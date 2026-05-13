import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "../../../../../lib/supabase";

import { parseYyyyMmDdUtcDayOfWeek } from "@/lib/calendar-local-date";
import { resolveClinicWorkingHoursForUtcDay } from "@/lib/resolve-clinic-working-hours-utc-day";
import { requireAdmin } from "@/lib/admin-auth";

const SLOT_STEP = 30;

function buildHalfHourSlotStrings(
  startTime: string,
  endTime: string,
): string[] {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  let cur = sh * 60 + sm;
  const endM = eh * 60 + em;
  const out: string[] = [];

  while (cur + SLOT_STEP <= endM) {
    const h = Math.floor(cur / 60);
    const m = cur % 60;

    out.push(
      `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`,
    );
    cur += SLOT_STEP;
  }

  return out;
}

async function getFallbackSlotsForDate(dateStr: string): Promise<string[]> {
  const dow = parseYyyyMmDdUtcDayOfWeek(dateStr);

  if (dow === null) return [];

  const resolved = await resolveClinicWorkingHoursForUtcDay(dow);

  if (resolved.status === "closed") return [];

  return buildHalfHourSlotStrings(
    resolved.hours.start_time.slice(0, 5),
    resolved.hours.end_time.slice(0, 5),
  );
}

// PATCH - Move booking to a different date/time
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();

  if (denied) return denied;

  const { id } = await params;

  try {
    const body = await request.json();
    const { newDate, newTime } = body;

    if (!newDate || !newTime) {
      return NextResponse.json(
        { error: "New date and time are required" },
        { status: 400 },
      );
    }

    // Validate date format
    const dateObj = new Date(newDate);

    if (isNaN(dateObj.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 },
      );
    }

    // First, check if the booking exists
    const { data: existingBooking, error: fetchError } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingBooking) {
      console.error("Booking not found:", fetchError);

      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check if there's already a booking at the new time slot
    const { data: conflictingBooking, error: conflictError } =
      await supabaseAdmin
        .from("bookings")
        .select("id")
        .eq("date", newDate)
        .eq("time", newTime)
        .neq("id", id); // Exclude the current booking

    if (conflictError) {
      console.error("Error checking for conflicts:", conflictError);

      return NextResponse.json(
        { error: "Failed to check for conflicts" },
        { status: 500 },
      );
    }

    // If there's a conflict, find the next available slot
    let finalTime = newTime;

    if (conflictingBooking && conflictingBooking.length > 0) {
      const timeSlots = await getFallbackSlotsForDate(newDate);

      if (timeSlots.length === 0) {
        return NextResponse.json(
          { error: "No available time slots for the selected date" },
          { status: 409 },
        );
      }

      const normalizedTime = newTime.length > 5 ? newTime.slice(0, 5) : newTime;
      let startIdx = timeSlots.indexOf(normalizedTime);

      if (startIdx < 0) {
        startIdx = -1;
      }

      let alternativeTime = null;

      for (let i = startIdx + 1; i < timeSlots.length; i++) {
        const checkTime = timeSlots[i];
        const { data: checkConflict } = await supabaseAdmin
          .from("bookings")
          .select("id")
          .eq("date", newDate)
          .eq("time", checkTime)
          .neq("id", id);

        if (!checkConflict || checkConflict.length === 0) {
          alternativeTime = checkTime;
          break;
        }
      }

      if (alternativeTime) {
        finalTime = alternativeTime;
      } else {
        return NextResponse.json(
          { error: "No available time slots for the selected date" },
          { status: 409 },
        );
      }
    }

    // Update the booking with new date and time
    const { data: updatedBooking, error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({
        date: newDate,
        time: finalTime,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating booking:", updateError);

      return NextResponse.json(
        { error: "Failed to move booking" },
        { status: 500 },
      );
    }

    // Format the time to HH:MM for consistency with frontend
    const formattedBooking = {
      ...updatedBooking,
      time: finalTime,
    };

    return NextResponse.json({
      success: true,
      booking: formattedBooking,
      message: `Booking moved successfully${finalTime !== newTime ? ` to ${finalTime}` : ""}`,
    });
  } catch (error) {
    console.error("Unexpected error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

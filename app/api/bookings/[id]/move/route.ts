import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "../../../../../lib/supabase";

import { assertSlotFree } from "@/lib/booking-conflicts";
import { requireAdmin } from "@/lib/admin-auth";

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

    // Strict: the target must be free for this booking's own practitioner.
    const slotCheck = await assertSlotFree({
      date: newDate,
      time: newTime,
      durationMinutes: existingBooking.service_duration_minutes,
      teamMemberId: existingBooking.team_member_id,
      excludeBookingId: id,
    });

    if (!slotCheck.ok) {
      return NextResponse.json(
        { error: slotCheck.adminMessage, code: "SLOT_TAKEN" },
        { status: 409 },
      );
    }

    // Update the booking with new date and time
    const { data: updatedBooking, error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({
        date: newDate,
        time: newTime,
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
      time: newTime,
    };

    return NextResponse.json({
      success: true,
      booking: formattedBooking,
      message: "Booking moved successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

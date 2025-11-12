import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase";

interface WorkingHour {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_working_day: boolean;
  buffer_minutes: number;
  max_appointments: number;
}

const SLOT_INTERVAL_MINUTES = 30;

function toDate(date: string, time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const base = new Date(`${date}T00:00:00`);
  base.setHours(hour, minute, 0, 0);
  return base;
}

function toTimeString(date: Date) {
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

function addMinutes(date: Date, minutes: number) {
  const next = new Date(date);
  next.setMinutes(next.getMinutes() + minutes);
  return next;
}

async function getWorkingHourForDate(date: Date) {
  const dow = date.getDay();
  const { data, error } = await supabaseAdmin
    .from("working_hours")
    .select("*")
    .eq("day_of_week", dow)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as WorkingHour | null;
}

async function getBookingsBetween(startDate: string, endDate: string) {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("id, date, time, status")
    .gte("date", startDate)
    .lte("date", endDate);

  if (error) {
    throw error;
  }

  return data ?? [];
}

function isSlotBooked(bookings: any[], date: string, time: string) {
  return bookings.some((booking) => {
    if (!booking || !booking.time || !booking.date) return false;

    const matchesDate = booking.date === date;
    const normalizedTime = booking.time.length > 5 ? booking.time.slice(0, 5) : booking.time;
    const matchesTime = normalizedTime === time;
    const isCancelled = booking.status === "cancelled";

    return matchesDate && matchesTime && !isCancelled;
  });
}

async function buildSlotsForDate(date: string, workingHour: WorkingHour | null) {
  if (!workingHour || !workingHour.is_working_day) {
    return { date, slots: [], bookedSlots: [], status: "closed" as const };
  }

  const start = toDate(date, workingHour.start_time);
  const end = toDate(date, workingHour.end_time);

  if (start >= end) {
    return { date, slots: [], bookedSlots: [], status: "closed" as const };
  }

  const bookings = await getBookingsBetween(date, date);
  const slots: Array<{ start_time: string; end_time: string; is_available: boolean }> = [];
  const bookedSlots: string[] = [];

  let cursor = new Date(start);

  while (cursor < end) {
    const slotStart = new Date(cursor);
    const slotEnd = addMinutes(slotStart, SLOT_INTERVAL_MINUTES);

    if (slotEnd > end) {
      break;
    }

    const slotStartStr = toTimeString(slotStart);
    const slotEndStr = toTimeString(slotEnd);
    const reserved = isSlotBooked(bookings, date, slotStartStr);

    slots.push({
      start_time: slotStartStr,
      end_time: slotEndStr,
      is_available: !reserved,
    });

    if (reserved) {
      bookedSlots.push(slotStartStr);
    }

    cursor = addMinutes(slotStart, SLOT_INTERVAL_MINUTES + (workingHour.buffer_minutes ?? 0));
  }

  const status: "available" | "full" = slots.some((slot) => slot.is_available) ? "available" : "full";

  return { date, slots, bookedSlots, status };
}

// GET - Get available time slots for a specific date
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    const dateObj = new Date(date);
    if (Number.isNaN(dateObj.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    const workingHour = await getWorkingHourForDate(dateObj);
    const payload = await buildSlotsForDate(date, workingHour);

    return NextResponse.json({
      success: true,
      date,
      status: payload.status,
      slots: payload.slots.filter((slot) => slot.is_available),
      allSlots: payload.slots,
      bookedSlots: payload.bookedSlots,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Generate time slots for a date range and persist to time_slots table
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate, endDate } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    if (start > end) {
      return NextResponse.json(
        { error: "Start date must be before end date" },
        { status: 400 }
      );
    }

    const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const summaries = [];

    for (let i = 0; i < dayCount; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      const currentDate = current.toISOString().split("T")[0];
      const workingHour = await getWorkingHourForDate(current);

      if (!workingHour || !workingHour.is_working_day) {
        summaries.push({ date: currentDate, generated: 0, skipped: true });
        continue;
      }

      const payload = await buildSlotsForDate(currentDate, workingHour);

      await supabaseAdmin
        .from("time_slots")
        .delete()
        .eq("date", currentDate);

      if (payload.slots.length > 0) {
        const rows = payload.slots.map((slot) => ({
          date: currentDate,
          start_time: `${slot.start_time}:00`,
          end_time: `${slot.end_time}:00`,
          is_available: slot.is_available,
        }));

        const { error } = await supabaseAdmin.from("time_slots").insert(rows);

        if (error) {
          console.error(`Failed inserting slots for ${currentDate}:`, error);
        }

        summaries.push({ date: currentDate, generated: rows.length, skipped: false });
      } else {
        summaries.push({ date: currentDate, generated: 0, skipped: false });
      }
    }

    return NextResponse.json({
      success: true,
      summaries,
      message: "Time slots generated successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Clear time slots for a specific date
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    await supabaseAdmin
      .from("time_slots")
      .delete()
      .eq("date", date);

    return NextResponse.json({
      success: true,
      message: `Time slots for ${date} cleared successfully`,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

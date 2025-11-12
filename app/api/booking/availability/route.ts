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

interface BookingRow {
  date: string;
  time: string;
  status: string;
}

const SLOT_INTERVAL_MINUTES = 30;
const DEFAULT_DAYS_AHEAD = 30;

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

function normalizeBookings(rows: BookingRow[]) {
  return rows.map((row) => ({
    date: row.date,
    time: row.time.length > 5 ? row.time.slice(0, 5) : row.time,
    status: row.status,
  }));
}

function buildSlots(
  date: string,
  workingHour: WorkingHour | null,
  bookings: BookingRow[]
) {
  if (!workingHour || !workingHour.is_working_day) {
    return {
      date,
      status: "closed" as const,
      availableSlots: [] as string[],
      bookedSlots: [] as string[],
      allSlots: [] as string[],
    };
  }

  const start = toDate(date, workingHour.start_time);
  const end = toDate(date, workingHour.end_time);

  if (start >= end) {
    return {
      date,
      status: "closed" as const,
      availableSlots: [] as string[],
      bookedSlots: [] as string[],
      allSlots: [] as string[],
    };
  }

  const allSlots: string[] = [];
  const bookedSlots: string[] = [];
  const availableSlots: string[] = [];
  const normalizedBookings = normalizeBookings(bookings);

  let cursor = new Date(start);

  while (cursor < end) {
    const slotStart = new Date(cursor);
    const slotEnd = addMinutes(slotStart, SLOT_INTERVAL_MINUTES);

    if (slotEnd > end) {
      break;
    }

    const slotStartStr = toTimeString(slotStart);
    const reserved = normalizedBookings.some(
      (booking) =>
        booking.date === date &&
        booking.time === slotStartStr &&
        booking.status !== "cancelled"
    );

    allSlots.push(slotStartStr);

    if (reserved) {
      bookedSlots.push(slotStartStr);
    } else {
      availableSlots.push(slotStartStr);
    }

    cursor = addMinutes(slotStart, SLOT_INTERVAL_MINUTES + (workingHour.buffer_minutes ?? 0));
  }

  const status: "full" | "available" = availableSlots.length > 0 ? "available" : "full";

  return { date, status, availableSlots, bookedSlots, allSlots };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");

    const today = new Date();
    const startDate = startParam ? new Date(startParam) : today;
    const endDate = endParam
      ? new Date(endParam)
      : new Date(startDate.getTime() + DEFAULT_DAYS_AHEAD * 24 * 60 * 60 * 1000);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid start or end date" },
        { status: 400 }
      );
    }

    if (startDate > endDate) {
      return NextResponse.json(
        { error: "Start date must be before end date" },
        { status: 400 }
      );
    }

    const { data: workingHoursRows, error: workingHoursError } = await supabaseAdmin
      .from("working_hours")
      .select("*");

    if (workingHoursError) {
      console.error("Error fetching working hours:", workingHoursError);
      return NextResponse.json(
        { error: "Unable to load working hours" },
        { status: 500 }
      );
    }

    const workingHoursMap = new Map<number, WorkingHour>();
    (workingHoursRows ?? []).forEach((row) => {
      workingHoursMap.set(row.day_of_week, row as WorkingHour);
    });

    const startISO = startDate.toISOString().split("T")[0];
    const endISO = endDate.toISOString().split("T")[0];

    const { data: bookingsRows, error: bookingsError } = await supabaseAdmin
      .from("bookings")
      .select("date, time, status")
      .gte("date", startISO)
      .lte("date", endISO);

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      return NextResponse.json(
        { error: "Unable to load bookings" },
        { status: 500 }
      );
    }

    const results = [] as Array<ReturnType<typeof buildSlots>>;
    const dayCount =
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    for (let i = 0; i < dayCount; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      const isoDate = day.toISOString().split("T")[0];
      const dow = day.getDay();
      const workingHour = workingHoursMap.get(dow) ?? null;
      const bookingsForDay = (bookingsRows ?? []).filter((row) => row.date === isoDate);

      results.push(buildSlots(isoDate, workingHour, bookingsForDay as BookingRow[]));
    }

    return NextResponse.json({
      success: true,
      start: startISO,
      end: endISO,
      days: results,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

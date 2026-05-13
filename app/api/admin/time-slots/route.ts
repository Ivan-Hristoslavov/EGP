import type { ClinicUtcDayHours } from "@/lib/resolve-clinic-working-hours-utc-day";

import { NextRequest, NextResponse } from "next/server";

import { isDayOffFeatureEnabled } from "@/config/feature-flags";
import { supabaseAdmin } from "../../../../lib/supabase";
import { isOnlineBookingBlackoutByRules } from "@/lib/booking-blackout-rules";
import { fetchBookingBlackoutRulesFromDb } from "@/lib/booking-blackout-rules-db";
import { fetchBookingClosedWeekdaysFromDb } from "@/lib/booking-closed-weekdays-db";
import {
  addDaysUtcYyyyMmDd,
  parseYyyyMmDdUtcDayOfWeek,
} from "@/lib/calendar-local-date";
import { resolveClinicWorkingHoursForUtcDay } from "@/lib/resolve-clinic-working-hours-utc-day";
import { requireAdmin } from "@/lib/admin-auth";

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

async function getBookingsBetween(
  startDate: string,
  endDate: string,
  teamMemberId: string | null,
) {
  let q = supabaseAdmin
    .from("bookings")
    .select("id, date, time, status, team_member_id")
    .gte("date", startDate)
    .lte("date", endDate);

  if (teamMemberId) {
    q = q.eq("team_member_id", teamMemberId);
  }

  const { data, error } = await q;

  if (error) {
    throw error;
  }

  return data ?? [];
}

function isSlotBooked(bookings: any[], date: string, time: string) {
  return bookings.some((booking) => {
    if (!booking || !booking.time || !booking.date) return false;

    const matchesDate = booking.date === date;
    const normalizedTime =
      booking.time.length > 5 ? booking.time.slice(0, 5) : booking.time;
    const matchesTime = normalizedTime === time;
    const isCancelled = booking.status === "cancelled";

    return matchesDate && matchesTime && !isCancelled;
  });
}

async function isTeamMemberOnDayOff(
  teamMemberId: string,
  date: string,
): Promise<boolean> {
  if (!isDayOffFeatureEnabled) return false;

  const { data, error } = await supabaseAdmin
    .from("team_day_off_periods")
    .select("id")
    .eq("team_member_id", teamMemberId)
    .lte("start_date", date)
    .gte("end_date", date)
    .limit(1);

  if (error) {
    console.error("[time-slots] day off check:", error);

    return false;
  }

  return (data?.length ?? 0) > 0;
}

async function buildSlotsForDate(
  date: string,
  workingHour: ClinicUtcDayHours | null,
  teamMemberId: string | null,
) {
  if (!workingHour || !workingHour.is_working_day) {
    return { date, slots: [], bookedSlots: [], status: "closed" as const };
  }

  const start = toDate(date, workingHour.start_time);
  const end = toDate(date, workingHour.end_time);

  if (start >= end) {
    return { date, slots: [], bookedSlots: [], status: "closed" as const };
  }

  const bookings = await getBookingsBetween(date, date, teamMemberId);
  const slots: Array<{
    start_time: string;
    end_time: string;
    is_available: boolean;
  }> = [];
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

    cursor = addMinutes(
      slotStart,
      SLOT_INTERVAL_MINUTES + (workingHour.buffer_minutes ?? 0),
    );
  }

  const status: "available" | "full" = slots.some((slot) => slot.is_available)
    ? "available"
    : "full";

  return { date, slots, bookedSlots, status };
}

// GET - Get available time slots for a specific date (admin only)
export async function GET(request: NextRequest) {
  const denied = await requireAdmin();

  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const teamMemberId = searchParams.get("team_member_id");

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 },
      );
    }

    const utcDow = parseYyyyMmDdUtcDayOfWeek(date);

    if (utcDow === null) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 },
      );
    }

    const [bookingClosedOnline, bookingBlackoutRules] = await Promise.all([
      fetchBookingClosedWeekdaysFromDb(),
      fetchBookingBlackoutRulesFromDb(),
    ]);
    const closedSet = new Set(bookingClosedOnline);

    if (closedSet.has(utcDow)) {
      return NextResponse.json({
        success: true,
        date,
        status: "closed",
        message: "Online booking is not available on this weekday.",
        slots: [],
        allSlots: [],
        bookedSlots: [],
      });
    }

    if (isOnlineBookingBlackoutByRules(date, utcDow, bookingBlackoutRules)) {
      return NextResponse.json({
        success: true,
        date,
        status: "closed",
        message: "Online booking is closed for this date (scheduled blackout).",
        slots: [],
        allSlots: [],
        bookedSlots: [],
      });
    }

    if (teamMemberId && (await isTeamMemberOnDayOff(teamMemberId, date))) {
      return NextResponse.json({
        success: true,
        date,
        status: "closed",
        message: "Team member is on day off for this date.",
        slots: [],
        allSlots: [],
        bookedSlots: [],
      });
    }

    const resolved = await resolveClinicWorkingHoursForUtcDay(utcDow);

    if (resolved.status === "closed") {
      return NextResponse.json({
        success: true,
        date,
        status: "closed",
        message: resolved.message,
        slots: [],
        allSlots: [],
        bookedSlots: [],
      });
    }

    const payload = await buildSlotsForDate(date, resolved.hours, teamMemberId);

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
      { status: 500 },
    );
  }
}

// POST - Generate time slots for a date range and persist to time_slots table
export async function POST(request: NextRequest) {
  const denied = await requireAdmin();

  if (denied) return denied;

  try {
    const body = await request.json();
    const { startDate, endDate } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 },
      );
    }

    const startUtcDow = parseYyyyMmDdUtcDayOfWeek(startDate);
    const endUtcDow = parseYyyyMmDdUtcDayOfWeek(endDate);

    if (startUtcDow === null || endUtcDow === null) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 },
      );
    }

    const startParts = startDate.split("-").map(Number);
    const endParts = endDate.split("-").map(Number);
    const startT = new Date(
      Date.UTC(startParts[0], startParts[1] - 1, startParts[2], 12, 0, 0, 0),
    );
    const endT = new Date(
      Date.UTC(endParts[0], endParts[1] - 1, endParts[2], 12, 0, 0, 0),
    );

    if (startT > endT) {
      return NextResponse.json(
        { error: "Start date must be before end date" },
        { status: 400 },
      );
    }

    const dayCount =
      Math.ceil((endT.getTime() - startT.getTime()) / (1000 * 60 * 60 * 24)) +
      1;
    const summaries = [];
    const [bookingClosedOnline, bookingBlackoutRules] = await Promise.all([
      fetchBookingClosedWeekdaysFromDb(),
      fetchBookingBlackoutRulesFromDb(),
    ]);
    const closedSet = new Set(bookingClosedOnline);

    for (let i = 0; i < dayCount; i++) {
      const currentDate = addDaysUtcYyyyMmDd(startDate, i);

      if (!currentDate) {
        summaries.push({ date: "", generated: 0, skipped: true });
        continue;
      }

      const dow = parseYyyyMmDdUtcDayOfWeek(currentDate);

      if (dow === null || closedSet.has(dow)) {
        summaries.push({ date: currentDate, generated: 0, skipped: true });
        continue;
      }

      if (isOnlineBookingBlackoutByRules(currentDate, dow, bookingBlackoutRules)) {
        summaries.push({ date: currentDate, generated: 0, skipped: true });
        continue;
      }

      const resolved = await resolveClinicWorkingHoursForUtcDay(dow);

      if (resolved.status === "closed") {
        summaries.push({ date: currentDate, generated: 0, skipped: true });
        continue;
      }

      const payload = await buildSlotsForDate(
        currentDate,
        resolved.hours,
        null,
      );

      await supabaseAdmin.from("time_slots").delete().eq("date", currentDate);

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

        summaries.push({
          date: currentDate,
          generated: rows.length,
          skipped: false,
        });
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
      { status: 500 },
    );
  }
}

// DELETE - Clear time slots for a specific date
export async function DELETE(request: NextRequest) {
  const denied = await requireAdmin();

  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 },
      );
    }

    await supabaseAdmin.from("time_slots").delete().eq("date", date);

    return NextResponse.json({
      success: true,
      message: `Time slots for ${date} cleared successfully`,
    });
  } catch (error) {
    console.error("Unexpected error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

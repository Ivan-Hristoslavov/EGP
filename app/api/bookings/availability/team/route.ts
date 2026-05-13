import { NextRequest, NextResponse } from "next/server";

import { isDayOffFeatureEnabled } from "@/config/feature-flags";
import { isOnlineBookingBlackoutByRules } from "@/lib/booking-blackout-rules";
import { fetchBookingBlackoutRulesFromDb } from "@/lib/booking-blackout-rules-db";
import { fetchBookingClosedWeekdaysFromDb } from "@/lib/booking-closed-weekdays-db";
import { resolveClinicWorkingHoursForUtcDay } from "@/lib/resolve-clinic-working-hours-utc-day";
import { supabaseAdmin } from "@/lib/supabase";

// GET - Get available booking hours for a team member and service
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamMemberId = searchParams.get("team_member_id");
    const date = searchParams.get("date");
    const serviceDurationMinutes = parseInt(
      searchParams.get("service_duration_minutes") || "30",
      10,
    );
    const serviceName = searchParams.get("service_name");

    if (!teamMemberId || !date) {
      return NextResponse.json(
        { error: "team_member_id and date are required" },
        { status: 400 },
      );
    }

    // Use admin client to bypass RLS for public booking access

    // Get service duration if service name is provided
    let durationMinutes = serviceDurationMinutes;

    if (serviceName) {
      const { data: serviceDuration } = await supabaseAdmin
        .from("service_durations")
        .select("duration_minutes, buffer_minutes")
        .eq("service_name", serviceName)
        .single();

      if (serviceDuration) {
        durationMinutes =
          serviceDuration.duration_minutes +
          (serviceDuration.buffer_minutes || 0);
      }
    }

    // Parse the date string manually to avoid timezone issues
    // Date string format: YYYY-MM-DD
    const [year, month, day] = date.split("-").map(Number);

    // Validate date components
    if (
      isNaN(year) ||
      isNaN(month) ||
      isNaN(day) ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      return NextResponse.json(
        {
          availableSlots: [],
          bookedSlots: [],
          message: `Invalid date format: ${date}`,
        },
        { status: 400 },
      );
    }

    // Calculate day of week using UTC to avoid timezone issues
    // Create date in UTC to ensure consistent day-of-week calculation regardless of server timezone
    const bookingDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0)); // Use noon UTC to avoid DST issues
    const dayOfWeek = bookingDate.getUTCDay(); // 0 = Sunday, 1 = Monday, etc. (UTC)

    // Verify the date was parsed correctly (using UTC methods)
    if (
      bookingDate.getUTCFullYear() !== year ||
      bookingDate.getUTCMonth() !== month - 1 ||
      bookingDate.getUTCDate() !== day
    ) {
      console.error(
        `Date parsing mismatch for ${date}: parsed as ${bookingDate.toISOString()}`,
      );
    }

    const [bookingClosedOnline, bookingBlackoutRules] = await Promise.all([
      fetchBookingClosedWeekdaysFromDb(),
      fetchBookingBlackoutRulesFromDb(),
    ]);
    const bookingClosedSet = new Set(bookingClosedOnline);

    if (bookingClosedSet.has(dayOfWeek)) {
      return NextResponse.json({
        availableSlots: [],
        bookedSlots: [],
        message: "Online booking is not available on this weekday.",
      });
    }

    if (isOnlineBookingBlackoutByRules(date, dayOfWeek, bookingBlackoutRules)) {
      return NextResponse.json({
        availableSlots: [],
        bookedSlots: [],
        message: "Online booking is closed for this date (scheduled blackout).",
      });
    }

    const resolvedHours = await resolveClinicWorkingHoursForUtcDay(dayOfWeek);

    if (resolvedHours.status === "closed") {
      return NextResponse.json({
        availableSlots: [],
        bookedSlots: [],
        message: resolvedHours.message,
      });
    }

    const workingHours = resolvedHours.hours;
    const bufferMinutes = workingHours.buffer_minutes;
    const maxAppointments = workingHours.max_appointments;

    if (isDayOffFeatureEnabled) {
      const { data: dayOffPeriods, error: dayOffError } = await supabaseAdmin
        .from("team_day_off_periods")
        .select("start_date, end_date, reason")
        .eq("team_member_id", teamMemberId)
        .lte("start_date", date)
        .gte("end_date", date);

      if (dayOffError) {
        console.error("Error checking day off periods:", dayOffError);
      }

      const isOnDayOff = dayOffPeriods && dayOffPeriods.length > 0;
      const dayOffReason = isOnDayOff ? dayOffPeriods[0].reason : null;

      if (isOnDayOff) {
        return NextResponse.json({
          availableSlots: [],
          bookedSlots: [],
          workingHours: {
            start: workingHours.start_time,
            end: workingHours.end_time,
            buffer_minutes: bufferMinutes,
            max_appointments: maxAppointments,
          },
          serviceDuration: durationMinutes,
          dayOfWeek: dayOfWeek,
          isWorkingDay: workingHours.is_working_day,
          isOnDayOff: true,
          dayOffReason: dayOffReason,
          message: `Team member is on day off from ${dayOffPeriods[0].start_date} to ${dayOffPeriods[0].end_date}`,
        });
      }
    }

    // Get existing bookings for this team member on this date
    const { data: existingBookings, error: bookingsError } = await supabaseAdmin
      .from("bookings")
      .select("time, service_duration_minutes, status")
      .eq("team_member_id", teamMemberId)
      .eq("date", date)
      .in("status", ["pending", "confirmed", "scheduled"]);

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);

      return NextResponse.json(
        { error: "Failed to fetch existing bookings" },
        { status: 500 },
      );
    }

    // Parse working hours
    const [startHour, startMinute] = workingHours.start_time
      .split(":")
      .map(Number);
    const [endHour, endMinute] = workingHours.end_time.split(":").map(Number);
    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;

    // Create a set of booked time ranges (including buffer after each booking)
    const bookedRanges: Array<{ start: number; end: number }> = [];

    (existingBookings || []).forEach((booking) => {
      const [hour, minute] = booking.time.split(":").map(Number);
      const bookingStartMinutes = hour * 60 + minute;
      const bookingDuration = booking.service_duration_minutes || 30;
      // Add buffer after the booking ends
      const bookingEndMinutes =
        bookingStartMinutes + bookingDuration + bufferMinutes;

      bookedRanges.push({
        start: bookingStartMinutes,
        end: bookingEndMinutes,
      });
    });

    // Sort booked ranges by start time
    bookedRanges.sort((a, b) => a.start - b.start);

    // Check if max appointments limit is reached
    const existingBookingsCount = (existingBookings || []).length;
    const isMaxAppointmentsReached = existingBookingsCount >= maxAppointments;

    // Generate available time slots and booked slots
    const availableSlots: string[] = [];
    const bookedSlots: string[] = [];
    const slotInterval = 15; // 15-minute intervals
    const requiredDuration = durationMinutes;

    // Generate all possible time slots in the working hours
    for (
      let timeMinutes = startTimeMinutes;
      timeMinutes < endTimeMinutes;
      timeMinutes += slotInterval
    ) {
      // Format time as HH:MM
      const hours = Math.floor(timeMinutes / 60);
      const minutes = timeMinutes % 60;
      const timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

      // Check if this time slot is within any booked range
      const isBooked = bookedRanges.some((booked) => {
        return timeMinutes >= booked.start && timeMinutes < booked.end;
      });

      if (isBooked) {
        bookedSlots.push(timeString);
      } else {
        // Skip if max appointments reached
        if (isMaxAppointmentsReached) {
          continue;
        }

        // Check if this slot can accommodate the required duration + buffer
        const slotEndMinutes = timeMinutes + requiredDuration + bufferMinutes;

        if (slotEndMinutes <= endTimeMinutes) {
          // Check if the full duration + buffer is available (no overlap with booked times)
          const isAvailable = !bookedRanges.some((booked) => {
            return timeMinutes < booked.end && slotEndMinutes > booked.start;
          });

          if (isAvailable) {
            availableSlots.push(timeString);
          }
        }
      }
    }

    return NextResponse.json({
      availableSlots,
      bookedSlots,
      workingHours: {
        start: workingHours.start_time,
        end: workingHours.end_time,
        buffer_minutes: bufferMinutes,
        max_appointments: maxAppointments,
      },
      serviceDuration: durationMinutes,
      dayOfWeek: dayOfWeek,
      isWorkingDay: workingHours.is_working_day,
      currentBookingsCount: existingBookingsCount,
      maxAppointmentsReached: isMaxAppointmentsReached,
    });
  } catch (error) {
    console.error("Error in availability GET:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        availableSlots: [],
        bookedSlots: [],
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET - Get available booking hours for a team member for a date range
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamMemberId = searchParams.get("team_member_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const serviceDurationMinutes = parseInt(searchParams.get("service_duration_minutes") || "30", 10);

    if (!teamMemberId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "team_member_id, start_date, and end_date are required" },
        { status: 400 }
      );
    }

    // Get working hours from admin_settings (source of truth)
    const { data: adminSettingsData, error: adminSettingsError } = await supabaseAdmin
      .from("admin_settings")
      .select("value")
      .eq("key", "business_hours")
      .single();

    let businessHours: any = null;
    if (!adminSettingsError && adminSettingsData?.value) {
      businessHours = typeof adminSettingsData.value === 'string' 
        ? JSON.parse(adminSettingsData.value) 
        : adminSettingsData.value;
    }

    // Get all bookings for the team member in the date range
    const { data: existingBookings, error: bookingsError } = await supabaseAdmin
      .from("bookings")
      .select("date, time, service_duration_minutes, status")
      .eq("team_member_id", teamMemberId)
      .gte("date", startDate)
      .lte("date", endDate)
      .in("status", ["pending", "confirmed", "scheduled"]);

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      return NextResponse.json(
        { error: "Failed to fetch existing bookings" },
        { status: 500 }
      );
    }

    // Group bookings by date
    const bookingsByDate = new Map<string, Array<{ time: string; duration: number }>>();
    (existingBookings || []).forEach((booking) => {
      if (!bookingsByDate.has(booking.date)) {
        bookingsByDate.set(booking.date, []);
      }
      bookingsByDate.get(booking.date)!.push({
        time: booking.time,
        duration: booking.service_duration_minutes || 30,
      });
    });

    // Generate availability for each date in range
    const results: Record<string, {
      availableSlots: string[];
      bookedSlots: string[];
      workingHours?: { start: string; end: string };
      status: 'available' | 'full' | 'closed';
    }> = {};

    const start = new Date(startDate);
    const end = new Date(endDate);
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      
      // Calculate day of week (0 = Sunday, 1 = Monday, etc.)
      const bookingDate = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 12, 0, 0, 0));
      const dayOfWeek = bookingDate.getUTCDay();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const currentDayKey = dayKeys[dayOfWeek];

      // Get working hours for this day
      let isWorkingDay = false;
      let startTime = null;
      let endTime = null;
      let bufferMinutes = 15;

      if (businessHours && businessHours[currentDayKey]) {
        const dayHours = businessHours[currentDayKey];
        isWorkingDay = dayHours.isOpen === true;
        startTime = dayHours.open;
        endTime = dayHours.close;
        bufferMinutes = dayHours.bufferMinutes || 15;
      }

      if (!isWorkingDay || !startTime || !endTime) {
        results[dateStr] = {
          availableSlots: [],
          bookedSlots: [],
          status: 'closed',
        };
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Get bookings for this date
      const dateBookings = bookingsByDate.get(dateStr) || [];

      // Parse working hours
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);
      const startTimeMinutes = startHour * 60 + startMinute;
      const endTimeMinutes = endHour * 60 + endMinute;

      // Create booked ranges for this date
      const bookedRanges: Array<{ start: number; end: number }> = [];
      dateBookings.forEach((booking) => {
        const [hour, minute] = booking.time.split(":").map(Number);
        const bookingStartMinutes = hour * 60 + minute;
        const bookingEndMinutes = bookingStartMinutes + booking.duration;
        bookedRanges.push({
          start: bookingStartMinutes,
          end: bookingEndMinutes,
        });
      });

      bookedRanges.sort((a, b) => a.start - b.start);

      // Generate available and booked slots
      const availableSlots: string[] = [];
      const bookedSlots: string[] = [];
      const slotInterval = 15;
      const requiredDuration = serviceDurationMinutes;

      for (let timeMinutes = startTimeMinutes; timeMinutes < endTimeMinutes; timeMinutes += slotInterval) {
        const hours = Math.floor(timeMinutes / 60);
        const minutes = timeMinutes % 60;
        const timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

        const isBooked = bookedRanges.some((booked) => {
          return timeMinutes >= booked.start && timeMinutes < booked.end;
        });

        if (isBooked) {
          bookedSlots.push(timeString);
        } else {
          const slotEndMinutes = timeMinutes + requiredDuration;
          if (slotEndMinutes <= endTimeMinutes) {
            const isAvailable = !bookedRanges.some((booked) => {
              return timeMinutes < booked.end && slotEndMinutes > booked.start;
            });

            if (isAvailable) {
              availableSlots.push(timeString);
            }
          }
        }
      }

      results[dateStr] = {
        availableSlots,
        bookedSlots,
        workingHours: {
          start: startTime,
          end: endTime,
        },
        status: availableSlots.length > 0 ? 'available' : 'full',
      };

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({
      availability: results,
      workingHours: businessHours,
    });
  } catch (error) {
    console.error("Error in availability range GET:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        availability: {},
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}


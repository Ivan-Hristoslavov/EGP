import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET - Get available booking hours for a team member and service
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamMemberId = searchParams.get("team_member_id");
    const date = searchParams.get("date");
    const serviceDurationMinutes = parseInt(searchParams.get("service_duration_minutes") || "30", 10);
    const serviceName = searchParams.get("service_name");

    if (!teamMemberId || !date) {
      return NextResponse.json(
        { error: "team_member_id and date are required" },
        { status: 400 }
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
        durationMinutes = serviceDuration.duration_minutes + (serviceDuration.buffer_minutes || 0);
      }
    }

    // Parse the date string manually to avoid timezone issues
    // Date string format: YYYY-MM-DD
    const [year, month, day] = date.split('-').map(Number);
    
    // Validate date components
    if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
      return NextResponse.json({
        availableSlots: [],
        bookedSlots: [],
        message: `Invalid date format: ${date}`
      }, { status: 400 });
    }
    
    // Calculate day of week using UTC to avoid timezone issues
    // Create date in UTC to ensure consistent day-of-week calculation regardless of server timezone
    const bookingDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0)); // Use noon UTC to avoid DST issues
    const dayOfWeek = bookingDate.getUTCDay(); // 0 = Sunday, 1 = Monday, etc. (UTC)
    
    // Verify the date was parsed correctly (using UTC methods)
    if (bookingDate.getUTCFullYear() !== year || bookingDate.getUTCMonth() !== month - 1 || bookingDate.getUTCDate() !== day) {
      console.error(`Date parsing mismatch for ${date}: parsed as ${bookingDate.toISOString()}`);
    }
    
    // Debug: Log day of week calculation
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDayKey = dayKeys[dayOfWeek];
    
    console.log(`[Availability] Date: ${date}, Day of Week: ${dayOfWeek} (${dayNames[dayOfWeek]}), Key: ${currentDayKey}`);
    
    // First, try to get working hours from admin_settings (source of truth)
    const { data: adminSettingsData, error: adminSettingsError } = await supabaseAdmin
      .from("admin_settings")
      .select("value")
      .eq("key", "business_hours")
      .single();
    
    let workingHours: any = null;
    let isWorkingDay = false;
    let startTime = null;
    let endTime = null;
    let bufferMinutes = 15; // Default
    
    if (!adminSettingsError && adminSettingsData?.value) {
      // Parse the JSON value from admin_settings
      const businessHours = typeof adminSettingsData.value === 'string' 
        ? JSON.parse(adminSettingsData.value) 
        : adminSettingsData.value;
      
      // Log all available keys in businessHours for debugging
      console.log(`[Availability] Available day keys in businessHours:`, Object.keys(businessHours));
      console.log(`[Availability] Looking for key: "${currentDayKey}"`);
      
      const dayHours = businessHours[currentDayKey];
      if (dayHours) {
        // Simple logic: use isOpen to determine if day is closed
        // If isOpen is false, day is closed regardless of other settings
        if (dayHours.isOpen === false) {
          console.log(`[Availability] Day ${date} (${dayNames[dayOfWeek]}) is closed: isOpen=false`);
          return NextResponse.json({
            availableSlots: [],
            bookedSlots: [],
            message: "This day is not a working day"
          });
        }
        
        // If isOpen is true, proceed with the times
        isWorkingDay = true;
        startTime = dayHours.open;
        endTime = dayHours.close;
        bufferMinutes = dayHours.bufferMinutes || 15;
        
        // Validate that we have times when isOpen is true
        if (!startTime || !endTime) {
          console.log(`[Availability] Day ${date} (${dayNames[dayOfWeek]}) isOpen=true but missing open/close times`);
          return NextResponse.json({
            availableSlots: [],
            bookedSlots: [],
            message: "This day has no working hours configured"
          });
        }
        
        console.log(`[Availability] Using admin_settings for ${date} (${dayNames[dayOfWeek]}): isOpen=true, ${startTime}-${endTime}, buffer=${bufferMinutes}min`);
      } else {
        console.log(`[Availability] No hours found in admin_settings for ${currentDayKey}. Available keys:`, Object.keys(businessHours));
        // If day not found in admin_settings, treat as closed
        return NextResponse.json({
          availableSlots: [],
          bookedSlots: [],
          message: "This day is not a working day"
        });
      }
    } else {
      console.log(`[Availability] Error fetching admin_settings:`, adminSettingsError);
      // Fallback to working_hours table if admin_settings doesn't exist
      const { data: whData, error: whError } = await supabaseAdmin
        .from("working_hours")
        .select("*")
        .eq("day_of_week", dayOfWeek)
        .single();
      
      if (!whError && whData) {
        // Use same simple logic: check is_working_day
        if (whData.is_working_day === false) {
          console.log(`[Availability] Day ${date} (${dayNames[dayOfWeek]}) is closed: is_working_day=false`);
          return NextResponse.json({
            availableSlots: [],
            bookedSlots: [],
            message: "This day is not a working day"
          });
        }
        
        workingHours = whData;
        isWorkingDay = true;
        startTime = whData.start_time;
        endTime = whData.end_time;
        bufferMinutes = whData.buffer_minutes || 15;
        console.log(`[Availability] Using working_hours table for ${date} (${dayNames[dayOfWeek]}): is_working_day=true, ${startTime}-${endTime}`);
      } else {
        console.log(`[Availability] No working hours found in either admin_settings or working_hours for ${date} (${dayNames[dayOfWeek]})`);
        return NextResponse.json({
          availableSlots: [],
          bookedSlots: [],
          message: "This day is not a working day"
        });
      }
    }
    
    // Create a workingHours-like object for compatibility with rest of code
    workingHours = {
      start_time: startTime,
      end_time: endTime,
      is_working_day: isWorkingDay,
      buffer_minutes: bufferMinutes,
    };

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
        { status: 500 }
      );
    }

    // Parse working hours
    const [startHour, startMinute] = workingHours.start_time.split(":").map(Number);
    const [endHour, endMinute] = workingHours.end_time.split(":").map(Number);
    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;

    // Create a set of booked time ranges
    const bookedRanges: Array<{ start: number; end: number }> = [];
    
    (existingBookings || []).forEach((booking) => {
      const [hour, minute] = booking.time.split(":").map(Number);
      const bookingStartMinutes = hour * 60 + minute;
      const bookingDuration = booking.service_duration_minutes || 30;
      const bookingEndMinutes = bookingStartMinutes + bookingDuration;
      
      bookedRanges.push({
        start: bookingStartMinutes,
        end: bookingEndMinutes
      });
    });

    // Sort booked ranges by start time
    bookedRanges.sort((a, b) => a.start - b.start);

    // Generate available time slots and booked slots
    const availableSlots: string[] = [];
    const bookedSlots: string[] = [];
    const slotInterval = 15; // 15-minute intervals
    const requiredDuration = durationMinutes;

    // Generate all possible time slots in the working hours
    for (let timeMinutes = startTimeMinutes; timeMinutes < endTimeMinutes; timeMinutes += slotInterval) {
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
        // Check if this slot can accommodate the required duration
        const slotEndMinutes = timeMinutes + requiredDuration;
        if (slotEndMinutes <= endTimeMinutes) {
          // Check if the full duration is available (no overlap with booked times)
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
        end: workingHours.end_time
      },
      serviceDuration: durationMinutes,
      dayOfWeek: dayOfWeek,
      isWorkingDay: workingHours.is_working_day
    });
  } catch (error) {
    console.error("Error in availability GET:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        availableSlots: [],
        bookedSlots: [],
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}


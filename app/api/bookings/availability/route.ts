import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - Check time slot availability for a specific date with enhanced features
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const service = searchParams.get('service');
    const duration = searchParams.get('duration') || '60'; // Default 60 minutes

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    // Validate date is not in the past
    const requestedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (requestedDate < today) {
      return NextResponse.json(
        { error: "Cannot book appointments in the past" },
        { status: 400 }
      );
    }

    // First, check if the date is in a day-off period
    const { data: dayOffPeriods, error: dayOffError } = await supabase
      .from("day_off_periods")
      .select("title, description, banner_message")
      .lte("start_date", date)
      .gte("end_date", date)
      .eq("is_recurring", false);

    if (dayOffError) {
      console.error("Error checking day-off periods:", dayOffError);
      return NextResponse.json(
        { error: "Failed to check day-off periods" },
        { status: 500 }
      );
    }

    // If there's a day-off period for this date, return unavailable
    if (dayOffPeriods && dayOffPeriods.length > 0) {
      const dayOffPeriod = dayOffPeriods[0];
      return NextResponse.json({
        date,
        isDayOff: true,
        dayOffTitle: dayOffPeriod.title,
        dayOffDescription: dayOffPeriod.description,
        bannerMessage: dayOffPeriod.banner_message,
        timeSlots: [],
        message: `Date ${date} is unavailable due to: ${dayOffPeriod.title}`
      });
    }

    // Get business hours from config or database
    const businessHours = {
      start: "09:00",
      end: "18:00",
      breakStart: "12:00",
      breakEnd: "13:00",
    };

    // Get buffer time between appointments (15 minutes default)
    const bufferTime = 15;

    // Get all booked time slots for the specified date
    const { data: bookedSlots, error } = await supabase
      .from("bookings")
      .select("time, customer_name, status, service")
      .eq("date", date)
      .in("status", ["scheduled", "pending", "confirmed"]);

    if (error) {
      console.error("Error fetching booked slots:", error);
      return NextResponse.json(
        { error: "Failed to check availability" },
        { status: 500 }
      );
    }

    // Generate time slots with proper duration and buffer
    const timeSlots = [];
    const startTime = new Date(`2000-01-01T${businessHours.start}`);
    const endTime = new Date(`2000-01-01T${businessHours.end}`);
    const breakStart = new Date(`2000-01-01T${businessHours.breakStart}`);
    const breakEnd = new Date(`2000-01-01T${businessHours.breakEnd}`);

    let currentTime = new Date(startTime);
    while (currentTime < endTime) {
      // Skip break time
      if (currentTime >= breakStart && currentTime < breakEnd) {
        currentTime.setMinutes(currentTime.getMinutes() + 30);
        continue;
      }

      const timeString = currentTime.toTimeString().slice(0, 5);
      
      // Calculate end time for this slot
      const slotEndTime = new Date(currentTime);
      slotEndTime.setMinutes(slotEndTime.getMinutes() + parseInt(duration) + bufferTime);
      
      // Check if this time slot conflicts with existing bookings
      let isAvailable = true;
      let conflictReason = "";

      if (bookedSlots && bookedSlots.length > 0) {
        for (const booking of bookedSlots) {
          const bookingTime = new Date(`2000-01-01T${booking.time}`);
          const bookingEndTime = new Date(bookingTime);
          bookingEndTime.setMinutes(bookingEndTime.getMinutes() + 60 + bufferTime); // Assume 60min + buffer for existing bookings

          // Check for time overlap
          if (
            (currentTime < bookingEndTime && slotEndTime > bookingTime) ||
            (currentTime.toTimeString().slice(0, 5) === booking.time)
          ) {
            isAvailable = false;
            conflictReason = `Conflicts with ${booking.service} at ${booking.time}`;
            break;
          }
        }
      }

      // Check if slot would go past business hours
      if (slotEndTime > endTime) {
        isAvailable = false;
        conflictReason = "Would extend past business hours";
      }

      timeSlots.push({
        time: timeString,
        available: isAvailable,
        conflictReason: conflictReason || null,
        duration: parseInt(duration),
      });

      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    // Filter out unavailable slots
    const availableSlots = timeSlots.filter(slot => slot.available);
    const bookedTimes = bookedSlots?.map(slot => ({
      time: slot.time,
      customer: slot.customer_name,
      status: slot.status,
      service: slot.service
    })) || [];

    return NextResponse.json({
      date,
      service,
      duration: parseInt(duration),
      isDayOff: false,
      totalSlots: timeSlots.length,
      availableSlots: availableSlots.length,
      timeSlots: timeSlots,
      bookedTimes,
      message: `Found ${availableSlots.length} available slots out of ${timeSlots.length} total slots for ${date}`
    });
  } catch (error) {
    console.error("Unexpected error checking availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 
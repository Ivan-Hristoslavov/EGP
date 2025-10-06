import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - Check time slot availability for a specific date
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
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
        bookedTimes: [],
        message: `Date ${date} is unavailable due to: ${dayOffPeriod.title}`
      });
    }

    // Get all booked time slots for the specified date
    const { data: bookedSlots, error } = await supabase
      .from("bookings")
      .select("time, customer_name, status")
      .eq("date", date)
      .in("status", ["scheduled", "pending", "confirmed"]);

    if (error) {
      console.error("Error fetching booked slots:", error);
      return NextResponse.json(
        { error: "Failed to check availability" },
        { status: 500 }
      );
    }

    // Return the booked time slots
    const bookedTimes = bookedSlots?.map(slot => ({
      time: slot.time,
      customer: slot.customer_name,
      status: slot.status
    })) || [];

    return NextResponse.json({
      date,
      isDayOff: false,
      bookedTimes,
      message: `Found ${bookedTimes.length} booked time slots for ${date}`
    });
  } catch (error) {
    console.error("Unexpected error checking availability:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 
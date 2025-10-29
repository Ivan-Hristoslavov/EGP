import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase";

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

    // Validate date format
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    // Get existing bookings for this date
    const { data: existingBookings, error: bookingsError } = await supabaseAdmin
      .from("bookings")
      .select("time")
      .eq("date", date);

    if (bookingsError) {
      console.error("Error fetching existing bookings:", bookingsError);
      return NextResponse.json(
        { error: "Failed to fetch existing bookings" },
        { status: 500 }
      );
    }

    // Generate time slots (9:00 AM to 6:00 PM, 30-minute intervals)
    const timeSlots = [];
    const startHour = 9;
    const endHour = 18;
    const interval = 30; // minutes

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const isBooked = existingBookings?.some(booking => 
          booking.time.startsWith(timeString)
        );
        
        timeSlots.push({
          slot_id: `${date}-${timeString}`,
          start_time: timeString,
          end_time: `${hour.toString().padStart(2, '0')}:${(minute + interval).toString().padStart(2, '0')}`,
          is_available: !isBooked
        });
      }
    }

    return NextResponse.json({
      success: true,
      date,
      slots: timeSlots.filter(slot => slot.is_available),
      count: timeSlots.filter(slot => slot.is_available).length
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Generate time slots for a date range
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

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
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

    // For now, just return success since we're generating slots on-demand
    // In a full implementation, this would pre-generate slots in a time_slots table
    return NextResponse.json({
      success: true,
      message: "Time slots are generated on-demand for each date",
      note: "No pre-generation needed with current implementation"
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

    // Since we're generating slots on-demand, there's nothing to clear
    // This endpoint is kept for API compatibility
    return NextResponse.json({
      success: true,
      message: `Time slots for ${date} are generated on-demand`,
      note: "No persistent slots to clear with current implementation"
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

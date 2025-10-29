import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabase";

// PATCH - Move booking to a different date/time
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { newDate, newTime } = body;

    console.log('Moving booking:', id, 'to:', newDate, newTime);

    if (!newDate || !newTime) {
      return NextResponse.json(
        { error: "New date and time are required" },
        { status: 400 }
      );
    }

    // Validate date format
    const dateObj = new Date(newDate);
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    // First, check if the booking exists
    const { data: existingBooking, error: fetchError } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingBooking) {
      console.error('Booking not found:', fetchError);
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if there's already a booking at the new time slot
    const { data: conflictingBooking, error: conflictError } = await supabaseAdmin
      .from("bookings")
      .select("id")
      .eq("date", newDate)
      .eq("time", newTime)
      .neq("id", id); // Exclude the current booking

    if (conflictError) {
      console.error('Error checking for conflicts:', conflictError);
      return NextResponse.json(
        { error: "Failed to check for conflicts" },
        { status: 500 }
      );
    }

    // If there's a conflict, find the next available slot
    let finalTime = newTime;
    if (conflictingBooking && conflictingBooking.length > 0) {
      console.log('Time slot conflict detected, finding alternative...');
      
      // Generate time slots for the target date (9:00 AM to 6:00 PM, 30-minute intervals)
      const timeSlots = [];
      const startHour = 9;
      const endHour = 18;
      const interval = 30;

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          timeSlots.push(timeString);
        }
      }

      // Find the next available slot
      const currentTimeIndex = timeSlots.indexOf(newTime);
      let alternativeTime = null;
      
      for (let i = currentTimeIndex + 1; i < timeSlots.length; i++) {
        const checkTime = timeSlots[i];
        const { data: checkConflict } = await supabaseAdmin
          .from("bookings")
          .select("id")
          .eq("date", newDate)
          .eq("time", checkTime)
          .neq("id", id);
          
        if (!checkConflict || checkConflict.length === 0) {
          alternativeTime = checkTime;
          break;
        }
      }
      
      if (alternativeTime) {
        finalTime = alternativeTime;
        console.log('Using alternative time:', alternativeTime);
      } else {
        return NextResponse.json(
          { error: "No available time slots for the selected date" },
          { status: 409 }
        );
      }
    }

    // Update the booking with new date and time
    const { data: updatedBooking, error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({
        date: newDate,
        time: finalTime,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating booking:", updateError);
      return NextResponse.json(
        { error: "Failed to move booking" },
        { status: 500 }
      );
    }

    // Format the time to HH:MM for consistency with frontend
    const formattedBooking = {
      ...updatedBooking,
      time: finalTime // This is already in HH:MM format from our logic
    };

    console.log('Booking moved successfully:', formattedBooking);
    return NextResponse.json({
      success: true,
      booking: formattedBooking,
      message: `Booking moved successfully${finalTime !== newTime ? ` to ${finalTime}` : ''}`
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

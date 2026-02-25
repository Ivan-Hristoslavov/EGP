import { NextRequest, NextResponse } from "next/server";

import { supabase, supabaseAdmin } from "../../../../lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

// GET - Fetch single booking by ID (UUID) or booking_number
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Use admin client to bypass RLS and ensure we can fetch any booking
    // Try to fetch by UUID first
    let { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();
    
    // Fetch team member if team_member_id exists
    if (booking && booking.team_member_id) {
      const { data: teamMember } = await supabaseAdmin
        .from("team")
        .select("id, name, role")
        .eq("id", booking.team_member_id)
        .single();
      
      if (teamMember) {
        booking.team = teamMember;
      }
    }

    // If not found by UUID, try booking_number
    if (error && error.code === 'PGRST116') {
      const { data: bookingByNumber, error: bookingNumberError } = await supabaseAdmin
        .from("bookings")
        .select("*")
        .eq("booking_number", id)
        .single();
      
      if (bookingByNumber) {
        booking = bookingByNumber;
        error = null;
        
        // Fetch team member if team_member_id exists
        if (booking.team_member_id) {
          const { data: teamMember } = await supabaseAdmin
            .from("team")
            .select("id, name, role")
            .eq("id", booking.team_member_id)
            .single();
          
          if (teamMember) {
            booking.team = teamMember;
          }
        }
      } else if (bookingNumberError && bookingNumberError.code === 'PGRST116') {
        // Both lookups failed - booking not found
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 }
        );
      } else if (bookingNumberError) {
        error = bookingNumberError;
      }
    }

    if (error) {
      console.error("Error fetching booking:", error);
      return NextResponse.json(
        { error: "Failed to fetch booking", details: error.message },
        { status: 500 }
      );
    }

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update booking by ID (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  try {
    const body = await request.json();
    console.log('PATCH request for booking ID:', id);
    console.log('Update body:', body);

    // First, let's try to fetch the booking to see if it exists
    const { data: existingBooking, error: fetchError } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error('Error fetching booking:', fetchError);
      return NextResponse.json(
        { error: "Booking not found", details: fetchError },
        { status: 404 }
      );
    }

    console.log('Existing booking found:', existingBooking);

    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating booking:", error);
      return NextResponse.json(
        { error: "Failed to update booking", details: error },
        { status: 500 }
      );
    }

    if (!booking) {
      console.error('No booking returned after update');
      return NextResponse.json(
        { error: "Booking not found after update" },
        { status: 404 }
      );
    }

    console.log('Update successful:', booking);
    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error },
      { status: 500 }
    );
  }
}

// PUT - Update booking by ID (alias for PATCH)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PATCH(request, { params });
}

// DELETE - Delete booking by ID (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  try {
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting booking:", error);
      return NextResponse.json(
        { error: "Failed to delete booking" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

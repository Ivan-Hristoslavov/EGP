import { NextRequest, NextResponse } from "next/server";

import { supabase, supabaseAdmin } from "../../../../lib/supabase";

// GET - Fetch single booking by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { data: booking, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching booking:", error);
      return NextResponse.json(
        { error: "Failed to fetch booking" },
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

// PATCH - Update booking by ID
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

// DELETE - Delete booking by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

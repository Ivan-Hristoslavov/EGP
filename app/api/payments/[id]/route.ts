import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { supabase } from "../../../../lib/supabase";

// GET - Fetch single payment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: payment, error } = await supabase
      .from("payments")
      .select(
        `
        *,
        customers!inner(name, email),
        bookings(service, date)
      `,
      )
      .eq("id", id)
      .single();

    if (error || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...payment,
      service: payment.bookings?.service,
    });
  } catch (error) {
    console.error("Error fetching payment:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT - Update payment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createRouteHandlerClient({ cookies });

    const {
      customer_id,
      booking_id,
      amount,
      payment_method,
      payment_date,
      reference,
      notes,
      payment_status,
    } = body;

    // Validate required fields
    if (!amount || !payment_method || !payment_date || !payment_status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate UUIDs if provided
    if (customer_id && customer_id.trim() === "") {
      return NextResponse.json(
        { error: "Invalid customer_id" },
        { status: 400 }
      );
    }

    if (booking_id && booking_id.trim() === "") {
      return NextResponse.json(
        { error: "Invalid booking_id" },
        { status: 400 }
      );
    }

    // Update the payment
    const { data: payment, error } = await supabase
      .from("payments")
      .update({
        customer_id: customer_id || null,
        booking_id: booking_id || null,
        amount: parseFloat(amount),
        payment_method,
        payment_date,
        reference,
        notes,
        payment_status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating payment:", error);
      return NextResponse.json(
        { error: "Failed to update payment" },
        { status: 500 }
      );
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const { error } = await supabase.from("payments").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting payment:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

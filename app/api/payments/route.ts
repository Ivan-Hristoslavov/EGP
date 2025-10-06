import { NextRequest, NextResponse } from "next/server";

import { supabase } from "../../../lib/supabase";
import { createCheckoutSession, createPaymentLink, STRIPE_TO_DB_STATUS, isStripeAvailable } from "../../../lib/stripe";

// GET - Fetch payments with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from("payments")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Error fetching payment count:", countError);
      return NextResponse.json(
        { error: "Failed to fetch payment count" },
        { status: 500 },
      );
    }

    // Get paginated payments
    const { data: payments, error } = await supabase
      .from("payments")
      .select(
        `
        *,
        customers!inner(name, email),
        bookings(service, date, customer_name)
      `,
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching payments:", error);

      return NextResponse.json(
        { error: "Failed to fetch payments" },
        { status: 500 },
      );
    }

    const totalPages = Math.ceil((totalCount || 0) / limit);

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Create new payment or payment intent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...paymentData } = body;

    if (type === "create_payment_link") {
      // Check if Stripe is configured
      if (!isStripeAvailable()) {
        return NextResponse.json(
          { error: "Stripe is not configured. Please contact support for payment options." },
          { status: 503 },
        );
      }

      // Create Stripe payment link
      const { customer_id, booking_id, amount, description, currency = "gbp" } = paymentData;

      // Get customer and booking details
      const { data: customer } = await supabase
        .from("customers")
        .select("name, email")
        .eq("id", customer_id)
        .single();

      let booking = null;

      if (booking_id) {
        const { data: bookingData } = await supabase
          .from("bookings")
          .select("service, date")
          .eq("id", booking_id)
          .single();

        booking = bookingData;
      }

      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404 },
        );
      }

      // Create payment record in database first
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert([
          {
            booking_id: booking_id || null,
            customer_id,
            amount,
            payment_method: "card",
            payment_status: "pending",
            payment_date: new Date().toISOString().split("T")[0],
            reference: null, // Will be updated with payment intent ID from webhook
            notes: `Stripe Payment Link created (${currency.toUpperCase()})`,
          },
        ])
        .select()
        .single();

      if (paymentError) {
        console.error("Error creating payment record:", paymentError);

        return NextResponse.json(
          { error: "Failed to create payment record" },
          { status: 500 },
        );
      }

      // Create Stripe Payment Link using helper function
      const productName = description || (booking ? `Payment for ${booking.service}` : "Service Payment");

      const paymentLink = await createPaymentLink({
        amount,
        currency,
        description: productName,
        customerEmail: customer.email,
        metadata: {
          customer_id,
          booking_id: booking_id || "",
          payment_id: payment.id,
          customer_name: customer.name,
          currency,
        },
      });

      // Update payment record with payment link ID for reference
      await supabase
        .from("payments")
        .update({
          reference: paymentLink.id,
          notes: `Stripe Payment Link: ${paymentLink.id} (${currency.toUpperCase()}) | URL: ${paymentLink.url}`,
        })
        .eq("id", payment.id);

      return NextResponse.json(
        {
          payment: { ...payment, reference: paymentLink.id },
          payment_link_url: paymentLink.url,
          payment_link_id: paymentLink.id,
          active: paymentLink.active,
          currency: currency.toUpperCase(),
        },
        { status: 201 },
      );
    } else {
      // Create regular payment record
      const paymentRecord = {
        ...paymentData,
        booking_id: paymentData.booking_id || null, // Convert empty string to null
        payment_status: paymentData.payment_status || "paid", // Default to paid for manual payments
      };

      const { data: payment, error } = await supabase
        .from("payments")
        .insert([paymentRecord])
        .select()
        .single();

      if (error) {
        console.error("Error creating payment:", error);

        return NextResponse.json(
          { error: "Failed to create payment" },
          { status: 500 },
        );
      }

      return NextResponse.json({ payment }, { status: 201 });
    }
  } catch (error) {
    console.error("Unexpected error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT - Update payment status (usually called by webhooks)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, payment_intent_id, status, payment_method } = body;

    let payment = null;

    // Find payment by session ID or payment intent ID
    if (session_id) {
      const { data: paymentData, error: findError } = await supabase
        .from("payments")
        .select("*")
        .eq("reference", session_id)
        .single();

      if (!findError && paymentData) {
        payment = paymentData;
      }
    } else if (payment_intent_id) {
      const { data: paymentData, error: findError } = await supabase
        .from("payments")
        .select("*")
        .eq("reference", payment_intent_id)
        .single();

      if (!findError && paymentData) {
        payment = paymentData;
      }
    }

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Update payment status
    const dbStatus =
      STRIPE_TO_DB_STATUS[status as keyof typeof STRIPE_TO_DB_STATUS] ||
      "pending";

    const { data: updatedPayment, error: updateError } = await supabase
      .from("payments")
      .update({
        payment_status: dbStatus,
        payment_method: payment_method || payment.payment_method,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating payment:", updateError);

      return NextResponse.json(
        { error: "Failed to update payment" },
        { status: 500 },
      );
    }

    return NextResponse.json({ payment: updatedPayment });
  } catch (error) {
    console.error("Unexpected error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

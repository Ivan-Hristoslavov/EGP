import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { assertSlotFree } from "@/lib/booking-conflicts";
import { validateOnlineCharge } from "@/lib/booking-pricing-server";

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY is not configured");

      return NextResponse.json(
        {
          error:
            "Payment processing is not configured. Please contact support.",
        },
        { status: 503 },
      );
    }

    const stripe = new Stripe(stripeSecretKey);
    const body = await request.json();
    const { amount, currency = "gbp", metadata = {} } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Never charge less than the selected services cost, whatever the browser says.
    if (metadata.services) {
      const isDeposit = metadata.isDeposit === "true";
      const priceCheck = await validateOnlineCharge({
        amount: Number(amount),
        services: metadata.services,
        isDeposit,
      });

      if (!priceCheck.ok) {
        return NextResponse.json(
          { error: priceCheck.message, code: "INVALID_AMOUNT" },
          { status: 400 },
        );
      }

      if (isDeposit) {
        // The booking records these figures later: use the server's, not the browser's.
        metadata.totalAmount = String(priceCheck.total);
        metadata.depositAmount = String(amount);
        metadata.remainingAmount = String(
          Math.max(
            0,
            Math.round((priceCheck.total - Number(amount)) * 100) / 100,
          ),
        );
      }
    }

    // Never take money for a time that is already taken.
    if (metadata.selectedDate && metadata.selectedTime) {
      const slotCheck = await assertSlotFree({
        date: metadata.selectedDate,
        time: metadata.selectedTime,
        durationMinutes: metadata.serviceDurationMinutes
          ? parseInt(metadata.serviceDurationMinutes, 10)
          : null,
        teamMemberId: metadata.teamMemberId || null,
      });

      if (!slotCheck.ok) {
        return NextResponse.json(
          { error: slotCheck.publicMessage, code: "SLOT_TAKEN" },
          { status: 409 },
        );
      }
    }

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to pence
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    if (!paymentIntent.client_secret) {
      console.error("Payment intent created but no client secret returned");

      return NextResponse.json(
        { error: "Failed to create payment intent - no client secret" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to create payment intent";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

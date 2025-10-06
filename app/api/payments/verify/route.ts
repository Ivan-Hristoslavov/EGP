import { NextRequest, NextResponse } from "next/server";

import { supabase } from "../../../../lib/supabase";
import { stripe, isStripeAvailable } from "@/lib/stripe";

// GET - Verify payment by session ID or test Stripe configuration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    const testMode = searchParams.get("test");

    // If test mode is requested, test Stripe configuration
    if (testMode === "true") {
      if (!isStripeAvailable()) {
        return NextResponse.json({
          success: false,
          error: "Stripe is not configured",
          message: "Please check your STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variables."
        });
      }

      // Test Stripe connection by making a simple API call
      try {
        const account = await stripe!.accounts.retrieve();
        
        return NextResponse.json({
          success: true,
          message: "Stripe is properly configured and connected",
          account: {
            id: account.id,
            business_type: account.business_type,
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            country: account.country
          }
        });
      } catch (stripeError) {
        console.error("Stripe API error:", stripeError);
        
        if (stripeError instanceof Error) {
          return NextResponse.json({
            success: false,
            error: "Stripe API error",
            message: stripeError.message
          });
        }
        
        return NextResponse.json({
          success: false,
          error: "Unknown Stripe error",
          message: "Failed to connect to Stripe API"
        });
      }
    }

    // Original payment verification logic
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    // Get payment from database
    const { data: payment, error: dbError } = await supabase
      .from("payments")
      .select(
        `
        *,
        customers(name, email),
        bookings(service, date)
      `,
      )
      .eq("reference", sessionId)
      .single();

    if (dbError || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Verify with Stripe only if configured
    if (isStripeAvailable() && stripe) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // Update payment status if needed
        if (
          session.payment_status === "paid" &&
          payment.payment_status !== "paid"
        ) {
          await supabase
            .from("payments")
            .update({
              payment_status: "paid",
              updated_at: new Date().toISOString(),
            })
            .eq("id", payment.id);

          payment.payment_status = "paid";
        }

        return NextResponse.json({
          ...payment,
          stripe_session: {
            payment_status: session.payment_status,
            amount_total: session.amount_total,
            currency: session.currency,
          },
          service: payment.bookings?.service,
        });
      } catch (stripeError) {
        console.error("Stripe verification error:", stripeError);
      }
    }

    // Return database payment data (if Stripe not configured or verification fails)
    return NextResponse.json({
      ...payment,
      service: payment.bookings?.service,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

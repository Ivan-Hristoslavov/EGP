import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import Stripe from "stripe";
import jwt from "jsonwebtoken";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any;
    
    if (decoded.type !== "customer") {
      return NextResponse.json(
        { error: "Invalid token type" },
        { status: 401 }
      );
    }

    const { planId, billingCycle } = await request.json();

    if (!planId || !billingCycle) {
      return NextResponse.json(
        { error: "Plan ID and billing cycle are required" },
        { status: 400 }
      );
    }

    // Get membership plan details
    const { data: plan, error: planError } = await supabase
      .from("membership_plans")
      .select("*")
      .eq("id", planId)
      .eq("is_active", true)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: "Membership plan not found" },
        { status: 404 }
      );
    }

    // Get customer details
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", decoded.customerId)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Check if customer already has an active membership
    const { data: existingMembership } = await supabase
      .from("customer_memberships")
      .select("id, status")
      .eq("customer_id", customer.id)
      .eq("status", "active")
      .single();

    if (existingMembership) {
      return NextResponse.json(
        { error: "You already have an active membership" },
        { status: 409 }
      );
    }

    // Get Stripe price ID
    const stripePriceId = billingCycle === "yearly" 
      ? plan.stripe_price_id_yearly 
      : plan.stripe_price_id_monthly;

    if (!stripePriceId) {
      return NextResponse.json(
        { error: "Stripe price not configured for this plan" },
        { status: 500 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      customer_email: customer.email,
      metadata: {
        customer_id: customer.id,
        plan_id: plan.id,
        billing_cycle: billingCycle,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/membership/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/membership/signup`,
      subscription_data: {
        metadata: {
          customer_id: customer.id,
          plan_id: plan.id,
          billing_cycle: billingCycle,
        },
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Membership signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

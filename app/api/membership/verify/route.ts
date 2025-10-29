import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (!session.subscription) {
      return NextResponse.json(
        { error: "No subscription found for this session" },
        { status: 404 }
      );
    }

    const subscription = session.subscription as Stripe.Subscription;
    const customerId = session.metadata?.customer_id;
    const planId = session.metadata?.plan_id;
    const billingCycle = session.metadata?.billing_cycle;

    if (!customerId || !planId) {
      return NextResponse.json(
        { error: "Invalid session metadata" },
        { status: 400 }
      );
    }

    // Get membership plan details
    const { data: plan, error: planError } = await supabase
      .from("membership_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: "Membership plan not found" },
        { status: 404 }
      );
    }

    // Check if membership already exists
    const { data: existingMembership } = await supabase
      .from("customer_memberships")
      .select("*")
      .eq("stripe_subscription_id", subscription.id)
      .single();

    if (existingMembership) {
      return NextResponse.json({
        success: true,
        membership: {
          ...existingMembership,
          plan_name: plan.name,
          discount_percentage: plan.discount_percentage,
          priority_booking: plan.priority_booking,
          free_treatments_per_month: plan.free_treatments_per_month,
          exclusive_access: plan.exclusive_access,
        },
      });
    }

    // Create new membership record
    const startDate = new Date((subscription as any).current_period_start * 1000);
    const endDate = new Date((subscription as any).current_period_end * 1000);
    const nextBillingDate = new Date((subscription as any).current_period_end * 1000);

    const { data: membership, error: membershipError } = await supabase
      .from("customer_memberships")
      .insert([
        {
          customer_id: customerId,
          plan_id: planId,
          stripe_subscription_id: subscription.id,
          status: subscription.status === 'active' ? 'active' : 'pending',
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          next_billing_date: nextBillingDate.toISOString().split('T')[0],
          auto_renew: !subscription.cancel_at_period_end,
          free_treatments_used: 0,
          free_treatments_reset_date: nextBillingDate.toISOString().split('T')[0],
        },
      ])
      .select()
      .single();

    if (membershipError) {
      console.error("Error creating membership:", membershipError);
      return NextResponse.json(
        { error: "Failed to create membership record" },
        { status: 500 }
      );
    }

    // Update customer's membership tier
    await supabase
      .from("customers")
      .update({ 
        membership_tier: plan.slug,
        membership_start_date: startDate.toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
      })
      .eq("id", customerId);

    return NextResponse.json({
      success: true,
      membership: {
        ...membership,
        plan_name: plan.name,
        discount_percentage: plan.discount_percentage,
        priority_booking: plan.priority_booking,
        free_treatments_per_month: plan.free_treatments_per_month,
        exclusive_access: plan.exclusive_access,
      },
    });
  } catch (error) {
    console.error("Membership verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

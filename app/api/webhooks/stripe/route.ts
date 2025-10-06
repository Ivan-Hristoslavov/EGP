import { NextRequest, NextResponse } from "next/server";

import { stripe, STRIPE_TO_DB_STATUS, isStripeAvailable } from "../../../../lib/stripe";
import { supabase } from "../../../../lib/supabase";

// Handle OPTIONS requests (preflight)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
    },
  });
}

export async function POST(request: NextRequest) {
  console.log('🔔 Webhook received:', {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    timestamp: new Date().toISOString()
  });

  // Check if Stripe is configured
  if (!isStripeAvailable() || !stripe) {
    console.error('❌ Stripe not configured');
    return NextResponse.json(
      { error: "Stripe webhooks are not configured" },
      { status: 503 },
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  // Allow testing without signature in development
  const isDevelopment = process.env.NODE_ENV === "development";
  
  if (!signature && !isDevelopment) {
    console.error('❌ Missing stripe-signature header');
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  if (!signature && isDevelopment) {
    console.log('⚠️  Development mode: Processing webhook without signature verification');
  }

  let event;

  try {
    if (signature) {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        console.error('❌ STRIPE_WEBHOOK_SECRET environment variable not set');
        return NextResponse.json(
          { error: "Webhook secret not configured" },
          { status: 500 }
        );
      }

      console.log('🔐 Verifying webhook signature...');
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret,
      );
      console.log('✅ Webhook signature verified successfully');
    } else if (isDevelopment) {
      // For development testing, parse the body directly
      event = JSON.parse(body);
    } else {
      throw new Error("No signature provided");
    }
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err);
    console.error("Signature:", signature);
    console.error("Body length:", body.length);

    return NextResponse.json({ 
      error: "Invalid signature", 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 400 });
  }

  try {
    console.log('🔄 Processing event:', {
      type: event.type,
      id: event.id,
      created: event.created,
      livemode: event.livemode
    });

    switch (event.type) {
      case "checkout.session.completed":
        console.log('💳 Processing checkout session completed');
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case "checkout.session.expired":
        console.log('⏰ Processing checkout session expired');
        await handleCheckoutSessionExpired(event.data.object);
        break;

      case "payment_intent.succeeded":
      case "payment_intent.payment_failed":
      case "payment_intent.canceled":
      case "payment_intent.requires_action":
        console.log('💰 Processing payment intent update:', event.type);
        await handlePaymentIntentUpdate(event.data.object);
        break;

      default:
        console.log(`❓ Unhandled event type: ${event.type}`);
    }

    console.log('✅ Webhook processed successfully');
    return NextResponse.json({ received: true, processed: true });
  } catch (error) {
    console.error("❌ Error handling webhook:", error);

    return NextResponse.json(
      { error: "Webhook handler failed", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  const sessionId = session.id;
  const paymentStatus = session.payment_status; // 'paid', 'unpaid', 'no_payment_required'
  const paymentIntentId = session.payment_intent;

  console.log(
    `Checkout session completed: ${sessionId}, status: ${paymentStatus}`,
  );

  // Find payment in database by session ID
  const { data: payment, error: findError } = await supabase
    .from("payments")
    .select("*")
    .eq("reference", sessionId)
    .single();

  if (findError || !payment) {
    console.error("Payment not found for checkout session:", sessionId);

    return;
  }

  // Update payment status
  const dbStatus = paymentStatus === "paid" ? "paid" : "failed";

  const { error: updateError } = await supabase
    .from("payments")
    .update({
      payment_status: dbStatus,
      payment_method: "card",
      notes: `Stripe Checkout Session completed: ${sessionId}${paymentIntentId ? ` | Payment Intent: ${paymentIntentId}` : ""}`,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payment.id);

  if (updateError) {
    console.error("Error updating payment status:", updateError);

    return;
  }

  // If payment is successful and linked to a booking, update booking status
  if (dbStatus === "paid" && payment.booking_id) {
    await supabase
      .from("bookings")
      .update({
        payment_status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.booking_id);
  }

  console.log(`Payment ${payment.id} updated to status: ${dbStatus}`);
}

async function handleCheckoutSessionExpired(session: any) {
  const sessionId = session.id;

  console.log(`Checkout session expired: ${sessionId}`);

  // Find payment in database by session ID
  const { data: payment, error: findError } = await supabase
    .from("payments")
    .select("*")
    .eq("reference", sessionId)
    .single();

  if (findError || !payment) {
    console.error("Payment not found for expired checkout session:", sessionId);

    return;
  }

  // Update payment status to failed
  const { error: updateError } = await supabase
    .from("payments")
    .update({
      payment_status: "failed",
      notes: `Stripe Checkout Session expired: ${sessionId}`,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payment.id);

  if (updateError) {
    console.error("Error updating expired payment status:", updateError);

    return;
  }

  console.log(
    `Payment ${payment.id} marked as failed due to session expiration`,
  );
}

async function handlePaymentIntentUpdate(paymentIntent: any) {
  const paymentIntentId = paymentIntent.id;
  const status = paymentIntent.status;
  const amount = paymentIntent.amount;
  const currency = paymentIntent.currency;
  const customerId = paymentIntent.customer;
  const latestCharge = paymentIntent.latest_charge;
  const paymentMethodId = paymentIntent.payment_method;
  
  console.log(`🔍 Processing payment intent: ${paymentIntentId}`, {
    status,
    amount,
    currency,
    customerId,
    latestCharge,
    paymentMethodId,
    metadata: paymentIntent.metadata
  });

  // Find payment in database by payment intent ID or metadata
  let payment = null;
  
  // First try to find by payment intent ID (direct reference)
  const { data: paymentByRef, error: findError } = await supabase
    .from("payments")
    .select("*")
    .eq("reference", paymentIntentId)
    .single();

  if (!findError && paymentByRef) {
    payment = paymentByRef;
  } else {
    // If not found by reference, try to find by payment_id in metadata
    const paymentIdFromMetadata = paymentIntent.metadata?.payment_id;
    if (paymentIdFromMetadata) {
      const { data: paymentByMetadata, error: metadataError } = await supabase
        .from("payments")
        .select("*")
        .eq("id", paymentIdFromMetadata)
        .single();
      
      if (!metadataError && paymentByMetadata) {
        payment = paymentByMetadata;
        console.log(`Found payment by metadata: ${paymentIdFromMetadata}`);
      }
    }
    
    // If still not found, try to find by customer email for payment links
    if (!payment && customerId) {
      try {
        // Get the customer email from Stripe
        const stripeCustomer = await stripe?.customers.retrieve(customerId);
        if (stripeCustomer && !stripeCustomer.deleted && stripeCustomer.email) {
          console.log(`Looking for pending payment for customer: ${stripeCustomer.email}`);
          
          // Find pending payment links for this customer
          const { data: pendingPayments, error: pendingError } = await supabase
            .from("payments")
            .select(`
              *,
              customers!inner(email)
            `)
            .eq("payment_status", "pending")
            .like("reference", "plink_%")
            .eq("customers.email", stripeCustomer.email)
            .order("created_at", { ascending: false });
          
          if (!pendingError && pendingPayments && pendingPayments.length > 0) {
            // Use the most recent pending payment link for this customer
            payment = pendingPayments[0];
            console.log(`Found pending payment link for customer ${stripeCustomer.email}: ${payment.reference}`);
          }
        }
      } catch (error) {
        console.warn("Error trying to find payment by customer email:", error);
      }
    }
  }

  if (!payment) {
    console.error("Payment not found for payment intent:", paymentIntentId);
    
    // For succeeded payments, try to create a new payment record if we can find the customer
    if (status === "succeeded" && customerId) {
      await handleSucceededPaymentWithoutRecord(paymentIntent);
    }
    
    return;
  }

  // Map Stripe status to database status
  const dbStatus =
    STRIPE_TO_DB_STATUS[status as keyof typeof STRIPE_TO_DB_STATUS] ||
    "pending";

  // Determine payment method
  let paymentMethod = "card"; // Default
  if (paymentMethodId) {
    try {
      const pm = await stripe?.paymentMethods.retrieve(paymentMethodId);
      paymentMethod = pm?.type || "card";
    } catch (error) {
      console.warn("Could not retrieve payment method details:", error);
    }
  }

  // Update payment with comprehensive data
  const updateData: any = {
    payment_status: dbStatus,
    payment_method: paymentMethod,
    updated_at: new Date().toISOString(),
  };

  // Store the original payment link reference before updating
  const originalPaymentLinkRef = payment.reference && payment.reference.startsWith("plink_") ? payment.reference : null;
  
  // Update reference to payment intent ID if it's different (for payment links)
  if (payment.reference !== paymentIntentId) {
    updateData.reference = paymentIntentId;
    updateData.notes = `${payment.notes || ""} | Payment Intent: ${paymentIntentId}`.trim();
  }

  // For succeeded payments, update amount if different (in case of partial payments)
  if (status === "succeeded" && amount) {
    const stripeAmount = amount / 100; // Convert from cents to pounds
    if (Math.abs(payment.amount - stripeAmount) > 0.01) {
      updateData.amount = stripeAmount;
      updateData.notes = `${updateData.notes || payment.notes || ""} | Amount updated from Stripe: £${stripeAmount}`.trim();
    }
  }

  // Add charge information to notes
  if (latestCharge) {
    updateData.notes = `${updateData.notes || payment.notes || ""} | Stripe Charge: ${latestCharge}`.trim();
  }

  const { error: updateError } = await supabase
    .from("payments")
    .update(updateData)
    .eq("id", payment.id);

  if (updateError) {
    console.error("Error updating payment status:", updateError);
    return;
  }

  // If payment is successful, update booking status
  if (dbStatus === "paid" && payment.booking_id) {
    await supabase
      .from("bookings")
      .update({
        payment_status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.booking_id);
  }

  // If payment is successful and it was a payment link, disable the payment link
  if (dbStatus === "paid" && originalPaymentLinkRef) {
    try {
      console.log(`Disabling payment link: ${originalPaymentLinkRef}`);
      await stripe?.paymentLinks.update(originalPaymentLinkRef, {
        active: false
      });
      console.log(`✅ Payment link ${originalPaymentLinkRef} disabled successfully`);
      
      // Update notes to reflect that the link was disabled
      const disabledNote = `${updateData.notes || payment.notes || ""} | Payment link ${originalPaymentLinkRef} disabled after successful payment`.trim();
      await supabase
        .from("payments")
        .update({
          notes: disabledNote,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);
        
    } catch (disableError) {
      console.error(`❌ Error disabling payment link ${originalPaymentLinkRef}:`, disableError);
      // Don't fail the webhook if we can't disable the link
    }
  }

  console.log(`Payment ${payment.id} updated to status: ${dbStatus}`);
}

async function handleSucceededPaymentWithoutRecord(paymentIntent: any) {
  const paymentIntentId = paymentIntent.id;
  const amount = paymentIntent.amount / 100; // Convert from cents
  const currency = paymentIntent.currency;
  const customerId = paymentIntent.customer;
  
  console.log(`Creating payment record for succeeded payment intent: ${paymentIntentId}`);

  try {
    let customer = null;
    
    // First try to find customer by stripe_customer_id if the field exists
    if (customerId) {
      const { data: customerByStripeId } = await supabase
        .from("customers")
        .select("id, email")
        .eq("stripe_customer_id", customerId)
        .single();
      
      if (customerByStripeId) {
        customer = customerByStripeId;
      } else {
        // If not found by Stripe ID, try to get customer email from Stripe and match by email
        try {
          const stripeCustomer = await stripe?.customers.retrieve(customerId);
          if (stripeCustomer && !stripeCustomer.deleted && stripeCustomer.email) {
            const { data: customerByEmail } = await supabase
              .from("customers")
              .select("id, email")
              .eq("email", stripeCustomer.email)
              .single();
            
            if (customerByEmail) {
              customer = customerByEmail;
              
              // Update the customer with the Stripe customer ID for future use
              await supabase
                .from("customers")
                .update({ stripe_customer_id: customerId })
                .eq("id", customer.id);
              
              console.log(`Updated customer ${customer.id} with Stripe ID: ${customerId}`);
            }
          }
        } catch (stripeError) {
          console.warn("Could not retrieve Stripe customer:", stripeError);
        }
      }
    }

    if (!customer) {
      console.warn(`Customer not found for Stripe customer ID: ${customerId}`);
      return;
    }

    // Create payment record
    const { error: insertError } = await supabase
      .from("payments")
      .insert({
        customer_id: customer.id,
        amount: amount,
        payment_method: "card",
        payment_status: "paid",
        payment_date: new Date().toISOString(),
        reference: paymentIntentId,
        notes: `Auto-created from Stripe webhook | Payment Intent: ${paymentIntentId} | Customer: ${customer.email}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Error creating payment record:", insertError);
      return;
    }

    console.log(`Payment record created for payment intent: ${paymentIntentId}, customer: ${customer.email}`);
  } catch (error) {
    console.error("Error handling succeeded payment without record:", error);
  }
}

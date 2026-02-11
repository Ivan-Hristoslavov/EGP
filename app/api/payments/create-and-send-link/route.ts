import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import { createPaymentLink, isStripeAvailable } from "../../../../lib/stripe";
import { sendEmail } from "../../../../lib/sendgrid-smtp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_id, booking_id, amount, description, currency = "gbp" } = body;

    if (!customer_id || !amount) {
      return NextResponse.json(
        { error: "Customer ID and amount are required" },
        { status: 400 }
      );
    }

    // Check if Stripe is configured
    if (!isStripeAvailable()) {
      return NextResponse.json(
        { error: "Stripe is not configured. Please contact support for payment options." },
        { status: 503 }
      );
    }

    // Get customer and booking details
    const { data: customer } = await supabase
      .from("customers")
      .select("first_name, last_name, email")
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
        { status: 404 }
      );
    }

    // Create customer name from first_name and last_name
    const customerName =
      customer.first_name && customer.last_name
        ? `${customer.first_name} ${customer.last_name}`
        : customer.first_name || customer.last_name || "Customer";

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
          reference: null, // Will be updated with payment link ID
          notes: `Stripe Payment Link to be created and emailed (${currency.toUpperCase()})`,
        },
      ])
      .select()
      .single();

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
      return NextResponse.json(
        { error: "Failed to create payment record" },
        { status: 500 }
      );
    }

    // Create Stripe Payment Link
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
        customer_name: customerName,
        currency,
        created_via: "email_link",
      },
    });

    // Update payment record with payment link details
    const updatedNotes = `Stripe Payment Link: ${paymentLink.id} (${currency.toUpperCase()}) | URL: ${paymentLink.url} | Created via email`;
    await supabase
      .from("payments")
      .update({
        reference: paymentLink.id,
        notes: updatedNotes,
      })
      .eq("id", payment.id);

    // Get admin profile for email sender info
    const { data: adminProfile } = await supabase
      .from("admin_profile")
      .select("name, email, company_name")
      .single();

    if (!adminProfile) {
      return NextResponse.json(
        { error: "Admin profile not found" },
        { status: 500 }
      );
    }

    // Create email content
    const emailSubject = `Payment Request from ${adminProfile.company_name || adminProfile.name}`;
    const emailContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
body{margin:0;padding:0;font-family:Georgia,serif;background:#f5f3ef;color:#1c1917}
.wrap{max-width:560px;margin:0 auto;background:#fff}
.head{background:#1c1917;color:#faf8f5;padding:36px 28px;text-align:center}
.head h1{margin:0;font-size:22px;font-weight:400;letter-spacing:.1em}
.line{width:40px;height:2px;background:#b76e79;margin:14px auto 0}
.main{padding:40px 32px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7}
.card{background:#faf8f5;border:1px solid #e7e4df;margin:24px 0;padding:24px}
.card-title{font-size:11px;letter-spacing:.12em;color:#78716c;margin-bottom:12px}
.row{padding:10px 0;border-bottom:1px solid #e7e4df}
.row:last-child{border-bottom:none}
.btn{display:inline-block;background:#1c1917;color:#faf8f5!important;padding:16px 36px;text-decoration:none;font-size:13px;letter-spacing:.1em}
.ft{padding:28px 32px;text-align:center;font-size:12px;color:#a8a29e;border-top:1px solid #e7e4df}
</style>
</head>
<body>
<div class="wrap">
<div class="head">
<h1>Payment Request</h1>
<p style="margin:8px 0 0;font-size:14px;opacity:.9">${adminProfile.company_name || adminProfile.name}</p>
<div class="line"></div>
</div>
<div class="main">
<p>Dear ${customerName},</p>
<p>We've prepared a secure payment link for you.</p>
<div class="card">
<div class="card-title">Details</div>
<div class="row">£${amount.toFixed(2)}</div>
<div class="row">${productName}</div>
${booking ? `<div class="row">${booking.service} · ${new Date(booking.date).toLocaleDateString()}</div>` : ''}
</div>
<div style="text-align:center;margin:28px 0">
<a href="${paymentLink.url}" class="btn">Pay Now — £${amount.toFixed(2)}</a>
</div>
<p style="font-size:14px;color:#78716c">Secure payment via Stripe. Questions? Contact ${adminProfile.name}.</p>
</div>
<div class="ft">
<p style="margin:0">${adminProfile.name} · ${adminProfile.company_name || ''}</p>
</div>
</div>
</body>
</html>
    `;

    // Send email via SMTP (Gmail)
    await sendEmail({
      to: customer.email,
      subject: emailSubject,
      text: `Payment Request from ${adminProfile.company_name || adminProfile.name}\n\nDear ${customerName},\n\nPay Now: ${paymentLink.url}\n\nAmount: £${amount.toFixed(2)}\n${booking ? `Service: ${booking.service}\n` : ""}${booking ? `Date: ${new Date(booking.date).toLocaleDateString()}\n` : ""}`,
      html: emailContent,
    });

    // Update payment record to track that email was sent
    await supabase
      .from("payments")
      .update({
        notes: `${updatedNotes} | Email sent to ${customer.email} at ${new Date().toISOString()}`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    return NextResponse.json({
      success: true,
      payment: { ...payment, reference: paymentLink.id },
      payment_link_url: paymentLink.url,
      payment_link_id: paymentLink.id,
      email_sent: true,
      customer_email: customer.email,
      message: "Payment link created and email sent successfully"
    });

  } catch (error) {
    console.error("Error creating payment link and sending email:", error);
    return NextResponse.json(
      { error: "Failed to create payment link and send email" },
      { status: 500 }
    );
  }
} 
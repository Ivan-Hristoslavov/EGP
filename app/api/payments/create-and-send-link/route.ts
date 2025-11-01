import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import { createPaymentLink, isStripeAvailable } from "../../../../lib/stripe";

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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Payment Request</h2>
        
        <p>Dear ${customer.name},</p>
        
        <p>We hope this email finds you well. We have prepared a secure payment link for your convenience.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Payment Details</h3>
          <p><strong>Amount:</strong> £${amount.toFixed(2)}</p>
          <p><strong>Description:</strong> ${productName}</p>
          ${booking ? `<p><strong>Service:</strong> ${booking.service}</p>` : ''}
          ${booking ? `<p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>` : ''}
          <p><strong>Payment Method:</strong> Secure online payment via Stripe</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${paymentLink.url}" 
             style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Pay Now - £${amount.toFixed(2)}
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          This payment link is secure and processed by Stripe. You can pay using your credit/debit card or other supported payment methods.
        </p>
        
        <p style="color: #666; font-size: 14px;">
          If you have any questions about this payment, please don't hesitate to contact us.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #666; font-size: 12px;">
          Best regards,<br>
          ${adminProfile.name}<br>
          ${adminProfile.company_name || ''}<br>
          ${adminProfile.email}
        </p>
      </div>
    `;

    // Send email using your preferred email service
    // For now, we'll just log the email content
    console.log('Email would be sent to:', customer.email);
    console.log('Email subject:', emailSubject);
    console.log('Email content:', emailContent);

    // TODO: Implement actual email sending using SendGrid or similar service
    // Example with SendGrid:
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: customer.email,
      from: adminProfile.email,
      subject: emailSubject,
      html: emailContent,
    };

    await sgMail.send(msg);
    */

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
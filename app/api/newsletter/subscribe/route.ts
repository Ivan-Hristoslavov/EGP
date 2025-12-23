import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendEmail } from "@/lib/sendgrid-smtp";
import { siteConfig } from "@/config/site";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, email, mobile } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if customer already exists by email
    const { data: existingCustomer } = await supabaseAdmin
      .from("customers")
      .select("id, first_name, last_name, phone, marketing_emails")
      .eq("email", email.toLowerCase())
      .single();

    let customerId: string;

    if (existingCustomer) {
      // Update existing customer
      customerId = existingCustomer.id;
      
      const updateData: any = {
        marketing_emails: true,
        updated_at: new Date().toISOString(),
      };

      // Update fields if provided and not already set
      if (firstName && !existingCustomer.first_name) {
        updateData.first_name = firstName;
      }
      if (mobile && !existingCustomer.phone) {
        updateData.phone = mobile;
      }

      const { error: updateError } = await supabaseAdmin
        .from("customers")
        .update(updateData)
        .eq("id", customerId);

      if (updateError) {
        console.error("Error updating customer:", updateError);
      }
    } else {
      // Create new customer (without password - they'll need to set it later if they want an account)
      const { data: newCustomer, error: createError } = await supabaseAdmin
        .from("customers")
        .insert([
          {
            first_name: firstName || "Newsletter",
            last_name: "Subscriber",
            email: email.toLowerCase(),
            phone: mobile || null,
            password_hash: null, // Newsletter subscriber - no password required
            marketing_emails: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select("id")
        .single();

      if (createError) {
        console.error("Error creating customer:", createError);
        return NextResponse.json(
          { error: "Failed to create customer record" },
          { status: 500 }
        );
      }

      customerId = newCustomer.id;
    }

    // Generate discount code
    const codePrefix = siteConfig.newsletter.discountCodePrefix || "WELCOME";
    const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    const discountCode = `${codePrefix}-${randomCode}`;

    // Calculate valid until date (30 days from now)
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + (siteConfig.newsletter.discountValidDays || 30));

    // Save discount code to database
    const { data: savedCode, error: codeError } = await supabaseAdmin
      .from("discount_codes")
      .insert([
        {
          customer_id: customerId,
          code: discountCode,
          discount_percentage: siteConfig.newsletter.welcomeDiscountPercent || 10,
          valid_from: new Date().toISOString(),
          valid_until: validUntil.toISOString(),
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (codeError) {
      console.error("Error saving discount code:", codeError);
      // Continue anyway - code is generated, just not saved
    }

    // Send email with discount code
    try {
      const emailSubject = `Welcome! Your ${siteConfig.newsletter.welcomeDiscountPercent}% Discount Code`;
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Discount Code</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #464C45; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to EGP Aesthetics!</h1>
          </div>
          <div style="background-color: #f5f1e9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 18px; margin-bottom: 20px;">Thank you for subscribing to our newsletter, ${firstName || "Valued Customer"}!</p>
            <p style="margin-bottom: 30px;">We're excited to offer you an exclusive <strong>${siteConfig.newsletter.welcomeDiscountPercent}% discount</strong> on your first visit to EGP Aesthetics.</p>
            
            <div style="background-color: white; border: 3px solid #464C45; border-radius: 10px; padding: 25px; text-align: center; margin: 30px 0;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Your Discount Code</p>
              <p style="margin: 0; font-size: 36px; font-weight: bold; color: #464C45; letter-spacing: 3px;">${discountCode}</p>
            </div>
            
            <p style="margin-bottom: 20px;"><strong>How to use your discount:</strong></p>
            <ul style="margin-bottom: 30px; padding-left: 20px;">
              <li>Book your appointment online or call us</li>
              <li>Mention this discount code when booking</li>
              <li>The discount will be applied to your first treatment</li>
              <li>Valid for ${siteConfig.newsletter.discountValidDays || 30} days from today</li>
            </ul>
            
            <p style="margin-bottom: 20px;">We look forward to welcoming you to our clinic and helping you look and feel your best!</p>
            
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
              Best regards,<br>
              The EGP Aesthetics Team
            </p>
          </div>
        </body>
        </html>
      `;

      const emailText = `
Welcome to EGP Aesthetics!

Thank you for subscribing to our newsletter, ${firstName || "Valued Customer"}!

We're excited to offer you an exclusive ${siteConfig.newsletter.welcomeDiscountPercent}% discount on your first visit.

Your Discount Code: ${discountCode}

How to use your discount:
- Book your appointment online or call us
- Mention this discount code when booking
- The discount will be applied to your first treatment
- Valid for ${siteConfig.newsletter.discountValidDays || 30} days from today

We look forward to welcoming you to our clinic!

Best regards,
The EGP Aesthetics Team
      `;

      await sendEmail({
        to: email,
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Continue - code is still generated and saved
    }

    return NextResponse.json({
      success: true,
      discountCode,
      message: "Subscription successful! Check your email for your discount code.",
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendEmail } from "@/lib/sendgrid-smtp";
import { siteConfig } from "@/config/site";
import { getEmailHead, EMAIL } from "@/lib/email-theme";

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
      const L = EMAIL.light;
      const emailSubject = `Welcome! Your ${siteConfig.newsletter.welcomeDiscountPercent}% Discount Code`;
      const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
${getEmailHead()}
<title>Your Discount Code</title>
</head>
<body class="email-body" style="margin:0;padding:0;font-family:${EMAIL.font};background:${L.bg};color:${L.text}">
<div class="email-wrap" style="max-width:560px;margin:0 auto;background:${L.wrap};color:${L.text};border:1px solid ${L.cardBorder}">
<div class="email-header" style="background:${L.green};color:#fff;padding:44px 32px;text-align:center">
<h1 style="margin:0;font-size:24px;font-weight:600;color:#fff">Welcome</h1>
<p style="margin:8px 0 0;font-size:14px;color:#e7e4df">Your exclusive offer</p>
<div class="email-accent-bar" style="width:48px;height:3px;background:${L.accent};margin:20px auto 0"></div>
</div>
<div style="padding:40px 32px;font-size:15px;line-height:1.7;color:${L.text}">
<p style="margin:0 0 8px;color:${L.text}">Thank you for subscribing, ${firstName || "Valued Customer"}.</p>
<p style="margin:0 0 24px;color:${L.textMuted}">Enjoy <strong>${siteConfig.newsletter.welcomeDiscountPercent}% off</strong> your first visit.</p>

<div style="background:${L.green};color:#fff;padding:28px;text-align:center;margin:28px 0;letter-spacing:4px;font-size:28px;font-weight:600;border:1px solid ${L.accent}">
<div style="font-size:11px;letter-spacing:.2em;opacity:.9;margin-bottom:8px">Your code</div>
${discountCode}
</div>

<p style="font-weight:600;color:${L.text};margin-bottom:8px">How to use:</p>
<ul style="padding-left:20px;margin:12px 0 24px;color:${L.textMuted}">
<li>Book online or call us</li>
<li>Mention this code when booking</li>
<li>Valid for ${siteConfig.newsletter.discountValidDays || 30} days</li>
</ul>

<p style="margin-top:24px;color:${L.text}">We look forward to welcoming you.</p>
<p style="color:${L.green};font-weight:600">EGP Aesthetics</p>
</div>
<div class="email-footer" style="padding:28px 32px;text-align:center;font-size:12px;color:${L.muted};border-top:1px solid ${L.cardBorder};background:${L.wrap}">EGP Aesthetics London</div>
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


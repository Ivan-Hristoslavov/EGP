import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendEmail } from "@/lib/sendgrid-smtp";
import { siteConfig } from "@/config/site";

// GET - List all discount codes with customer info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;
    const search = searchParams.get("search");
    const status = searchParams.get("status"); // active, used, expired, all
    const customerId = searchParams.get("customer_id");

    let query = supabaseAdmin
      .from("discount_codes")
      .select("*, customers:customer_id(id, first_name, last_name, email)", { count: "exact" });

    // Filter by customer
    if (customerId) {
      query = query.eq("customer_id", customerId);
    }

    // Filter by status
    if (status === "active") {
      query = query.eq("is_active", true).is("used_at", null).gte("valid_until", new Date().toISOString());
    } else if (status === "used") {
      query = query.not("used_at", "is", null);
    } else if (status === "expired") {
      query = query.lt("valid_until", new Date().toISOString()).is("used_at", null);
    }

    // Search by code
    if (search) {
      query = query.ilike("code", `%${search}%`);
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: codes, error, count } = await query;

    if (error) {
      console.error("Error fetching discount codes:", error);
      return NextResponse.json({ error: "Failed to fetch discount codes" }, { status: 500 });
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      discountCodes: codes || [],
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
    console.error("Unexpected error fetching discount codes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a new discount code for a customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_id, discount_percentage, valid_days, send_email } = body;

    if (!customer_id) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
    }

    // Get customer info
    const { data: customer, error: customerError } = await supabaseAdmin
      .from("customers")
      .select("id, first_name, last_name, email")
      .eq("id", customer_id)
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Generate unique code
    const codePrefix = siteConfig.newsletter.discountCodePrefix || "WELCOME";
    const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    const discountCode = `${codePrefix}-${randomCode}`;

    const percentage = discount_percentage || siteConfig.newsletter.welcomeDiscountPercent || 10;
    const days = valid_days || siteConfig.newsletter.discountValidDays || 30;

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + days);

    // Save to database
    const { data: savedCode, error: codeError } = await supabaseAdmin
      .from("discount_codes")
      .insert([{
        customer_id,
        code: discountCode,
        discount_percentage: percentage,
        valid_from: new Date().toISOString(),
        valid_until: validUntil.toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select("*, customers:customer_id(id, first_name, last_name, email)")
      .single();

    if (codeError) {
      console.error("Error creating discount code:", codeError);
      return NextResponse.json({ error: "Failed to create discount code" }, { status: 500 });
    }

    // Optionally send email
    if (send_email && customer.email) {
      try {
        const firstName = customer.first_name || "Valued Customer";
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your Discount Code</title>
<style>
body{margin:0;padding:0;font-family:Georgia,serif;background:#f5f3ef;color:#1c1917}
.wrap{max-width:560px;margin:0 auto;background:#fff}
.head{background:linear-gradient(165deg,#1c1917 0%,#292524 100%);color:#faf8f5;padding:44px 32px;text-align:center}
.head h1{margin:0;font-size:24px;font-weight:400;letter-spacing:.08em}
.accent{width:48px;height:3px;background:#b76e79;margin:20px auto 0}
.main{padding:40px 32px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7}
.code-box{background:#1c1917;color:#faf8f5;padding:28px;text-align:center;margin:28px 0;letter-spacing:4px;font-size:28px;font-family:Georgia,serif}
.code-label{font-size:11px;letter-spacing:.2em;opacity:.8;margin-bottom:8px}
.ft{padding:28px 32px;text-align:center;font-size:12px;color:#a8a29e;border-top:1px solid #e7e4df}
</style>
</head>
<body>
<div class="wrap">
<div class="head">
<h1>Special Offer</h1>
<p>Just for you</p>
<div class="accent"></div>
</div>
<div class="main">
<p>Hello ${firstName},</p>
<p>We have a special <strong>${percentage}% discount</strong> waiting for you!</p>

<div class="code-box">
<div class="code-label">Your discount code</div>
${discountCode}
</div>

<p><strong>How to use:</strong></p>
<ul style="padding-left:20px;margin:12px 0 24px">
<li>Book online or call us</li>
<li>Mention this code when booking</li>
<li>Valid for ${days} days</li>
</ul>

<p>We look forward to seeing you!</p>
<p style="font-family:Georgia,serif"><strong>EGP Aesthetics</strong></p>
</div>
<div class="ft">EGP Aesthetics London</div>
</div>
</body>
</html>`;

        const emailText = `Hello ${firstName},\n\nWe have a special ${percentage}% discount waiting for you!\n\nYour Discount Code: ${discountCode}\n\nHow to use:\n- Book online or call us\n- Mention this code when booking\n- Valid for ${days} days\n\nWe look forward to seeing you!\n\nEGP Aesthetics`;

        await sendEmail({
          to: customer.email,
          subject: `Your ${percentage}% Discount Code from EGP Aesthetics`,
          text: emailText,
          html: emailHtml,
        });
      } catch (emailError) {
        console.error("Error sending discount email:", emailError);
        // Don't fail the request - code is still created
      }
    }

    return NextResponse.json({ discountCode: savedCode }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error creating discount code:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

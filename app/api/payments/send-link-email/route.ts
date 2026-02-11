import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import { sendEmail } from "../../../../lib/sendgrid-smtp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payment_id, customer_email, customer_name, payment_link_url, amount } = body;

    if (!payment_id || !customer_email || !customer_name || !payment_link_url || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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
<p>Dear ${customer_name},</p>
<p>We've prepared a secure payment link for you.</p>
<div class="card">
<p style="margin:0 0 8px"><strong>Amount</strong> · £${amount.toFixed(2)}</p>
<p style="margin:0;font-size:13px;color:#78716c">Secure payment via Stripe</p>
</div>
<div style="text-align:center;margin:28px 0">
<a href="${payment_link_url}" class="btn">Pay Now</a>
</div>
<p style="font-size:14px;color:#78716c">Questions? Reply to this email or contact ${adminProfile.name}.</p>
</div>
<div class="ft">
<p style="margin:0">${adminProfile.name} · ${adminProfile.company_name || ''}</p>
</div>
</div>
</body>
</html>
    `;

    // Send email using SendGrid
    try {
      console.log('Attempting to send email to:', customer_email);
      console.log('Email subject:', emailSubject);
      console.log('Admin profile email:', adminProfile.email);
      
      await sendEmail({
        to: customer_email,
        subject: emailSubject,
        text: `Payment Request from ${adminProfile.company_name || adminProfile.name}\n\nDear ${customer_name},\n\nWe have prepared a secure payment link for your convenience.\n\nAmount: £${amount.toFixed(2)}\n\nPayment Link: ${payment_link_url}\n\nBest regards,\n${adminProfile.name}`,
        html: emailContent,
      });
      
      console.log('✅ Payment link email sent successfully to:', customer_email);
    } catch (emailError: any) {
      console.error('❌ Error sending payment link email:', emailError);
      console.error('Error details:', emailError.response?.body || emailError.message);
      return NextResponse.json(
        { error: `Failed to send payment link email: ${emailError.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Update payment record to track that email was sent
    // First get the current payment to get existing notes
    const { data: currentPayment } = await supabase
      .from("payments")
      .select("notes")
      .eq("id", payment_id)
      .single();
    
    const currentNotes = currentPayment?.notes || '';
    const newNotes = `${currentNotes} | Email sent to ${customer_email} at ${new Date().toISOString()}`.trim();
    
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        notes: newNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment_id);

    if (updateError) {
      console.error("Error updating payment record:", updateError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({ 
      success: true, 
      message: "Payment link email sent successfully" 
    });

  } catch (error) {
    console.error("Error sending payment link email:", error);
    return NextResponse.json(
      { error: "Failed to send payment link email" },
      { status: 500 }
    );
  }
} 
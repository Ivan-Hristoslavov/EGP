import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import { sendEmail } from "../../../../lib/sendgrid";

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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Payment Request</h2>
        
        <p>Dear ${customer_name},</p>
        
        <p>We hope this email finds you well. We have prepared a secure payment link for your convenience.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Payment Details</h3>
          <p><strong>Amount:</strong> £${amount.toFixed(2)}</p>
          <p><strong>Payment Method:</strong> Secure online payment via Stripe</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${payment_link_url}" 
             style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Pay Now
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
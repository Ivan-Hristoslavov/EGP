import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/sendgrid-smtp";
import { getAdminContactInfo } from "@/lib/admin-profile";

export async function POST(request: NextRequest) {
  try {
    // This endpoint can be called by a cron job or scheduled task
    const { type } = await request.json();
    
    if (!type || !["24h", "1h", "followup"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid reminder type. Must be '24h', '1h', or 'followup'" },
        { status: 400 }
      );
    }

    let bookings = [];
    let reminderTime = "";

    if (type === "24h") {
      // Get bookings for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          customers (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq("date", tomorrowString)
        .in("status", ["confirmed", "pending"])
        .eq("reminder_24h_sent", false);
      
      if (error) throw error;
      bookings = data || [];
      reminderTime = "24 hours";
    } 
    else if (type === "1h") {
      // Get bookings for today in the next 1-2 hours
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      
      const todayString = now.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          customers (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq("date", todayString)
        .in("status", ["confirmed", "pending"])
        .eq("reminder_1h_sent", false)
        .gte("time", oneHourFromNow.toTimeString().slice(0, 5))
        .lte("time", twoHoursFromNow.toTimeString().slice(0, 5));
      
      if (error) throw error;
      bookings = data || [];
      reminderTime = "1 hour";
    }
    else if (type === "followup") {
      // Get completed bookings from 3 days ago for follow-up
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const threeDaysAgoString = threeDaysAgo.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          customers (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq("date", threeDaysAgoString)
        .eq("status", "completed")
        .eq("followup_sent", false);
      
      if (error) throw error;
      bookings = data || [];
    }

    const results = [];
    const contactInfo = await getAdminContactInfo();

    for (const booking of bookings) {
      try {
        let emailContent = "";
        let subject = "";

        if (type === "24h" || type === "1h") {
          subject = `Reminder: Your ${booking.service} appointment ${reminderTime} from now`;
          emailContent = generateReminderEmail(booking, reminderTime, contactInfo);
        } else if (type === "followup") {
          subject = `How was your ${booking.service} treatment?`;
          emailContent = generateFollowupEmail(booking, contactInfo);
        }

        // Send email
        await sendEmail({
          to: booking.customers.email,
          subject: subject,
          html: emailContent,
          text: emailContent.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
        });

        // Update booking to mark reminder as sent
        const updateField = type === "24h" ? "reminder_24h_sent" : 
                           type === "1h" ? "reminder_1h_sent" : 
                           "followup_sent";

        await supabase
          .from("bookings")
          .update({ [updateField]: true })
          .eq("id", booking.id);

        results.push({
          bookingId: booking.id,
          customerEmail: booking.customers.email,
          status: "sent",
        });
      } catch (error) {
        console.error(`Failed to send reminder for booking ${booking.id}:`, error);
        results.push({
          bookingId: booking.id,
          customerEmail: booking.customers.email,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      type,
      totalBookings: bookings.length,
      results,
    });
  } catch (error) {
    console.error("Reminder processing error:", error);
    return NextResponse.json(
      { error: "Failed to process reminders" },
      { status: 500 }
    );
  }
}

function generateReminderEmail(booking: any, reminderTime: string, contactInfo: { phone: string; email: string }): string {
  const appointmentDate = new Date(booking.date).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const firstName = booking.customers?.first_name || 'there';

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Appointment Reminder</title>
<style>
body{margin:0;padding:0;font-family:Georgia,serif;background:#f5f3ef;color:#1c1917}
.wrap{max-width:560px;margin:0 auto;background:#fff}
.head{background:linear-gradient(165deg,#1c1917 0%,#292524 100%);color:#faf8f5;padding:44px 32px;text-align:center}
.head h1{margin:0;font-size:24px;font-weight:400;letter-spacing:.08em}
.head p{margin:8px 0 0;font-size:14px;opacity:.9}
.accent{width:48px;height:3px;background:#b76e79;margin:20px auto 0}
.badge{display:inline-block;background:#b76e79;color:#fff;padding:10px 24px;font-size:11px;letter-spacing:.2em;margin-top:16px}
.main{padding:40px 32px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7}
.card{background:#faf8f5;border:1px solid #e7e4df;margin:24px 0;padding:24px}
.card-title{font-size:11px;letter-spacing:.15em;color:#78716c;margin-bottom:16px}
.row{padding:12px 0;border-bottom:1px solid #e7e4df}
.row:last-child{border-bottom:none}
.ft{padding:28px 32px;text-align:center;font-size:12px;color:#a8a29e;border-top:1px solid #e7e4df}
</style>
</head>
<body>
<div class="wrap">
<div class="head">
<h1>Appointment Reminder</h1>
<p>${reminderTime} from now</p>
<div class="accent"></div>
<span class="badge">EGP Aesthetics</span>
</div>
<div class="main">
<p>Hello ${firstName},</p>
<p>This is a friendly reminder that your appointment is coming up in ${reminderTime}.</p>

<div class="card">
<div class="card-title">Your appointment</div>
<div class="row">${booking.service}</div>
<div class="row">${appointmentDate}</div>
<div class="row">${booking.time} · £${booking.amount}</div>
${booking.address ? `<div class="row">${booking.address}</div>` : ''}
</div>

<p>Need to reschedule? Contact us as soon as possible. We look forward to seeing you.</p>

<div class="ft">
<p style="margin:0 0 4px"><strong>EGP Aesthetics London</strong></p>
<p style="margin:0">${contactInfo.phone} · ${contactInfo.email}</p>
</div>
</div>
</div>
</body>
</html>
  `;
}

function generateFollowupEmail(booking: any, contactInfo: { phone: string; email: string }): string {
  const firstName = booking.customers?.first_name || 'there';

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Treatment Follow-up</title>
<style>
body{margin:0;padding:0;font-family:Georgia,serif;background:#f5f3ef;color:#1c1917}
.wrap{max-width:560px;margin:0 auto;background:#fff}
.head{background:linear-gradient(165deg,#1c1917 0%,#292524 100%);color:#faf8f5;padding:44px 32px;text-align:center}
.head h1{margin:0;font-size:24px;font-weight:400;letter-spacing:.08em}
.accent{width:48px;height:3px;background:#b76e79;margin:20px auto 0}
.badge{display:inline-block;background:#b76e79;color:#fff;padding:10px 24px;font-size:11px;letter-spacing:.2em;margin-top:16px}
.main{padding:40px 32px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7}
.btn{display:inline-block;background:#1c1917;color:#faf8f5!important;padding:16px 36px;text-decoration:none;font-size:13px;letter-spacing:.1em}
.ft{padding:28px 32px;text-align:center;font-size:12px;color:#a8a29e;border-top:1px solid #e7e4df}
</style>
</head>
<body>
<div class="wrap">
<div class="head">
<h1>How was your treatment?</h1>
<div class="accent"></div>
<span class="badge">We'd love your feedback</span>
</div>
<div class="main">
<p>Hello ${firstName},</p>
<p>We hope you're enjoying the results of your ${booking.service} treatment from a few days ago.</p>
<p>Your feedback helps us improve and helps others make informed decisions. We'd love to hear about your experience.</p>

<div style="text-align:center;margin:28px 0">
<a href="https://www.egpaesthetics.co.uk/reviews" class="btn">Leave a Review</a>
</div>

<p>Any questions about your treatment? We're here for you.</p>

<div class="ft">
<p style="margin:0 0 4px"><strong>EGP Aesthetics London</strong></p>
<p style="margin:0">${contactInfo.phone} · ${contactInfo.email}</p>
</div>
</div>
</div>
</body>
</html>
  `;
}

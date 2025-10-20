import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/sendgrid";

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

    for (const booking of bookings) {
      try {
        let emailContent = "";
        let subject = "";

        if (type === "24h" || type === "1h") {
          subject = `Reminder: Your ${booking.service} appointment ${reminderTime} from now`;
          emailContent = generateReminderEmail(booking, reminderTime);
        } else if (type === "followup") {
          subject = `How was your ${booking.service} treatment?`;
          emailContent = generateFollowupEmail(booking);
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

function generateReminderEmail(booking: any, reminderTime: string): string {
  const appointmentDate = new Date(booking.date).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Appointment Reminder</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ec4899; }
        .button { display: inline-block; background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Appointment Reminder</h1>
          <p>EGP Aesthetics London</p>
        </div>
        <div class="content">
          <h2>Hello ${booking.customers.first_name}!</h2>
          <p>This is a friendly reminder that you have an appointment coming up in ${reminderTime}.</p>
          
          <div class="appointment-details">
            <h3>Appointment Details</h3>
            <p><strong>Service:</strong> ${booking.service}</p>
            <p><strong>Date:</strong> ${appointmentDate}</p>
            <p><strong>Time:</strong> ${booking.time}</p>
            <p><strong>Amount:</strong> £${booking.amount}</p>
            ${booking.address ? `<p><strong>Address:</strong> ${booking.address}</p>` : ''}
          </div>

          <p>If you need to reschedule or cancel your appointment, please contact us as soon as possible.</p>
          
          <p>We look forward to seeing you!</p>
          
          <div class="footer">
            <p><strong>EGP Aesthetics London</strong></p>
            <p>Phone: +44 20 1234 5678</p>
            <p>Email: info@egpaesthetics.co.uk</p>
            <p>Website: www.egpaesthetics.co.uk</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateFollowupEmail(booking: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Treatment Follow-up</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>How was your treatment?</h1>
          <p>EGP Aesthetics London</p>
        </div>
        <div class="content">
          <h2>Hello ${booking.customers.first_name}!</h2>
          <p>We hope you're enjoying the results of your ${booking.service} treatment from 3 days ago.</p>
          
          <p>We'd love to hear about your experience and see how you're doing. Your feedback helps us improve our services and helps other clients make informed decisions.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.egpaesthetics.co.uk/reviews" class="button">Leave a Review</a>
          </div>
          
          <p>If you have any questions or concerns about your treatment, please don't hesitate to contact us.</p>
          
          <p>We look forward to seeing you again soon!</p>
          
          <div class="footer">
            <p><strong>EGP Aesthetics London</strong></p>
            <p>Phone: +44 20 1234 5678</p>
            <p>Email: info@egpaesthetics.co.uk</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

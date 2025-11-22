import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase";
import { sendEmail } from "@/lib/sendgrid";

// GET - Fetch bookings with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;
    const status = searchParams.get("status");
    const date = searchParams.get("date");
    const search = searchParams.get("search");

    // Build the base query
    let countQuery = supabaseAdmin.from("bookings").select("*", { count: "exact", head: true });
    let bookingsQuery = supabaseAdmin.from("bookings").select("*");

    // Apply filters
    if (status && status !== 'all') {
      countQuery = countQuery.eq("status", status);
      bookingsQuery = bookingsQuery.eq("status", status);
    }

    if (date && date !== 'all') {
      if (date === 'today') {
        const today = new Date().toISOString().split('T')[0];
        countQuery = countQuery.eq("date", today);
        bookingsQuery = bookingsQuery.eq("date", today);
      } else if (date === 'tomorrow') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        countQuery = countQuery.eq("date", tomorrowStr);
        bookingsQuery = bookingsQuery.eq("date", tomorrowStr);
      } else if (date === 'this_week') {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        countQuery = countQuery.gte("date", weekStart.toISOString().split('T')[0]).lte("date", weekEnd.toISOString().split('T')[0]);
        bookingsQuery = bookingsQuery.gte("date", weekStart.toISOString().split('T')[0]).lte("date", weekEnd.toISOString().split('T')[0]);
      } else if (date === 'next_week') {
        const today = new Date();
        const nextWeekStart = new Date(today);
        nextWeekStart.setDate(today.getDate() - today.getDay() + 7);
        const nextWeekEnd = new Date(nextWeekStart);
        nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
        countQuery = countQuery.gte("date", nextWeekStart.toISOString().split('T')[0]).lte("date", nextWeekEnd.toISOString().split('T')[0]);
        bookingsQuery = bookingsQuery.gte("date", nextWeekStart.toISOString().split('T')[0]).lte("date", nextWeekEnd.toISOString().split('T')[0]);
      } else if (date === 'this_month') {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        countQuery = countQuery.gte("date", monthStart.toISOString().split('T')[0]).lte("date", monthEnd.toISOString().split('T')[0]);
        bookingsQuery = bookingsQuery.gte("date", monthStart.toISOString().split('T')[0]).lte("date", monthEnd.toISOString().split('T')[0]);
      } else if (date === 'next_month') {
        const today = new Date();
        const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);
        countQuery = countQuery.gte("date", nextMonthStart.toISOString().split('T')[0]).lte("date", nextMonthEnd.toISOString().split('T')[0]);
        bookingsQuery = bookingsQuery.gte("date", nextMonthStart.toISOString().split('T')[0]).lte("date", nextMonthEnd.toISOString().split('T')[0]);
      } else {
        // Assume it's a specific date
        countQuery = countQuery.eq("date", date);
        bookingsQuery = bookingsQuery.eq("date", date);
      }
    }

    if (search) {
      const searchPattern = `%${search}%`;
      countQuery = countQuery.or(`customer_name.ilike.${searchPattern},service.ilike.${searchPattern},customer_email.ilike.${searchPattern}`);
      bookingsQuery = bookingsQuery.or(`customer_name.ilike.${searchPattern},service.ilike.${searchPattern},customer_email.ilike.${searchPattern}`);
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error("Error fetching booking count:", countError);
      return NextResponse.json(
        { error: "Failed to fetch booking count" },
        { status: 500 }
      );
    }

    // Get paginated bookings
    const { data: bookings, error } = await bookingsQuery
      .order("date", { ascending: true })
      .order("time", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching bookings:", error);
      return NextResponse.json(
        { error: "Failed to fetch bookings" },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((totalCount || 0) / limit);

    return NextResponse.json({
      bookings,
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
    console.error("Unexpected error fetching bookings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new booking with conflict check and email notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer_id,
      customer_name,
      customer_email,
      customer_phone,
      service,
      date,
      time,
      amount,
      address,
      notes,
      team_member_id,
      service_duration_minutes
    } = body;

    // Validate required fields
    if (!customer_name || !service || !date || !time || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: customer_name, service, date, time, amount" },
        { status: 400 }
      );
    }

    // Check for booking conflicts - same date and time
    const { data: existingBookings, error: conflictError } = await supabaseAdmin
      .from("bookings")
      .select("id, customer_name, time")
      .eq("date", date)
      .eq("time", time)
      .in("status", ["scheduled", "pending", "confirmed"]);

    if (conflictError) {
      console.error("Error checking booking conflicts:", conflictError);
      return NextResponse.json(
        { error: "Failed to check booking availability" },
        { status: 500 }
      );
    }

    if (existingBookings && existingBookings.length > 0) {
      return NextResponse.json(
        { 
          error: "Time slot already booked", 
          conflict: true,
          message: `This time slot is already booked by ${existingBookings[0].customer_name}. Please select a different time.`
        },
        { status: 409 }
      );
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .insert([
        {
          customer_id: customer_id || null,
          customer_name,
          customer_email: customer_email || null,
          customer_phone: customer_phone || null,
          service,
          date,
          time,
          amount: parseFloat(amount),
          address: address || null,
          notes: notes || null,
          team_member_id: team_member_id || null,
          service_duration_minutes: service_duration_minutes || null,
          status: "pending",
          payment_status: "pending",
        },
      ])
      .select()
      .single();

    if (bookingError) {
      console.error("Error creating booking:", bookingError);
      return NextResponse.json(
        { error: `Failed to create booking: ${bookingError.message}` },
        { status: 500 }
      );
    }

    // Send email notification to admin
    try {
      await sendBookingNotificationEmail(booking);
      console.log("Booking notification email sent successfully");
    } catch (emailError) {
      console.error("Error sending booking notification email:", emailError);
      // Don't fail the booking creation if email fails
    }

    // Send confirmation email to customer with payment link
    if (customer_email) {
      try {
        await sendCustomerBookingConfirmationEmail(booking);
        console.log("Customer booking confirmation email sent successfully");
      } catch (emailError) {
        console.error("Error sending customer booking confirmation email:", emailError);
        // Don't fail the booking creation if email fails
      }
    }

    return NextResponse.json({
      success: true,
      booking,
      message: "Booking created successfully"
    });
  } catch (error) {
    console.error("Unexpected error creating booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Function to send booking notification email to admin
async function sendBookingNotificationEmail(booking: any) {
  try {
    // Get admin email from database or environment
    const { data: adminProfile } = await supabaseAdmin
      .from('admin_profile')
      .select('email, name')
      .single();

    const adminEmail = adminProfile?.email || process.env.ADMIN_EMAIL;
    
    if (!adminEmail) {
      console.warn("No admin email found for booking notification");
      return;
    }

    const emailSubject = `New Booking Request - ${booking.customer_name}`;
    const emailBody = generateBookingNotificationEmail(booking);

    await sendEmail({
      to: adminEmail,
      subject: emailSubject,
      text: emailBody,
      html: generateBookingNotificationEmailHtml(booking)
    });

  } catch (error) {
    console.error("Error in sendBookingNotificationEmail:", error);
    throw error;
  }
}

function generateBookingNotificationEmail(booking: any): string {
  const bookingDate = new Date(booking.date).toLocaleDateString("en-GB");
  
  return `
New Booking Request Received

Customer Details:
- Name: ${booking.customer_name}
- Email: ${booking.customer_email || 'Not provided'}
- Phone: ${booking.customer_phone || 'Not provided'}

Service Details:
- Service: ${booking.service}
- Date: ${bookingDate}
- Time: ${booking.time}
- Amount: £${booking.amount.toFixed(2)}

${booking.address ? `Address: ${booking.address}` : ''}
${booking.notes ? `Notes: ${booking.notes}` : ''}

Booking ID: ${booking.id}
Created: ${new Date(booking.created_at).toLocaleString("en-GB")}

Please review and update the booking status in your admin panel.
  `.trim();
}

function generateBookingNotificationEmailHtml(booking: any): string {
  const bookingDate = new Date(booking.date).toLocaleDateString("en-GB");
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Booking Request</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .booking-details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #3b82f6; }
        .amount { font-size: 24px; font-weight: bold; color: #3b82f6; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="header">
        <h1>New Booking Request</h1>
    </div>
    
    <div class="content">
        <h2>Customer Details</h2>
        <div class="booking-details">
            <p><strong>Name:</strong> ${booking.customer_name}</p>
            <p><strong>Email:</strong> ${booking.customer_email || 'Not provided'}</p>
            <p><strong>Phone:</strong> ${booking.customer_phone || 'Not provided'}</p>
        </div>
        
        <h2>Service Details</h2>
        <div class="booking-details">
            <p><strong>Service:</strong> ${booking.service}</p>
            <p><strong>Date:</strong> ${bookingDate}</p>
            <p><strong>Time:</strong> ${booking.time}</p>
            <p><strong>Amount:</strong> <span class="amount">£${booking.amount.toFixed(2)}</span></p>
        </div>
        
        ${booking.address ? `
        <h2>Address</h2>
        <div class="booking-details">
            <p>${booking.address}</p>
        </div>
        ` : ''}
        
        ${booking.notes ? `
        <h2>Notes</h2>
        <div class="booking-details">
            <p>${booking.notes}</p>
        </div>
        ` : ''}
        
        <div class="booking-details">
            <p><strong>Booking ID:</strong> ${booking.id}</p>
            <p><strong>Created:</strong> ${new Date(booking.created_at).toLocaleString("en-GB")}</p>
        </div>
        
        <p>Please review and update the booking status in your admin panel.</p>
    </div>
    
    <div class="footer">
        <p>This is an automated notification from the booking system.</p>
    </div>
</body>
</html>
  `.trim();
}

// Function to send booking confirmation email to customer with payment link
async function sendCustomerBookingConfirmationEmail(booking: any) {
  try {
    if (!booking.customer_email) {
      console.warn("No customer email provided for booking confirmation");
      return;
    }

    // Generate Stripe payment link
    const paymentLink = await generateStripePaymentLink(booking);
    
    const emailSubject = `Booking Confirmation - ${booking.service} on ${new Date(booking.date).toLocaleDateString("en-GB")}`;
    const emailBody = generateCustomerBookingConfirmationEmail(booking, paymentLink);

    await sendEmail({
      to: booking.customer_email,
      subject: emailSubject,
      text: emailBody,
      html: generateCustomerBookingConfirmationEmailHtml(booking, paymentLink)
    });

  } catch (error) {
    console.error("Error in sendCustomerBookingConfirmationEmail:", error);
    throw error;
  }
}

// Function to generate Stripe payment link
async function generateStripePaymentLink(booking: any) {
  try {
    // For now, we'll create a simple payment link
    // In a real implementation, you would integrate with Stripe API
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://egp.com';
    const paymentLink = `${baseUrl}/payment/${booking.id}`;
    
    return paymentLink;
  } catch (error) {
    console.error("Error generating Stripe payment link:", error);
    // Return a fallback link
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://egp.com';
    return `${baseUrl}/contact`;
  }
}

function generateCustomerBookingConfirmationEmail(booking: any, paymentLink: string): string {
  const bookingDate = new Date(booking.date).toLocaleDateString("en-GB");
  
  return `
Booking Confirmation - EGP Aesthetics

Dear ${booking.customer_name},

Thank you for booking with EGP Aesthetics! We're excited to provide you with our premium aesthetic treatments.

Booking Details:
- Service: ${booking.service}
- Date: ${bookingDate}
- Time: ${booking.time}
- Amount: £${booking.amount.toFixed(2)}

${booking.address ? `Address: ${booking.address}` : ''}
${booking.notes ? `Notes: ${booking.notes}` : ''}

Payment:
To secure your booking, please complete your payment using the link below:
${paymentLink}

Important Information:
- Please arrive 10 minutes before your appointment
- Bring a valid ID
- If you need to reschedule, please contact us at least 24 hours in advance
- Late cancellations may incur a fee

Contact Information:
Phone: +44 7700 900123
Email: info@egp.com

We look forward to seeing you!

Best regards,
EGP Aesthetics Team

Booking ID: ${booking.id}
  `.trim();
}

function generateCustomerBookingConfirmationEmailHtml(booking: any, paymentLink: string): string {
  const bookingDate = new Date(booking.date).toLocaleDateString("en-GB");
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .booking-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .amount { font-size: 28px; font-weight: bold; color: #667eea; }
        .payment-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .payment-button:hover { opacity: 0.9; }
        .info-box { background-color: #e0f2fe; border: 1px solid #81d4fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Booking Confirmed!</h1>
        <p>Thank you for choosing EGP Aesthetics</p>
    </div>
    
    <div class="content">
        <h2>Dear ${booking.customer_name},</h2>
        <p>We're excited to provide you with our premium aesthetic treatments. Your booking has been confirmed!</p>
        
        <h2>Booking Details</h2>
        <div class="booking-details">
            <p><strong>Service:</strong> ${booking.service}</p>
            <p><strong>Date:</strong> ${bookingDate}</p>
            <p><strong>Time:</strong> ${booking.time}</p>
            <p><strong>Amount:</strong> <span class="amount">£${booking.amount.toFixed(2)}</span></p>
        </div>
        
        ${booking.address ? `
        <h2>Address</h2>
        <div class="booking-details">
            <p>${booking.address}</p>
        </div>
        ` : ''}
        
        ${booking.notes ? `
        <h2>Notes</h2>
        <div class="booking-details">
            <p>${booking.notes}</p>
        </div>
        ` : ''}
        
        <h2>Complete Your Payment</h2>
        <p>To secure your booking, please complete your payment using the button below:</p>
        <div style="text-align: center;">
            <a href="${paymentLink}" class="payment-button">Pay Now - £${booking.amount.toFixed(2)}</a>
        </div>
        
        <div class="info-box">
            <h3>Important Information:</h3>
            <ul>
                <li>Please arrive 10 minutes before your appointment</li>
                <li>Bring a valid ID</li>
                <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
                <li>Late cancellations may incur a fee</li>
            </ul>
        </div>
        
        <h2>Contact Information</h2>
        <div class="booking-details">
            <p><strong>Phone:</strong> +44 7700 900123</p>
            <p><strong>Email:</strong> info@egp.com</p>
        </div>
        
        <p>We look forward to seeing you!</p>
        <p><strong>Best regards,<br>EGP Aesthetics Team</strong></p>
        
        <div class="booking-details">
            <p><strong>Booking ID:</strong> ${booking.id}</p>
        </div>
    </div>
    
    <div class="footer">
        <p>This is an automated confirmation from EGP Aesthetics booking system.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
    </div>
</body>
</html>
  `.trim();
}

// DELETE - Delete a booking
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("id");

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Delete the booking
    const { error } = await supabaseAdmin
      .from("bookings")
      .delete()
      .eq("id", bookingId);

    if (error) {
      console.error("Error deleting booking:", error);
      return NextResponse.json(
        { error: `Failed to delete booking: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully"
    });
  } catch (error) {
    console.error("Unexpected error deleting booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update a booking
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("id");

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      customer_name,
      customer_email,
      customer_phone,
      service,
      date,
      time,
      amount,
      address,
      notes,
      status,
      payment_status
    } = body;

    // Validate required fields
    if (!customer_name || !service || !date || !time || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: customer_name, service, date, time, amount" },
        { status: 400 }
      );
    }

    // Update the booking
    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .update({
        customer_name,
        customer_email: customer_email || null,
        customer_phone: customer_phone || null,
        service,
        date,
        time,
        amount: parseFloat(amount),
        address: address || null,
        notes: notes || null,
        status: status || 'pending',
        payment_status: payment_status || 'pending',
        updated_at: new Date().toISOString()
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (error) {
      console.error("Error updating booking:", error);
      return NextResponse.json(
        { error: `Failed to update booking: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      booking,
      message: "Booking updated successfully"
    });
  } catch (error) {
    console.error("Unexpected error updating booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

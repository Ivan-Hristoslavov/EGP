import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import { sendEmail } from "@/lib/sendgrid";

// GET - Fetch bookings with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Error fetching booking count:", countError);
      return NextResponse.json(
        { error: "Failed to fetch booking count" },
        { status: 500 }
      );
    }

    // Get paginated bookings
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("*")
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
      notes
    } = body;

    // Validate required fields
    if (!customer_name || !service || !date || !time || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: customer_name, service, date, time, amount" },
        { status: 400 }
      );
    }

    // Check for booking conflicts - same date and time
    const { data: existingBookings, error: conflictError } = await supabase
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
    const { data: booking, error: bookingError } = await supabase
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
    const { data: adminProfile } = await supabase
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

Best regards,
FixMyLeak System
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
        <p>FixMyLeak Plumbing Services</p>
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
        <p>This is an automated notification from the FixMyLeak booking system.</p>
    </div>
</body>
</html>
  `.trim();
}

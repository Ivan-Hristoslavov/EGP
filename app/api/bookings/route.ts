import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase";
import { sendEmail } from "@/lib/sendgrid-smtp";
import { getAdminContactInfo } from "@/lib/admin-profile";
import { requireAdmin } from "@/lib/admin-auth";
import { getEmailHead, EMAIL } from "@/lib/email-theme";

// GET - Fetch bookings with pagination and filtering (admin only)
export async function GET(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

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
      service_duration_minutes,
      payment_method,
      payment_type,
      total_amount,
      amount_paid,
      remaining_amount,
      status: bodyStatus,
      payment_status: bodyPaymentStatus,
    } = body;

    // Validate required fields
    // Note: amount can legitimately be 0 for free bookings, so only treat it as missing
    // when it is null or undefined (not when it's 0).
    if (
      !customer_name ||
      !service ||
      !date ||
      !time ||
      amount === undefined ||
      amount === null
    ) {
      return NextResponse.json(
        { error: "Missing required fields: customer_name, service, date, time, amount" },
        { status: 400 }
      );
    }

    // Get working hours for this date to check max appointments
    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const { data: workingHour, error: workingHourError } = await supabaseAdmin
      .from("working_hours")
      .select("max_appointments")
      .eq("day_of_week", dayOfWeek)
      .single();
    
    const maxAppointments = workingHour?.max_appointments || 12;

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

    // Check max appointments limit for this date
    const { data: dayBookings, error: dayBookingsError } = await supabaseAdmin
      .from("bookings")
      .select("id")
      .eq("date", date)
      .in("status", ["scheduled", "pending", "confirmed"]);

    if (dayBookingsError) {
      console.error("Error checking day bookings:", dayBookingsError);
      return NextResponse.json(
        { error: "Failed to check booking availability" },
        { status: 500 }
      );
    }

    const currentBookingsCount = (dayBookings || []).length;
    if (currentBookingsCount >= maxAppointments) {
      return NextResponse.json(
        { 
          error: "Maximum appointments reached", 
          conflict: true,
          message: `This day has reached the maximum of ${maxAppointments} appointments. Please select a different date.`
        },
        { status: 409 }
      );
    }

    // Server-side customer upsert: look up by email or use provided customer_id
    let resolvedCustomerId: string | null = customer_id || null;
    if (!resolvedCustomerId && customer_email) {
      const { data: existingCustomer } = await supabaseAdmin
        .from("customers")
        .select("id")
        .eq("email", customer_email)
        .maybeSingle();

      if (existingCustomer) {
        resolvedCustomerId = existingCustomer.id;
      } else if (customer_name) {
        const nameParts = customer_name.trim().split(" ");
        const first_name = nameParts[0] || "";
        const last_name = nameParts.slice(1).join(" ") || "";
        const { data: newCustomer } = await supabaseAdmin
          .from("customers")
          .insert([{ first_name, last_name, email: customer_email, phone: customer_phone || null, address: address || null }])
          .select("id")
          .single();
        if (newCustomer) resolvedCustomerId = newCustomer.id;
      }
    }

    const parsedAmount = parseFloat(amount);
    const parsedTotalAmount = total_amount != null ? parseFloat(total_amount) : parsedAmount;

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .insert([
        {
          customer_id: resolvedCustomerId,
          customer_name,
          customer_email: customer_email || null,
          customer_phone: customer_phone || null,
          service,
          date,
          time,
          amount: parsedAmount,
          total_amount: parsedTotalAmount,
          amount_paid: amount_paid != null ? parseFloat(amount_paid) : parsedAmount,
          remaining_amount: remaining_amount != null ? parseFloat(remaining_amount) : 0,
          payment_type: payment_type || "full",
          payment_method: payment_method || null,
          address: address || null,
          notes: notes || null,
          team_member_id: team_member_id || null,
          service_duration_minutes: service_duration_minutes || null,
          status: bodyStatus || "pending",
          payment_status: bodyPaymentStatus || "pending",
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
    // Prefer ADMIN_EMAIL from env (e.g. info@egpaesthetics.co.uk), fallback to admin_profile
    let adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      const { data: adminProfile } = await supabaseAdmin
        .from("admin_profile")
        .select("email")
        .single();
      adminEmail = adminProfile?.email;
    }

    if (!adminEmail) {
      console.warn("No admin email found for booking notification. Set ADMIN_EMAIL in .env");
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
body{margin:0;padding:0;font-family:Georgia,serif;background:#f5f3ef;color:#1c1917}
.wrap{max-width:560px;margin:0 auto;background:#fff}
.head{background:#1c1917;color:#faf8f5;padding:36px 28px;text-align:center}
.head h1{margin:0;font-size:22px;font-weight:400;letter-spacing:.1em}
.line{width:40px;height:2px;background:#b76e79;margin:14px auto 0}
.badge{display:inline-block;background:#78716c;color:#fff;padding:6px 16px;font-size:10px;letter-spacing:.15em;margin-top:12px}
.main{padding:32px 28px;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.65}
.sect{background:#faf8f5;border:1px solid #e7e4df;margin:20px 0;padding:20px}
.sect-title{font-size:11px;letter-spacing:.12em;color:#78716c;margin-bottom:12px}
.row{padding:10px 0;border-bottom:1px solid #e7e4df}
.row:last-child{border-bottom:none}
.amt{font-size:22px;font-weight:400;color:#1c1917}
.ft{padding:24px;text-align:center;font-size:12px;color:#a8a29e;border-top:1px solid #e7e4df}
</style>
</head>
<body>
<div class="wrap">
<div class="head">
<h1>New Booking Request</h1>
<div class="line"></div>
<span class="badge">PENDING</span>
</div>
<div class="main">
<div class="sect">
<div class="sect-title">CUSTOMER</div>
<div class="row">${booking.customer_name}</div>
<div class="row">${booking.customer_email || '—'}</div>
<div class="row">${booking.customer_phone || '—'}</div>
</div>
<div class="sect">
<div class="sect-title">APPOINTMENT</div>
<div class="row">${booking.service}</div>
<div class="row">${bookingDate} · ${booking.time}</div>
<div class="row"><span class="amt">£${booking.amount.toFixed(2)}</span></div>
</div>
${booking.address ? `<div class="sect"><div class="sect-title">ADDRESS</div><div class="row">${booking.address}</div></div>` : ''}
${booking.notes ? `<div class="sect"><div class="sect-title">NOTES</div><div class="row">${booking.notes}</div></div>` : ''}
<p style="color:#78716c;font-size:13px;">Ref: ${booking.id} · ${new Date(booking.created_at).toLocaleString("en-GB")}</p>
</div>
<div class="ft">Booking system · EGP Aesthetics</div>
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

    const contactInfo = await getAdminContactInfo();
    const paymentLink = await generateStripePaymentLink(booking);
    const emailSubject = `Booking Confirmation - ${booking.service} on ${new Date(booking.date).toLocaleDateString("en-GB")}`;
    const emailBody = generateCustomerBookingConfirmationEmail(booking, paymentLink, contactInfo);

    await sendEmail({
      to: booking.customer_email,
      subject: emailSubject,
      text: emailBody,
      html: generateCustomerBookingConfirmationEmailHtml(booking, paymentLink, contactInfo),
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

function generateCustomerBookingConfirmationEmail(booking: any, paymentLink: string, contactInfo: { phone: string; email: string }): string {
  const bookingDate = new Date(booking.date).toLocaleDateString("en-GB");
  const isDeposit = booking.payment_type === "deposit" && Number(booking.amount_paid) > 0 && Number(booking.remaining_amount) > 0;
  const depositBlurb = isDeposit
    ? `\nYou have paid £${Number(booking.amount_paid).toFixed(2)} deposit. The remaining £${Number(booking.remaining_amount).toFixed(2)} is due when you attend.\n`
    : "";

  return `
Booking Confirmation - EGP Aesthetics

Dear ${booking.customer_name},

Thank you for booking with EGP Aesthetics! We're excited to provide you with our premium aesthetic treatments.

Booking Details:
- Service: ${booking.service}
- Date: ${bookingDate}
- Time: ${booking.time}
- Amount: £${(booking.total_amount != null ? parseFloat(booking.total_amount) : booking.amount).toFixed(2)}
${isDeposit ? `- Paid now (deposit): £${Number(booking.amount_paid).toFixed(2)}` : ""}
${isDeposit ? `- Due on arrival: £${Number(booking.remaining_amount).toFixed(2)}` : ""}
${depositBlurb}

${booking.address ? `Address: ${booking.address}` : ""}
${booking.notes ? `Notes: ${booking.notes}` : ""}

Payment:
To secure your booking, please complete your payment using the link below:
${paymentLink}

Important Information:
- Please arrive 10 minutes before your appointment
- Bring a valid ID
- If you need to reschedule, please contact us at least 24 hours in advance
- Late cancellations may incur a fee

Contact Information:
Phone: ${contactInfo.phone}
Email: ${contactInfo.email}

We look forward to seeing you!

Best regards,
EGP Aesthetics Team

Booking ID: ${booking.id}
  `.trim();
}

function generateCustomerBookingConfirmationEmailHtml(booking: any, paymentLink: string, contactInfo: { phone: string; email: string }): string {
  const L = EMAIL.light;
  const bookingDate = new Date(booking.date).toLocaleDateString("en-GB");
  const totalAmount = booking.total_amount != null ? parseFloat(booking.total_amount) : booking.amount;
  const amountPaid = Number(booking.amount_paid ?? 0);
  const remainingAmount = Number(booking.remaining_amount ?? 0);
  const isDeposit = booking.payment_type === "deposit" && amountPaid > 0 && remainingAmount > 0;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
${getEmailHead()}
<title>Booking Confirmation</title>
</head>
<body class="email-body" style="margin:0;padding:0;font-family:${EMAIL.font};background:${L.bg};color:${L.text}">
<div class="email-wrap" style="max-width:560px;margin:0 auto;background:${L.wrap};color:${L.text}">
<div class="email-header" style="background:${L.green};color:#fff;padding:36px 28px;text-align:center">
<h1 style="margin:0;font-size:24px;font-weight:600;color:#fff">Booking Request Received</h1>
<p style="margin:8px 0 0;font-size:14px;color:#e7e4df">Secure your appointment</p>
<div class="email-accent-bar" style="width:48px;height:3px;background:${L.accent};margin:16px auto 0"></div>
<span class="email-badge" style="display:inline-block;background:${L.greenDark};color:#fff;padding:8px 20px;font-size:11px;letter-spacing:.12em;margin-top:12px;border-radius:4px">Payment pending</span>
</div>
<div style="padding:32px 28px;font-size:15px;line-height:1.65;color:${L.text}">
<p style="margin:0 0 16px;color:${L.text}">Dear ${booking.customer_name},</p>
<p style="margin:0 0 24px;color:${L.textMuted}">Thank you for choosing EGP Aesthetics. Your booking has been received. To confirm your appointment, please complete payment below.</p>

<div class="email-card" style="background:${L.cardBg};border:1px solid ${L.cardBorder};margin:24px 0;padding:20px;border-radius:8px">
<div class="email-card-title" style="font-size:11px;letter-spacing:.12em;color:${L.green};margin-bottom:12px;font-weight:600">APPOINTMENT</div>
<div style="padding:10px 0;border-bottom:1px solid #e7e4df;color:${L.text}">${booking.service}</div>
<div style="padding:10px 0;border-bottom:1px solid #e7e4df;color:${L.text}">${bookingDate} · ${booking.time}</div>
<div style="padding:10px 0;border-bottom:1px solid #e7e4df;color:${L.text}">Total · <span style="font-size:20px;font-weight:600;color:${L.green}">£${Number(totalAmount).toFixed(2)}</span></div>
${isDeposit ? `<div style="padding:10px 0;border-bottom:1px solid #e7e4df;color:${L.text}">Paid now (deposit) · <span style="color:${L.deposit};font-weight:600">£${amountPaid.toFixed(2)}</span></div><div style="padding:10px 0;color:${L.text}">Due on arrival · <span style="font-weight:600">£${remainingAmount.toFixed(2)}</span></div>` : ""}
${booking.address ? `<div style="padding:10px 0;color:${L.text}">${booking.address}</div>` : ""}
${booking.notes ? `<div style="padding:10px 0;color:${L.text}">${booking.notes}</div>` : ""}
</div>
${isDeposit ? `<div style="background:#e8f5e9;border:1px solid ${L.accent};padding:14px;margin:16px 0;font-size:14px;color:${L.text};border-radius:6px">You have paid <strong>£${amountPaid.toFixed(2)}</strong> deposit. The remaining <strong>£${remainingAmount.toFixed(2)}</strong> is due when you attend.</div>` : ""}

<div style="text-align:center;margin:28px 0">
<a href="${paymentLink}" style="display:inline-block;background:${L.green};color:#fff;padding:16px 36px;text-decoration:none;font-size:14px;font-weight:600;border-radius:6px">Pay Now — £${(isDeposit ? remainingAmount : totalAmount).toFixed(2)}</a>
</div>

<div class="email-notice" style="background:#f0ede7;border-left:4px solid ${L.noticeBorder};padding:20px;margin:24px 0;border-radius:0 6px 6px 0">
<div style="font-weight:600;color:${L.text};margin-bottom:8px">Before your visit</div>
<ul style="margin:0;padding-left:20px;color:${L.textMuted}">
<li>Arrive 10 minutes early</li>
<li>Bring a valid ID</li>
<li>Reschedule at least 24 hours in advance if needed</li>
</ul>
<p style="margin:12px 0 0;font-size:13px;color:${L.danger};font-weight:500">You can cancel or request a refund up to 24 hours before your appointment.</p>
</div>

<div class="email-card" style="background:${L.cardBg};border:1px solid ${L.cardBorder};margin:24px 0;padding:20px;border-radius:8px">
<div class="email-card-title" style="font-size:11px;letter-spacing:.12em;color:${L.green};margin-bottom:12px;font-weight:600">QUESTIONS?</div>
<div style="padding:8px 0;color:${L.text}"><a href="tel:${contactInfo.phone.replace(/\s/g,"")}" class="email-link" style="color:${L.link};text-decoration:none;font-weight:500">${contactInfo.phone}</a></div>
<div style="padding:8px 0;color:${L.text}"><a href="mailto:${contactInfo.email}" class="email-link" style="color:${L.link};text-decoration:none;font-weight:500">${contactInfo.email}</a></div>
</div>

<p style="margin-top:28px;color:${L.text}">We look forward to welcoming you.</p>
<p style="color:${L.green};font-weight:600">EGP Aesthetics</p>
</div>
<div class="email-footer" style="padding:24px 28px;text-align:center;font-size:12px;color:${L.muted};border-top:1px solid #e7e4df;background:${L.wrap}">
<p style="margin:0">Ref: ${booking.id} · EGP Aesthetics London</p>
</div>
</div>
</body>
</html>
  `.trim();
}

// DELETE - Delete a booking (admin only)
export async function DELETE(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

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

// PUT - Update a booking (admin only)
export async function PUT(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

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
      payment_status,
      payment_method,
      payment_type,
      total_amount,
      amount_paid,
      remaining_amount,
    } = body;

    if (!customer_name || !service || !date || !time || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: customer_name, service, date, time, amount" },
        { status: 400 }
      );
    }

    const parsedAmount = parseFloat(amount);
    const updateData: Record<string, any> = {
      customer_name,
      customer_email: customer_email || null,
      customer_phone: customer_phone || null,
      service,
      date,
      time,
      amount: parsedAmount,
      address: address || null,
      notes: notes || null,
      status: status || 'pending',
      payment_status: payment_status || 'pending',
      updated_at: new Date().toISOString(),
    };

    if (total_amount != null) updateData.total_amount = parseFloat(total_amount);
    if (amount_paid != null) updateData.amount_paid = parseFloat(amount_paid);
    if (remaining_amount != null) updateData.remaining_amount = parseFloat(remaining_amount);
    if (payment_type) updateData.payment_type = payment_type;
    if (payment_method) updateData.payment_method = payment_method;

    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .update(updateData)
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

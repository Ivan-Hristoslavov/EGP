import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/sendgrid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId } = body;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    // Retrieve payment intent to check status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Payment successful - create booking record from metadata
      const metadata = paymentIntent.metadata || {};
      const services = metadata.services ? JSON.parse(metadata.services) : [];
      const selectedDate = metadata.selectedDate;
      const selectedTime = metadata.selectedTime;
      const teamMemberId = metadata.teamMemberId || null;
      const serviceDurationMinutes = metadata.serviceDurationMinutes ? parseInt(metadata.serviceDurationMinutes) : null;

      if (!selectedDate || !selectedTime || !services || services.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Missing booking information in payment metadata',
        }, { status: 400 });
      }

      // Calculate total amount and service names
      const totalAmount = services.reduce((sum: number, s: any) => sum + (s.price * s.quantity), 0);
      const serviceNames = services.map((s: any) => `${s.name}${s.quantity > 1 ? ` (x${s.quantity})` : ''}`).join(', ');

      const supabase = createClient();

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          customer_name: metadata.customerName || 'Customer',
          customer_email: metadata.customerEmail || null,
          customer_phone: metadata.customerPhone || null,
          service: serviceNames,
          date: selectedDate,
          time: selectedTime,
          amount: totalAmount,
          team_member_id: teamMemberId || null,
          service_duration_minutes: serviceDurationMinutes || null,
          status: 'confirmed',
          payment_status: 'paid',
          notes: `Payment via Stripe - Payment Intent: ${paymentIntentId}`,
        })
        .select()
        .single();

      if (bookingError) {
        console.error('Error creating booking:', bookingError);
        return NextResponse.json({
          success: false,
          error: 'Failed to create booking',
        }, { status: 500 });
      }

      // Get team member details if available
      let teamMemberName = null;
      if (teamMemberId) {
        const { data: teamMember } = await supabase
          .from('team')
          .select('name, role')
          .eq('id', teamMemberId)
          .single();
        if (teamMember) {
          teamMemberName = `${teamMember.name} (${teamMember.role})`;
        }
      }

      // Get customer email from payment intent or metadata
      let customerEmail = metadata.customerEmail;
      if (!customerEmail && paymentIntent.customer) {
        try {
          const customer = await stripe.customers.retrieve(paymentIntent.customer as string);
          if (customer && !customer.deleted && customer.email) {
            customerEmail = customer.email;
          }
        } catch (error) {
          console.warn('Could not retrieve customer email from Stripe:', error);
        }
      }

      // Send booking confirmation email to customer
      if (customerEmail) {
        try {
          const bookingDate = new Date(selectedDate).toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          const durationText = serviceDurationMinutes 
            ? `${Math.floor(serviceDurationMinutes / 60)}h ${serviceDurationMinutes % 60}m`
            : 'N/A';

          const emailSubject = `Payment Confirmed - Booking for ${serviceNames}`;
          const emailHtml = generatePaymentConfirmationEmail({
            customerName: metadata.customerName || 'Customer',
            services: services,
            bookingDate: bookingDate,
            bookingTime: selectedTime,
            duration: durationText,
            totalAmount: totalAmount,
            paymentMethod: 'Card (Stripe)',
            paymentIntentId: paymentIntentId,
            bookingId: booking.id,
            teamMember: teamMemberName,
          });

          const emailText = generatePaymentConfirmationEmailText({
            customerName: metadata.customerName || 'Customer',
            services: services,
            bookingDate: bookingDate,
            bookingTime: selectedTime,
            duration: durationText,
            totalAmount: totalAmount,
            paymentMethod: 'Card (Stripe)',
            paymentIntentId: paymentIntentId,
            bookingId: booking.id,
            teamMember: teamMemberName,
          });

          await sendEmail({
            to: customerEmail,
            subject: emailSubject,
            text: emailText,
            html: emailHtml,
          });

          console.log('Payment confirmation email sent to:', customerEmail);
        } catch (emailError) {
          console.error('Error sending payment confirmation email:', emailError);
          // Don't fail the booking if email fails
        }
      }

      console.log('Payment succeeded and booking created:', booking.id);
      
      return NextResponse.json({
        success: true,
        paymentIntent,
        bookingId: booking.id,
      });
    } else {
      return NextResponse.json({
        success: false,
        status: paymentIntent.status,
        error: 'Payment not completed',
      });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}

function generatePaymentConfirmationEmail(data: {
  customerName: string;
  services: any[];
  bookingDate: string;
  bookingTime: string;
  duration: string;
  totalAmount: number;
  paymentMethod: string;
  paymentIntentId: string;
  bookingId: string;
  teamMember: string | null;
}): string {
  const servicesList = data.services.map(s => 
    `• ${s.name}${s.quantity > 1 ? ` (x${s.quantity})` : ''} - £${(s.price * s.quantity).toFixed(2)}`
  ).join('<br>');

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Confirmed</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #e11d48 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .details-box { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e11d48; }
        .amount { font-size: 28px; font-weight: bold; color: #e11d48; }
        .success-badge { display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
        .info-box { background-color: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; text-align: center; }
        .detail-row { margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: bold; color: #6b7280; display: inline-block; width: 150px; }
        .detail-value { color: #1f2937; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Payment Confirmed! ✅</h1>
        <p>Thank you for your payment</p>
    </div>
    
    <div class="content">
        <h2>Dear ${data.customerName},</h2>
        <p>Your payment has been successfully processed. Your booking is now confirmed!</p>
        
        <div class="success-badge">PAYMENT RECEIVED</div>
        
        <h2>Services Paid For</h2>
        <div class="details-box">
            ${servicesList}
            <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #e5e7eb;">
                <strong>Total Amount: <span class="amount">£${data.totalAmount.toFixed(2)}</span></strong>
            </div>
        </div>
        
        <h2>Booking Details</h2>
        <div class="details-box">
            <div class="detail-row">
                <span class="detail-label">Booked Day:</span>
                <span class="detail-value">${data.bookingDate}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${data.bookingTime}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">${data.duration}</span>
            </div>
            ${data.teamMember ? `
            <div class="detail-row">
                <span class="detail-label">Team Member:</span>
                <span class="detail-value">${data.teamMember}</span>
            </div>
            ` : ''}
        </div>
        
        <h2>Payment Information</h2>
        <div class="details-box">
            <div class="detail-row">
                <span class="detail-label">Amount Paid:</span>
                <span class="detail-value"><strong>£${data.totalAmount.toFixed(2)}</strong></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">${data.paymentMethod}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Payment ID:</span>
                <span class="detail-value">${data.paymentIntentId}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">${data.bookingId}</span>
            </div>
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
        <div class="details-box">
            <p><strong>Phone:</strong> +44 7700 900123</p>
            <p><strong>Email:</strong> info@egp.com</p>
        </div>
        
        <p>We look forward to seeing you!</p>
        <p><strong>Best regards,<br>EGP Aesthetics Team</strong></p>
    </div>
    
    <div class="footer">
        <p>This is an automated confirmation from EGP Aesthetics booking system.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
    </div>
</body>
</html>
  `.trim();
}

function generatePaymentConfirmationEmailText(data: {
  customerName: string;
  services: any[];
  bookingDate: string;
  bookingTime: string;
  duration: string;
  totalAmount: number;
  paymentMethod: string;
  paymentIntentId: string;
  bookingId: string;
  teamMember: string | null;
}): string {
  const servicesList = data.services.map(s => 
    `- ${s.name}${s.quantity > 1 ? ` (x${s.quantity})` : ''} - £${(s.price * s.quantity).toFixed(2)}`
  ).join('\n');

  return `
Payment Confirmed - EGP Aesthetics

Dear ${data.customerName},

Your payment has been successfully processed. Your booking is now confirmed!

PAYMENT RECEIVED ✅

Services Paid For:
${servicesList}

Total Amount: £${data.totalAmount.toFixed(2)}

Booking Details:
- Booked Day: ${data.bookingDate}
- Time: ${data.bookingTime}
- Duration: ${data.duration}
${data.teamMember ? `- Team Member: ${data.teamMember}` : ''}

Payment Information:
- Amount Paid: £${data.totalAmount.toFixed(2)}
- Payment Method: ${data.paymentMethod}
- Payment ID: ${data.paymentIntentId}
- Booking ID: ${data.bookingId}

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
  `.trim();
}

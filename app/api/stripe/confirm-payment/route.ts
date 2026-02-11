import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { sendEmail } from '@/lib/sendgrid-smtp';
import { getAdminContactInfo } from '@/lib/admin-profile';

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
      
      console.log('=== Payment Confirmed - Processing Booking ===');
      console.log('PaymentIntent ID:', paymentIntentId);
      console.log('Metadata received:', JSON.stringify(metadata, null, 2));
      
      const services = metadata.services ? JSON.parse(metadata.services) : [];
      const selectedDate = metadata.selectedDate;
      const selectedTime = metadata.selectedTime;
      const teamMemberId = metadata.teamMemberId || null;
      const serviceDurationMinutes = metadata.serviceDurationMinutes ? parseInt(metadata.serviceDurationMinutes) : null;

      if (!selectedDate || !selectedTime || !services || services.length === 0) {
        console.error('Missing booking information:', { selectedDate, selectedTime, servicesCount: services.length });
        return NextResponse.json({
          success: false,
          error: 'Missing booking information in payment metadata',
        }, { status: 400 });
      }

      // Calculate total amount and service names
      const totalAmount = services.reduce((sum: number, s: any) => sum + (s.price * s.quantity), 0);
      const serviceNames = services.map((s: any) => `${s.name}${s.quantity > 1 ? ` (x${s.quantity})` : ''}`).join(', ');

      // Get customer data from metadata - use defaults if not provided
      const customerName = metadata.customerName && metadata.customerName.trim() !== '' 
        ? metadata.customerName.trim() 
        : 'Guest Customer';
      const customerEmail = metadata.customerEmail && metadata.customerEmail.trim() !== '' 
        ? metadata.customerEmail.trim().toLowerCase() 
        : null;
      const customerPhone = metadata.customerPhone && metadata.customerPhone.trim() !== '' 
        ? metadata.customerPhone.trim() 
        : null;

      console.log('Customer data from metadata:', { customerName, customerEmail, customerPhone });

      // Try to get email from Stripe customer if not in metadata
      let finalCustomerEmail = customerEmail;
      if (!finalCustomerEmail && paymentIntent.customer) {
        try {
          const stripeCustomer = await stripe.customers.retrieve(paymentIntent.customer as string);
          if (stripeCustomer && !stripeCustomer.deleted && stripeCustomer.email) {
            finalCustomerEmail = stripeCustomer.email.toLowerCase();
            console.log('Got email from Stripe customer:', finalCustomerEmail);
          }
        } catch (error) {
          console.warn('Could not retrieve customer email from Stripe:', error);
        }
      }

      // Parse name into first_name and last_name
      const nameParts = customerName.trim().split(' ');
      const firstName = nameParts[0] || 'Guest';
      const lastName = nameParts.slice(1).join(' ') || 'Customer';

      // === STEP 1: Create or Find Customer ===
      let customerId: string | null = null;
      
      if (finalCustomerEmail) {
        // Try to find existing customer by email
        const { data: existingCustomer, error: findError } = await supabaseAdmin
          .from('customers')
          .select('id, first_name, last_name, email, phone')
          .eq('email', finalCustomerEmail)
          .single();

        if (existingCustomer && !findError) {
          // Update existing customer with latest info
          customerId = existingCustomer.id;
          const { error: updateError } = await supabaseAdmin
            .from('customers')
            .update({
              first_name: firstName,
              last_name: lastName,
              phone: customerPhone || existingCustomer.phone,
            })
            .eq('id', customerId);
          
          if (updateError) {
            console.warn('Could not update existing customer:', updateError);
          } else {
            console.log('Updated existing customer:', customerId);
          }
        } else {
          // Create new customer with email
          const { data: newCustomer, error: createError } = await supabaseAdmin
            .from('customers')
            .insert({
              first_name: firstName,
              last_name: lastName,
              email: finalCustomerEmail,
              phone: customerPhone,
              // password_hash is required in some setups - provide a placeholder for Stripe customers
              password_hash: `stripe_customer_${Date.now()}`,
            })
            .select('id')
            .single();

          if (createError) {
            console.error('Error creating customer:', createError);
            // Try without password_hash in case column is nullable
            const { data: newCustomer2, error: createError2 } = await supabaseAdmin
              .from('customers')
              .insert({
                first_name: firstName,
                last_name: lastName,
                email: finalCustomerEmail,
                phone: customerPhone,
              })
              .select('id')
              .single();
            
            if (!createError2 && newCustomer2) {
              customerId = newCustomer2.id;
              console.log('Created customer (without password_hash):', customerId);
            } else {
              console.error('Failed to create customer even without password_hash:', createError2);
            }
          } else if (newCustomer) {
            customerId = newCustomer.id;
            console.log('Created new customer:', customerId);
          }
        }
      } else {
        // No email - create customer with temporary email
        const tempEmail = `booking_${paymentIntentId.slice(-10)}@stripe.guest`;
        
        const { data: newCustomer, error: createError } = await supabaseAdmin
          .from('customers')
          .insert({
            first_name: firstName,
            last_name: lastName,
            email: tempEmail,
            phone: customerPhone,
            password_hash: `stripe_guest_${Date.now()}`,
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating guest customer:', createError);
          // Try without password_hash
          const { data: newCustomer2, error: createError2 } = await supabaseAdmin
            .from('customers')
            .insert({
              first_name: firstName,
              last_name: lastName,
              email: tempEmail,
              phone: customerPhone,
            })
            .select('id')
            .single();
          
          if (!createError2 && newCustomer2) {
            customerId = newCustomer2.id;
            console.log('Created guest customer (without password_hash):', customerId);
          }
        } else if (newCustomer) {
          customerId = newCustomer.id;
          console.log('Created guest customer:', customerId);
        }
      }

      console.log('Final customer ID:', customerId);

      // === STEP 2: Create Booking ===
      const { data: booking, error: bookingError } = await supabaseAdmin
        .from('bookings')
        .insert({
          customer_id: customerId, // May be null if customer creation failed
          customer_name: customerName,
          customer_email: finalCustomerEmail,
          customer_phone: customerPhone,
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
          details: bookingError.message,
        }, { status: 500 });
      }

      console.log('Booking created:', booking.id, 'Number:', booking.booking_number);

      // If booking was created but booking_number wasn't returned, fetch it again
      if (booking && !booking.booking_number) {
        const { data: updatedBooking } = await supabaseAdmin
          .from('bookings')
          .select('*')
          .eq('id', booking.id)
          .single();
        if (updatedBooking) {
          Object.assign(booking, updatedBooking);
        }
      }

      // === STEP 3: Create Payment Record ===
      const { data: payment, error: paymentError } = await supabaseAdmin
        .from('payments')
        .insert({
          booking_id: booking.id,
          customer_id: customerId, // May be null
          amount: totalAmount,
          payment_method: 'card',
          payment_status: 'paid',
          payment_date: new Date().toISOString().split('T')[0],
          reference: paymentIntentId,
          notes: `Stripe Payment for ${serviceNames}`,
        })
        .select()
        .single();

      if (paymentError) {
        console.error('Error creating payment record:', paymentError);
        // Don't fail the whole process - booking is already created
      } else {
        console.log('Payment record created:', payment.id);
      }

      // === STEP 4: Send Confirmation Email ===
      // Get team member details if available
      let teamMemberName = null;
      if (teamMemberId) {
        const { data: teamMember } = await supabaseAdmin
          .from('team')
          .select('name, role')
          .eq('id', teamMemberId)
          .single();
        if (teamMember) {
          teamMemberName = `${teamMember.name} (${teamMember.role})`;
        }
      }

      // Send booking confirmation email to customer
      if (finalCustomerEmail && !finalCustomerEmail.includes('@stripe.guest')) {
        try {
          const contactInfo = await getAdminContactInfo();
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
            customerName: customerName,
            services: services,
            bookingDate: bookingDate,
            bookingTime: selectedTime,
            duration: durationText,
            totalAmount: totalAmount,
            paymentMethod: 'Card (Stripe)',
            paymentIntentId: paymentIntentId,
            bookingId: booking.id,
            bookingNumber: booking.booking_number || booking.id,
            teamMember: teamMemberName,
            contactPhone: contactInfo.phone,
            contactEmail: contactInfo.email,
          });

          const emailText = generatePaymentConfirmationEmailText({
            customerName: customerName,
            services: services,
            bookingDate: bookingDate,
            bookingTime: selectedTime,
            duration: durationText,
            totalAmount: totalAmount,
            paymentMethod: 'Card (Stripe)',
            paymentIntentId: paymentIntentId,
            bookingId: booking.id,
            bookingNumber: booking.booking_number || booking.id,
            teamMember: teamMemberName,
            contactPhone: contactInfo.phone,
            contactEmail: contactInfo.email,
          });

          await sendEmail({
            to: finalCustomerEmail,
            subject: emailSubject,
            text: emailText,
            html: emailHtml,
          });

          console.log('Payment confirmation email sent to:', finalCustomerEmail);
        } catch (emailError) {
          console.error('Error sending payment confirmation email:', emailError);
          // Don't fail the booking if email fails
        }
      }

      // === STEP 5: Send Admin Notification Email ===
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        try {
          const bookingDateFormatted = new Date(selectedDate).toLocaleDateString('en-GB');
          const adminSubject = `New Paid Booking - ${customerName}`;
          const adminHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
body{margin:0;padding:0;font-family:Georgia,serif;background:#f5f3ef;color:#1c1917}
.wrap{max-width:560px;margin:0 auto}
.head{background:#1c1917;color:#faf8f5;padding:36px 28px;text-align:center}
.head h1{margin:0;font-size:22px;font-weight:400;letter-spacing:.1em}
.line{width:40px;height:2px;background:#b76e79;margin:14px auto 0}
.badge{display:inline-block;background:#b76e79;color:#fff;padding:6px 16px;font-size:10px;letter-spacing:.15em;margin-top:12px}
.main{padding:32px 28px;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.65}
.sect{background:#faf8f5;border:1px solid #e7e4df;margin:20px 0;padding:20px}
.sect-title{font-size:11px;letter-spacing:.12em;color:#78716c;margin-bottom:12px}
.row{padding:10px 0;border-bottom:1px solid #e7e4df}
.row:last-child{border-bottom:none}
.label{color:#78716c}
.amt{font-size:22px;font-weight:400;color:#1c1917}
</style>
</head>
<body>
<div class="wrap">
<div class="head">
<h1>New Paid Booking</h1>
<div class="line"></div>
<span class="badge">PAID</span>
</div>
<div class="main">
<div class="sect">
<div class="sect-title">CUSTOMER</div>
<div class="row"><span class="label">Name</span> · ${customerName}</div>
<div class="row"><span class="label">Email</span> · ${finalCustomerEmail || '—'}</div>
<div class="row"><span class="label">Phone</span> · ${customerPhone || '—'}</div>
</div>
<div class="sect">
<div class="sect-title">BOOKING</div>
<div class="row"><span class="label">Service</span> · ${serviceNames}</div>
<div class="row"><span class="label">Date</span> · ${bookingDateFormatted}</div>
<div class="row"><span class="label">Time</span> · ${selectedTime}</div>
<div class="row"><span class="label">Amount</span> · <span class="amt">£${totalAmount.toFixed(2)}</span></div>
<div class="row"><span class="label">Ref</span> · ${booking.booking_number || booking.id}</div>
</div>
<p style="color:#78716c;font-size:13px;">Payment completed via Stripe. Review in admin panel.</p>
</div>
</div>
</body>
</html>`.trim();
          const adminText = `
New Paid Booking - EGP Aesthetics

Customer: ${customerName}
Email: ${finalCustomerEmail || 'Not provided'}
Phone: ${customerPhone || 'Not provided'}

Service: ${serviceNames}
Date: ${bookingDateFormatted}
Time: ${selectedTime}
Amount: £${totalAmount.toFixed(2)}

Booking ID: ${booking.id}
Payment via Stripe - Payment Intent: ${paymentIntentId}
          `.trim();

          await sendEmail({
            to: adminEmail,
            subject: adminSubject,
            text: adminText,
            html: adminHtml,
          });

          console.log('Admin notification email sent to:', adminEmail);
        } catch (adminEmailError) {
          console.error('Error sending admin notification email:', adminEmailError);
        }
      }

      console.log('=== Booking Process Completed Successfully ===');
      console.log('Booking ID:', booking.id);
      console.log('Customer ID:', customerId);
      console.log('Payment ID:', payment?.id || 'Not created');
      
      return NextResponse.json({
        success: true,
        paymentIntent,
        bookingId: booking.id,
        bookingNumber: booking.booking_number,
        customerId: customerId,
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
  bookingNumber: string;
  teamMember: string | null;
  contactPhone: string;
  contactEmail: string;
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
body{margin:0;padding:0;font-family:Georgia,serif;background:#f5f3ef;color:#1c1917}
.wrap{max-width:560px;margin:0 auto;background:#fff}
.head{background:linear-gradient(165deg,#1c1917 0%,#292524 100%);color:#faf8f5;padding:44px 32px;text-align:center}
.head h1{margin:0;font-size:24px;font-weight:400;letter-spacing:.08em}
.head p{margin:8px 0 0;font-size:14px;opacity:.9;font-family:Helvetica,Arial,sans-serif}
.accent{width:48px;height:3px;background:#b76e79;margin:20px auto 0}
.badge{display:inline-block;background:#b76e79;color:#fff;padding:10px 24px;font-size:11px;letter-spacing:.2em;margin-top:16px}
.main{padding:40px 32px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#2d2a26}
.card{background:#faf8f5;border:1px solid #e7e4df;margin:24px 0;padding:24px}
.card-title{font-family:Georgia,serif;font-size:11px;letter-spacing:.15em;color:#78716c;margin-bottom:16px}
.row{padding:12px 0;border-bottom:1px solid #e7e4df}
.row:last-child{border-bottom:none}
.lbl{color:#78716c;font-size:13px}
.val{color:#1c1917;font-weight:500}
.amt{font-size:28px;font-weight:400;color:#1c1917;font-family:Georgia,serif}
.notice{background:#fef7ed;border-left:4px solid #b76e79;padding:20px;margin:24px 0}
.notice ul{margin:8px 0 0;padding-left:20px}
.ft{padding:28px 32px;text-align:center;font-size:12px;color:#a8a29e;border-top:1px solid #e7e4df}
</style>
</head>
<body>
<div class="wrap">
<div class="head">
<h1>Payment Confirmed</h1>
<p>Your booking is secured</p>
<div class="accent"></div>
<span class="badge">Confirmed</span>
</div>
<div class="main">
<p>Dear ${data.customerName},</p>
<p>Thank you for your payment. Your appointment is now confirmed and we look forward to welcoming you.</p>

<div class="card">
<div class="card-title">Services</div>
${servicesList}
<div style="margin-top:20px;padding-top:20px;border-top:2px solid #e7e4df"><span class="lbl">Total </span><span class="amt">£${data.totalAmount.toFixed(2)}</span></div>
</div>

<div class="card">
<div class="card-title">Appointment</div>
<div class="row"><span class="lbl">Ref</span> · <span class="val">${data.bookingNumber}</span></div>
<div class="row"><span class="lbl">Date</span> · ${data.bookingDate}</div>
<div class="row"><span class="lbl">Time</span> · ${data.bookingTime}</div>
<div class="row"><span class="lbl">Duration</span> · ${data.duration}</div>
${data.teamMember ? `<div class="row"><span class="lbl">Practitioner</span> · ${data.teamMember}</div>` : ''}
</div>

<div class="notice">
<div style="font-weight:600;color:#1c1917">Before your visit</div>
<ul>
<li>Arrive 10 minutes early</li>
<li>Bring a valid ID</li>
<li>Reschedule at least 24 hours in advance if needed</li>
</ul>
</div>

<div class="card">
<div class="card-title">Contact us</div>
<div class="row"><span class="lbl">Phone</span> · <a href="tel:${data.contactPhone.replace(/\s/g,'')}" style="color:#1c1917;text-decoration:none">${data.contactPhone}</a></div>
<div class="row"><span class="lbl">Email</span> · <a href="mailto:${data.contactEmail}" style="color:#1c1917;text-decoration:none">${data.contactEmail}</a></div>
</div>

<p style="margin-top:32px">We look forward to seeing you.</p>
<p style="font-family:Georgia,serif;color:#1c1917"><strong>EGP Aesthetics</strong></p>
</div>
<div class="ft">
<p style="margin:0">Automated confirmation · EGP Aesthetics London</p>
</div>
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
  bookingNumber: string;
  teamMember: string | null;
  contactPhone: string;
  contactEmail: string;
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
- Booking Number: ${data.bookingNumber}
- Booked Day: ${data.bookingDate}
- Time: ${data.bookingTime}
- Duration: ${data.duration}
${data.teamMember ? `- Team Member: ${data.teamMember}` : ''}

Payment Information:
- Amount Paid: £${data.totalAmount.toFixed(2)}
- Payment Method: ${data.paymentMethod}
- Payment ID: ${data.paymentIntentId}

Important Information:
- Please arrive 10 minutes before your appointment
- Bring a valid ID
- If you need to reschedule, please contact us at least 24 hours in advance
- Late cancellations may incur a fee

Contact Information:
Phone: ${data.contactPhone}
Email: ${data.contactEmail}

We look forward to seeing you!

Best regards,
EGP Aesthetics Team
  `.trim();
}

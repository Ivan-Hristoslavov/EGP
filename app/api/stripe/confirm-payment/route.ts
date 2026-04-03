import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { sendEmail } from '@/lib/sendgrid-smtp';
import { getAdminContactInfo } from '@/lib/admin-profile';
import { getEmailHead, EMAIL } from '@/lib/email-theme';

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripeServer();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment service is not configured' },
        { status: 503 }
      );
    }

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

      // Total amount: from metadata when deposit (full booking total), else from services
      const isDeposit = metadata.isDeposit === 'true';
      const totalAmountFromMeta = metadata.totalAmount != null ? parseFloat(String(metadata.totalAmount)) : NaN;
      const totalAmount = (isDeposit && !Number.isNaN(totalAmountFromMeta)) ? totalAmountFromMeta : services.reduce((sum: number, s: any) => sum + (s.price * s.quantity), 0);
      const amountPaidPence = paymentIntent.amount;
      const amountPaid = amountPaidPence / 100;
      const remainingAmount = isDeposit && metadata.remainingAmount != null ? parseFloat(String(metadata.remainingAmount)) : 0;
      const paymentType = isDeposit && amountPaid < totalAmount ? 'deposit' : 'full';
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
      const bookingInsert: Record<string, unknown> = {
        customer_id: customerId, // May be null if customer creation failed
        customer_name: customerName,
        customer_email: finalCustomerEmail,
        customer_phone: customerPhone,
        service: serviceNames,
        date: selectedDate,
        time: selectedTime,
        amount: totalAmount,
        total_amount: totalAmount,
        amount_paid: amountPaid,
        payment_type: paymentType,
        remaining_amount: paymentType === 'deposit' ? remainingAmount : 0,
        team_member_id: teamMemberId || null,
        service_duration_minutes: serviceDurationMinutes || null,
        status: 'confirmed',
        payment_status: 'paid',
        notes: `Payment via Stripe - Payment Intent: ${paymentIntentId}`,
      };
      const { data: booking, error: bookingError } = await supabaseAdmin
        .from('bookings')
        .insert(bookingInsert)
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
          amount: amountPaid,
          payment_type: paymentType,
          payment_method: 'card',
          payment_status: 'paid',
          payment_date: new Date().toISOString().split('T')[0],
          reference: paymentIntentId,
          notes: paymentType === 'deposit' ? `Deposit (Stripe) for ${serviceNames} - £${remainingAmount.toFixed(2)} due on arrival` : `Stripe Payment for ${serviceNames}`,
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
            amountPaid: amountPaid,
            remainingAmount: paymentType === 'deposit' ? remainingAmount : 0,
            paymentType: paymentType,
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
            amountPaid: amountPaid,
            remainingAmount: paymentType === 'deposit' ? remainingAmount : 0,
            paymentType: paymentType,
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
          const L = EMAIL.light;
          const adminDepositRows = paymentType === 'deposit' && amountPaid > 0 && remainingAmount > 0
            ? `<div style="padding:10px 0;border-bottom:1px solid #e7e4df"><span style="color:${L.muted};font-size:13px">Paid (deposit)</span> · <span style="color:${L.text};font-weight:600">£${amountPaid.toFixed(2)}</span></div>
<div style="padding:10px 0"><span style="color:${L.muted};font-size:13px">Due on arrival</span> · <span style="color:${L.text};font-weight:500">£${remainingAmount.toFixed(2)}</span></div>`
            : '';
          const adminHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
${getEmailHead()}
<title>New Paid Booking</title>
</head>
<body class="email-body" style="margin:0;padding:0;font-family:${EMAIL.font};background:${L.bg};color:${L.text}">
<div class="email-wrap" style="max-width:560px;margin:0 auto;background:${L.wrap};color:${L.text}">
<div class="email-header" style="background:${L.green};color:#fff;padding:32px 28px;text-align:center">
<h1 style="margin:0;font-size:22px;font-weight:600;color:#fff">New Paid Booking</h1>
<div class="email-accent-bar" style="width:40px;height:2px;background:${L.accent};margin:12px auto 0"></div>
<span class="email-badge" style="display:inline-block;background:${L.deposit};color:#fff;padding:6px 16px;font-size:10px;letter-spacing:.12em;margin-top:10px;border-radius:4px">PAID</span>
</div>
<div style="padding:28px;font-size:14px;line-height:1.65;color:${L.text}">
<div class="email-card" style="background:${L.cardBg};border:1px solid ${L.cardBorder};margin:0 0 20px;padding:20px;border-radius:8px">
<div class="email-card-title" style="font-size:11px;letter-spacing:.1em;color:${L.green};margin-bottom:12px;font-weight:600">CUSTOMER</div>
<div style="padding:8px 0;border-bottom:1px solid #e7e4df;color:${L.text}"><span style="color:${L.muted}">Name</span> · ${customerName}</div>
<div style="padding:8px 0;border-bottom:1px solid #e7e4df;color:${L.text}"><span style="color:${L.muted}">Email</span> · ${finalCustomerEmail || '—'}</div>
<div style="padding:8px 0;color:${L.text}"><span style="color:${L.muted}">Phone</span> · ${customerPhone || '—'}</div>
</div>
<div class="email-card" style="background:${L.cardBg};border:1px solid ${L.cardBorder};margin:0 0 20px;padding:20px;border-radius:8px">
<div class="email-card-title" style="font-size:11px;letter-spacing:.1em;color:${L.green};margin-bottom:12px;font-weight:600">BOOKING</div>
<div style="padding:8px 0;border-bottom:1px solid #e7e4df;color:${L.text}"><span style="color:${L.muted}">Service</span> · ${serviceNames}</div>
<div style="padding:8px 0;border-bottom:1px solid #e7e4df;color:${L.text}"><span style="color:${L.muted}">Date</span> · ${bookingDateFormatted}</div>
<div style="padding:8px 0;border-bottom:1px solid #e7e4df;color:${L.text}"><span style="color:${L.muted}">Time</span> · ${selectedTime}</div>
<div style="padding:8px 0;border-bottom:1px solid #e7e4df;color:${L.text}"><span style="color:${L.muted}">Total</span> · <span style="font-weight:600;color:${L.text}">£${totalAmount.toFixed(2)}</span></div>
${adminDepositRows}
<div style="padding:8px 0;color:${L.text}"><span style="color:${L.muted}">Ref</span> · ${booking.booking_number || booking.id}</div>
</div>
<p style="margin:0;color:${L.muted};font-size:13px">Payment via Stripe. Review in admin panel.</p>
</div>
</div>
</body>
</html>`.trim();
          const adminDepositText = paymentType === 'deposit' && amountPaid > 0 && remainingAmount > 0
            ? `Paid (deposit): £${amountPaid.toFixed(2)}\nDue on arrival: £${remainingAmount.toFixed(2)}\n\n`
            : '';
          const adminText = `
New Paid Booking - EGP Aesthetics

Customer: ${customerName}
Email: ${finalCustomerEmail || 'Not provided'}
Phone: ${customerPhone || 'Not provided'}

Service: ${serviceNames}
Date: ${bookingDateFormatted}
Time: ${selectedTime}
Total: £${totalAmount.toFixed(2)}
${adminDepositText}Ref: ${booking.booking_number || booking.id}

Payment via Stripe - ${paymentIntentId}
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
  amountPaid?: number;
  remainingAmount?: number;
  paymentType?: string;
  paymentMethod: string;
  paymentIntentId: string;
  bookingId: string;
  bookingNumber: string;
  teamMember: string | null;
  contactPhone: string;
  contactEmail: string;
}): string {
  const L = EMAIL.light;
  const servicesList = data.services.map(s =>
    `<tr><td style="padding:10px 0;border-bottom:1px solid #e7e4df;color:${L.text};font-size:15px">${s.name}${s.quantity > 1 ? ` (x${s.quantity})` : ''}</td><td style="padding:10px 0;border-bottom:1px solid #e7e4df;color:${L.text};font-weight:500;text-align:right">£${(s.price * s.quantity).toFixed(2)}</td></tr>`
  ).join('');
  const isDeposit = data.paymentType === 'deposit' && (data.amountPaid ?? 0) > 0 && (data.remainingAmount ?? 0) > 0;
  const paymentBreakdown = isDeposit
    ? `
<tr><td colspan="2" style="padding:12px 0;border-top:2px solid #e7e4df"></td></tr>
<tr><td style="padding:8px 0;color:${L.green};font-size:13px">Paid now (deposit)</td><td style="padding:8px 0;color:${L.deposit};font-weight:600;text-align:right;font-size:15px">£${(data.amountPaid ?? 0).toFixed(2)}</td></tr>
<tr><td style="padding:8px 0;color:${L.green};font-size:13px">Due on arrival</td><td style="padding:8px 0;color:${L.text};font-weight:500;text-align:right;font-size:15px">£${(data.remainingAmount ?? 0).toFixed(2)}</td></tr>
`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
${getEmailHead()}
<title>Payment Confirmed</title>
</head>
<body class="email-body" style="margin:0;padding:0;font-family:${EMAIL.font};background:${L.bg};color:${L.text}">
<div class="email-wrap" style="max-width:560px;margin:0 auto;background:${L.wrap};color:${L.text}">
<div class="email-header" style="background:${L.green};color:#fff;padding:36px 28px;text-align:center">
<h1 style="margin:0;font-size:24px;font-weight:600;letter-spacing:.04em;color:#fff">Payment Confirmed</h1>
<p style="margin:10px 0 0;font-size:14px;color:#e7e4df">Your booking is secured.</p>
<div class="email-accent-bar" style="width:48px;height:3px;background:${L.accent};margin:16px auto 0"></div>
<span class="email-badge" style="display:inline-block;background:${L.deposit};color:#fff;padding:8px 20px;font-size:11px;letter-spacing:.12em;margin-top:14px;border-radius:4px">Confirmed</span>
</div>
<div style="padding:32px 28px;font-size:15px;line-height:1.65;color:${L.text}">
<p style="margin:0 0 16px;color:${L.text}">Dear ${data.customerName},</p>
<p style="margin:0 0 24px;color:${L.textMuted}">Thank you for your payment. Your appointment is now confirmed and we look forward to welcoming you.</p>

<div class="email-card" style="background:${L.cardBg};border:1px solid ${L.cardBorder};margin:24px 0;padding:20px;border-radius:8px">
<div class="email-card-title" style="font-size:11px;letter-spacing:.12em;color:${L.green};margin-bottom:12px;font-weight:600">SERVICES BOOKED</div>
<table style="width:100%;border-collapse:collapse">
${servicesList}
<tr><td style="padding:12px 0 4px;color:${L.green};font-size:14px">Total</td><td style="padding:12px 0 4px;text-align:right;font-size:20px;font-weight:600;color:${L.text}">£${data.totalAmount.toFixed(2)}</td></tr>
${paymentBreakdown}
</table>
</div>
${isDeposit ? `<p style="margin:0 0 24px;padding:14px;background:#e8f5e9;border:1px solid ${L.accent};border-radius:6px;font-size:14px;color:${L.text}">You have paid <strong>£${(data.amountPaid ?? 0).toFixed(2)}</strong> deposit. The remaining <strong>£${(data.remainingAmount ?? 0).toFixed(2)}</strong> is due when you attend.</p>` : ''}

<div class="email-card" style="background:${L.cardBg};border:1px solid ${L.cardBorder};margin:24px 0;padding:20px;border-radius:8px">
<div class="email-card-title" style="font-size:11px;letter-spacing:.12em;color:${L.green};margin-bottom:12px;font-weight:600">APPOINTMENT</div>
<div style="padding:10px 0;border-bottom:1px solid #e7e4df;color:${L.text}"><span style="color:${L.muted};font-size:13px">Ref</span> · ${data.bookingNumber}</div>
<div style="padding:10px 0;border-bottom:1px solid #e7e4df;color:${L.text}"><span style="color:${L.muted};font-size:13px">Date</span> · ${data.bookingDate}</div>
<div style="padding:10px 0;border-bottom:1px solid #e7e4df;color:${L.text}"><span style="color:${L.muted};font-size:13px">Time</span> · ${data.bookingTime}</div>
<div style="padding:10px 0;border-bottom:1px solid #e7e4df;color:${L.text}"><span style="color:${L.muted};font-size:13px">Duration</span> · ${data.duration}</div>
${data.teamMember ? `<div style="padding:10px 0;color:${L.text}"><span style="color:${L.muted};font-size:13px">Practitioner</span> · ${data.teamMember}</div>` : ''}
</div>

<div class="email-notice" style="background:#fef7ed;border-left:4px solid ${L.noticeBorder};padding:20px;margin:24px 0;border-radius:0 6px 6px 0">
<div style="font-weight:600;color:${L.text};margin-bottom:8px">Before your visit</div>
<ul style="margin:0;padding-left:20px;color:${L.textMuted}">
<li>Arrive 10 minutes early</li>
<li>Bring a valid ID</li>
<li>Reschedule at least 24 hours in advance if needed</li>
</ul>
<p style="margin:12px 0 0;font-size:13px;color:${L.danger};font-weight:500">You can cancel or request a refund up to 24 hours before your appointment.</p>
</div>

<div class="email-card" style="background:${L.cardBg};border:1px solid ${L.cardBorder};margin:24px 0;padding:20px;border-radius:8px">
<div class="email-card-title" style="font-size:11px;letter-spacing:.12em;color:${L.green};margin-bottom:12px;font-weight:600">CONTACT US</div>
<div style="padding:10px 0;color:${L.text}"><a href="tel:${data.contactPhone.replace(/\s/g,'')}" class="email-link" style="color:${L.link};text-decoration:none;font-weight:500">${data.contactPhone}</a></div>
<div style="padding:10px 0;color:${L.text}"><a href="mailto:${data.contactEmail}" class="email-link" style="color:${L.link};text-decoration:none;font-weight:500">${data.contactEmail}</a></div>
</div>

<p style="margin-top:28px;color:${L.text}">We look forward to seeing you.</p>
<p style="color:${L.green};font-weight:600">EGP Aesthetics</p>
</div>
<div class="email-footer" style="padding:24px 28px;text-align:center;font-size:12px;color:${L.muted};border-top:1px solid #e7e4df;background:${L.wrap}">
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
  amountPaid?: number;
  remainingAmount?: number;
  paymentType?: string;
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
  const isDeposit = data.paymentType === 'deposit' && (data.amountPaid ?? 0) > 0 && (data.remainingAmount ?? 0) > 0;
  const paymentSection = isDeposit
    ? `
Payment breakdown:
- Total: £${data.totalAmount.toFixed(2)}
- Paid now (deposit): £${(data.amountPaid ?? 0).toFixed(2)}
- Due on arrival: £${(data.remainingAmount ?? 0).toFixed(2)}

You have paid £${(data.amountPaid ?? 0).toFixed(2)} deposit. The remaining £${(data.remainingAmount ?? 0).toFixed(2)} is due when you attend.
`
    : `
Payment Information:
- Amount Paid: £${data.totalAmount.toFixed(2)}
`;

  return `
Payment Confirmed - EGP Aesthetics

Dear ${data.customerName},

Your payment has been successfully processed. Your booking is now confirmed!

PAYMENT RECEIVED ✅

Services Paid For:
${servicesList}

Total Amount: £${data.totalAmount.toFixed(2)}
${paymentSection}
- Payment Method: ${data.paymentMethod}

Booking Details:
- Booking Number: ${data.bookingNumber}
- Booked Day: ${data.bookingDate}
- Time: ${data.bookingTime}
- Duration: ${data.duration}
${data.teamMember ? `- Practitioner: ${data.teamMember}` : ''}

Important Information:
- Please arrive 10 minutes before your appointment
- Bring a valid ID
- Reschedule at least 24 hours in advance if needed
- You can cancel or request a refund up to 24 hours before your appointment.

Contact:
Phone: ${data.contactPhone}
Email: ${data.contactEmail}

We look forward to seeing you!

Best regards,
EGP Aesthetics Team
  `.trim();
}

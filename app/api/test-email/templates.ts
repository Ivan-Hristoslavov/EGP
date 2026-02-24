/**
 * Sample data and 1:1 email template builders for admin Test Email.
 * Data matches a typical booking (e.g. deposit, two services) so previews match production.
 * Uses shared email theme (Montserrat, #f5f1e9 light / dark green for dark mode).
 */
import { getEmailHead, EMAIL } from "@/lib/email-theme";

// Shared sample data used across templates (1:1 like a real booking)
const nextMonday = (() => {
  const d = new Date();
  d.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7));
  return d;
})();

export const SAMPLE = {
  customerName: "Jane Smith",
  customerEmail: "jane.smith@example.com",
  customerPhone: "07700 900123",
  serviceNames: "Baby Botox, HydraFacial",
  services: [
    { name: "Baby Botox", price: 149.25, quantity: 1 },
    { name: "HydraFacial", price: 150, quantity: 1 },
  ],
  date: nextMonday.toISOString().slice(0, 10),
  dateFormatted: nextMonday.toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
  dateShort: nextMonday.toLocaleDateString("en-GB"),
  time: "14:00",
  duration: "1h 20m",
  totalAmount: 299.25,
  amountPaid: 149.63,
  remainingAmount: 149.62,
  bookingNumber: "BK-2026-0002",
  bookingId: "test-booking-id-123",
  teamMember: "Eli (Senior Aesthetic Practitioner)",
  // Use fixed demo numbers so test email preview always shows full number (not env placeholders like +447XXXXXXXXXX)
  contactPhone: "07944 24 20 79",
  contactEmail: "info@egpaesthetics.co.uk",
  discountCode: "WELCOME10-ABC12",
  welcomeDiscountPercent: 10,
  discountValidDays: 30,
  paymentLink: `${process.env.NEXT_PUBLIC_SITE_URL || "https://egpaesthetics.co.uk"}/payment/test`,
} as const;

export type TemplateId =
  | "simple"
  | "booking_confirmation"
  | "payment_confirmed"
  | "admin_new_paid_booking"
  | "admin_booking_request"
  | "newsletter_welcome";

export function getTemplate(
  template: TemplateId
): { subject: string; html: string; text: string } {
  const s = SAMPLE;
  switch (template) {
    case "simple":
      return getSimple(s);
    case "booking_confirmation":
      return getBookingConfirmation(s);
    case "payment_confirmed":
      return getPaymentConfirmed(s);
    case "admin_new_paid_booking":
      return getAdminNewPaidBooking(s);
    case "admin_booking_request":
      return getAdminBookingRequest(s);
    case "newsletter_welcome":
      return getNewsletterWelcome(s);
    default:
      return getSimple(s);
  }
}

function getSimple(s: typeof SAMPLE): { subject: string; html: string; text: string } {
  const message = "This is a test email to verify SMTP configuration.";
  const L = EMAIL.light;
  return {
    subject: "Test Email from EGP Aesthetics",
    text: `${message}\n\nThis email confirms that SMTP is configured correctly.`,
    html: `
<!DOCTYPE html>
<html lang="en"><head>${getEmailHead()}</head>
<body class="email-body" style="margin:0;padding:0;font-family:${EMAIL.font};background:${L.bg};color:${L.text}">
<div class="email-wrap" style="max-width:560px;margin:0 auto;background:${L.wrap};color:${L.text};padding:32px">
<h1 style="margin:0 0 16px;font-size:22px;color:${L.text}">SMTP Test</h1>
<p style="margin:0;color:${L.textMuted}">${message}</p>
<p style="margin:16px 0 0;color:${L.muted};font-size:14px">${new Date().toLocaleString()}</p>
</div>
</body>
</html>`.trim(),
  };
}

function getBookingConfirmation(s: typeof SAMPLE): { subject: string; html: string; text: string } {
  const totalAmount = s.totalAmount;
  const amountPaid = s.amountPaid;
  const remainingAmount = s.remainingAmount;
  const L = EMAIL.light;
  return {
    subject: `Booking Confirmation - ${s.serviceNames} on ${s.dateShort}`,
    text: [
      `Booking Confirmation - EGP Aesthetics`,
      ``,
      `Dear ${s.customerName},`,
      `Thank you for booking with EGP Aesthetics!`,
      ``,
      `Booking Details:`,
      `- Service: ${s.serviceNames}`,
      `- Date: ${s.dateShort}`,
      `- Time: ${s.time}`,
      `- Amount: £${totalAmount.toFixed(2)}`,
      `- Paid now (deposit): £${amountPaid.toFixed(2)}`,
      `- Due on arrival: £${remainingAmount.toFixed(2)}`,
      ``,
      `You have paid £${amountPaid.toFixed(2)} deposit. The remaining £${remainingAmount.toFixed(2)} is due when you attend.`,
      ``,
      `Payment: ${s.paymentLink}`,
      ``,
      `Contact: ${s.contactPhone} | ${s.contactEmail}`,
    ].join("\n"),
    html: `
<!DOCTYPE html>
<html lang="en"><head>${getEmailHead()}</head>
<body class="email-body" style="margin:0;padding:0;font-family:${EMAIL.font};background:${L.bg};color:${L.text}">
<div class="email-wrap" style="max-width:560px;margin:0 auto;background:${L.wrap};color:${L.text}">
<div class="email-header" style="background:${L.green};color:#fff;padding:36px 28px;text-align:center">
<h1 style="margin:0;font-size:24px;font-weight:600;color:#fff">Booking Request Received</h1>
<p style="margin:8px 0 0;font-size:14px;color:#e7e4df">Secure your appointment</p>
<div class="email-accent-bar" style="width:48px;height:3px;background:${L.accent};margin:16px auto 0"></div>
<span class="email-badge" style="display:inline-block;background:${L.greenDark};color:#fff;padding:8px 20px;font-size:11px;letter-spacing:.12em;margin-top:12px;border-radius:4px">Payment pending</span>
</div>
<div style="padding:32px 28px;font-size:15px;line-height:1.65;color:${L.text}">
<p style="margin:0 0 16px;color:${L.text}">Dear ${s.customerName},</p>
<p style="margin:0 0 24px;color:${L.textMuted}">Thank you for choosing EGP Aesthetics. Your booking has been received. To confirm your appointment, please complete payment below.</p>
<div class="email-card" style="background:${L.cardBg};border:1px solid ${L.cardBorder};margin:24px 0;padding:20px;border-radius:8px">
<div class="email-card-title" style="font-size:11px;letter-spacing:.12em;color:${L.green};margin-bottom:12px;font-weight:600">APPOINTMENT</div>
<div style="padding:10px 0;border-bottom:1px solid #e7e4df;color:${L.text}">${s.serviceNames}</div>
<div style="padding:10px 0;border-bottom:1px solid #e7e4df;color:${L.text}">${s.dateShort} · ${s.time}</div>
<div style="padding:10px 0;border-bottom:1px solid #e7e4df;color:${L.text}">Total · <span style="font-size:20px;font-weight:600;color:${L.green}">£${totalAmount.toFixed(2)}</span></div>
<div style="padding:10px 0;border-bottom:1px solid #e7e4df;color:${L.text}">Paid now (deposit) · <span style="color:${L.deposit};font-weight:600">£${amountPaid.toFixed(2)}</span></div>
<div style="padding:10px 0;color:${L.text}">Due on arrival · <span style="font-weight:600">£${remainingAmount.toFixed(2)}</span></div>
</div>
<div style="background:#e8f5e9;border:1px solid ${L.accent};padding:14px;margin:16px 0;font-size:14px;color:${L.text};border-radius:6px">You have paid <strong>£${amountPaid.toFixed(2)}</strong> deposit. The remaining <strong>£${remainingAmount.toFixed(2)}</strong> is due when you attend.</div>
<div style="text-align:center;margin:28px 0">
<a href="${s.paymentLink}" style="display:inline-block;background:${L.green};color:#fff;padding:16px 36px;text-decoration:none;font-size:14px;font-weight:600;border-radius:6px">Pay Now — £${remainingAmount.toFixed(2)}</a>
</div>
<div class="email-notice" style="background:#f0ede7;border-left:4px solid ${L.noticeBorder};padding:20px;margin:24px 0;border-radius:0 6px 6px 0">
<div style="font-weight:600;color:${L.text};margin-bottom:8px">Before your visit</div>
<ul style="margin:0;padding-left:20px;color:${L.textMuted}">
<li>Arrive 10 minutes early</li><li>Bring a valid ID</li><li>Reschedule at least 24 hours in advance if needed</li>
</ul>
<p style="margin:12px 0 0;font-size:13px;color:${L.danger};font-weight:500">You can cancel or request a refund up to 24 hours before your appointment.</p>
</div>
<div class="email-card" style="background:${L.cardBg};border:1px solid ${L.cardBorder};margin:24px 0;padding:20px;border-radius:8px">
<div class="email-card-title" style="font-size:11px;letter-spacing:.12em;color:${L.green};margin-bottom:12px;font-weight:600">QUESTIONS?</div>
<div style="padding:8px 0;color:${L.text}"><a href="tel:${s.contactPhone.replace(/\s/g,"")}" class="email-link" style="color:${L.link};text-decoration:none;font-weight:500">${s.contactPhone}</a></div>
<div style="padding:8px 0;color:${L.text}"><a href="mailto:${s.contactEmail}" class="email-link" style="color:${L.link};text-decoration:none;font-weight:500">${s.contactEmail}</a></div>
</div>
<p style="margin-top:28px;color:${L.text}">We look forward to welcoming you.</p>
<p style="color:${L.green};font-weight:600">EGP Aesthetics</p>
</div>
<div class="email-footer" style="padding:24px 28px;text-align:center;font-size:12px;color:${L.muted};border-top:1px solid #e7e4df;background:${L.wrap}">
<p style="margin:0">Ref: ${s.bookingId} · EGP Aesthetics London</p>
</div>
</div>
</body>
</html>`.trim(),
  };
}

function getPaymentConfirmed(s: typeof SAMPLE): { subject: string; html: string; text: string } {
  const L = EMAIL.light;
  const servicesList = s.services
    .map(
      (srv) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid #e7e4df;color:${L.text};font-size:15px">${srv.name}</td><td style="padding:10px 0;border-bottom:1px solid #e7e4df;color:${L.text};font-weight:500;text-align:right">£${(srv.price * srv.quantity).toFixed(2)}</td></tr>`
    )
    .join("");
  const paymentBreakdown = `
<tr><td colspan="2" style="padding:12px 0;border-top:2px solid #e7e4df"></td></tr>
<tr><td style="padding:8px 0;color:${L.green};font-size:13px">Paid now (deposit)</td><td style="padding:8px 0;color:${L.deposit};font-weight:600;text-align:right;font-size:15px">£${s.amountPaid.toFixed(2)}</td></tr>
<tr><td style="padding:8px 0;color:${L.green};font-size:13px">Due on arrival</td><td style="padding:8px 0;color:${L.text};font-weight:500;text-align:right;font-size:15px">£${s.remainingAmount.toFixed(2)}</td></tr>`;
  return {
    subject: `Payment Confirmed - Booking for ${s.serviceNames}`,
    text: [
      `Payment Confirmed - EGP Aesthetics`,
      ``,
      `Dear ${s.customerName},`,
      `Your payment has been successfully processed. Your booking is now confirmed!`,
      ``,
      `Services: ${s.services.map((x) => `${x.name} - £${(x.price * x.quantity).toFixed(2)}`).join("\n")}`,
      `Total: £${s.totalAmount.toFixed(2)}`,
      `Paid now (deposit): £${s.amountPaid.toFixed(2)}`,
      `Due on arrival: £${s.remainingAmount.toFixed(2)}`,
      ``,
      `Booking: ${s.bookingNumber} · ${s.dateFormatted} · ${s.time} · ${s.duration}`,
      `${s.teamMember ? `Practitioner: ${s.teamMember}` : ""}`,
      ``,
      `Contact: ${s.contactPhone} | ${s.contactEmail}`,
    ].join("\n"),
    html: `
<!DOCTYPE html>
<html lang="en"><head>${getEmailHead()}</head>
<body class="email-body" style="margin:0;padding:0;font-family:${EMAIL.font};background:${L.bg};color:${L.text}">
<div class="email-wrap" style="max-width:560px;margin:0 auto;background:${L.wrap};color:${L.text}">
<div class="email-header" style="background:${L.green};color:#fff;padding:36px 28px;text-align:center">
<h1 style="margin:0;font-size:24px;font-weight:600;color:#fff">Payment Confirmed</h1>
<p style="margin:10px 0 0;font-size:14px;color:#e7e4df">Your booking is secured.</p>
<div class="email-accent-bar" style="width:48px;height:3px;background:${L.accent};margin:16px auto 0"></div>
<span class="email-badge" style="display:inline-block;background:${L.deposit};color:#fff;padding:8px 20px;font-size:11px;letter-spacing:.12em;margin-top:14px;border-radius:4px">Confirmed</span>
</div>
<div style="padding:32px 28px;font-size:15px;line-height:1.65;color:${L.text}">
<p style="margin:0 0 16px;color:${L.text}">Dear ${s.customerName},</p>
<p style="margin:0 0 24px;color:${L.textMuted}">Thank you for your payment. Your appointment is now confirmed and we look forward to welcoming you.</p>
<div class="email-card" style="background:${L.cardBg};border:1px solid ${L.cardBorder};margin:24px 0;padding:20px;border-radius:8px">
<div class="email-card-title" style="font-size:11px;letter-spacing:.12em;color:${L.green};margin-bottom:12px;font-weight:600">SERVICES BOOKED</div>
<table style="width:100%;border-collapse:collapse">${servicesList}
<tr><td style="padding:12px 0 4px;color:${L.green};font-size:14px">Total</td><td style="padding:12px 0 4px;text-align:right;font-size:20px;font-weight:600;color:${L.text}">£${s.totalAmount.toFixed(2)}</td></tr>${paymentBreakdown}
</table>
</div>
<p style="margin:0 0 24px;padding:14px;background:#e8f5e9;border:1px solid ${L.accent};border-radius:6px;font-size:14px;color:${L.text}">You have paid <strong>£${s.amountPaid.toFixed(2)}</strong> deposit. The remaining <strong>£${s.remainingAmount.toFixed(2)}</strong> is due when you attend.</p>
<div class="email-card" style="background:${L.cardBg};border:1px solid ${L.cardBorder};margin:24px 0;padding:20px;border-radius:8px">
<div class="email-card-title" style="font-size:11px;letter-spacing:.12em;color:${L.green};margin-bottom:12px;font-weight:600">APPOINTMENT</div>
<div style="padding:10px 0;border-bottom:1px solid #e7e4df;color:${L.text}"><span style="color:${L.muted};font-size:13px">Ref</span> · ${s.bookingNumber}</div>
<div style="padding:10px 0;border-bottom:1px solid #e7e4df;color:${L.text}"><span style="color:${L.muted};font-size:13px">Date</span> · ${s.dateFormatted}</div>
<div style="padding:10px 0;border-bottom:1px solid #e7e4df;color:${L.text}"><span style="color:${L.muted};font-size:13px">Time</span> · ${s.time}</div>
<div style="padding:10px 0;border-bottom:1px solid #e7e4df;color:${L.text}"><span style="color:${L.muted};font-size:13px">Duration</span> · ${s.duration}</div>
<div style="padding:10px 0;color:${L.text}"><span style="color:${L.muted};font-size:13px">Practitioner</span> · ${s.teamMember}</div>
</div>
<div class="email-notice" style="background:#fef7ed;border-left:4px solid ${L.noticeBorder};padding:20px;margin:24px 0;border-radius:0 6px 6px 0">
<div style="font-weight:600;color:${L.text};margin-bottom:8px">Before your visit</div>
<ul style="margin:0;padding-left:20px;color:${L.textMuted}">
<li>Arrive 10 minutes early</li><li>Bring a valid ID</li><li>Reschedule at least 24 hours in advance if needed</li>
</ul>
<p style="margin:12px 0 0;font-size:13px;color:${L.danger};font-weight:500">You can cancel or request a refund up to 24 hours before your appointment.</p>
</div>
<div class="email-card" style="background:${L.cardBg};border:1px solid ${L.cardBorder};margin:24px 0;padding:20px;border-radius:8px">
<div class="email-card-title" style="font-size:11px;letter-spacing:.12em;color:${L.green};margin-bottom:12px;font-weight:600">CONTACT US</div>
<div style="padding:10px 0;color:${L.text}"><a href="tel:${s.contactPhone.replace(/\s/g,"")}" class="email-link" style="color:${L.link};text-decoration:none;font-weight:500">${s.contactPhone}</a></div>
<div style="padding:10px 0;color:${L.text}"><a href="mailto:${s.contactEmail}" class="email-link" style="color:${L.link};text-decoration:none;font-weight:500">${s.contactEmail}</a></div>
</div>
<p style="margin-top:28px;color:${L.text}">We look forward to seeing you.</p>
<p style="color:${L.green};font-weight:600">EGP Aesthetics</p>
</div>
<div class="email-footer" style="padding:24px 28px;text-align:center;font-size:12px;color:${L.muted};border-top:1px solid #e7e4df;background:${L.wrap}">
<p style="margin:0">Automated confirmation · EGP Aesthetics London</p>
</div>
</div>
</body>
</html>`.trim(),
  };
}

function getAdminNewPaidBooking(s: typeof SAMPLE): { subject: string; html: string; text: string } {
  const L = EMAIL.light;
  const adminDepositRows = `
<div style="padding:10px 0;border-bottom:1px solid #e7e4df"><span style="color:${L.muted};font-size:13px">Paid (deposit)</span> · <span style="color:${L.text};font-weight:600">£${s.amountPaid.toFixed(2)}</span></div>
<div style="padding:10px 0"><span style="color:${L.muted};font-size:13px">Due on arrival</span> · <span style="color:${L.text};font-weight:500">£${s.remainingAmount.toFixed(2)}</span></div>`;
  return {
    subject: `New Paid Booking - ${s.customerName}`,
    text: [
      `New Paid Booking - EGP Aesthetics`,
      `Customer: ${s.customerName}`,
      `Email: ${s.customerEmail}`,
      `Phone: ${s.customerPhone}`,
      `Service: ${s.serviceNames}`,
      `Date: ${s.dateShort}`,
      `Time: ${s.time}`,
      `Total: £${s.totalAmount.toFixed(2)}`,
      `Paid (deposit): £${s.amountPaid.toFixed(2)}`,
      `Due on arrival: £${s.remainingAmount.toFixed(2)}`,
      `Ref: ${s.bookingNumber}`,
    ].join("\n"),
    html: `
<!DOCTYPE html>
<html lang="en"><head>${getEmailHead()}</head>
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
<div style="padding:8px 0;border-bottom:1px solid #e7e4df;color:${L.text}"><span style="color:${L.muted}">Name</span> · ${s.customerName}</div>
<div style="padding:8px 0;border-bottom:1px solid #e7e4df;color:${L.text}"><span style="color:${L.muted}">Email</span> · ${s.customerEmail}</div>
<div style="padding:8px 0;color:${L.text}"><span style="color:${L.muted}">Phone</span> · ${s.customerPhone}</div>
</div>
<div class="email-card" style="background:${L.cardBg};border:1px solid ${L.cardBorder};margin:0 0 20px;padding:20px;border-radius:8px">
<div class="email-card-title" style="font-size:11px;letter-spacing:.1em;color:${L.green};margin-bottom:12px;font-weight:600">BOOKING</div>
<div style="padding:8px 0;border-bottom:1px solid #e7e4df;color:${L.text}"><span style="color:${L.muted}">Service</span> · ${s.serviceNames}</div>
<div style="padding:8px 0;border-bottom:1px solid #e7e4df;color:${L.text}"><span style="color:${L.muted}">Date</span> · ${s.dateShort}</div>
<div style="padding:8px 0;border-bottom:1px solid #e7e4df;color:${L.text}"><span style="color:${L.muted}">Time</span> · ${s.time}</div>
<div style="padding:8px 0;border-bottom:1px solid #e7e4df;color:${L.text}"><span style="color:${L.muted}">Total</span> · <span style="font-weight:600;color:${L.text}">£${s.totalAmount.toFixed(2)}</span></div>${adminDepositRows}
<div style="padding:8px 0;color:${L.text}"><span style="color:${L.muted}">Ref</span> · ${s.bookingNumber}</div>
</div>
<p style="margin:0;color:${L.muted};font-size:13px">Payment via Stripe. Review in admin panel.</p>
</div>
</div>
</body>
</html>`.trim(),
  };
}

function getAdminBookingRequest(s: typeof SAMPLE): { subject: string; html: string; text: string } {
  const L = EMAIL.light;
  return {
    subject: `New Booking Request - ${s.customerName}`,
    text: [
      `New Booking Request`,
      `Customer: ${s.customerName}`,
      `Email: ${s.customerEmail}`,
      `Phone: ${s.customerPhone}`,
      `Service: ${s.serviceNames}`,
      `Date: ${s.dateShort} · Time: ${s.time}`,
      `Amount: £${s.totalAmount.toFixed(2)}`,
      `Ref: ${s.bookingId}`,
    ].join("\n"),
    html: `
<!DOCTYPE html>
<html lang="en"><head>${getEmailHead()}</head>
<body class="email-body" style="margin:0;padding:0;font-family:${EMAIL.font};background:${L.bg};color:${L.text}">
<div class="email-wrap" style="max-width:560px;margin:0 auto;background:${L.wrap};color:${L.text}">
<div class="email-header" style="background:${L.green};color:#fff;padding:36px 28px;text-align:center">
<h1 style="margin:0;font-size:22px;font-weight:600;color:#fff">New Booking Request</h1>
<div class="email-accent-bar" style="width:40px;height:2px;background:${L.accent};margin:14px auto 0"></div>
<span class="email-badge" style="display:inline-block;background:${L.greenDark};color:#fff;padding:6px 16px;font-size:10px;letter-spacing:.15em;margin-top:12px;border-radius:4px">PENDING</span>
</div>
<div style="padding:32px 28px;font-size:14px;line-height:1.65;color:${L.text}">
<div class="email-card" style="background:${L.cardBg};border:1px solid ${L.cardBorder};margin:20px 0;padding:20px;border-radius:8px">
<div class="email-card-title" style="font-size:11px;letter-spacing:.12em;color:${L.green};margin-bottom:12px;font-weight:600">CUSTOMER</div>
<div style="padding:10px 0;border-bottom:1px solid #e7e4df;color:${L.text}">${s.customerName}</div>
<div style="padding:10px 0;border-bottom:1px solid #e7e4df;color:${L.text}">${s.customerEmail}</div>
<div style="padding:10px 0;color:${L.text}">${s.customerPhone}</div>
</div>
<div class="email-card" style="background:${L.cardBg};border:1px solid ${L.cardBorder};margin:20px 0;padding:20px;border-radius:8px">
<div class="email-card-title" style="font-size:11px;letter-spacing:.12em;color:${L.green};margin-bottom:12px;font-weight:600">APPOINTMENT</div>
<div style="padding:10px 0;border-bottom:1px solid #e7e4df;color:${L.text}">${s.serviceNames}</div>
<div style="padding:10px 0;border-bottom:1px solid #e7e4df;color:${L.text}">${s.dateShort} · ${s.time}</div>
<div style="padding:10px 0;color:${L.text}"><span style="font-size:22px;font-weight:600;color:${L.green}">£${s.totalAmount.toFixed(2)}</span></div>
</div>
<p style="color:${L.muted};font-size:13px">Ref: ${s.bookingId} · ${new Date().toLocaleString("en-GB")}</p>
</div>
<div class="email-footer" style="padding:24px;text-align:center;font-size:12px;color:${L.muted};border-top:1px solid #e7e4df;background:${L.wrap}">Booking system · EGP Aesthetics</div>
</div>
</body>
</html>`.trim(),
  };
}

function getNewsletterWelcome(s: typeof SAMPLE): { subject: string; html: string; text: string } {
  const L = EMAIL.light;
  const firstName = s.customerName.split(" ")[0] || "Valued Customer";
  return {
    subject: `Welcome! Your ${s.welcomeDiscountPercent}% Discount Code`,
    text: [
      `Welcome to EGP Aesthetics!`,
      ``,
      `Thank you for subscribing, ${firstName}.`,
      `Enjoy ${s.welcomeDiscountPercent}% off your first visit.`,
      ``,
      `Your Discount Code: ${s.discountCode}`,
      ``,
      `How to use: Book online or call us · Mention this code when booking · Valid for ${s.discountValidDays} days.`,
    ].join("\n"),
    html: `
<!DOCTYPE html>
<html lang="en"><head>${getEmailHead()}</head>
<body class="email-body" style="margin:0;padding:0;font-family:${EMAIL.font};background:${L.bg};color:${L.text}">
<div class="email-wrap" style="max-width:560px;margin:0 auto;background:${L.wrap};color:${L.text};border:1px solid ${L.cardBorder}">
<div class="email-header" style="background:${L.green};color:#fff;padding:44px 32px;text-align:center">
<h1 style="margin:0;font-size:24px;font-weight:600;color:#fff">Welcome</h1>
<p style="margin:8px 0 0;font-size:14px;color:#e7e4df">Your exclusive offer</p>
<div class="email-accent-bar" style="width:48px;height:3px;background:${L.accent};margin:20px auto 0"></div>
</div>
<div style="padding:40px 32px;font-size:15px;line-height:1.7;color:${L.text}">
<p style="margin:0 0 8px;color:${L.text}">Thank you for subscribing, ${firstName}.</p>
<p style="margin:0 0 24px;color:${L.textMuted}">Enjoy <strong>${s.welcomeDiscountPercent}% off</strong> your first visit.</p>
<div style="background:${L.green};color:#fff;padding:28px;text-align:center;margin:28px 0;letter-spacing:4px;font-size:28px;font-weight:600;border:1px solid ${L.accent}">
<div style="font-size:11px;letter-spacing:.2em;opacity:.9;margin-bottom:8px">Your code</div>
${s.discountCode}
</div>
<p style="font-weight:600;color:${L.text};margin-bottom:8px">How to use:</p>
<ul style="padding-left:20px;margin:12px 0 24px;color:${L.textMuted}">
<li>Book online or call us</li><li>Mention this code when booking</li><li>Valid for ${s.discountValidDays} days</li>
</ul>
<p style="color:${L.green};font-weight:600">EGP Aesthetics</p>
</div>
<div class="email-footer" style="padding:28px 32px;text-align:center;font-size:12px;color:${L.muted};border-top:1px solid ${L.cardBorder};background:${L.wrap}">EGP Aesthetics London</div>
</div>
</body>
</html>`.trim(),
  };
}

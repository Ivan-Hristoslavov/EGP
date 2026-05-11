import { getAdminProfile } from "@/lib/admin-profile";
import { sendEmail } from "@/lib/sendgrid-smtp";
import { supabaseAdmin } from "@/lib/supabase";

/** Minimal booking shape for staff notification (DB row or Stripe-built object). */
export type StaffBookingNotificationInput = {
  id: string;
  customer_name: string;
  customer_email?: string | null;
  customer_phone?: string | null;
  service: string;
  date: string;
  time: string;
  amount: number;
  total_amount?: number | null;
  address?: string | null;
  notes?: string | null;
  team_member_id?: string | null;
  created_at?: string;
  payment_status?: string | null;
};

/** Clinic inbox from admin_profile; optional practitioner label for the email body only. */
export type StaffNotificationRecipient = {
  to: string;
  assignedPractitionerLabel?: string | null;
};

function formatAssignedPractitionerLabel(
  name: string | null | undefined,
  role: string | null | undefined,
): string | null {
  const n = name?.trim();
  const r = role?.trim();

  if (!n) return null;
  if (r) return `${n} (${r})`;

  return n;
}

/**
 * Resolve the new-booking staff email recipient: always clinic inbox from admin_profile
 * (business_email, then email). When a team member is assigned, their name/role are loaded
 * for the message body only — not used as the To address.
 */
export async function getStaffBookingNotificationTarget(
  booking: StaffBookingNotificationInput,
): Promise<StaffNotificationRecipient | null> {
  const profile = await getAdminProfile();
  const to = profile?.business_email?.trim() || profile?.email?.trim() || null;

  if (!to) {
    console.warn(
      "Staff booking notification: no business_email or email on admin_profile",
    );

    return null;
  }

  let assignedPractitionerLabel: string | null = null;

  if (booking.team_member_id) {
    const { data: member, error } = await supabaseAdmin
      .from("team")
      .select("name, role")
      .eq("id", booking.team_member_id)
      .maybeSingle();

    if (error) {
      console.warn("Staff booking notification: team lookup failed:", error);
    } else {
      assignedPractitionerLabel = formatAssignedPractitionerLabel(
        member?.name,
        member?.role,
      );

      if (!assignedPractitionerLabel) {
        console.warn(
          "Staff booking notification: team member has no display name, id:",
          booking.team_member_id,
        );
      }
    }
  }

  return { to, assignedPractitionerLabel };
}

function staffNotificationAmount(
  booking: StaffBookingNotificationInput,
): number {
  if (
    booking.total_amount != null &&
    !Number.isNaN(Number(booking.total_amount))
  ) {
    return Number(booking.total_amount);
  }

  return Number(booking.amount) || 0;
}

function staffNotificationCreatedAt(
  booking: StaffBookingNotificationInput,
): string {
  if (booking.created_at) {
    return new Date(booking.created_at).toLocaleString("en-GB");
  }

  return new Date().toLocaleString("en-GB");
}

function staffBadge(booking: StaffBookingNotificationInput): string {
  const ps = (booking.payment_status || "").toLowerCase();

  if (ps === "paid" || ps === "test") return "PAID";

  return "PENDING";
}

function assignedPractitionerBlockText(
  label: string | null | undefined,
): string {
  if (!label?.trim()) return "";

  return `
Assigned practitioner:
${label}
`.trim();
}

function assignedPractitionerBlockHtml(
  label: string | null | undefined,
): string {
  if (!label?.trim()) return "";

  return `<div class="sect"><div class="sect-title">ASSIGNED PRACTITIONER</div><div class="row">${escapeHtml(label)}</div></div>`;
}

export function generateStaffBookingNotificationText(
  booking: StaffBookingNotificationInput,
  target: StaffNotificationRecipient,
): string {
  const bookingDate = new Date(booking.date).toLocaleDateString("en-GB");
  const amount = staffNotificationAmount(booking);
  const practitioner = assignedPractitionerBlockText(
    target.assignedPractitionerLabel,
  );

  return `
New booking request
${practitioner ? `${practitioner}\n\n` : ""}
Customer:
- Name: ${booking.customer_name}
- Email: ${booking.customer_email || "Not provided"}
- Phone: ${booking.customer_phone || "Not provided"}

Appointment:
- Service: ${booking.service}
- Date: ${bookingDate}
- Time: ${booking.time}
- Amount: £${amount.toFixed(2)}

${booking.address ? `Address: ${booking.address}\n` : ""}${booking.notes ? `Notes: ${booking.notes}\n` : ""}
Booking ref: ${booking.id}
${staffNotificationCreatedAt(booking)}

Please review in your admin panel when needed.
  `.trim();
}

export function generateStaffBookingNotificationHtml(
  booking: StaffBookingNotificationInput,
  target: StaffNotificationRecipient,
): string {
  const bookingDate = new Date(booking.date).toLocaleDateString("en-GB");
  const amount = staffNotificationAmount(booking);
  const badge = staffBadge(booking);
  const title = `New booking — ${escapeHtml(booking.customer_name)}`;
  const subtitle = escapeHtml(booking.service);
  const practitionerHtml = assignedPractitionerBlockHtml(
    target.assignedPractitionerLabel,
  );

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
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
<h1>${title}</h1>
<p style="margin:8px 0 0;font-size:14px;opacity:.9">${subtitle}</p>
<div class="line"></div>
<span class="badge">${badge}</span>
</div>
<div class="main">
<div class="sect">
<div class="sect-title">CUSTOMER</div>
<div class="row">${escapeHtml(booking.customer_name)}</div>
<div class="row">${escapeHtml(booking.customer_email || "—")}</div>
<div class="row">${escapeHtml(booking.customer_phone || "—")}</div>
</div>
${practitionerHtml}
<div class="sect">
<div class="sect-title">APPOINTMENT</div>
<div class="row">${escapeHtml(booking.service)}</div>
<div class="row">${escapeHtml(bookingDate)} · ${escapeHtml(booking.time)}</div>
<div class="row"><span class="amt">£${amount.toFixed(2)}</span></div>
</div>
${booking.address ? `<div class="sect"><div class="sect-title">ADDRESS</div><div class="row">${escapeHtml(booking.address)}</div></div>` : ""}
${booking.notes ? `<div class="sect"><div class="sect-title">NOTES</div><div class="row">${escapeHtml(booking.notes)}</div></div>` : ""}
<p style="color:#78716c;font-size:13px;">Ref: ${escapeHtml(booking.id)} · ${staffNotificationCreatedAt(booking)}</p>
</div>
<div class="ft">Booking system · EGP Aesthetics</div>
</div>
</body>
</html>
  `.trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Sends one staff-facing new booking email to the clinic inbox (admin_profile only).
 */
export async function sendStaffNewBookingNotification(
  booking: StaffBookingNotificationInput,
): Promise<void> {
  const target = await getStaffBookingNotificationTarget(booking);

  if (!target) {
    return;
  }

  const subject = `New booking — ${booking.customer_name}`;

  await sendEmail({
    to: target.to,
    subject,
    text: generateStaffBookingNotificationText(booking, target),
    html: generateStaffBookingNotificationHtml(booking, target),
  });
}

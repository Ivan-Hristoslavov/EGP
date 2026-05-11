import { supabaseAdmin } from "@/lib/supabase";

/** Team member details shown to the customer on booking / payment confirmation. */
export type BookingPractitionerForCustomerEmail = {
  name: string;
  role: string;
  email: string;
  phone: string | null;
  specializations: string | null;
};

export function escapeHtmlForEmail(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Loads practitioner contact for customer-facing booking emails (name, role, phone, email).
 */
export async function fetchBookingPractitionerForCustomerEmail(
  teamMemberId: string | null | undefined,
): Promise<BookingPractitionerForCustomerEmail | null> {
  if (!teamMemberId) return null;

  const { data, error } = await supabaseAdmin
    .from("team")
    .select("name, role, email, phone, specializations")
    .eq("id", teamMemberId)
    .maybeSingle();

  if (error) {
    console.warn("Customer booking email: team member lookup failed:", error);

    return null;
  }

  if (!data) return null;

  return {
    name: data.name?.trim() || "",
    role: data.role?.trim() || "",
    email: data.email?.trim() || "",
    phone: data.phone?.trim() || null,
    specializations: data.specializations?.trim() || null,
  };
}

/** Plain-text section (with blank lines) or empty string. */
export function practitionerPlainTextSection(
  p: BookingPractitionerForCustomerEmail | null,
): string {
  if (!p || (!p.name && !p.email)) return "";

  const lines: string[] = [
    "Your practitioner:",
    p.name ? `  Name: ${p.name}` : "",
    p.role ? `  Role: ${p.role}` : "",
    p.specializations ? `  Specializations: ${p.specializations}` : "",
    p.phone ? `  Phone: ${p.phone}` : "",
    p.email ? `  Email: ${p.email}` : "",
  ].filter(Boolean);

  return `\n${lines.join("\n")}\n`;
}

export type PractitionerCardHtmlOpts = {
  cardBg: string;
  cardBorder: string;
  titleColor: string;
  textColor: string;
  mutedColor: string;
};

/** Styled card block for customer HTML emails, or empty string. */
export function practitionerEmailCardHtml(
  p: BookingPractitionerForCustomerEmail | null,
  opts: PractitionerCardHtmlOpts,
): string {
  if (!p || (!p.name && !p.email)) return "";

  const e = escapeHtmlForEmail;
  const { cardBg, cardBorder, titleColor, textColor, mutedColor } = opts;

  const row = (label: string, value: string, withBorder: boolean) =>
    `<div style="padding:10px 0;${withBorder ? "border-bottom:1px solid #e7e4df;" : ""}color:${textColor}"><span style="color:${mutedColor};font-size:13px">${label}</span> · ${value}</div>`;

  const parts: string[] = [];

  if (p.name) parts.push(row("Name", e(p.name), true));
  if (p.role) parts.push(row("Role", e(p.role), true));
  if (p.specializations) {
    parts.push(
      `<div style="padding:10px 0;border-bottom:1px solid #e7e4df;color:${textColor};white-space:pre-wrap"><span style="color:${mutedColor};font-size:13px;display:block;margin-bottom:6px">Specializations</span>${e(p.specializations)}</div>`,
    );
  }
  if (p.phone) {
    const telHref = p.phone.replace(/\s/g, "").replace(/"/g, "");

    parts.push(
      `<div style="padding:10px 0;border-bottom:1px solid #e7e4df;color:${textColor}"><span style="color:${mutedColor};font-size:13px">Phone</span> · <a href="tel:${telHref}" style="color:inherit;text-decoration:none;font-weight:500">${e(p.phone)}</a></div>`,
    );
  }

  if (p.email) {
    const mailHref = encodeURI(`mailto:${p.email}`);

    parts.push(
      `<div style="padding:10px 0;color:${textColor}"><span style="color:${mutedColor};font-size:13px">Email</span> · <a href="${mailHref}" style="color:inherit;text-decoration:none;font-weight:500">${e(p.email)}</a></div>`,
    );
  }

  return `
<div class="email-card" style="background:${cardBg};border:1px solid ${cardBorder};margin:24px 0;padding:20px;border-radius:8px">
<div class="email-card-title" style="font-size:11px;letter-spacing:.12em;color:${titleColor};margin-bottom:12px;font-weight:600">YOUR PRACTITIONER</div>
${parts.join("")}
</div>`.trim();
}

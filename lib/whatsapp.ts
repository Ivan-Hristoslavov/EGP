/**
 * wa.me wants the number in international form with digits only: no "+", no
 * spaces and no UK leading 0 ("07944 242079" must become "447944242079").
 */
export function toWhatsAppNumber(raw: string | null | undefined): string {
  const digits = String(raw ?? "").replace(/\D/g, "");

  if (!digits) return "";
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0")) return `44${digits.slice(1)}`;

  return digits;
}

export function buildWhatsAppUrl(
  raw: string | null | undefined,
  message?: string,
): string {
  const base = `https://wa.me/${toWhatsAppNumber(raw)}`;

  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

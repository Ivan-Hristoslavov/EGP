export function formatUkPhoneForDisplay(phone: string): string {
  const raw = (phone || "").trim();
  if (!raw) return "";

  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return raw;

  // +44XXXXXXXXXX or 44XXXXXXXXXX -> 0XXXXXXXXXX
  if (digits.startsWith("44") && digits.length >= 12) {
    const local = `0${digits.slice(2, 12)}`;
    return `${local.slice(0, 5)} ${local.slice(5, 7)} ${local.slice(7)}`;
  }

  // 07XXXXXXXXX
  if (digits.startsWith("0") && digits.length >= 11) {
    return `${digits.slice(0, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 11)}`;
  }

  return raw;
}

/** Truncate admin list labels for dense tables; full string for tooltips. */

export function truncateAdminLabel(text: string, maxChars: number): string {
  const t = text.trim();
  if (t.length <= maxChars) return t;

  return `${t.slice(0, Math.max(0, maxChars - 1))}…`;
}

export function isAdminLabelTruncated(text: string, maxChars: number): boolean {
  return text.trim().length > maxChars;
}

/**
 * Category names come from the admin as typed ("FACE", "Body", "Anti-wrinkle"),
 * so one row of chips can mix casing. ALL-CAPS names are shown in sentence case;
 * anything already mixed-case is left as written.
 */
export function formatCategoryLabel(name: string | null | undefined): string {
  const text = (name ?? "").trim();
  const letters = text.replace(/[^A-Za-z]/g, "");

  if (letters.length > 1 && letters === letters.toUpperCase()) {
    const lower = text.toLowerCase();

    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }

  return text;
}

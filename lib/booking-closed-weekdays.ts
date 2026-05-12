export const BOOKING_CLOSED_WEEKDAYS_KEY = "booking_closed_weekdays";

/** 0 = Sunday … 6 = Saturday (same as Date.getUTCDay / clinic working_hours day_of_week). */
export function parseBookingClosedWeekdays(raw: unknown): number[] {
  if (raw == null) return [];

  let arr: unknown[];

  if (typeof raw === "string") {
    try {
      arr = JSON.parse(raw) as unknown[];
    } catch {
      return [];
    }
  } else if (Array.isArray(raw)) {
    arr = raw;
  } else {
    return [];
  }

  const out: number[] = [];

  for (const x of arr) {
    const n = typeof x === "number" ? x : Number(x);

    if (Number.isInteger(n) && n >= 0 && n <= 6 && !out.includes(n)) out.push(n);
  }

  out.sort((a, b) => a - b);

  return out;
}

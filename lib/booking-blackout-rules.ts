export const BOOKING_BLACKOUT_RULES_KEY = "booking_blackout_rules";

export type BookingBlackoutRule = {
  /** Client-generated id for stable React keys; ignored by matching logic */
  id?: string;
  start_date: string;
  end_date: string;
  /** If empty or omitted, every calendar day in the range is blacked out */
  weekdays?: number[];
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isValidYyyyMmDd(s: string): boolean {
  if (!ISO_DATE.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d, 12, 0, 0, 0));

  return (
    t.getUTCFullYear() === y &&
    t.getUTCMonth() === m - 1 &&
    t.getUTCDate() === d
  );
}

function normalizeWeekdays(raw: unknown): number[] | undefined {
  if (raw == null) return undefined;

  if (!Array.isArray(raw)) return undefined;

  const out: number[] = [];

  for (const x of raw) {
    const n = typeof x === "number" ? x : Number(x);

    if (Number.isInteger(n) && n >= 0 && n <= 6 && !out.includes(n))
      out.push(n);
  }

  out.sort((a, b) => a - b);

  return out;
}

/**
 * Parse and normalize blackout rules from DB or API body.
 * Drops invalid entries; coerces start/end order.
 */
export function parseBookingBlackoutRules(raw: unknown): BookingBlackoutRule[] {
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

  const out: BookingBlackoutRule[] = [];

  for (const item of arr) {
    if (!item || typeof item !== "object") continue;

    const o = item as Record<string, unknown>;
    const start =
      typeof o.start_date === "string" ? o.start_date.trim() : "";
    const end = typeof o.end_date === "string" ? o.end_date.trim() : "";

    if (!isValidYyyyMmDd(start) || !isValidYyyyMmDd(end)) continue;

    let startDate = start;
    let endDate = end;

    if (startDate > endDate) {
      const tmp = startDate;

      startDate = endDate;
      endDate = tmp;
    }

    const weekdays = normalizeWeekdays(o.weekdays);
    const id = typeof o.id === "string" && o.id.length > 0 ? o.id : undefined;

    out.push({
      ...(id ? { id } : {}),
      start_date: startDate,
      end_date: endDate,
      ...(weekdays && weekdays.length > 0 ? { weekdays } : {}),
    });
  }

  out.sort((a, b) => {
    const c = a.start_date.localeCompare(b.start_date);

    if (c !== 0) return c;

    return a.end_date.localeCompare(b.end_date);
  });

  return out;
}

/** True if date is within [start,end] inclusive (YYYY-MM-DD strings). */
function isDateInRange(
  dateYyyyMmDd: string,
  start: string,
  end: string,
): boolean {
  return dateYyyyMmDd >= start && dateYyyyMmDd <= end;
}

/** True when this rule blackouts the given calendar date (UTC weekday). */
export function bookingBlackoutRuleMatchesDate(
  rule: BookingBlackoutRule,
  dateYyyyMmDd: string,
  utcDow: number,
): boolean {
  if (!isDateInRange(dateYyyyMmDd, rule.start_date, rule.end_date))
    return false;

  const wd = rule.weekdays;

  if (!wd || wd.length === 0) return true;

  return wd.includes(utcDow);
}

export function isOnlineBookingBlackoutByRules(
  dateYyyyMmDd: string,
  utcDow: number,
  rules: BookingBlackoutRule[],
): boolean {
  for (const rule of rules) {
    if (bookingBlackoutRuleMatchesDate(rule, dateYyyyMmDd, utcDow))
      return true;
  }

  return false;
}

/** Combined: recurring closed weekdays OR scheduled blackout rules */
export function isOnlineBookingDateClosed(params: {
  dateYyyyMmDd: string;
  utcDow: number;
  globalClosedWeekdays: number[];
  blackoutRules: BookingBlackoutRule[];
}): boolean {
  const { dateYyyyMmDd, utcDow, globalClosedWeekdays, blackoutRules } = params;

  for (const d of globalClosedWeekdays) {
    if (d === utcDow) return true;
  }

  return isOnlineBookingBlackoutByRules(dateYyyyMmDd, utcDow, blackoutRules);
}

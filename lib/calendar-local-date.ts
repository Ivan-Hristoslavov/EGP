/**
 * Calendar / booking date helpers using the clinic wall-clock (local) or UTC-safe
 * calendar-day parsing where noted.
 */

/** YYYY-MM-DD from local date parts (clinic "today" and month/week UI bounds). */
export function formatLocalYyyyMmDd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${y}-${m}-${day}`;
}

export function getLocalTodayYyyyMmDd(): string {
  return formatLocalYyyyMmDd(new Date());
}

/** First and last calendar day of a month in local timezone (month is 0–11). */
export function getLocalMonthDateRangeStrings(
  year: number,
  monthIndex: number,
): { start: string; end: string } {
  const start = formatLocalYyyyMmDd(new Date(year, monthIndex, 1));
  const end = formatLocalYyyyMmDd(new Date(year, monthIndex + 1, 0));

  return { start, end };
}

/**
 * Monday-based week range in local timezone (matches admin calendar getWeekDays).
 */
export function getLocalWeekRangeStringsMondayStart(anchor: Date): {
  start: string;
  end: string;
} {
  const d = new Date(anchor);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);

  monday.setDate(diff);
  const sunday = new Date(monday);

  sunday.setDate(monday.getDate() + 6);

  return {
    start: formatLocalYyyyMmDd(monday),
    end: formatLocalYyyyMmDd(sunday),
  };
}

/**
 * Parse YYYY-MM-DD and return UTC day-of-week (0=Sun…6=Sat), same convention as
 * `/api/bookings/availability/team` (noon UTC anchor).
 */
export function parseYyyyMmDdUtcDayOfWeek(dateStr: string): number | null {
  const parts = dateStr.split("-").map(Number);
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];

  if (
    parts.length !== 3 ||
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  const bookingDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));

  if (
    bookingDate.getUTCFullYear() !== year ||
    bookingDate.getUTCMonth() !== month - 1 ||
    bookingDate.getUTCDate() !== day
  ) {
    return null;
  }

  return bookingDate.getUTCDay();
}

/** Add whole days to a YYYY-MM-DD string in UTC calendar sense (noon UTC anchor). */
export function addDaysUtcYyyyMmDd(
  dateStr: string,
  deltaDays: number,
): string | null {
  const parts = dateStr.split("-").map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];

  if (parts.length !== 3 || Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) {
    return null;
  }

  const t = new Date(Date.UTC(y, m - 1, d, 12, 0, 0, 0));

  t.setUTCDate(t.getUTCDate() + deltaDays);

  const yy = t.getUTCFullYear();
  const mm = String(t.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(t.getUTCDate()).padStart(2, "0");

  return `${yy}-${mm}-${dd}`;
}

/**
 * Single source of truth for "is this time free for this practitioner".
 * Pure functions only (no I/O) so every route and the public slot list share
 * exactly the same rules. See docs/superpowers/specs/2026-10-08-booking-integrity-core-design.md
 */

export const OCCUPYING_STATUSES = [
  "pending",
  "confirmed",
  "scheduled",
] as const;
export const DEFAULT_DURATION_MINUTES = 30;
export const DEFAULT_BUFFER_MINUTES = 15;
export const DEFAULT_MAX_APPOINTMENTS = 12;
export const SLOT_INTERVAL_MINUTES = 15;

export type BookingLike = {
  id?: string | null;
  time: string;
  service_duration_minutes?: number | null;
  team_member_id?: string | null;
  status?: string | null;
  customer_name?: string | null;
};

export type BookingRow = {
  date: string;
  time: string;
  team_member_id?: string | null;
  service_duration_minutes?: number | null;
  status?: string | null;
};

export type MinuteRange = { start: number; end: number };

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + (minutes || 0);
}

export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

export function normalizeTime(time: string): string {
  return time.slice(0, 5);
}

/** Cancelled and completed bookings free the time; unknown status is treated as occupying. */
export function isOccupyingStatus(status?: string | null): boolean {
  return !status || (OCCUPYING_STATUSES as readonly string[]).includes(status);
}

/** The time a booking blocks: start until end of service plus the clinic buffer. */
export function occupiedRange(
  booking: BookingLike,
  bufferMinutes: number,
): MinuteRange {
  const start = timeToMinutes(booking.time);
  const duration = booking.service_duration_minutes || DEFAULT_DURATION_MINUTES;

  return { start, end: start + duration + bufferMinutes };
}

/**
 * Bookings that block `teamMemberId`: their own plus unassigned ones.
 * A null `teamMemberId` (new unassigned booking) is blocked by every booking.
 */
export function bookingsBlocking(
  teamMemberId: string | null | undefined,
  bookings: BookingLike[],
  excludeBookingId?: string | null,
): BookingLike[] {
  return bookings.filter((booking) => {
    if (excludeBookingId && booking.id === excludeBookingId) return false;
    if (!isOccupyingStatus(booking.status)) return false;
    if (!teamMemberId) return true;

    return !booking.team_member_id || booking.team_member_id === teamMemberId;
  });
}

export function findOverlap(input: {
  startTime: string;
  durationMinutes?: number | null;
  bufferMinutes: number;
  teamMemberId?: string | null;
  bookings: BookingLike[];
  excludeBookingId?: string | null;
}): BookingLike | null {
  const start = timeToMinutes(input.startTime);
  const end =
    start +
    (input.durationMinutes || DEFAULT_DURATION_MINUTES) +
    input.bufferMinutes;

  for (const booking of bookingsBlocking(
    input.teamMemberId,
    input.bookings,
    input.excludeBookingId,
  )) {
    const range = occupiedRange(booking, input.bufferMinutes);

    if (start < range.end && end > range.start) return booking;
  }

  return null;
}

export function isDayLimitReached(input: {
  teamMemberId?: string | null;
  bookings: BookingLike[];
  maxAppointments: number;
  excludeBookingId?: string | null;
}): boolean {
  return (
    bookingsBlocking(input.teamMemberId, input.bookings, input.excludeBookingId)
      .length >= input.maxAppointments
  );
}

/** Start times (every 15 min) that are free / blocked for one practitioner on one day. */
export function buildDaySlots(input: {
  openTime: string;
  closeTime: string;
  durationMinutes: number;
  bufferMinutes: number;
  maxAppointments: number;
  teamMemberId?: string | null;
  bookings: BookingLike[];
  /** Skip start times before this minute of the day (used for "today"). */
  earliestStartMinutes?: number;
}): {
  availableSlots: string[];
  bookedSlots: string[];
  dayLimitReached: boolean;
  bookingsCount: number;
} {
  const open = timeToMinutes(input.openTime);
  const close = timeToMinutes(input.closeTime);
  const blocking = bookingsBlocking(input.teamMemberId, input.bookings);
  const ranges = blocking
    .map((booking) => occupiedRange(booking, input.bufferMinutes))
    .sort((a, b) => a.start - b.start);
  const dayLimitReached = blocking.length >= input.maxAppointments;
  const availableSlots: string[] = [];
  const bookedSlots: string[] = [];

  for (let t = open; t < close; t += SLOT_INTERVAL_MINUTES) {
    if (
      input.earliestStartMinutes !== undefined &&
      t < input.earliestStartMinutes
    ) {
      continue;
    }

    const label = minutesToTime(t);

    if (ranges.some((range) => t >= range.start && t < range.end)) {
      bookedSlots.push(label);
      continue;
    }

    if (dayLimitReached) continue;

    const slotEnd = t + input.durationMinutes + input.bufferMinutes;

    if (slotEnd > close) continue;

    if (!ranges.some((range) => t < range.end && slotEnd > range.start)) {
      availableSlots.push(label);
    }
  }

  return {
    availableSlots,
    bookedSlots,
    dayLimitReached,
    bookingsCount: blocking.length,
  };
}

/**
 * Whether an edit changes what the booking occupies. Edits that do not touch
 * date, time, practitioner, duration or reactivation (e.g. notes, payment
 * status, cancel, complete) are never re-checked, so existing data that already
 * overlaps cannot block unrelated admin work.
 */
export function slotNeedsRecheck(
  existing: BookingRow,
  patch: Partial<BookingRow>,
): { needed: boolean; effective: BookingRow } {
  const effective: BookingRow = {
    date: patch.date ?? existing.date,
    time: patch.time ?? existing.time,
    team_member_id:
      patch.team_member_id !== undefined
        ? patch.team_member_id
        : existing.team_member_id,
    service_duration_minutes:
      patch.service_duration_minutes !== undefined
        ? patch.service_duration_minutes
        : existing.service_duration_minutes,
    status: patch.status ?? existing.status,
  };
  const timingChanged =
    effective.date.slice(0, 10) !== existing.date.slice(0, 10) ||
    normalizeTime(effective.time) !== normalizeTime(existing.time) ||
    (effective.team_member_id ?? null) !== (existing.team_member_id ?? null) ||
    (effective.service_duration_minutes ?? null) !==
      (existing.service_duration_minutes ?? null);
  const reactivated =
    !isOccupyingStatus(existing.status) && isOccupyingStatus(effective.status);

  return {
    needed:
      (timingChanged || reactivated) && isOccupyingStatus(effective.status),
    effective,
  };
}

/** Current date and minute of day in the clinic's time zone (default London). */
export function getClinicNow(
  now: Date = new Date(),
  timeZone = "Europe/London",
): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)!.value;

  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

import {
  DEFAULT_BUFFER_MINUTES,
  DEFAULT_DURATION_MINUTES,
  DEFAULT_MAX_APPOINTMENTS,
  OCCUPYING_STATUSES,
  findOverlap,
  isDayLimitReached,
  minutesToTime,
  timeToMinutes,
  type BookingLike,
} from "@/lib/booking-availability";
import { parseYyyyMmDdUtcDayOfWeek } from "@/lib/calendar-local-date";
import { resolveClinicWorkingHoursForUtcDay } from "@/lib/resolve-clinic-working-hours-utc-day";
import { supabaseAdmin } from "@/lib/supabase";

export type SlotCheckInput = {
  date: string;
  time: string;
  durationMinutes?: number | null;
  teamMemberId?: string | null;
  excludeBookingId?: string | null;
};

export type SlotCheckResult =
  | { ok: true }
  | {
      ok: false;
      reason: "overlap" | "day_limit";
      /** Names the other booking — admin screens only. */
      adminMessage: string;
      /** Safe for customers: never names anyone. */
      publicMessage: string;
    };

export const PUBLIC_SLOT_TAKEN_MESSAGE =
  "Sorry, this time was just taken. Please choose another.";

export function formatOverlapMessage(
  booking: BookingLike,
  practitionerName: string | null,
): string {
  const start = timeToMinutes(booking.time);
  const end =
    start + (booking.service_duration_minutes || DEFAULT_DURATION_MINUTES);
  const range = `${minutesToTime(start)}–${minutesToTime(end)}`;
  const client = booking.customer_name ? ` (${booking.customer_name})` : "";

  if (practitionerName) {
    return `${practitionerName} is booked ${range}${client}. Choose another time.`;
  }

  return `An existing booking with no practitioner assigned uses ${range}${client}. Choose another time.`;
}

async function loadDayBookings(date: string): Promise<BookingLike[]> {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "id, time, service_duration_minutes, team_member_id, status, customer_name",
    )
    .eq("date", date)
    .in("status", [...OCCUPYING_STATUSES]);

  if (error) throw error;

  return (data ?? []) as BookingLike[];
}

async function loadPractitionerNames(
  ids: string[],
): Promise<Map<string, string>> {
  const names = new Map<string, string>();

  if (ids.length === 0) return names;

  const { data } = await supabaseAdmin
    .from("team")
    .select("id, name")
    .in("id", ids);

  for (const member of data ?? []) {
    names.set(member.id, member.name);
  }

  return names;
}

async function resolveRules(
  date: string,
): Promise<{ bufferMinutes: number; maxAppointments: number }> {
  const fallback = {
    bufferMinutes: DEFAULT_BUFFER_MINUTES,
    maxAppointments: DEFAULT_MAX_APPOINTMENTS,
  };
  const dayOfWeek = parseYyyyMmDdUtcDayOfWeek(date);

  if (dayOfWeek === null) return fallback;

  const resolved = await resolveClinicWorkingHoursForUtcDay(dayOfWeek);

  // A closed day must not make writes fail here; closed days are handled by the slot list.
  if (resolved.status !== "open") return fallback;

  return {
    bufferMinutes: resolved.hours.buffer_minutes ?? fallback.bufferMinutes,
    maxAppointments:
      resolved.hours.max_appointments ?? fallback.maxAppointments,
  };
}

/** Single entry point for every route that creates, moves or edits a booking. */
export async function assertSlotFree(
  input: SlotCheckInput,
): Promise<SlotCheckResult> {
  const [bookings, rules] = await Promise.all([
    loadDayBookings(input.date),
    resolveRules(input.date),
  ]);

  // Forms may send the duration as text ("60"); never let it turn into string concatenation.
  const durationMinutes = Number(input.durationMinutes) || null;

  const overlap = findOverlap({
    startTime: input.time,
    durationMinutes,
    bufferMinutes: rules.bufferMinutes,
    teamMemberId: input.teamMemberId,
    bookings,
    excludeBookingId: input.excludeBookingId,
  });

  if (overlap) {
    const names = await loadPractitionerNames(
      overlap.team_member_id ? [overlap.team_member_id] : [],
    );
    const practitionerName = overlap.team_member_id
      ? (names.get(overlap.team_member_id) ?? null)
      : null;

    return {
      ok: false,
      reason: "overlap",
      adminMessage: formatOverlapMessage(overlap, practitionerName),
      publicMessage: PUBLIC_SLOT_TAKEN_MESSAGE,
    };
  }

  if (
    isDayLimitReached({
      teamMemberId: input.teamMemberId,
      bookings,
      maxAppointments: rules.maxAppointments,
      excludeBookingId: input.excludeBookingId,
    })
  ) {
    return {
      ok: false,
      reason: "day_limit",
      adminMessage: `The daily limit of ${rules.maxAppointments} appointments has been reached for this day.`,
      publicMessage: PUBLIC_SLOT_TAKEN_MESSAGE,
    };
  }

  return { ok: true };
}

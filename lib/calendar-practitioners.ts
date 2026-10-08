/**
 * Pure helpers for the admin calendar with practitioners: colours and badges,
 * filtering, counting, day-off checks and the day timeline layout.
 */

import {
  DEFAULT_DURATION_MINUTES,
  timeToMinutes,
} from "@/lib/booking-availability";

export type CalendarMember = {
  id: string;
  name: string;
  role?: string | null;
  image_url?: string | null;
  dayOffPeriods?: Array<{
    start_date: string;
    end_date: string;
    reason?: string | null;
  }>;
};

/** "all", "unassigned", or a practitioner id. */
export type PractitionerFilter = string;

export const FILTER_ALL = "all";
export const FILTER_UNASSIGNED = "unassigned";

export type PractitionerColor = {
  /** Solid dot / accent bar */
  dot: string;
  /** Soft card background + text */
  soft: string;
  /** Card border */
  border: string;
  /** Initials badge */
  badge: string;
  /** Ring around a photo */
  ring: string;
};

// Full class names so Tailwind keeps them in the build.
export const PRACTITIONER_COLORS: PractitionerColor[] = [
  {
    dot: "bg-rose-500",
    soft: "bg-rose-50 text-rose-950 dark:bg-rose-500/15 dark:text-rose-100",
    border: "border-rose-300 dark:border-rose-400/40",
    badge: "bg-rose-600 text-white",
    ring: "ring-rose-500",
  },
  {
    dot: "bg-teal-500",
    soft: "bg-teal-50 text-teal-950 dark:bg-teal-500/15 dark:text-teal-100",
    border: "border-teal-300 dark:border-teal-400/40",
    badge: "bg-teal-600 text-white",
    ring: "ring-teal-500",
  },
  {
    dot: "bg-violet-500",
    soft: "bg-violet-50 text-violet-950 dark:bg-violet-500/15 dark:text-violet-100",
    border: "border-violet-300 dark:border-violet-400/40",
    badge: "bg-violet-600 text-white",
    ring: "ring-violet-500",
  },
  {
    dot: "bg-amber-500",
    soft: "bg-amber-50 text-amber-950 dark:bg-amber-500/15 dark:text-amber-100",
    border: "border-amber-300 dark:border-amber-400/40",
    badge: "bg-amber-600 text-white",
    ring: "ring-amber-500",
  },
];

export const UNASSIGNED_COLOR: PractitionerColor = {
  dot: "bg-slate-400",
  soft: "bg-white text-slate-900 dark:bg-slate-500/10 dark:text-slate-100",
  border: "border-dashed border-slate-400 dark:border-slate-500",
  badge: "bg-slate-500 text-white",
  ring: "ring-slate-400",
};

export type PractitionerBadge = {
  id: string;
  name: string;
  initials: string;
  imageUrl?: string | null;
  color: PractitionerColor;
};

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Stable order (by name, then id) so a practitioner always keeps the same colour. */
export function sortMembers<T extends CalendarMember>(members: T[]): T[] {
  return [...members].sort(
    (a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
  );
}

export function colorForMember(
  members: CalendarMember[],
  memberId: string,
): PractitionerColor {
  const index = sortMembers(members).findIndex((m) => m.id === memberId);

  if (index < 0) return UNASSIGNED_COLOR;

  return PRACTITIONER_COLORS[index % PRACTITIONER_COLORS.length];
}

/** Badge for a booking's practitioner; null when the booking is unassigned. */
export function getPractitionerBadge(
  members: CalendarMember[],
  teamMemberId: string | null | undefined,
): PractitionerBadge | null {
  if (!teamMemberId) return null;

  const member = members.find((m) => m.id === teamMemberId);

  if (!member) {
    return {
      id: teamMemberId,
      name: "Former team member",
      initials: "?",
      color: UNASSIGNED_COLOR,
    };
  }

  return {
    id: member.id,
    name: member.name,
    initials: initialsOf(member.name),
    imageUrl: member.image_url ?? null,
    color: colorForMember(members, member.id),
  };
}

export function filterByPractitioner<
  T extends { team_member_id?: string | null },
>(bookings: T[], filter: PractitionerFilter): T[] {
  if (filter === FILTER_ALL) return bookings;
  if (filter === FILTER_UNASSIGNED) {
    return bookings.filter((booking) => !booking.team_member_id);
  }

  return bookings.filter((booking) => booking.team_member_id === filter);
}

export function countByPractitioner(
  bookings: Array<{ team_member_id?: string | null }>,
): { byMember: Record<string, number>; unassigned: number } {
  const byMember: Record<string, number> = {};
  let unassigned = 0;

  for (const booking of bookings) {
    if (!booking.team_member_id) {
      unassigned += 1;
    } else {
      byMember[booking.team_member_id] =
        (byMember[booking.team_member_id] ?? 0) + 1;
    }
  }

  return { byMember, unassigned };
}

export function isMemberOffOnDate(
  member: CalendarMember,
  dateStr: string,
): boolean {
  return (member.dayOffPeriods ?? []).some(
    (period) =>
      period.start_date.slice(0, 10) <= dateStr &&
      dateStr <= period.end_date.slice(0, 10),
  );
}

type Timed = {
  time: string;
  service_duration_minutes?: number | null;
  duration?: number | null;
};

export function durationOf(booking: Timed): number {
  return (
    booking.service_duration_minutes ||
    booking.duration ||
    DEFAULT_DURATION_MINUTES
  );
}

export type ColumnItem<T> = {
  booking: T;
  top: number;
  height: number;
  lane: number;
  lanes: number;
};

/**
 * Positions one column's bookings on the timeline. Bookings that overlap each
 * other (legacy data) are placed in separate lanes side by side.
 */
export function layoutColumn<T extends Timed>(
  bookings: T[],
  options: {
    windowStartMinutes: number;
    pxPerMinute: number;
    minHeightPx?: number;
  },
): ColumnItem<T>[] {
  const minHeight = options.minHeightPx ?? 0;
  const sorted = bookings
    .map((booking) => {
      const start = timeToMinutes(booking.time);

      return { booking, start, end: start + durationOf(booking) };
    })
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const result: ColumnItem<T>[] = [];
  let cluster: Array<{ item: ColumnItem<T>; end: number }> = [];
  let clusterEnd = -1;
  let laneEnds: number[] = [];

  const closeCluster = () => {
    const lanes = laneEnds.length || 1;

    for (const entry of cluster) entry.item.lanes = lanes;
    cluster = [];
    laneEnds = [];
  };

  for (const { booking, start, end } of sorted) {
    if (cluster.length > 0 && start >= clusterEnd) closeCluster();

    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start);

    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(end);
    } else {
      laneEnds[lane] = end;
    }

    const item: ColumnItem<T> = {
      booking,
      top: (start - options.windowStartMinutes) * options.pxPerMinute,
      height: Math.max((end - start) * options.pxPerMinute, minHeight),
      lane,
      lanes: 1,
    };

    result.push(item);
    cluster.push({ item, end });
    clusterEnd = Math.max(clusterEnd, end);
  }

  closeCluster();

  return result;
}

/** Whole-hour window for the day timeline: 09-18 by default, widened to fit bookings. */
export function computeDayWindow(
  bookings: Timed[],
  defaults: { startHour: number; endHour: number } = {
    startHour: 9,
    endHour: 18,
  },
): { startHour: number; endHour: number } {
  let startHour = defaults.startHour;
  let endHour = defaults.endHour;

  for (const booking of bookings) {
    const start = timeToMinutes(booking.time);
    const end = start + durationOf(booking);

    startHour = Math.min(startHour, Math.floor(start / 60));
    endHour = Math.max(endHour, Math.ceil(end / 60));
  }

  return { startHour: Math.max(0, startHour), endHour: Math.min(24, endHour) };
}

export type TeamDayRow = {
  member: CalendarMember;
  /** Bookings that day, cancelled ones excluded. */
  count: number;
  /** First booking at or after "now" (or the first of the day when `nowMinutes` is null). */
  nextTime: string | null;
  isOff: boolean;
};

/** Per-practitioner summary of one day for the dashboard. */
export function summarizeTeamDay(
  members: CalendarMember[],
  bookings: Array<{
    team_member_id?: string | null;
    time: string;
    status?: string | null;
  }>,
  date: string,
  nowMinutes: number | null,
): { rows: TeamDayRow[]; unassigned: number } {
  const active = bookings.filter((booking) => booking.status !== "cancelled");
  const known = new Set(members.map((member) => member.id));

  const rows = sortMembers(members).map((member) => {
    const mine = active
      .filter((booking) => booking.team_member_id === member.id)
      .sort((a, b) => a.time.localeCompare(b.time));
    const next =
      nowMinutes === null
        ? mine[0]
        : mine.find((booking) => timeToMinutes(booking.time) >= nowMinutes);

    return {
      member,
      count: mine.length,
      nextTime: next ? next.time.slice(0, 5) : null,
      isOff: isMemberOffOnDate(member, date),
    };
  });

  return {
    rows,
    unassigned: active.filter(
      (booking) =>
        !booking.team_member_id || !known.has(booking.team_member_id),
    ).length,
  };
}

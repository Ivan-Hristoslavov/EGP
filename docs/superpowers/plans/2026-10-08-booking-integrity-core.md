# Booking Integrity Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One shared rule set decides whether a time is free for a practitioner, used by the public slot list and by every write path, so bookings can never overlap.

**Architecture:** A pure module (`lib/booking-availability.ts`) holds the rules. A thin server wrapper (`lib/booking-conflicts.ts`) loads the day's bookings and clinic rules from Supabase and exposes `assertSlotFree`. Routes call the wrapper; the slot list routes call the pure module.

**Tech Stack:** Next.js 16 route handlers, TypeScript, Supabase (`supabaseAdmin`), Stripe, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-08-booking-integrity-core-design.md`

**Rules:** no `git commit`, no push, no deploy, no database change. All work stays uncommitted for the owner to review.

**Decisions taken while planning (differences from the spec text):**
- The server cannot tell an admin from a public caller on `POST /api/bookings`, so a booking **without** a practitioner is accepted but occupies everyone's time (spec rule 4). Making the practitioner mandatory in the admin forms is part B (admin UI).
- Admin move no longer silently shifts to the "next free slot" when the target is taken; it returns `409` with a clear message.
- Messages shown to the public never name another customer; admin messages do.

---

## File structure

| File | Responsibility |
|---|---|
| `lib/booking-availability.ts` (create) | Pure rules: time helpers, `findOverlap`, `isDayLimitReached`, `buildDaySlots`, `slotNeedsRecheck`, `getClinicNow` |
| `lib/booking-availability.test.ts` (create) | Rule tests + characterization against the old slot loop |
| `lib/booking-conflicts.ts` (create) | `assertSlotFree` (DB access), message formatting |
| `lib/booking-conflicts.test.ts` (create) | Wrapper tests with mocked Supabase |
| `lib/booking-conflict-notification.ts` (create) | Staff email when a paid booking conflicts |
| `app/api/bookings/availability/team/route.ts` (modify) | Use `buildDaySlots` |
| `app/api/bookings/availability/team/range/route.ts` (modify) | Use `buildDaySlots` |
| `app/api/bookings/route.ts` (modify) | `POST` uses `assertSlotFree` |
| `app/api/bookings/[id]/route.ts` (modify) | `PATCH` rechecks on timing change |
| `app/api/bookings/[id]/move/route.ts` (modify) | Strict conflict check |
| `app/api/admin/time-slots/route.ts` (modify) | Booked check uses overlap with duration |
| `app/api/stripe/create-payment-intent/route.ts` (modify) | Pre-payment check |
| `app/api/stripe/confirm-payment/route.ts` (modify) | Idempotency + final check |
| `components/StripePaymentForm.tsx`, `app/book/page.tsx` (modify) | Handle `SLOT_TAKEN` |
| `app/book/success/page.tsx` (modify) | Notice for conflicted booking |
| `app/api/**/route.test.ts` (create, several) | Route tests |

---

### Task 1: Pure rule module

**Files:**
- Create: `lib/booking-availability.ts`
- Test: `lib/booking-availability.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/booking-availability.test.ts`:

```ts
import { describe, it, expect } from "vitest";

import {
  buildDaySlots,
  findOverlap,
  getClinicNow,
  isDayLimitReached,
  minutesToTime,
  slotNeedsRecheck,
  timeToMinutes,
  type BookingLike,
} from "./booking-availability";

const A = "practitioner-a";
const B = "practitioner-b";

const booking = (over: Partial<BookingLike> = {}): BookingLike => ({
  id: "b1",
  time: "10:00",
  service_duration_minutes: 60,
  team_member_id: A,
  status: "confirmed",
  customer_name: "Client",
  ...over,
});

const base = {
  openTime: "09:00",
  closeTime: "18:00",
  durationMinutes: 60,
  bufferMinutes: 15,
  maxAppointments: 12,
};

describe("time helpers", () => {
  it("converts HH:MM and HH:MM:SS", () => {
    expect(timeToMinutes("09:30")).toBe(570);
    expect(timeToMinutes("09:30:00")).toBe(570);
    expect(minutesToTime(570)).toBe("09:30");
  });
});

describe("findOverlap", () => {
  const bookings = [booking()]; // A: 10:00-11:00 + 15 buffer => occupies until 11:15

  it("detects an overlap for the same practitioner", () => {
    const hit = findOverlap({
      startTime: "11:00",
      durationMinutes: 30,
      bufferMinutes: 15,
      teamMemberId: A,
      bookings,
    });

    expect(hit?.id).toBe("b1");
  });

  it("allows a booking right after the buffer", () => {
    expect(
      findOverlap({
        startTime: "11:15",
        durationMinutes: 30,
        bufferMinutes: 15,
        teamMemberId: A,
        bookings,
      }),
    ).toBeNull();
  });

  it("never conflicts across practitioners", () => {
    expect(
      findOverlap({
        startTime: "10:00",
        durationMinutes: 60,
        bufferMinutes: 15,
        teamMemberId: B,
        bookings,
      }),
    ).toBeNull();
  });

  it("treats an unassigned existing booking as occupying everyone", () => {
    const hit = findOverlap({
      startTime: "10:30",
      durationMinutes: 30,
      bufferMinutes: 15,
      teamMemberId: B,
      bookings: [booking({ team_member_id: null })],
    });

    expect(hit).not.toBeNull();
  });

  it("treats a new unassigned booking as conflicting with anyone", () => {
    const hit = findOverlap({
      startTime: "10:30",
      durationMinutes: 30,
      bufferMinutes: 15,
      teamMemberId: null,
      bookings,
    });

    expect(hit?.id).toBe("b1");
  });

  it("ignores cancelled and completed bookings", () => {
    for (const status of ["cancelled", "completed"]) {
      expect(
        findOverlap({
          startTime: "10:00",
          durationMinutes: 60,
          bufferMinutes: 15,
          teamMemberId: A,
          bookings: [booking({ status })],
        }),
      ).toBeNull();
    }
  });

  it("can exclude the booking being edited", () => {
    expect(
      findOverlap({
        startTime: "10:00",
        durationMinutes: 60,
        bufferMinutes: 15,
        teamMemberId: A,
        bookings,
        excludeBookingId: "b1",
      }),
    ).toBeNull();
  });

  it("defaults to 30 minutes when the duration is unknown", () => {
    const hit = findOverlap({
      startTime: "10:30",
      durationMinutes: null,
      bufferMinutes: 0,
      teamMemberId: A,
      bookings: [booking({ service_duration_minutes: null, time: "10:00" })],
    });

    expect(hit).toBeNull(); // existing 10:00-10:30, new starts 10:30
  });
});

describe("isDayLimitReached", () => {
  it("counts per practitioner plus unassigned", () => {
    const bookings = [
      booking({ id: "1" }),
      booking({ id: "2", time: "13:00" }),
      booking({ id: "3", time: "15:00", team_member_id: B }),
    ];

    expect(
      isDayLimitReached({ teamMemberId: A, bookings, maxAppointments: 2 }),
    ).toBe(true);
    expect(
      isDayLimitReached({ teamMemberId: B, bookings, maxAppointments: 2 }),
    ).toBe(false);
  });
});

describe("buildDaySlots", () => {
  it("offers every 15 minutes from opening when nothing is booked", () => {
    const { availableSlots, bookedSlots } = buildDaySlots({
      ...base,
      teamMemberId: A,
      bookings: [],
    });

    expect(availableSlots[0]).toBe("09:00");
    expect(availableSlots[availableSlots.length - 1]).toBe("16:45");
    expect(availableSlots).toHaveLength(32);
    expect(bookedSlots).toEqual([]);
  });

  it("blocks the practitioner's own booking including buffer", () => {
    const { availableSlots, bookedSlots } = buildDaySlots({
      ...base,
      teamMemberId: A,
      bookings: [booking()],
    });

    expect(bookedSlots).toEqual(["10:00", "10:15", "10:30", "10:45", "11:00"]);
    expect(availableSlots[0]).toBe("11:15");
  });

  it("leaves the other practitioner completely free", () => {
    const { availableSlots, bookedSlots } = buildDaySlots({
      ...base,
      teamMemberId: B,
      bookings: [booking()],
    });

    expect(availableSlots[0]).toBe("09:00");
    expect(bookedSlots).toEqual([]);
  });

  it("lets an unassigned booking block everyone", () => {
    const { bookedSlots } = buildDaySlots({
      ...base,
      teamMemberId: B,
      bookings: [booking({ team_member_id: null })],
    });

    expect(bookedSlots).toEqual(["10:00", "10:15", "10:30", "10:45", "11:00"]);
  });

  it("does not offer slots before the earliest start", () => {
    const { availableSlots } = buildDaySlots({
      ...base,
      teamMemberId: A,
      bookings: [],
      earliestStartMinutes: timeToMinutes("12:00"),
    });

    expect(availableSlots[0]).toBe("12:00");
  });

  it("offers nothing once the day limit is reached, only for that practitioner", () => {
    const bookings = [
      booking({ id: "1", time: "09:00", service_duration_minutes: 30 }),
      booking({ id: "2", time: "13:00", service_duration_minutes: 30 }),
    ];
    const a = buildDaySlots({
      ...base,
      maxAppointments: 2,
      teamMemberId: A,
      bookings,
    });
    const b = buildDaySlots({
      ...base,
      maxAppointments: 2,
      teamMemberId: B,
      bookings,
    });

    expect(a.dayLimitReached).toBe(true);
    expect(a.availableSlots).toEqual([]);
    expect(b.dayLimitReached).toBe(false);
    expect(b.availableSlots.length).toBeGreaterThan(0);
  });
});

/** The slot loop exactly as it was inline in the team availability routes. */
function legacySlots(
  open: string,
  close: string,
  duration: number,
  buffer: number,
  maxAppointments: number,
  existing: Array<{ time: string; duration: number }>,
) {
  const startM = timeToMinutes(open);
  const endM = timeToMinutes(close);
  const ranges = existing
    .map((b) => {
      const s = timeToMinutes(b.time);

      return { start: s, end: s + b.duration + buffer };
    })
    .sort((x, y) => x.start - y.start);
  const limit = existing.length >= maxAppointments;
  const available: string[] = [];
  const booked: string[] = [];

  for (let t = startM; t < endM; t += 15) {
    const label = minutesToTime(t);
    const isBooked = ranges.some((r) => t >= r.start && t < r.end);

    if (isBooked) {
      booked.push(label);
    } else {
      if (limit) continue;
      const slotEnd = t + duration + buffer;

      if (slotEnd <= endM) {
        if (!ranges.some((r) => t < r.end && slotEnd > r.start)) {
          available.push(label);
        }
      }
    }
  }

  return { available, booked };
}

describe("buildDaySlots matches the previous slot loop", () => {
  const fixtures = [
    [],
    [{ time: "09:00", duration: 30 }],
    [
      { time: "10:00", duration: 60 },
      { time: "13:30", duration: 45 },
    ],
    [
      { time: "09:15", duration: 90 },
      { time: "12:00", duration: 30 },
      { time: "15:45", duration: 120 },
    ],
  ];

  it.each(fixtures.map((f, i) => [i, f] as const))(
    "fixture %i",
    (_i, existing) => {
      for (const duration of [30, 45, 60, 90, 150]) {
        const expected = legacySlots("09:00", "18:00", duration, 15, 12, [
          ...existing,
        ]);
        const actual = buildDaySlots({
          ...base,
          durationMinutes: duration,
          teamMemberId: A,
          bookings: existing.map((e, idx) =>
            booking({
              id: `x${idx}`,
              time: e.time,
              service_duration_minutes: e.duration,
            }),
          ),
        });

        expect(actual.availableSlots).toEqual(expected.available);
        expect(actual.bookedSlots).toEqual(expected.booked);
      }
    },
  );
});

describe("slotNeedsRecheck", () => {
  const existing = {
    date: "2026-10-20",
    time: "10:00:00",
    team_member_id: A,
    service_duration_minutes: 60,
    status: "confirmed",
  };

  it("does not recheck a note or payment edit", () => {
    expect(slotNeedsRecheck(existing, { status: "confirmed" }).needed).toBe(
      false,
    );
  });

  it("ignores the HH:MM vs HH:MM:SS difference", () => {
    expect(slotNeedsRecheck(existing, { time: "10:00" }).needed).toBe(false);
  });

  it("rechecks when time, date, practitioner or duration change", () => {
    expect(slotNeedsRecheck(existing, { time: "11:00" }).needed).toBe(true);
    expect(slotNeedsRecheck(existing, { date: "2026-10-21" }).needed).toBe(true);
    expect(slotNeedsRecheck(existing, { team_member_id: B }).needed).toBe(true);
    expect(
      slotNeedsRecheck(existing, { service_duration_minutes: 90 }).needed,
    ).toBe(true);
  });

  it("rechecks when a cancelled booking is reactivated", () => {
    expect(
      slotNeedsRecheck({ ...existing, status: "cancelled" }, { status: "confirmed" })
        .needed,
    ).toBe(true);
  });

  it("does not recheck when cancelling or completing", () => {
    expect(slotNeedsRecheck(existing, { status: "cancelled" }).needed).toBe(false);
    expect(slotNeedsRecheck(existing, { status: "completed" }).needed).toBe(false);
  });
});

describe("getClinicNow", () => {
  it("uses London summer time", () => {
    expect(getClinicNow(new Date(Date.UTC(2026, 5, 15, 12, 30)))).toEqual({
      date: "2026-06-15",
      minutes: 13 * 60 + 30,
    });
  });

  it("uses London winter time", () => {
    expect(getClinicNow(new Date(Date.UTC(2026, 0, 15, 12, 30)))).toEqual({
      date: "2026-01-15",
      minutes: 12 * 60 + 30,
    });
  });
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npx vitest run lib/booking-availability.test.ts`
Expected: FAIL — `Failed to resolve import "./booking-availability"`.

- [ ] **Step 3: Write the module**

Create `lib/booking-availability.ts`:

```ts
/**
 * Single source of truth for "is this time free for this practitioner".
 * Pure functions only (no I/O) so every route and the public slot list share
 * exactly the same rules. See docs/superpowers/specs/2026-10-08-booking-integrity-core-design.md
 */

export const OCCUPYING_STATUSES = ["pending", "confirmed", "scheduled"] as const;
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
    if (input.earliestStartMinutes !== undefined && t < input.earliestStartMinutes) {
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
    needed: (timingChanged || reactivated) && isOccupyingStatus(effective.status),
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
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `npx vitest run lib/booking-availability.test.ts`
Expected: PASS, all tests green (including every "matches the previous slot loop" fixture).

---

### Task 2: Server wrapper `assertSlotFree`

**Files:**
- Create: `lib/booking-conflicts.ts`
- Test: `lib/booking-conflicts.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/booking-conflicts.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const db = vi.hoisted(() => ({
  bookings: [] as any[],
  team: [] as any[],
  hours: { status: "open", hours: { buffer_minutes: 15, max_appointments: 12 } } as any,
}));

vi.mock("@/lib/supabase", () => ({
  supabaseAdmin: {
    from: (table: string) => {
      const chain: any = {
        select: () => chain,
        eq: () => chain,
        in: () =>
          table === "bookings"
            ? Promise.resolve({ data: db.bookings, error: null })
            : Promise.resolve({ data: db.team, error: null }),
      };

      return chain;
    },
  },
}));

vi.mock("@/lib/resolve-clinic-working-hours-utc-day", () => ({
  resolveClinicWorkingHoursForUtcDay: () => Promise.resolve(db.hours),
}));

import { assertSlotFree, formatOverlapMessage } from "./booking-conflicts";

const A = "a";
const B = "b";

describe("assertSlotFree", () => {
  beforeEach(() => {
    db.bookings = [
      {
        id: "b1",
        time: "14:00:00",
        service_duration_minutes: 60,
        team_member_id: A,
        status: "confirmed",
        customer_name: "Jane Client",
      },
    ];
    db.team = [{ id: A, name: "Maria" }];
    db.hours = {
      status: "open",
      hours: { buffer_minutes: 15, max_appointments: 12 },
    };
  });

  it("rejects an overlap for the same practitioner with a detailed admin message", async () => {
    const result = await assertSlotFree({
      date: "2026-10-20",
      time: "14:30",
      durationMinutes: 30,
      teamMemberId: A,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("overlap");
      expect(result.adminMessage).toBe(
        "Maria is booked 14:00–15:00 (Jane Client). Choose another time.",
      );
      expect(result.publicMessage).toBe(
        "Sorry, this time was just taken. Please choose another.",
      );
      expect(result.publicMessage).not.toContain("Jane");
    }
  });

  it("allows the other practitioner at the same time", async () => {
    const result = await assertSlotFree({
      date: "2026-10-20",
      time: "14:00",
      durationMinutes: 60,
      teamMemberId: B,
    });

    expect(result).toEqual({ ok: true });
  });

  it("does not count the booking being edited", async () => {
    const result = await assertSlotFree({
      date: "2026-10-20",
      time: "14:00",
      durationMinutes: 60,
      teamMemberId: A,
      excludeBookingId: "b1",
    });

    expect(result).toEqual({ ok: true });
  });

  it("rejects when the practitioner's daily limit is reached", async () => {
    db.hours = {
      status: "open",
      hours: { buffer_minutes: 15, max_appointments: 1 },
    };

    const result = await assertSlotFree({
      date: "2026-10-20",
      time: "09:00",
      durationMinutes: 30,
      teamMemberId: A,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("day_limit");
  });

  it("falls back to default rules on a closed day instead of blocking", async () => {
    db.hours = { status: "closed", message: "closed" };

    const result = await assertSlotFree({
      date: "2026-10-20",
      time: "09:00",
      durationMinutes: 30,
      teamMemberId: B,
    });

    expect(result).toEqual({ ok: true });
  });
});

describe("formatOverlapMessage", () => {
  it("describes an unassigned booking without a name", () => {
    expect(
      formatOverlapMessage(
        { time: "10:00", service_duration_minutes: 30, customer_name: "Sam" },
        null,
      ),
    ).toBe(
      "An existing booking with no practitioner assigned uses 10:00–10:30 (Sam). Choose another time.",
    );
  });
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npx vitest run lib/booking-conflicts.test.ts`
Expected: FAIL — `Failed to resolve import "./booking-conflicts"`.

- [ ] **Step 3: Write the wrapper**

Create `lib/booking-conflicts.ts`:

```ts
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
  const end = start + (booking.service_duration_minutes || DEFAULT_DURATION_MINUTES);
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
    .select("id, time, service_duration_minutes, team_member_id, status, customer_name")
    .eq("date", date)
    .in("status", [...OCCUPYING_STATUSES]);

  if (error) throw error;

  return (data ?? []) as BookingLike[];
}

async function loadPractitionerNames(ids: string[]): Promise<Map<string, string>> {
  const names = new Map<string, string>();

  if (ids.length === 0) return names;

  const { data } = await supabaseAdmin.from("team").select("id, name").in("id", ids);

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
    maxAppointments: resolved.hours.max_appointments ?? fallback.maxAppointments,
  };
}

/** Single entry point for every route that creates, moves or edits a booking. */
export async function assertSlotFree(input: SlotCheckInput): Promise<SlotCheckResult> {
  const [bookings, rules] = await Promise.all([
    loadDayBookings(input.date),
    resolveRules(input.date),
  ]);

  const overlap = findOverlap({
    startTime: input.time,
    durationMinutes: input.durationMinutes,
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
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `npx vitest run lib/booking-conflicts.test.ts lib/booking-availability.test.ts`
Expected: PASS.

---

### Task 3: Public slot list uses the engine

**Files:**
- Modify: `app/api/bookings/availability/team/route.ts`
- Modify: `app/api/bookings/availability/team/range/route.ts`

- [ ] **Step 1: Single-day route — imports**

In `app/api/bookings/availability/team/route.ts`, add after the existing `@/lib/...` imports:

```ts
import {
  OCCUPYING_STATUSES,
  buildDaySlots,
  getClinicNow,
} from "@/lib/booking-availability";
```

- [ ] **Step 2: Single-day route — replace the booking query and slot loop**

Replace everything from the comment `// Get existing bookings for this team member on this date` down to (but not including) the final `return NextResponse.json({ availableSlots, bookedSlots, workingHours: {` block with:

```ts
    // All active bookings of the day: the practitioner's own plus unassigned ones
    // (unassigned bookings occupy everyone's time).
    const { data: existingBookings, error: bookingsError } = await supabaseAdmin
      .from("bookings")
      .select("id, time, service_duration_minutes, team_member_id, status")
      .eq("date", date)
      .in("status", [...OCCUPYING_STATUSES]);

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);

      return NextResponse.json(
        { error: "Failed to fetch existing bookings" },
        { status: 500 },
      );
    }

    const clinicNow = getClinicNow();
    const {
      availableSlots,
      bookedSlots,
      dayLimitReached: isMaxAppointmentsReached,
      bookingsCount: existingBookingsCount,
    } = buildDaySlots({
      openTime: workingHours.start_time,
      closeTime: workingHours.end_time,
      durationMinutes,
      bufferMinutes,
      maxAppointments,
      teamMemberId,
      bookings: existingBookings ?? [],
      earliestStartMinutes:
        date === clinicNow.date ? clinicNow.minutes : undefined,
    });
```

Then in the final response replace `currentBookingsCount: existingBookingsCount,` and `maxAppointmentsReached: isMaxAppointmentsReached,` — they keep working because the variables above carry the same names.

- [ ] **Step 3: Range route — imports**

In `app/api/bookings/availability/team/range/route.ts` add:

```ts
import {
  OCCUPYING_STATUSES,
  buildDaySlots,
  getClinicNow,
  type BookingLike,
} from "@/lib/booking-availability";
```

- [ ] **Step 4: Range route — load all active bookings and group by date**

Replace the block from `// Get all bookings for the team member in the date range` through the end of the `(existingBookings || []).forEach(...)` grouping with:

```ts
    // All active bookings in the range: the practitioner's own plus unassigned ones.
    const { data: existingBookings, error: bookingsError } = await supabaseAdmin
      .from("bookings")
      .select("id, date, time, service_duration_minutes, team_member_id, status")
      .gte("date", startDate)
      .lte("date", endDate)
      .in("status", [...OCCUPYING_STATUSES]);

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);

      return NextResponse.json(
        { error: "Failed to fetch existing bookings" },
        { status: 500 },
      );
    }

    const bookingsByDate = new Map<string, BookingLike[]>();

    (existingBookings || []).forEach((booking) => {
      if (!bookingsByDate.has(booking.date)) {
        bookingsByDate.set(booking.date, []);
      }
      bookingsByDate.get(booking.date)!.push(booking);
    });

    const clinicNow = getClinicNow();
```

- [ ] **Step 5: Range route — replace the per-day slot computation**

Inside the `while (currentDate <= end)` loop, replace everything from `// Get bookings for this date` through the line that sets `status: availableSlots.length > 0 ? "available" : "full"` block's computation (i.e. the parsing of working hours, `bookedRanges`, the `for` slot loop and the `maxAppointments` count) with:

```ts
      const dateBookings = bookingsByDate.get(dateStr) || [];
      const { availableSlots, bookedSlots } = buildDaySlots({
        openTime: startTime,
        closeTime: endTime,
        durationMinutes: serviceDurationMinutes,
        bufferMinutes,
        maxAppointments,
        teamMemberId,
        bookings: dateBookings,
        earliestStartMinutes:
          dateStr === clinicNow.date ? clinicNow.minutes : undefined,
      });
```

Keep the existing `results[dateStr] = { availableSlots, bookedSlots, workingHours: {...}, status: availableSlots.length > 0 ? "available" : "full", isOnDayOff: false };` assignment and the `currentDate.setDate(...)` line unchanged.

- [ ] **Step 6: Typecheck and compare with the live site**

Run: `npm run typecheck`
Expected: no output (clean).

Then with the dev server running (`egp-dev`), compare a real week against production for a practitioner that has no unassigned bookings in the window (differences are expected only for past times today and unassigned bookings):

```bash
TEAM=$(curl -s https://www.egpaesthetics.co.uk/api/team | python3 -c "import sys,json;print(json.load(sys.stdin)['team'][0]['id'])")
Q="team_member_id=$TEAM&start_date=2026-10-12&end_date=2026-10-25&service_duration_minutes=60"
curl -s "https://www.egpaesthetics.co.uk/api/bookings/availability/team/range?$Q" > /tmp/prod.json
curl -s "http://localhost:3000/api/bookings/availability/team/range?$Q" > /tmp/local.json
python3 - <<'EOF'
import json
a=json.load(open('/tmp/prod.json'))['availability']; b=json.load(open('/tmp/local.json'))['availability']
diff=[d for d in a if a[d]!=b.get(d)]
print("days compared:",len(a),"days that differ:",diff)
EOF
```
Expected: `days that differ: []` (or only dates explained by unassigned bookings; inspect any difference before continuing).

---

### Task 4: `POST /api/bookings` uses `assertSlotFree`

**Files:**
- Modify: `app/api/bookings/route.ts`
- Test: `app/api/bookings/route.post.test.ts`

- [ ] **Step 1: Write the failing test**

Create `app/api/bookings/route.post.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const m = vi.hoisted(() => ({
  assertSlotFree: vi.fn(),
  requireAdmin: vi.fn(),
  insert: vi.fn(),
}));

vi.mock("@/lib/booking-conflicts", () => ({
  assertSlotFree: (...a: unknown[]) => m.assertSlotFree(...a),
}));
vi.mock("@/lib/admin-auth", () => ({ requireAdmin: () => m.requireAdmin() }));
vi.mock("@/lib/sendgrid-smtp", () => ({ sendEmail: vi.fn() }));
vi.mock("@/lib/booking-staff-notification", () => ({
  sendStaffNewBookingNotification: vi.fn(),
}));
vi.mock("@/lib/booking-practitioner-for-customer-email", () => ({
  fetchBookingPractitionerForCustomerEmail: vi.fn(),
  practitionerEmailCardHtml: vi.fn(() => ""),
  practitionerPlainTextSection: vi.fn(() => ""),
}));
vi.mock("@/lib/admin-profile", () => ({
  getAdminContactInfo: vi.fn(() => Promise.resolve({ phone: "", email: "" })),
}));
vi.mock("@/lib/email-theme", () => ({
  getEmailHead: () => "",
  EMAIL: { light: {}, dark: {} },
}));
vi.mock("../../../lib/supabase", () => ({
  supabaseAdmin: {
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: () => Promise.resolve({ data: null }) }),
      }),
      insert: (...a: unknown[]) => {
        m.insert(...a);

        return {
          select: () => ({
            single: () =>
              Promise.resolve({ data: { id: "new", customer_email: null }, error: null }),
          }),
        };
      },
    }),
  },
}));

import { POST } from "./route";

const body = {
  customer_name: "Jane",
  service: "Consultation",
  date: "2026-10-20",
  time: "14:00",
  amount: 0,
  team_member_id: "a",
  service_duration_minutes: 30,
};

const req = () =>
  new NextRequest("http://localhost/api/bookings", {
    method: "POST",
    body: JSON.stringify(body),
  });

describe("POST /api/bookings", () => {
  beforeEach(() => {
    m.assertSlotFree.mockReset();
    m.requireAdmin.mockReset();
    m.insert.mockReset();
  });

  it("checks the slot for the chosen practitioner and duration", async () => {
    m.assertSlotFree.mockResolvedValue({ ok: true });
    await POST(req());

    expect(m.assertSlotFree).toHaveBeenCalledWith({
      date: "2026-10-20",
      time: "14:00",
      durationMinutes: 30,
      teamMemberId: "a",
    });
    expect(m.insert).toHaveBeenCalled();
  });

  it("returns a generic 409 to the public and does not insert", async () => {
    m.assertSlotFree.mockResolvedValue({
      ok: false,
      reason: "overlap",
      adminMessage: "Maria is booked 14:00–14:30 (Other Client). Choose another time.",
      publicMessage: "Sorry, this time was just taken. Please choose another.",
    });
    m.requireAdmin.mockResolvedValue(new Response(null, { status: 401 }));

    const res = await POST(req());
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.code).toBe("SLOT_TAKEN");
    expect(json.error).toBe("Sorry, this time was just taken. Please choose another.");
    expect(JSON.stringify(json)).not.toContain("Other Client");
    expect(m.insert).not.toHaveBeenCalled();
  });

  it("returns the detailed message to an admin", async () => {
    m.assertSlotFree.mockResolvedValue({
      ok: false,
      reason: "overlap",
      adminMessage: "Maria is booked 14:00–14:30 (Other Client). Choose another time.",
      publicMessage: "Sorry, this time was just taken. Please choose another.",
    });
    m.requireAdmin.mockResolvedValue(null);

    const res = await POST(req());
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.error).toContain("Maria is booked 14:00–14:30");
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npx vitest run app/api/bookings/route.post.test.ts`
Expected: FAIL (`assertSlotFree` never called; old conflict code runs against the mocked client).

- [ ] **Step 3: Replace the conflict logic**

In `app/api/bookings/route.ts` add to the imports:

```ts
import { assertSlotFree } from "@/lib/booking-conflicts";
```

Replace the whole block from the comment `// Get working hours for this date to check max appointments` through the `Maximum appointments reached` response (everything before `// Server-side customer upsert: look up by email or use provided customer_id`) with:

```ts
    // One shared rule set for every path: per practitioner, with duration and buffer.
    const slotCheck = await assertSlotFree({
      date,
      time,
      durationMinutes: service_duration_minutes,
      teamMemberId: team_member_id,
    });

    if (!slotCheck.ok) {
      // Admins see who holds the slot; the public never learns another customer's name.
      const isAdmin = (await requireAdmin()) === null;
      const message = isAdmin ? slotCheck.adminMessage : slotCheck.publicMessage;

      return NextResponse.json(
        { error: message, message, code: "SLOT_TAKEN", conflict: true },
        { status: 409 },
      );
    }
```

- [ ] **Step 4: Run the tests and typecheck**

Run: `npx vitest run app/api/bookings/route.post.test.ts && npm run typecheck`
Expected: PASS and clean typecheck.

---

### Task 5: Edit and move are strict

**Files:**
- Modify: `app/api/bookings/[id]/route.ts`
- Modify: `app/api/bookings/[id]/move/route.ts`
- Test: `app/api/bookings/[id]/move/route.test.ts`

- [ ] **Step 1: Write the failing move test**

Create `app/api/bookings/[id]/move/route.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const m = vi.hoisted(() => ({
  assertSlotFree: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/lib/admin-auth", () => ({ requireAdmin: () => Promise.resolve(null) }));
vi.mock("@/lib/booking-conflicts", () => ({
  assertSlotFree: (...a: unknown[]) => m.assertSlotFree(...a),
}));
vi.mock("../../../../../lib/supabase", () => ({
  supabaseAdmin: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: {
                id: "b1",
                team_member_id: "a",
                service_duration_minutes: 60,
              },
              error: null,
            }),
        }),
      }),
      update: (...a: unknown[]) => {
        m.update(...a);

        return {
          eq: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: { id: "b1" }, error: null }),
            }),
          }),
        };
      },
    }),
  },
}));

import { PATCH } from "./route";

const call = () =>
  PATCH(
    new NextRequest("http://localhost/api/bookings/b1/move", {
      method: "PATCH",
      body: JSON.stringify({ newDate: "2026-10-21", newTime: "11:00" }),
    }),
    { params: Promise.resolve({ id: "b1" }) },
  );

describe("PATCH /api/bookings/[id]/move", () => {
  beforeEach(() => {
    m.assertSlotFree.mockReset();
    m.update.mockReset();
  });

  it("checks the target for the booking's own practitioner and ignores itself", async () => {
    m.assertSlotFree.mockResolvedValue({ ok: true });
    const res = await call();

    expect(res.status).toBe(200);
    expect(m.assertSlotFree).toHaveBeenCalledWith({
      date: "2026-10-21",
      time: "11:00",
      durationMinutes: 60,
      teamMemberId: "a",
      excludeBookingId: "b1",
    });
    expect(m.update).toHaveBeenCalled();
  });

  it("rejects a taken time with a clear message and does not move", async () => {
    m.assertSlotFree.mockResolvedValue({
      ok: false,
      reason: "overlap",
      adminMessage: "Maria is booked 11:00–12:00 (Jane). Choose another time.",
      publicMessage: "x",
    });
    const res = await call();
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.error).toBe("Maria is booked 11:00–12:00 (Jane). Choose another time.");
    expect(m.update).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run "app/api/bookings/[id]/move/route.test.ts"`
Expected: FAIL.

- [ ] **Step 3: Rewrite the move route conflict handling**

In `app/api/bookings/[id]/move/route.ts`:

1. Delete `SLOT_STEP`, `buildHalfHourSlotStrings`, `getFallbackSlotsForDate` and the imports of `parseYyyyMmDdUtcDayOfWeek` and `resolveClinicWorkingHoursForUtcDay`.
2. Add `import { assertSlotFree } from "@/lib/booking-conflicts";`.
3. Replace the block from `// Check if there's already a booking at the new time slot` through the end of the `if (conflictingBooking && ...) { ... }` alternative-slot logic with:

```ts
    // Strict: the target must be free for this booking's own practitioner.
    const slotCheck = await assertSlotFree({
      date: newDate,
      time: newTime,
      durationMinutes: existingBooking.service_duration_minutes,
      teamMemberId: existingBooking.team_member_id,
      excludeBookingId: id,
    });

    if (!slotCheck.ok) {
      return NextResponse.json(
        { error: slotCheck.adminMessage, code: "SLOT_TAKEN" },
        { status: 409 },
      );
    }
```
4. Replace the `finalTime` usages: update with `time: newTime`, build `formattedBooking` with `time: newTime`, and the success `message` becomes `"Booking moved successfully"`.

- [ ] **Step 4: Recheck on `PATCH /api/bookings/[id]`**

In `app/api/bookings/[id]/route.ts` add imports:

```ts
import { slotNeedsRecheck } from "@/lib/booking-availability";
import { assertSlotFree } from "@/lib/booking-conflicts";
```

In `PATCH`, right after the `console.log("Existing booking found:", existingBooking);` line insert:

```ts
    // Only re-check when the edit changes what the booking occupies.
    const recheck = slotNeedsRecheck(existingBooking, body);

    if (recheck.needed) {
      const slotCheck = await assertSlotFree({
        date: recheck.effective.date.slice(0, 10),
        time: recheck.effective.time,
        durationMinutes: recheck.effective.service_duration_minutes,
        teamMemberId: recheck.effective.team_member_id,
        excludeBookingId: id,
      });

      if (!slotCheck.ok) {
        return NextResponse.json(
          { error: slotCheck.adminMessage, code: "SLOT_TAKEN" },
          { status: 409 },
        );
      }
    }
```

- [ ] **Step 5: Run the tests and typecheck**

Run: `npx vitest run "app/api/bookings/[id]/move/route.test.ts" && npm run typecheck`
Expected: PASS and clean.

---

### Task 6: Admin time-slot list marks overlaps

**Files:**
- Modify: `app/api/admin/time-slots/route.ts`

- [ ] **Step 1: Use overlap instead of an exact start match**

In `app/api/admin/time-slots/route.ts` add imports:

```ts
import {
  DEFAULT_DURATION_MINUTES,
  OCCUPYING_STATUSES,
  findOverlap,
} from "@/lib/booking-availability";
```

Replace `getBookingsBetween` so it keeps all practitioners' bookings (needed for the unassigned rule) and the fields the engine needs:

```ts
async function getBookingsBetween(startDate: string, endDate: string) {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("id, date, time, service_duration_minutes, status, team_member_id")
    .gte("date", startDate)
    .lte("date", endDate)
    .in("status", [...OCCUPYING_STATUSES]);

  if (error) {
    throw error;
  }

  return data ?? [];
}
```

Replace `isSlotBooked` with:

```ts
function isSlotBooked(
  bookings: any[],
  date: string,
  time: string,
  teamMemberId: string | null,
  bufferMinutes: number,
) {
  return (
    findOverlap({
      startTime: time,
      durationMinutes: DEFAULT_DURATION_MINUTES,
      bufferMinutes,
      teamMemberId,
      bookings: bookings.filter((booking) => booking.date === date),
    }) !== null
  );
}
```

In `buildSlotsForDate` change the two call sites:

```ts
  const bookings = await getBookingsBetween(date, date);
  ...
    const reserved = isSlotBooked(
      bookings,
      date,
      slotStartStr,
      teamMemberId,
      workingHour.buffer_minutes ?? 0,
    );
```

Update any other caller of `getBookingsBetween(...)` in the same file to the two-argument form (search the file for `getBookingsBetween(`).

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean.

---

### Task 7: Pre-payment check and "time taken" handling

**Files:**
- Modify: `app/api/stripe/create-payment-intent/route.ts`
- Test: `app/api/stripe/create-payment-intent/route.test.ts`
- Modify: `components/StripePaymentForm.tsx`
- Modify: `app/book/page.tsx`

- [ ] **Step 1: Write the failing test**

Create `app/api/stripe/create-payment-intent/route.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const m = vi.hoisted(() => ({
  assertSlotFree: vi.fn(),
  create: vi.fn(),
}));

vi.mock("@/lib/booking-conflicts", () => ({
  assertSlotFree: (...a: unknown[]) => m.assertSlotFree(...a),
}));
vi.mock("stripe", () => ({
  default: class {
    paymentIntents = { create: (...a: unknown[]) => m.create(...a) };
  },
}));

import { POST } from "./route";

const req = (metadata: Record<string, string>) =>
  new NextRequest("http://localhost/api/stripe/create-payment-intent", {
    method: "POST",
    body: JSON.stringify({ amount: 50, metadata }),
  });

describe("POST /api/stripe/create-payment-intent", () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    m.assertSlotFree.mockReset();
    m.create.mockReset();
    m.create.mockResolvedValue({ client_secret: "cs", id: "pi_1" });
  });

  it("refuses to start a payment for a time that is already taken", async () => {
    m.assertSlotFree.mockResolvedValue({
      ok: false,
      reason: "overlap",
      adminMessage: "x",
      publicMessage: "Sorry, this time was just taken. Please choose another.",
    });

    const res = await POST(
      req({
        selectedDate: "2026-10-20",
        selectedTime: "14:00",
        teamMemberId: "a",
        serviceDurationMinutes: "60",
      }),
    );
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.code).toBe("SLOT_TAKEN");
    expect(m.create).not.toHaveBeenCalled();
  });

  it("creates the payment when the time is free", async () => {
    m.assertSlotFree.mockResolvedValue({ ok: true });

    const res = await POST(
      req({
        selectedDate: "2026-10-20",
        selectedTime: "14:00",
        teamMemberId: "a",
        serviceDurationMinutes: "60",
      }),
    );

    expect(res.status).toBe(200);
    expect(m.assertSlotFree).toHaveBeenCalledWith({
      date: "2026-10-20",
      time: "14:00",
      durationMinutes: 60,
      teamMemberId: "a",
    });
  });

  it("skips the check when the metadata has no booking slot", async () => {
    const res = await POST(req({ note: "no slot" }));

    expect(res.status).toBe(200);
    expect(m.assertSlotFree).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run app/api/stripe/create-payment-intent/route.test.ts`
Expected: FAIL.

- [ ] **Step 3: Add the pre-check to the route**

In `app/api/stripe/create-payment-intent/route.ts` add `import { assertSlotFree } from "@/lib/booking-conflicts";` and, after the `Invalid amount` check and before `stripe.paymentIntents.create`, insert:

```ts
    // Never take money for a time that is already taken.
    if (metadata.selectedDate && metadata.selectedTime) {
      const slotCheck = await assertSlotFree({
        date: metadata.selectedDate,
        time: metadata.selectedTime,
        durationMinutes: metadata.serviceDurationMinutes
          ? parseInt(metadata.serviceDurationMinutes, 10)
          : null,
        teamMemberId: metadata.teamMemberId || null,
      });

      if (!slotCheck.ok) {
        return NextResponse.json(
          { error: slotCheck.publicMessage, code: "SLOT_TAKEN" },
          { status: 409 },
        );
      }
    }
```

- [ ] **Step 4: Handle `SLOT_TAKEN` in the payment form**

In `components/StripePaymentForm.tsx`:

1. Add an optional prop `onSlotTaken?: () => void;` to `StripePaymentFormProps` (next to `onPaymentError`) and destructure it where the other callbacks are read.
2. Where the payment intent is created (the `if (!response.ok) { ... }` block after `fetch("/api/stripe/create-payment-intent", ...)`), replace the block with:

```ts
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || "Failed to initialize payment";

        setInitError(errorMessage);
        setIsInitializing(false);
        props.onProcessingChange?.(false);

        if (errorData.code === "SLOT_TAKEN") {
          props.onSlotTaken?.();
        }

        return;
      }
```
3. For the free-booking paths (the two `fetch("/api/bookings", ...)` blocks), after `const data = await response.json();` add (in both places) before the existing `if (!response.ok ...)` throw:

```ts
        if (data?.code === "SLOT_TAKEN") {
          onSlotTaken?.();
        }
```
and make sure `onSlotTaken` is available in the component that contains that block (add it to the destructured props of that component, like `onPaymentError`).

- [ ] **Step 5: Return the customer to the time step**

In `app/book/page.tsx`, next to the other `handle…` functions add:

```ts
  const handleSlotTaken = () => {
    setSelectedTime("");
    setSelectedTimeSlots([]);
    setCurrentStep("date");
    loadAvailability();
  };
```
and pass `onSlotTaken={handleSlotTaken}` to the `StripePaymentForm` element (next to `onPaymentError`). The existing error message from the form (`SLOT_TAKEN` text) is already shown by the form and by `handlePaymentError`.

- [ ] **Step 6: Run tests and typecheck**

Run: `npx vitest run app/api/stripe/create-payment-intent/route.test.ts && npm run typecheck`
Expected: PASS and clean.

---

### Task 8: After payment — idempotent, final check, flagged conflict

**Files:**
- Create: `lib/booking-conflict-notification.ts`
- Modify: `app/api/stripe/confirm-payment/route.ts`
- Modify: `app/book/success/page.tsx`
- Test: `app/api/stripe/confirm-payment/route.test.ts`

- [ ] **Step 1: Staff alert helper**

Create `lib/booking-conflict-notification.ts`:

```ts
import {
  getStaffBookingNotificationTarget,
  type StaffBookingNotificationInput,
} from "@/lib/booking-staff-notification";
import { sendEmail } from "@/lib/sendgrid-smtp";

/**
 * A client paid but the time was taken in the meantime. The booking is kept
 * (pending) and staff must contact the client to reschedule or refund.
 */
export async function sendBookingConflictAlert(
  booking: StaffBookingNotificationInput,
  conflictMessage: string,
): Promise<void> {
  const target = await getStaffBookingNotificationTarget(booking);

  if (!target) return;

  const text = [
    "ACTION NEEDED: a client paid for a time that was taken at the same moment.",
    "",
    `Client: ${booking.customer_name}`,
    `Email: ${booking.customer_email || "n/a"}`,
    `Phone: ${booking.customer_phone || "n/a"}`,
    `Service: ${booking.service}`,
    `Requested: ${booking.date} at ${booking.time}`,
    `Practitioner: ${target.assignedPractitionerLabel || "n/a"}`,
    "",
    `Conflict: ${conflictMessage}`,
    "",
    "The booking is saved as PENDING with a CONFLICT note. Please contact the",
    "client to choose another time, or refund the payment in Stripe.",
  ].join("\n");

  await sendEmail({
    to: target.to,
    subject: `ACTION NEEDED — paid booking conflict: ${booking.customer_name}`,
    text,
    html: text.replace(/\n/g, "<br>"),
  });
}
```

- [ ] **Step 2: Write the failing route test**

Create `app/api/stripe/confirm-payment/route.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const m = vi.hoisted(() => ({
  existing: null as any,
  inserted: [] as any[],
  assertSlotFree: vi.fn(),
  conflictAlert: vi.fn(),
  confirmationEmail: vi.fn(),
}));

const intent = {
  id: "pi_123",
  status: "succeeded",
  amount: 5000,
  customer: null,
  metadata: {
    services: JSON.stringify([{ name: "Facial", price: 50, quantity: 1 }]),
    selectedDate: "2026-10-20",
    selectedTime: "14:00",
    teamMemberId: "a",
    serviceDurationMinutes: "60",
    customerName: "Jane Client",
    customerEmail: "jane@example.com",
    customerPhone: "07000000000",
  },
};

vi.mock("@/lib/stripe", () => ({
  stripe: { paymentIntents: { retrieve: () => Promise.resolve(intent) }, customers: {} },
  isStripeAvailable: () => true,
}));
vi.mock("@/lib/booking-conflicts", () => ({
  assertSlotFree: (...a: unknown[]) => m.assertSlotFree(...a),
}));
vi.mock("@/lib/booking-conflict-notification", () => ({
  sendBookingConflictAlert: (...a: unknown[]) => m.conflictAlert(...a),
}));
vi.mock("@/lib/sendgrid-smtp", () => ({
  sendEmail: (...a: unknown[]) => m.confirmationEmail(...a),
}));
vi.mock("@/lib/booking-staff-notification", () => ({
  sendStaffNewBookingNotification: vi.fn(),
}));
vi.mock("@/lib/booking-practitioner-for-customer-email", () => ({
  fetchBookingPractitionerForCustomerEmail: vi.fn(),
  practitionerEmailCardHtml: vi.fn(() => ""),
  practitionerPlainTextSection: vi.fn(() => ""),
}));
vi.mock("@/lib/admin-profile", () => ({
  getAdminContactInfo: vi.fn(() => Promise.resolve({ phone: "", email: "" })),
}));
vi.mock("@/lib/email-theme", () => ({
  getEmailHead: () => "",
  EMAIL: { light: {}, dark: {} },
}));
vi.mock("@/lib/supabase", () => {
  const table = (name: string) => {
    const chain: any = {
      select: () => chain,
      ilike: () => chain,
      eq: () => chain,
      limit: () => chain,
      maybeSingle: () =>
        Promise.resolve({ data: name === "bookings" ? m.existing : null }),
      single: () => Promise.resolve({ data: null, error: { code: "PGRST116" } }),
      insert: (row: any) => {
        if (name === "bookings") m.inserted.push(row);

        return {
          select: () => ({
            single: () =>
              Promise.resolve({
                data: { id: "new-booking", booking_number: "BK-1", ...row },
                error: null,
              }),
          }),
        };
      },
      update: () => chain,
    };

    return chain;
  };

  return { supabaseAdmin: { from: table }, supabase: { from: table } };
});

import { POST } from "./route";

const call = () =>
  POST(
    new NextRequest("http://localhost/api/stripe/confirm-payment", {
      method: "POST",
      body: JSON.stringify({ paymentIntentId: "pi_123" }),
    }),
  );

describe("POST /api/stripe/confirm-payment", () => {
  beforeEach(() => {
    m.existing = null;
    m.inserted = [];
    m.assertSlotFree.mockReset();
    m.conflictAlert.mockReset();
    m.confirmationEmail.mockReset();
  });

  it("returns the existing booking instead of creating a duplicate", async () => {
    m.existing = { id: "already", booking_number: "BK-0" };

    const res = await call();
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.bookingId).toBe("already");
    expect(m.inserted).toHaveLength(0);
  });

  it("confirms the booking when the time is still free", async () => {
    m.assertSlotFree.mockResolvedValue({ ok: true });

    const res = await call();
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(m.inserted[0].status).toBe("confirmed");
    expect(m.conflictAlert).not.toHaveBeenCalled();
  });

  it("keeps a conflicting paid booking as pending, flags it and alerts staff", async () => {
    m.assertSlotFree.mockResolvedValue({
      ok: false,
      reason: "overlap",
      adminMessage: "Maria is booked 14:00–15:00 (Other). Choose another time.",
      publicMessage: "x",
    });

    const res = await call();
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.conflict).toBe(true);
    expect(m.inserted[0].status).toBe("pending");
    expect(m.inserted[0].notes).toContain("CONFLICT");
    expect(m.inserted[0].notes).toContain("Payment Intent: pi_123");
    expect(m.conflictAlert).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 3: Run it and confirm it fails**

Run: `npx vitest run app/api/stripe/confirm-payment/route.test.ts`
Expected: FAIL.

- [ ] **Step 4: Idempotency, final check and flagged conflict in the route**

In `app/api/stripe/confirm-payment/route.ts` add imports:

```ts
import { assertSlotFree } from "@/lib/booking-conflicts";
import { sendBookingConflictAlert } from "@/lib/booking-conflict-notification";
```

a) Directly after the `Missing booking information` validation block (before `// Total amount: from metadata when deposit ...`) insert the idempotency guard:

```ts
      // The same PaymentIntent must never create a second booking.
      const { data: alreadyBooked } = await supabaseAdmin
        .from("bookings")
        .select("id, booking_number")
        .ilike("notes", `%Payment Intent: ${paymentIntentId}%`)
        .limit(1)
        .maybeSingle();

      if (alreadyBooked) {
        return NextResponse.json({
          success: true,
          paymentIntent,
          bookingId: alreadyBooked.id,
          bookingNumber: alreadyBooked.booking_number,
          alreadyProcessed: true,
        });
      }
```

b) Immediately before `const bookingInsert: Record<string, unknown> = {` insert the final check and change the insert's status and notes:

```ts
      // Final check: the time may have been taken while the client was paying.
      const slotCheck = await assertSlotFree({
        date: selectedDate,
        time: selectedTime,
        durationMinutes: serviceDurationMinutes,
        teamMemberId,
      });
      const hasConflict = !slotCheck.ok;
```
and inside `bookingInsert` replace

```ts
        status: "confirmed",
        payment_status: "paid",
        notes: `Payment via Stripe - Payment Intent: ${paymentIntentId}`,
```
with

```ts
        status: hasConflict ? "pending" : "confirmed",
        payment_status: "paid",
        notes: `Payment via Stripe - Payment Intent: ${paymentIntentId}${
          hasConflict
            ? " | CONFLICT – the time was taken by another booking while paying; contact the client to reschedule or refund"
            : ""
        }`,
```

c) Wrap STEP 4 (customer confirmation email) so it only runs without a conflict: change `if (finalCustomerEmail && !finalCustomerEmail.includes("@stripe.guest")) {` to

```ts
      if (
        !hasConflict &&
        finalCustomerEmail &&
        !finalCustomerEmail.includes("@stripe.guest")
      ) {
```
and at the start of STEP 5 (`// === STEP 5: Staff notification ...`) replace the `try { ... sendStaffNewBookingNotification(...) ... }` with a branch:

```ts
      if (!slotCheck.ok) {
        try {
          await sendBookingConflictAlert(
            {
              id: booking.id,
              customer_name: customerName,
              customer_email: finalCustomerEmail,
              customer_phone: customerPhone,
              service: serviceNames,
              date: selectedDate,
              time: selectedTime,
              amount: totalAmount,
              total_amount: totalAmount,
              notes: booking.notes,
              team_member_id: teamMemberId,
              created_at: booking.created_at,
              payment_status: booking.payment_status,
            },
            slotCheck.adminMessage,
          );
        } catch (alertError) {
          console.error("Error sending booking conflict alert:", alertError);
        }
      } else {
        /* existing try { sendStaffNewBookingNotification ... } block stays here unchanged */
      }
```
(keep the existing staff-notification `try/catch` exactly as it is inside the `else`).

d) Add `conflict: hasConflict,` to the success `NextResponse.json({ success: true, paymentIntent, bookingId: ..., ... })` at the end.

- [ ] **Step 5: Tell the client on the success page**

In `app/book/success/page.tsx`, in `setBookingDetails({ ... })` add `hasConflict: String(booking.notes || "").includes("CONFLICT"),` and, near the top of the rendered confirmation content (where the booking status/heading is shown for a non-error booking), render when `bookingDetails.hasConflict`:

```tsx
{bookingDetails.hasConflict && (
  <div
    className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200"
    role="status"
  >
    We received your payment, but this time slot needs to be adjusted. We will
    contact you shortly to agree a new time.
  </div>
)}
```
Place it right above the first card that shows the booking details; read the file first and choose the exact JSX location that wraps the loaded-booking branch.

- [ ] **Step 6: Run the tests and typecheck**

Run: `npx vitest run app/api/stripe/confirm-payment/route.test.ts && npm run typecheck`
Expected: PASS and clean.

---

### Task 9: Whole-change verification

- [ ] **Step 1: Full test suite**

Run: `npx vitest run`
Expected: all test files pass (the original 15 plus the new ones).

- [ ] **Step 2: Typecheck and lint the touched files**

Run:
```bash
npm run typecheck
npx eslint lib/booking-availability.ts lib/booking-conflicts.ts lib/booking-conflict-notification.ts app/api/bookings app/api/stripe app/api/admin/time-slots components/StripePaymentForm.tsx app/book 2>&1 | grep -E "error|✖" | grep -v "label-has-associated-control"
```
Expected: typecheck clean; no new lint errors beyond the pre-existing `jsx-a11y/label-has-associated-control` ones.

- [ ] **Step 3: Regression comparison on the live data**

Repeat the Task 3 Step 6 comparison for the second practitioner and for a 30-minute and a 90-minute service. Expected: no differing days except those explained by unassigned bookings (inspect each).

- [ ] **Step 4: Review the diff**

Run: `git status --short && git diff --stat`
Expected: only the files listed in the file-structure table plus tests and docs. Nothing committed, nothing pushed.

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
    expect(slotNeedsRecheck(existing, { date: "2026-10-21" }).needed).toBe(
      true,
    );
    expect(slotNeedsRecheck(existing, { team_member_id: B }).needed).toBe(true);
    expect(
      slotNeedsRecheck(existing, { service_duration_minutes: 90 }).needed,
    ).toBe(true);
  });

  it("rechecks when a cancelled booking is reactivated", () => {
    expect(
      slotNeedsRecheck(
        { ...existing, status: "cancelled" },
        { status: "confirmed" },
      ).needed,
    ).toBe(true);
  });

  it("does not recheck when cancelling or completing", () => {
    expect(slotNeedsRecheck(existing, { status: "cancelled" }).needed).toBe(
      false,
    );
    expect(slotNeedsRecheck(existing, { status: "completed" }).needed).toBe(
      false,
    );
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

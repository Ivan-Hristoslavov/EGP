import { describe, it, expect, vi, beforeEach } from "vitest";

const db = vi.hoisted(() => ({
  bookings: [] as any[],
  team: [] as any[],
  hours: {
    status: "open",
    hours: { buffer_minutes: 15, max_appointments: 12 },
  } as any,
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

  it("treats a duration sent as text like a number", async () => {
    const result = await assertSlotFree({
      date: "2026-10-20",
      time: "15:15",
      durationMinutes: "30" as unknown as number,
      teamMemberId: A,
    });

    // existing 14:00-15:00 (+15 buffer) ends 15:15; a 30 minute booking at 15:15 fits
    expect(result).toEqual({ ok: true });
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

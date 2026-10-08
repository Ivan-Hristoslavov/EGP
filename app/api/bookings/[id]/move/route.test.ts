import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const m = vi.hoisted(() => ({
  assertSlotFree: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/lib/admin-auth", () => ({
  requireAdmin: () => Promise.resolve(null),
}));
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
              single: () =>
                Promise.resolve({ data: { id: "b1" }, error: null }),
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
    expect(json.error).toBe(
      "Maria is booked 11:00–12:00 (Jane). Choose another time.",
    );
    expect(m.update).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const m = vi.hoisted(() => ({
  assertSlotFree: vi.fn(),
  update: vi.fn(),
  existing: {
    date: "2026-10-20",
    time: "10:00:00",
    team_member_id: "a",
    service_duration_minutes: 60,
    status: "confirmed",
  } as any,
}));

vi.mock("@/lib/booking-conflicts", () => ({
  assertSlotFree: (...a: unknown[]) => m.assertSlotFree(...a),
}));
vi.mock("@/lib/admin-auth", () => ({
  requireAdmin: () => Promise.resolve(null),
}));
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
        eq: () => ({
          single: () => Promise.resolve({ data: m.existing, error: null }),
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

import { PUT } from "./route";

const call = (over: Record<string, unknown> = {}) =>
  PUT(
    new NextRequest("http://localhost/api/bookings?id=b1", {
      method: "PUT",
      body: JSON.stringify({
        customer_name: "Jane",
        service: "Facial",
        date: "2026-10-20",
        time: "10:00",
        amount: 50,
        status: "confirmed",
        ...over,
      }),
    }),
  );

describe("PUT /api/bookings?id=", () => {
  beforeEach(() => {
    m.assertSlotFree.mockReset();
    m.update.mockReset();
  });

  it("does not recheck an edit that keeps the same time", async () => {
    const res = await call({ notes: "updated note" });

    expect(res.status).toBe(200);
    expect(m.assertSlotFree).not.toHaveBeenCalled();
    expect(m.update).toHaveBeenCalled();
  });

  it("rechecks the booking's own practitioner when the time changes", async () => {
    m.assertSlotFree.mockResolvedValue({ ok: true });
    const res = await call({ time: "11:00" });

    expect(res.status).toBe(200);
    expect(m.assertSlotFree).toHaveBeenCalledWith({
      date: "2026-10-20",
      time: "11:00",
      durationMinutes: 60,
      teamMemberId: "a",
      excludeBookingId: "b1",
    });
  });

  it("rejects a taken time with the admin message and does not update", async () => {
    m.assertSlotFree.mockResolvedValue({
      ok: false,
      reason: "overlap",
      adminMessage: "Maria is booked 11:00–12:00 (Sam). Choose another time.",
      publicMessage: "x",
    });
    const res = await call({ time: "11:00" });
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.error).toBe(
      "Maria is booked 11:00–12:00 (Sam). Choose another time.",
    );
    expect(m.update).not.toHaveBeenCalled();
  });

  it("rechecks against the NEW practitioner when it is reassigned", async () => {
    m.assertSlotFree.mockResolvedValue({ ok: true });
    const res = await call({ team_member_id: "b" });

    expect(res.status).toBe(200);
    expect(m.assertSlotFree).toHaveBeenCalledWith({
      date: "2026-10-20",
      time: "10:00",
      durationMinutes: 60,
      teamMemberId: "b",
      excludeBookingId: "b1",
    });
    expect(m.update.mock.calls[0][0].team_member_id).toBe("b");
  });

  it("saves a changed duration after rechecking with it", async () => {
    m.assertSlotFree.mockResolvedValue({ ok: true });
    const res = await call({ service_duration_minutes: 90 });

    expect(res.status).toBe(200);
    expect(m.assertSlotFree.mock.calls[0][0].durationMinutes).toBe(90);
    expect(m.update.mock.calls[0][0].service_duration_minutes).toBe(90);
  });

  it("leaves the practitioner untouched when the field is not sent", async () => {
    await call({ notes: "x" });

    expect("team_member_id" in m.update.mock.calls[0][0]).toBe(false);
  });
});

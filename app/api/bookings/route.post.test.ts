import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const m = vi.hoisted(() => ({
  assertSlotFree: vi.fn(),
  requireAdmin: vi.fn(),
  insert: vi.fn(),
  priceServiceSummary: vi.fn(),
}));

vi.mock("@/lib/booking-conflicts", () => ({
  assertSlotFree: (...a: unknown[]) => m.assertSlotFree(...a),
}));
vi.mock("@/lib/admin-auth", () => ({ requireAdmin: () => m.requireAdmin() }));
vi.mock("@/lib/booking-pricing-server", () => ({
  priceServiceSummary: (...a: unknown[]) => m.priceServiceSummary(...a),
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
        eq: () => ({ maybeSingle: () => Promise.resolve({ data: null }) }),
      }),
      insert: (...a: unknown[]) => {
        m.insert(...a);

        return {
          select: () => ({
            single: () =>
              Promise.resolve({
                data: { id: "new", customer_email: null },
                error: null,
              }),
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

const req = (over: Record<string, unknown> = {}) =>
  new NextRequest("http://localhost/api/bookings", {
    method: "POST",
    body: JSON.stringify({ ...body, ...over }),
  });

describe("POST /api/bookings", () => {
  beforeEach(() => {
    m.assertSlotFree.mockReset();
    m.requireAdmin.mockReset();
    m.insert.mockReset();
    m.priceServiceSummary.mockReset();
    m.priceServiceSummary.mockResolvedValue({ ok: true, total: 0 });
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
      adminMessage:
        "Maria is booked 14:00–14:30 (Other Client). Choose another time.",
      publicMessage: "Sorry, this time was just taken. Please choose another.",
    });
    m.requireAdmin.mockResolvedValue(new Response(null, { status: 401 }));

    const res = await POST(req());
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.code).toBe("SLOT_TAKEN");
    expect(json.error).toBe(
      "Sorry, this time was just taken. Please choose another.",
    );
    expect(JSON.stringify(json)).not.toContain("Other Client");
    expect(m.insert).not.toHaveBeenCalled();
  });

  it("returns the detailed message to an admin", async () => {
    m.assertSlotFree.mockResolvedValue({
      ok: false,
      reason: "overlap",
      adminMessage:
        "Maria is booked 14:00–14:30 (Other Client). Choose another time.",
      publicMessage: "Sorry, this time was just taken. Please choose another.",
    });
    m.requireAdmin.mockResolvedValue(null);

    const res = await POST(req());
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.error).toContain("Maria is booked 14:00–14:30");
  });

  it("requires an admin to choose a practitioner", async () => {
    m.requireAdmin.mockResolvedValue(null);

    const res = await POST(req({ team_member_id: null }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.code).toBe("PRACTITIONER_REQUIRED");
    expect(m.assertSlotFree).not.toHaveBeenCalled();
    expect(m.insert).not.toHaveBeenCalled();
  });

  it("still accepts a public booking without a practitioner", async () => {
    m.requireAdmin.mockResolvedValue(new Response(null, { status: 401 }));
    m.assertSlotFree.mockResolvedValue({ ok: true });

    const res = await POST(req({ team_member_id: undefined }));

    expect(res.status).toBe(200);
    expect(m.insert).toHaveBeenCalled();
  });

  describe("price and payment state for visitors", () => {
    const row = () => m.insert.mock.calls[0][0][0];

    beforeEach(() => {
      m.assertSlotFree.mockResolvedValue({ ok: true });
      m.requireAdmin.mockResolvedValue(new Response(null, { status: 401 }));
    });

    it("never lets a visitor mark an expensive booking as paid or confirmed", async () => {
      m.priceServiceSummary.mockResolvedValue({ ok: true, total: 450 });

      const res = await POST(
        req({
          amount: 1,
          total_amount: 1,
          amount_paid: 1,
          status: "confirmed",
          payment_status: "paid",
          payment_method: "free",
        }),
      );

      expect(res.status).toBe(200);
      expect(row()).toMatchObject({
        amount: 450,
        total_amount: 450,
        amount_paid: 0,
        remaining_amount: 450,
        status: "pending",
        payment_status: "pending",
        payment_method: null,
      });
    });

    it("keeps the free consultation flow working", async () => {
      m.priceServiceSummary.mockResolvedValue({ ok: true, total: 0 });

      await POST(
        req({
          amount: 0,
          status: "confirmed",
          payment_status: "paid",
          payment_method: "free",
        }),
      );

      expect(row()).toMatchObject({
        amount: 0,
        status: "confirmed",
        payment_status: "paid",
        payment_method: "free",
      });
    });

    it("keeps a request for an unknown service as a pending enquiry", async () => {
      m.priceServiceSummary.mockResolvedValue({ ok: false });

      const res = await POST(
        req({
          service: "Book Treatment Now",
          amount: 0,
          status: "confirmed",
          payment_status: "paid",
          payment_method: "free",
        }),
      );

      expect(res.status).toBe(200);
      expect(row()).toMatchObject({
        amount: 0,
        status: "pending",
        payment_status: "pending",
        payment_method: null,
      });
    });

    it("leaves the admin in charge of amount and status", async () => {
      m.requireAdmin.mockResolvedValue(null);

      await POST(
        req({
          amount: 120,
          status: "confirmed",
          payment_status: "paid",
          payment_method: "cash",
          amount_paid: 120,
        }),
      );

      expect(m.priceServiceSummary).not.toHaveBeenCalled();
      expect(row()).toMatchObject({
        amount: 120,
        status: "confirmed",
        payment_status: "paid",
        payment_method: "cash",
        amount_paid: 120,
      });
    });
  });
});

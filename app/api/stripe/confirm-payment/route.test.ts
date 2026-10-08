import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const m = vi.hoisted(() => ({
  existing: null as any,
  inserted: [] as any[],
  assertSlotFree: vi.fn(),
  conflictAlert: vi.fn(),
  sendEmail: vi.fn(),
  staffNotification: vi.fn(),
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
  getStripeServer: () => ({
    paymentIntents: { retrieve: () => Promise.resolve(intent) },
    customers: {},
  }),
}));
vi.mock("@/lib/booking-conflicts", () => ({
  assertSlotFree: (...a: unknown[]) => m.assertSlotFree(...a),
}));
vi.mock("@/lib/booking-conflict-notification", () => ({
  sendBookingConflictAlert: (...a: unknown[]) => m.conflictAlert(...a),
}));
vi.mock("@/lib/sendgrid-smtp", () => ({
  sendEmail: (...a: unknown[]) => m.sendEmail(...a),
}));
vi.mock("@/lib/booking-staff-notification", () => ({
  sendStaffNewBookingNotification: (...a: unknown[]) =>
    m.staffNotification(...a),
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
      single: () =>
        Promise.resolve({ data: null, error: { code: "PGRST116" } }),
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
    m.sendEmail.mockReset();
    m.staffNotification.mockReset();
  });

  it("returns the existing booking instead of creating a duplicate", async () => {
    m.existing = { id: "already", booking_number: "BK-0" };

    const res = await call();
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.bookingId).toBe("already");
    expect(m.inserted).toHaveLength(0);
    expect(m.assertSlotFree).not.toHaveBeenCalled();
  });

  it("confirms the booking when the time is still free", async () => {
    m.assertSlotFree.mockResolvedValue({ ok: true });

    const res = await call();
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.conflict).toBe(false);
    expect(m.inserted[0].status).toBe("confirmed");
    expect(m.conflictAlert).not.toHaveBeenCalled();
    expect(m.staffNotification).toHaveBeenCalledTimes(1);
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
    expect(m.staffNotification).not.toHaveBeenCalled();
    // the client must not get a "Payment Confirmed" email for an unconfirmed time
    expect(m.sendEmail).not.toHaveBeenCalled();
  });
});

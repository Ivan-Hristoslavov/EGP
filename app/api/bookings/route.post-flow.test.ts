import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const m = vi.hoisted(() => ({
  isAdmin: true,
  existingCustomer: null as any,
  bookingError: null as any,
  throwOnBookings: false,
  customerInserts: [] as any[],
  customerLookups: 0,
  bookingRows: [] as any[],
  sendEmail: vi.fn(),
  staffNotify: vi.fn(),
}));

vi.mock("@/lib/admin-auth", () => ({
  requireAdmin: () =>
    Promise.resolve(m.isAdmin ? null : new Response(null, { status: 401 })),
}));
vi.mock("@/lib/booking-conflicts", () => ({
  assertSlotFree: () => Promise.resolve({ ok: true }),
}));
vi.mock("@/lib/booking-pricing-server", () => ({
  priceServiceSummary: () => Promise.resolve({ ok: true, total: 80 }),
}));
vi.mock("@/lib/sendgrid-smtp", () => ({
  sendEmail: (...a: unknown[]) => m.sendEmail(...a),
}));
vi.mock("@/lib/booking-staff-notification", () => ({
  sendStaffNewBookingNotification: (...a: unknown[]) => m.staffNotify(...a),
}));
vi.mock("@/lib/booking-practitioner-for-customer-email", () => ({
  fetchBookingPractitionerForCustomerEmail: () => Promise.resolve(null),
  practitionerEmailCardHtml: () => "",
  practitionerPlainTextSection: () => "",
}));
vi.mock("@/lib/admin-profile", () => ({
  getAdminContactInfo: () =>
    Promise.resolve({ phone: "0123", email: "info@egp.test" }),
}));
vi.mock("@/lib/email-theme", () => ({
  getEmailHead: () => "",
  EMAIL: { light: {}, dark: {} },
}));
vi.mock("../../../lib/supabase", () => ({
  supabaseAdmin: {
    from: (table: string) => {
      if (table === "bookings" && m.throwOnBookings) {
        throw new Error("db down");
      }

      let inserted: any = null;
      const chain: any = {
        select: () => chain,
        eq: () => chain,
        maybeSingle: () => {
          m.customerLookups += 1;

          return Promise.resolve({ data: m.existingCustomer });
        },
        insert: (rows: any[]) => {
          inserted = rows[0];
          if (table === "customers") m.customerInserts.push(rows[0]);
          if (table === "bookings") m.bookingRows.push(rows[0]);

          return chain;
        },
        single: () => {
          if (table === "customers") {
            return Promise.resolve({ data: { id: "new-customer" } });
          }

          return Promise.resolve({
            data: m.bookingError ? null : { id: "b1", ...inserted },
            error: m.bookingError,
          });
        },
      };

      return chain;
    },
  },
}));

import { POST } from "./route";

const base = {
  customer_name: "Jane Mary Doe",
  customer_email: "jane@example.com",
  customer_phone: "07000",
  service: "Cheek filler",
  date: "2026-10-20",
  time: "14:00",
  amount: 120,
  team_member_id: "a",
  service_duration_minutes: 45,
};

const post = (over: Record<string, unknown> = {}) =>
  POST(
    new NextRequest("http://localhost/api/bookings", {
      method: "POST",
      body: JSON.stringify({ ...base, ...over }),
    }),
  );

describe("POST /api/bookings customers and emails", () => {
  beforeEach(() => {
    m.isAdmin = true;
    m.existingCustomer = null;
    m.bookingError = null;
    m.throwOnBookings = false;
    m.customerInserts = [];
    m.customerLookups = 0;
    m.bookingRows = [];
    m.sendEmail.mockReset();
    m.sendEmail.mockResolvedValue(undefined);
    m.staffNotify.mockReset();
    m.staffNotify.mockResolvedValue(undefined);
  });

  it("links the booking to a customer who already has that email", async () => {
    m.existingCustomer = { id: "c1" };

    const res = await post();

    expect(res.status).toBe(200);
    expect(m.customerInserts).toHaveLength(0);
    expect(m.bookingRows[0].customer_id).toBe("c1");
  });

  it("creates a customer, splitting the name, when the email is new", async () => {
    await post({ address: "1 High St" });

    expect(m.customerInserts[0]).toEqual({
      first_name: "Jane",
      last_name: "Mary Doe",
      email: "jane@example.com",
      phone: "07000",
      address: "1 High St",
    });
    expect(m.bookingRows[0].customer_id).toBe("new-customer");
  });

  it("uses a customer id that was sent and skips the lookup", async () => {
    await post({ customer_id: "given" });

    expect(m.customerLookups).toBe(0);
    expect(m.bookingRows[0].customer_id).toBe("given");
  });

  it("books without a customer record or email when none was given", async () => {
    await post({ customer_email: null, customer_phone: null });

    expect(m.customerLookups).toBe(0);
    expect(m.bookingRows[0].customer_id).toBeNull();
    expect(m.sendEmail).not.toHaveBeenCalled();
    expect(m.staffNotify).toHaveBeenCalled();
  });

  it("keeps the admin's own payment figures", async () => {
    await post({
      total_amount: 150,
      amount_paid: 50,
      remaining_amount: 100,
      payment_type: "deposit",
      payment_method: "card",
      status: "confirmed",
      payment_status: "partial",
      notes: "Call first",
    });

    expect(m.bookingRows[0]).toMatchObject({
      amount: 120,
      total_amount: 150,
      amount_paid: 50,
      remaining_amount: 100,
      payment_type: "deposit",
      payment_method: "card",
      status: "confirmed",
      payment_status: "partial",
      notes: "Call first",
    });
  });

  it("emails the customer a payment link for a paid booking", async () => {
    await post();

    const mail = m.sendEmail.mock.calls[0][0];

    expect(mail.to).toBe("jane@example.com");
    expect(mail.subject).toContain("Booking Confirmation");
    expect(mail.text).toContain("/payment/b1");
    expect(mail.html).toContain("/payment/b1");
  });

  it("explains a deposit in the email", async () => {
    await post({
      payment_type: "deposit",
      amount_paid: 50,
      remaining_amount: 70,
      address: "1 High St",
      notes: "Side entrance",
    });

    const text = m.sendEmail.mock.calls[0][0].text as string;

    expect(text).toContain("£50.00 deposit");
    expect(text).toContain("£70.00");
    expect(text).toContain("Address: 1 High St");
    expect(text).toContain("Notes: Side entrance");
  });

  it("sends a plain confirmation when nothing is owed", async () => {
    await post({ amount: 0, address: "1 High St", notes: "Hello" });

    const mail = m.sendEmail.mock.calls[0][0];

    expect(mail.subject).toContain("Booking confirmed");
    expect(mail.text).toContain("No payment is required");
    expect(mail.text).not.toContain("/payment/");
  });

  it("still confirms the booking when an email fails", async () => {
    m.staffNotify.mockRejectedValue(new Error("smtp"));
    m.sendEmail.mockRejectedValue(new Error("smtp"));

    const res = await post();

    expect((await res.json()).success).toBe(true);
  });

  it("reports a database error when saving the booking", async () => {
    m.bookingError = { message: "constraint" };

    const res = await post();

    expect(res.status).toBe(500);
    expect((await res.json()).error).toContain("constraint");
  });

  it("answers 500 when the database is unreachable", async () => {
    m.throwOnBookings = true;

    expect((await post()).status).toBe(500);
  });

  it("asks for the required fields", async () => {
    const res = await post({ customer_name: "" });

    expect(res.status).toBe(400);
  });
});

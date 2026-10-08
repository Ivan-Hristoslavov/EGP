import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const m = vi.hoisted(() => ({
  denied: null as Response | null,
  calls: [] as Array<[string, ...unknown[]]>,
  countResult: { count: 25, error: null } as any,
  rowsResult: { data: [{ id: "b1" }], error: null } as any,
  deleteResult: { error: null } as any,
  throwOnFrom: false,
}));

vi.mock("@/lib/admin-auth", () => ({
  requireAdmin: () => Promise.resolve(m.denied),
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
vi.mock("@/lib/booking-conflicts", () => ({ assertSlotFree: vi.fn() }));
vi.mock("@/lib/booking-pricing-server", () => ({
  priceServiceSummary: vi.fn(),
}));
vi.mock("@/lib/email-theme", () => ({
  getEmailHead: () => "",
  EMAIL: { light: {}, dark: {} },
}));
vi.mock("../../../lib/supabase", () => ({
  supabaseAdmin: {
    from: () => {
      if (m.throwOnFrom) throw new Error("db down");

      let head = false;
      let deleting = false;
      const chain: any = {
        select: (_cols: string, opts?: { head?: boolean }) => {
          head = !!opts?.head;

          return chain;
        },
        delete: () => {
          deleting = true;

          return chain;
        },
        eq: (...a: unknown[]) => {
          m.calls.push(["eq", ...a]);

          return deleting ? Promise.resolve(m.deleteResult) : chain;
        },
        gte: (...a: unknown[]) => {
          m.calls.push(["gte", ...a]);

          return chain;
        },
        lte: (...a: unknown[]) => {
          m.calls.push(["lte", ...a]);

          return chain;
        },
        or: (...a: unknown[]) => {
          m.calls.push(["or", ...a]);

          return chain;
        },
        order: () => chain,
        range: (...a: unknown[]) => {
          m.calls.push(["range", ...a]);

          return Promise.resolve(m.rowsResult);
        },
        then: (resolve: any) => resolve(head ? m.countResult : m.rowsResult),
      };

      return chain;
    },
  },
}));

import { DELETE, GET } from "./route";

const get = (qs = "") =>
  GET(new NextRequest(`http://localhost/api/bookings${qs ? `?${qs}` : ""}`));
const del = (qs = "") =>
  DELETE(
    new NextRequest(`http://localhost/api/bookings${qs ? `?${qs}` : ""}`, {
      method: "DELETE",
    }),
  );
const called = (name: string, ...args: unknown[]) =>
  m.calls.some(
    (c) => c[0] === name && args.every((arg, i) => c[i + 1] === arg),
  );

describe("GET /api/bookings", () => {
  beforeEach(() => {
    m.denied = null;
    m.calls = [];
    m.countResult = { count: 25, error: null };
    m.rowsResult = { data: [{ id: "b1" }], error: null };
    m.throwOnFrom = false;
  });

  it("refuses visitors", async () => {
    m.denied = new Response(null, { status: 401 });

    expect((await get()).status).toBe(401);
  });

  it("pages through results and reports the totals", async () => {
    const res = await get("page=2&limit=10");
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(called("range", 10, 19)).toBe(true);
    expect(json.pagination).toEqual({
      page: 2,
      limit: 10,
      totalCount: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPrevPage: true,
    });
  });

  it("filters by status, ignoring 'all'", async () => {
    await get("status=confirmed");
    expect(called("eq", "status", "confirmed")).toBe(true);

    m.calls = [];
    await get("status=all");
    expect(called("eq", "status")).toBe(false);
  });

  it("uses an explicit date range and allows a large page for the calendar", async () => {
    const res = await get("date_from=2026-10-01&date_to=2026-10-31&limit=5000");
    const json = await res.json();

    expect(called("gte", "date", "2026-10-01")).toBe(true);
    expect(called("lte", "date", "2026-10-31")).toBe(true);
    expect(json.pagination.limit).toBe(3000);
  });

  it.each([
    ["today"],
    ["tomorrow"],
    ["this_week"],
    ["next_week"],
    ["this_month"],
    ["next_month"],
  ])("understands the '%s' shortcut", async (shortcut) => {
    const res = await get(`date=${shortcut}`);

    expect(res.status).toBe(200);
    expect(m.calls.some((c) => c[0] === "eq" || c[0] === "gte")).toBe(true);
  });

  it("treats other values as one specific date, and 'all' as no filter", async () => {
    await get("date=2026-10-20");
    expect(called("eq", "date", "2026-10-20")).toBe(true);

    m.calls = [];
    await get("date=all");
    expect(m.calls.filter((c) => c[0] === "eq" || c[0] === "gte")).toHaveLength(
      0,
    );
  });

  it("searches name, service and email", async () => {
    await get("search=jane");

    expect(
      m.calls.some(
        (c) =>
          c[0] === "or" && String(c[1]).includes("customer_name.ilike.%jane%"),
      ),
    ).toBe(true);
  });

  it("reports a failed count and a failed list separately", async () => {
    m.countResult = { count: null, error: { message: "x" } };
    expect((await get()).status).toBe(500);

    m.countResult = { count: 1, error: null };
    m.rowsResult = { data: null, error: { message: "y" } };
    expect((await get()).status).toBe(500);
  });

  it("answers 500 when the database is unreachable", async () => {
    m.throwOnFrom = true;

    expect((await get()).status).toBe(500);
  });
});

describe("DELETE /api/bookings", () => {
  beforeEach(() => {
    m.denied = null;
    m.calls = [];
    m.deleteResult = { error: null };
    m.throwOnFrom = false;
  });

  it("refuses visitors", async () => {
    m.denied = new Response(null, { status: 401 });

    expect((await del("id=b1")).status).toBe(401);
  });

  it("needs a booking id", async () => {
    expect((await del()).status).toBe(400);
  });

  it("deletes the booking by id", async () => {
    const res = await del("id=b1");

    expect(res.status).toBe(200);
    expect(called("eq", "id", "b1")).toBe(true);
  });

  it("reports a database failure", async () => {
    m.deleteResult = { error: { message: "fk" } };
    const res = await del("id=b1");

    expect(res.status).toBe(500);
    expect((await res.json()).error).toContain("fk");
  });

  it("answers 500 when the database is unreachable", async () => {
    m.throwOnFrom = true;

    expect((await del("id=b1")).status).toBe(500);
  });
});

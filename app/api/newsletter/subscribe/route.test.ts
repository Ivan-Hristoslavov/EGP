import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const m = vi.hoisted(() => ({
  customer: null as any,
  activeCodes: [] as any[],
  inserts: [] as Array<{ table: string; row: any }>,
  updates: [] as any[],
  updateError: null as any,
  createError: null as any,
  codeError: null as any,
  sendEmail: vi.fn(),
}));

vi.mock("@/lib/sendgrid-smtp", () => ({
  sendEmail: (...a: unknown[]) => m.sendEmail(...a),
}));
vi.mock("@/lib/supabase", () => ({
  supabaseAdmin: {
    from: (table: string) => {
      let op = "select";
      const chain: any = {
        select: () => chain,
        insert: (rows: any[]) => {
          op = "insert";
          m.inserts.push({ table, row: rows[0] });

          if (table === "discount_codes") {
            return Promise.resolve({ error: m.codeError });
          }

          return chain;
        },
        update: (row: any) => {
          op = "update";
          m.updates.push(row);

          return chain;
        },
        eq: () => chain,
        gt: () => chain,
        like: () => chain,
        order: () => chain,
        limit: () => chain,
        single: () =>
          Promise.resolve(
            op === "insert"
              ? m.createError
                ? { data: null, error: m.createError }
                : { data: { id: "new-customer" }, error: null }
              : table === "customers"
                ? { data: m.customer, error: null }
                : { data: null, error: null },
          ),
        then: (resolve: any) =>
          resolve(
            op === "update"
              ? { error: m.updateError }
              : {
                  data: table === "discount_codes" ? m.activeCodes : null,
                  error: null,
                },
          ),
      };

      return chain;
    },
  },
}));

import { POST } from "./route";

const req = (body: Record<string, unknown>) =>
  new NextRequest("http://localhost/api/newsletter/subscribe", {
    method: "POST",
    body: JSON.stringify(body),
  });

describe("POST /api/newsletter/subscribe", () => {
  beforeEach(() => {
    m.customer = null;
    m.activeCodes = [];
    m.inserts = [];
    m.updates = [];
    m.updateError = null;
    m.createError = null;
    m.codeError = null;
    m.sendEmail.mockReset();
    m.sendEmail.mockResolvedValue(undefined);
  });

  it("rejects text that is not an email and creates nothing", async () => {
    const res = await POST(req({ email: "not-an-email" }));

    expect(res.status).toBe(400);
    expect(m.inserts).toHaveLength(0);
    expect(m.sendEmail).not.toHaveBeenCalled();
  });

  it("creates the customer and a welcome code for a new subscriber", async () => {
    const res = await POST(
      req({ email: " Jane@Example.com ", firstName: "Jane" }),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(m.inserts.map((i) => i.table)).toEqual([
      "customers",
      "discount_codes",
    ]);
    expect(m.inserts[0].row.email).toBe("jane@example.com");
    expect(json.discountCode).toBe(m.inserts[1].row.code);
  });

  it("hands back the code the customer already has instead of making another", async () => {
    m.customer = { id: "c1", first_name: "Jane", phone: null };
    m.activeCodes = [{ code: "WELCOME10-ABCDE" }];

    const res = await POST(req({ email: "jane@example.com" }));
    const json = await res.json();

    expect(json.discountCode).toBe("WELCOME10-ABCDE");
    expect(m.inserts.filter((i) => i.table === "discount_codes")).toHaveLength(
      0,
    );
  });

  it("does not let a name inject HTML into the email", async () => {
    await POST(
      req({ email: "jane@example.com", firstName: '<a href="x">pay</a>' }),
    );

    const html = m.sendEmail.mock.calls[0][0].html as string;

    expect(html).not.toContain('<a href="x">');
    expect(html).toContain("&lt;a href=&quot;x&quot;&gt;");
  });

  it("asks for an email when none is given", async () => {
    const res = await POST(req({ firstName: "Jane" }));

    expect(res.status).toBe(400);
  });

  it("fills in the name and phone of an existing customer who left them blank", async () => {
    m.customer = { id: "c1", first_name: "", phone: null };

    await POST(
      req({ email: "jane@example.com", firstName: "Jane", mobile: "07000" }),
    );

    expect(m.updates[0]).toMatchObject({
      marketing_emails: true,
      first_name: "Jane",
      phone: "07000",
    });
  });

  it("does not overwrite details an existing customer already has", async () => {
    m.customer = { id: "c1", first_name: "Anna", phone: "0111" };

    await POST(
      req({ email: "anna@example.com", firstName: "Jane", mobile: "07000" }),
    );

    expect(m.updates[0]).not.toHaveProperty("first_name");
    expect(m.updates[0]).not.toHaveProperty("phone");
  });

  it("carries on when updating the customer fails", async () => {
    m.customer = { id: "c1", first_name: "Anna", phone: "0111" };
    m.updateError = { message: "locked" };

    const res = await POST(req({ email: "anna@example.com" }));

    expect(res.status).toBe(200);
  });

  it("reports a failure to create the customer", async () => {
    m.createError = { message: "duplicate" };

    const res = await POST(req({ email: "new@example.com" }));

    expect(res.status).toBe(500);
  });

  it("still returns a code when saving it fails or the email cannot be sent", async () => {
    m.codeError = { message: "full" };
    m.sendEmail.mockRejectedValue(new Error("smtp"));

    const res = await POST(req({ email: "new@example.com" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.discountCode).toMatch(/-/);
  });

  it("answers 500 for a request that is not JSON", async () => {
    const res = await POST(
      new NextRequest("http://localhost/api/newsletter/subscribe", {
        method: "POST",
        body: "not json",
      }),
    );

    expect(res.status).toBe(500);
  });
});

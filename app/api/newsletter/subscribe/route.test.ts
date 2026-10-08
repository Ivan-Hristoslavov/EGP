import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const m = vi.hoisted(() => ({
  customer: null as any,
  activeCodes: [] as any[],
  inserts: [] as Array<{ table: string; row: any }>,
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

          return chain;
        },
        update: () => {
          op = "update";

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
              ? { data: { id: "new-customer" }, error: null }
              : table === "customers"
                ? { data: m.customer, error: null }
                : { data: null, error: null },
          ),
        then: (resolve: any) =>
          resolve({
            data: table === "discount_codes" ? m.activeCodes : null,
            error: null,
          }),
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
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const m = vi.hoisted(() => ({
  denied: null as Response | null,
  selectResult: { data: null, error: null } as any,
  idResult: { data: { id: 7 }, error: null } as any,
  updateResult: { data: { id: 7, password: "x" }, error: null } as any,
  updates: [] as any[],
  throwOnFrom: false,
}));

vi.mock("@/lib/admin-auth", () => ({
  requireAdmin: () => Promise.resolve(m.denied),
}));
vi.mock("@/lib/supabase", () => ({
  supabaseAdmin: {
    from: () => {
      if (m.throwOnFrom) throw new Error("db down");

      let columns = "";
      let updating = false;
      const chain: any = {
        select: (cols: string) => {
          columns = cols;

          return chain;
        },
        update: (row: any) => {
          updating = true;
          m.updates.push(row);

          return chain;
        },
        eq: () => chain,
        single: () =>
          Promise.resolve(
            updating
              ? m.updateResult
              : columns === "id"
                ? m.idResult
                : m.selectResult,
          ),
      };

      return chain;
    },
  },
}));

import { GET, PUT } from "./route";

const put = (body: Record<string, unknown>) =>
  PUT(
    new NextRequest("http://localhost/api/admin/profile", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  );

beforeEach(() => {
  m.denied = null;
  m.selectResult = { data: null, error: null };
  m.idResult = { data: { id: 7 }, error: null };
  m.updateResult = { data: { id: 7, password: "x" }, error: null };
  m.updates = [];
  m.throwOnFrom = false;
});

describe("GET /api/admin/profile", () => {
  it("refuses visitors", async () => {
    m.denied = new Response(null, { status: 401 });

    expect((await GET()).status).toBe(401);
  });

  it("never returns the password hash", async () => {
    m.selectResult = {
      data: { id: 1, email: "a@b.c", password: "$2b$hash", phone: "1" },
      error: null,
    };

    const json = await (await GET()).json();

    expect(json.password).toBeUndefined();
    expect(json.email).toBe("a@b.c");
  });

  it("answers null when no profile exists yet", async () => {
    m.selectResult = { data: null, error: { code: "PGRST116" } };

    expect(await (await GET()).json()).toBeNull();
  });

  it("reports other database errors", async () => {
    m.selectResult = { data: null, error: { code: "XX", message: "boom" } };

    expect((await GET()).status).toBe(500);
  });

  it("reads JSON stored as text, even when encoded twice", async () => {
    m.selectResult = {
      data: {
        transport_options: JSON.stringify(JSON.stringify({ bus: "Route 1" })),
        nearby_landmarks: JSON.stringify([{ name: "Park" }]),
      },
      error: null,
    };

    const json = await (await GET()).json();

    expect(json.transport_options).toEqual({ bus: "Route 1" });
    expect(json.nearby_landmarks).toEqual([{ name: "Park" }]);
  });

  it("unwraps landmarks that were double encoded, and defaults bad values", async () => {
    m.selectResult = {
      data: {
        transport_options: "{not json",
        nearby_landmarks: JSON.stringify(JSON.stringify([{ name: "Pier" }])),
      },
      error: null,
    };

    const json = await (await GET()).json();

    expect(json.transport_options).toEqual({});
    expect(json.nearby_landmarks).toEqual([{ name: "Pier" }]);

    m.selectResult = { data: { nearby_landmarks: "{broken" }, error: null };
    expect((await (await GET()).json()).nearby_landmarks).toEqual([]);

    m.selectResult = { data: { nearby_landmarks: null }, error: null };
    expect((await (await GET()).json()).nearby_landmarks).toEqual([]);
  });

  it("answers 500 when the database is unreachable", async () => {
    m.throwOnFrom = true;

    expect((await GET()).status).toBe(500);
  });
});

describe("PUT /api/admin/profile", () => {
  it("refuses visitors", async () => {
    m.denied = new Response(null, { status: 401 });

    expect((await put({ phone: "1" })).status).toBe(401);
  });

  it("saves the basics and never returns the password hash", async () => {
    const res = await put({
      phone: "0123",
      businessEmail: "info@x.co",
      companyName: "EGP",
      companyAddress: "1 High St",
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(m.updates[0]).toMatchObject({
      phone: "0123",
      business_email: "info@x.co",
      company_name: "EGP",
      company_address: "1 High St",
    });
    expect(json.profile.password).toBeUndefined();
  });

  it("only writes optional fields that were sent", async () => {
    await put({ phone: "1" });
    expect(m.updates[0]).not.toHaveProperty("whatsapp");
    expect(m.updates[0]).not.toHaveProperty("how_to_find_us");

    await put({
      phone: "1",
      accountNumber: "123",
      sortCode: "00-00-00",
      whatsapp: "+44 1",
      howToFindUs: "Turn left",
      howToReachUs: "Call us",
      googleMapsAddress: "Maps",
    });

    expect(m.updates[1]).toMatchObject({
      account_number: "123",
      sort_code: "00-00-00",
      whatsapp: "+44 1",
      how_to_find_us: "Turn left",
      how_to_reach_us: "Call us",
      google_maps_address: "Maps",
    });
  });

  it("stores structured fields as JSON text and keeps text as is", async () => {
    await put({
      phone: "1",
      transportOptions: { bus: "1" },
      nearbyLandmarks: [{ name: "Park" }],
    });
    await put({
      phone: "1",
      transportOptions: '{"bus":"2"}',
      nearbyLandmarks: "[]",
    });

    expect(m.updates[0].transport_options).toBe('{"bus":"1"}');
    expect(m.updates[0].nearby_landmarks).toBe('[{"name":"Park"}]');
    expect(m.updates[1].transport_options).toBe('{"bus":"2"}');
    expect(m.updates[1].nearby_landmarks).toBe("[]");
  });

  it("reports a missing profile and a failed update", async () => {
    m.idResult = { data: null, error: { message: "none" } };
    expect((await put({ phone: "1" })).status).toBe(500);

    m.idResult = { data: { id: 7 }, error: null };
    m.updateResult = { data: null, error: { message: "locked" } };
    expect((await put({ phone: "1" })).status).toBe(500);
  });

  it("answers 500 when the database is unreachable", async () => {
    m.throwOnFrom = true;

    expect((await put({ phone: "1" })).status).toBe(500);
  });
});

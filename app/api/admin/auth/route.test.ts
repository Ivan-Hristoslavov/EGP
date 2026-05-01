import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

import { POST, DELETE } from "./route";

const authMocks = vi.hoisted(() => ({
  maybeSingle: vi.fn(),
  bcryptCompare: vi.fn(),
  cookieSet: vi.fn(),
  cookieDelete: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      set: authMocks.cookieSet,
      delete: authMocks.cookieDelete,
    }),
  ),
}));

vi.mock("@/lib/supabase", () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: authMocks.maybeSingle,
        })),
      })),
    })),
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: (...args: unknown[]) => authMocks.bcryptCompare(...args),
  },
}));

describe("POST /api/admin/auth", () => {
  let jwtSecret: string | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    jwtSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = "ci-build-placeholder-secret-min-32-chars-long";
    authMocks.maybeSingle.mockResolvedValue({ data: null, error: null });
    authMocks.bcryptCompare.mockResolvedValue(false);
  });

  afterEach(() => {
    if (jwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = jwtSecret;
  });

  it("returns 200 and sets cookie on valid credentials", async () => {
    authMocks.maybeSingle.mockResolvedValue({
      data: { email: "admin@test.com", password: "hashed" },
      error: null,
    });
    authMocks.bcryptCompare.mockResolvedValue(true);

    const req = new NextRequest("http://localhost/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "Admin@Test.com",
        password: " correct-pass ",
      }),
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(authMocks.cookieSet).toHaveBeenCalledWith(
      "adminAuth",
      expect.any(String),
      expect.objectContaining({ httpOnly: true, sameSite: "lax" }),
    );
  });

  it("returns 500 when JWT_SECRET is missing", async () => {
    delete process.env.JWT_SECRET;
    authMocks.maybeSingle.mockResolvedValue({
      data: { email: "a@b.com", password: "h" },
      error: null,
    });
    authMocks.bcryptCompare.mockResolvedValue(true);

    const req = new NextRequest("http://localhost/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "a@b.com", password: "x" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(500);
    const json = await res.json();

    expect(json.error).toMatch(/JWT_SECRET/i);
  });

  it("returns 401 on invalid credentials", async () => {
    const req = new NextRequest("http://localhost/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "nobody@test.com", password: "wrong" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it("returns 400 when email is missing", async () => {
    const req = new NextRequest("http://localhost/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "secret" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();

    expect(json.error).toContain("required");
  });

  it("returns 400 when password is missing", async () => {
    const req = new NextRequest("http://localhost/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@test.com" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();

    expect(json.error).toContain("required");
  });

  it("returns 400 when body is not a JSON object", async () => {
    const req = new NextRequest("http://localhost/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const json = await res.json();

    expect(json.error).toMatch(/invalid/i);
  });

  it("returns 429 after repeated failures from same IP", async () => {
    vi.resetModules();
    const { POST: postFresh } = await import("./route");

    authMocks.maybeSingle.mockResolvedValue({ data: null, error: null });
    authMocks.bcryptCompare.mockResolvedValue(false);

    function loginAttempt() {
      return new NextRequest("http://localhost/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "attacker@test.com", password: "bad" }),
      });
    }
    for (let i = 0; i < 5; i++) {
      expect((await postFresh(loginAttempt())).status).toBe(401);
    }
    const blocked = await postFresh(loginAttempt());

    expect(blocked.status).toBe(429);
    const json = await blocked.json();

    expect(json.error).toMatch(/too many/i);
    expect(blocked.headers.get("Retry-After")).toBeTruthy();
  });
});

describe("DELETE /api/admin/auth", () => {
  beforeEach(() => {
    authMocks.cookieDelete.mockClear();
  });

  it("clears admin cookie", async () => {
    const res = await DELETE();

    expect(res.status).toBe(200);
    expect(authMocks.cookieDelete).toHaveBeenCalledWith("adminAuth");
  });
});

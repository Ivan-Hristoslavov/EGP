import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({ set: vi.fn(), delete: vi.fn() })),
}));

vi.mock("@/lib/supabase", () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ maybeSingle: vi.fn(() => ({ data: null, error: null })) })),
      })),
    })),
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(() => Promise.resolve(false)),
  },
}));

describe("POST /api/admin/auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when email is missing", async () => {
    const req = new Request("http://localhost/api/admin/auth", {
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
    const req = new Request("http://localhost/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@test.com" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("required");
  });
});

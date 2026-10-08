import { describe, it, expect, vi } from "vitest";

const m = vi.hoisted(() => ({ profile: null as any }));

vi.mock("@/lib/admin-auth", () => ({ requireAdmin: async () => null }));
vi.mock("@/lib/supabase", () => ({
  supabaseAdmin: {
    from: () => {
      const chain: any = {
        select: () => chain,
        update: () => chain,
        eq: () => chain,
        single: () => Promise.resolve({ data: { ...m.profile }, error: null }),
      };

      return chain;
    },
  },
}));

import { GET, PUT } from "./route";

describe("/api/admin/profile", () => {
  it("never returns the password hash", async () => {
    m.profile = { id: 1, email: "a@b.c", password: "$2b$hash", phone: "1" };

    const get = await (await GET()).json();
    const put = await (
      await PUT(
        new Request("http://localhost/api/admin/profile", {
          method: "PUT",
          body: JSON.stringify({ phone: "2" }),
        }) as any,
      )
    ).json();

    expect(get.password).toBeUndefined();
    expect(get.email).toBe("a@b.c");
    expect(put.profile.password).toBeUndefined();
  });
});

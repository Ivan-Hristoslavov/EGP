import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const cookieStore = vi.hoisted(() => ({
  value: undefined as string | undefined,
}));

vi.mock("next/headers", () => ({
  cookies: () =>
    Promise.resolve({
      get: (name: string) =>
        name === "adminAuth" && cookieStore.value
          ? { value: cookieStore.value }
          : undefined,
    }),
}));

import jwt from "jsonwebtoken";

import { requireAdmin, requireAdminOrCron } from "./admin-auth";

const SECRET = "test-secret-with-enough-length-1234567890";

describe("requireAdmin / requireAdminOrCron", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = SECRET;
    delete process.env.CRON_SECRET;
    cookieStore.value = undefined;
  });
  afterEach(() => {
    delete process.env.CRON_SECRET;
  });

  it("rejects a request without a cookie", async () => {
    const res = await requireAdmin();

    expect(res?.status).toBe(401);
  });

  it("rejects a forged cookie that is not a valid token", async () => {
    cookieStore.value = "anything";

    expect((await requireAdmin())?.status).toBe(401);
  });

  it("rejects a customer token", async () => {
    cookieStore.value = jwt.sign({ type: "customer" }, SECRET);

    expect((await requireAdmin())?.status).toBe(401);
  });

  it("accepts a valid admin token", async () => {
    cookieStore.value = jwt.sign({ type: "admin", email: "a@b.c" }, SECRET);

    expect(await requireAdmin()).toBeNull();
  });

  it("lets a scheduled job in with the cron secret", async () => {
    process.env.CRON_SECRET = "cron-secret-123";
    const req = new Request("http://localhost/x", {
      headers: { authorization: "Bearer cron-secret-123" },
    });

    expect(await requireAdminOrCron(req)).toBeNull();
  });

  it("does not accept a wrong or missing cron secret", async () => {
    process.env.CRON_SECRET = "cron-secret-123";

    expect(
      (
        await requireAdminOrCron(
          new Request("http://localhost/x", {
            headers: { authorization: "Bearer nope" },
          }),
        )
      )?.status,
    ).toBe(401);
    expect(
      (await requireAdminOrCron(new Request("http://localhost/x")))?.status,
    ).toBe(401);
  });

  it("never trusts the cron header when no secret is configured", async () => {
    const req = new Request("http://localhost/x", {
      headers: { authorization: "Bearer undefined" },
    });

    expect((await requireAdminOrCron(req))?.status).toBe(401);
  });
});

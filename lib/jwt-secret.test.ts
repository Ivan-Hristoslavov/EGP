import { describe, it, expect, afterEach } from "vitest";

import { getJwtSecret } from "./jwt-secret";

const original = process.env.JWT_SECRET;

describe("getJwtSecret", () => {
  afterEach(() => {
    if (original === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = original;
  });

  it("returns the configured secret", () => {
    process.env.JWT_SECRET = "configured-secret";

    expect(getJwtSecret()).toBe("configured-secret");
  });

  it("throws instead of using a built-in fallback", () => {
    delete process.env.JWT_SECRET;

    expect(() => getJwtSecret()).toThrow("JWT_SECRET is not configured");
  });

  it("treats an empty value as missing", () => {
    process.env.JWT_SECRET = "";

    expect(() => getJwtSecret()).toThrow();
  });
});

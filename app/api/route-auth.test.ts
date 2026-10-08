import fs from "node:fs";
import path from "node:path";

import { describe, it, expect } from "vitest";

/**
 * Safety net: every API route that changes data, or returns private data,
 * must check for an admin session. A route may only stay public if it is on
 * the explicit allowlist below (customer-facing flows that have their own checks).
 */

const API_DIR = path.resolve(__dirname);
const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
type Method = (typeof METHODS)[number];

/** "route path METHOD" pairs that are public on purpose. */
const PUBLIC_ON_PURPOSE = new Set([
  "bookings POST", // public booking form (slot check inside)
  "bookings/availability/team GET",
  "customer/auth/login POST",
  "customer/auth/register POST",
  "customer/dashboard GET", // customer JWT
  "membership/signup POST",
  "membership/verify POST",
  "newsletter/subscribe POST",
  "reviews POST", // visitors submit reviews
  "stripe/create-payment-intent POST",
  "stripe/confirm-payment POST",
  "webhooks/stripe POST", // Stripe signature
  "admin/auth POST", // login
  "admin/auth DELETE", // logout
  "auth/google/callback GET", // OAuth redirect from Google
  "auth/callback/google GET", // OAuth redirect from Google
  "debug/env GET", // own secret / development-only gate
]);

/** Reads of private data that must also be admin-only. */
const PRIVATE_GETS = [
  "dashboard/stats",
  "invoices",
  "invoices/[id]",
  "customers",
  "customers/[id]",
  "payments",
  "payments/[id]",
  "test-email",
  "bookings",
];

function routeFiles(): string[] {
  return (fs.readdirSync(API_DIR, { recursive: true }) as string[])
    .filter((file) => file.replace(/\\/g, "/").endsWith("/route.ts") || file === "route.ts")
    .map((file) => file.replace(/\\/g, "/"));
}

function handlerSegments(source: string): Record<Method, string | undefined> {
  const found: Array<{ method: Method; start: number }> = [];

  for (const method of METHODS) {
    const match = new RegExp(`export\\s+async\\s+function\\s+${method}\\b`).exec(
      source,
    );

    if (match) found.push({ method, start: match.index });
  }
  found.sort((a, b) => a.start - b.start);

  const result = {} as Record<Method, string | undefined>;

  found.forEach((entry, i) => {
    const end = i + 1 < found.length ? found[i + 1].start : source.length;

    result[entry.method] = source.slice(entry.start, end);
  });

  return result;
}

const GUARD = /requireAdmin\(|requireAdminOrCron\(/;

function isGuarded(
  segments: Record<Method, string | undefined>,
  method: Method,
): boolean {
  const segment = segments[method];

  if (!segment) return true;
  if (GUARD.test(segment)) return true;

  // An alias such as `PUT` calling `PATCH` is as safe as the handler it calls.
  const alias = /return\s+(GET|POST|PUT|PATCH|DELETE)\(/.exec(segment);

  if (alias && alias[1] !== method) {
    return isGuarded(segments, alias[1] as Method);
  }

  return false;
}

describe("API route authorisation", () => {
  const unguarded: string[] = [];

  for (const file of routeFiles()) {
    const route = file.replace(/\/?route\.ts$/, "");
    const source = fs.readFileSync(path.join(API_DIR, file), "utf8");
    const segments = handlerSegments(source);

    for (const method of METHODS) {
      if (!segments[method]) continue;

      const key = `${route} ${method}`;
      const isMutation = method !== "GET";
      const isPrivateRead =
        method === "GET" &&
        (route.startsWith("admin/") || PRIVATE_GETS.includes(route));

      if (!isMutation && !isPrivateRead) continue;
      if (PUBLIC_ON_PURPOSE.has(key)) continue;
      if (!isGuarded(segments, method)) unguarded.push(key);
    }
  }

  it("has no unprotected admin or mutating route", () => {
    expect(unguarded.sort()).toEqual([]);
  });

  it("keeps the public allowlist honest (every entry still exists)", () => {
    const existing = new Set<string>();

    for (const file of routeFiles()) {
      const route = file.replace(/\/?route\.ts$/, "");
      const segments = handlerSegments(
        fs.readFileSync(path.join(API_DIR, file), "utf8"),
      );

      for (const method of METHODS) {
        if (segments[method]) existing.add(`${route} ${method}`);
      }
    }

    const stale = Array.from(PUBLIC_ON_PURPOSE).filter(
      (key) => !existing.has(key),
    );

    expect(stale).toEqual([]);
  });
});

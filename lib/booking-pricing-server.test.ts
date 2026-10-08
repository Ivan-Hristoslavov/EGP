import { describe, it, expect, vi, beforeEach } from "vitest";

const db = vi.hoisted(() => ({
  services: [] as any[],
  deposit: null as any,
}));

vi.mock("@/lib/supabase", () => ({
  supabaseAdmin: {
    from: (table: string) => {
      const chain: any = {
        select: () => chain,
        eq: () =>
          table === "services"
            ? Promise.resolve({ data: db.services, error: null })
            : chain,
        single: () =>
          Promise.resolve({
            data: db.deposit ? { value: db.deposit } : null,
            error: db.deposit ? null : { code: "PGRST116" },
          }),
      };

      return chain;
    },
  },
}));

import {
  isFreeBookingSummary,
  priceServiceSummary,
  validateOnlineCharge,
} from "./booking-pricing-server";

const order = (items: Array<{ name: string; quantity?: number }>) =>
  JSON.stringify(items.map((i) => ({ price: 1, quantity: 1, ...i })));

describe("validateOnlineCharge", () => {
  beforeEach(() => {
    db.services = [
      { name: "Cheek filler", price: "450", discount_group: null },
      {
        name: "Baby Botox",
        price: "199",
        discount_group: { is_active: true, discount_percentage: 50 },
      },
      { name: "Free Discovery Consultation", price: "0", discount_group: null },
    ];
    db.deposit = { enabled: true, type: "percentage", percentage: 50 };
  });

  it("accepts the exact total", async () => {
    const result = await validateOnlineCharge({
      amount: 450,
      services: order([{ name: "Cheek filler" }]),
      isDeposit: false,
    });

    expect(result).toEqual({ ok: true, total: 450 });
  });

  it("accepts the discounted group price", async () => {
    const result = await validateOnlineCharge({
      amount: 99.5,
      services: order([{ name: "Baby Botox" }]),
      isDeposit: false,
    });

    expect(result.ok).toBe(true);
  });

  it("rejects paying less than the services cost, whatever the browser says", async () => {
    const result = await validateOnlineCharge({
      amount: 1,
      services: order([{ name: "Cheek filler", quantity: 1 }]),
      isDeposit: false,
    });

    expect(result.ok).toBe(false);
  });

  it("accepts the configured deposit and rejects less than it", async () => {
    const enough = await validateOnlineCharge({
      amount: 225,
      services: order([{ name: "Cheek filler" }]),
      isDeposit: true,
    });
    const tooLittle = await validateOnlineCharge({
      amount: 100,
      services: order([{ name: "Cheek filler" }]),
      isDeposit: true,
    });

    expect(enough.ok).toBe(true);
    expect(tooLittle.ok).toBe(false);
  });

  it("does not let a deposit be claimed when deposits are off", async () => {
    db.deposit = { enabled: false, type: "percentage", percentage: 50 };

    const result = await validateOnlineCharge({
      amount: 225,
      services: order([{ name: "Cheek filler" }]),
      isDeposit: true,
    });

    expect(result.ok).toBe(false);
  });

  it("rejects an unknown service and unreadable services", async () => {
    expect(
      (
        await validateOnlineCharge({
          amount: 500,
          services: order([{ name: "Made up" }]),
          isDeposit: false,
        })
      ).ok,
    ).toBe(false);
    expect(
      (
        await validateOnlineCharge({
          amount: 500,
          services: "not json",
          isDeposit: false,
        })
      ).ok,
    ).toBe(false);
  });
});

describe("isFreeBookingSummary", () => {
  beforeEach(() => {
    db.services = [
      { name: "Cheek filler", price: "450", discount_group: null },
      { name: "Free Discovery Consultation", price: "0", discount_group: null },
    ];
  });

  it("is true only for services that cost nothing", async () => {
    expect(await isFreeBookingSummary("Free Discovery Consultation")).toBe(
      true,
    );
    expect(await isFreeBookingSummary("Cheek filler")).toBe(false);
    expect(await isFreeBookingSummary("Book Treatment Now")).toBe(false);
  });
});

describe("priceServiceSummary", () => {
  beforeEach(() => {
    db.services = [
      { name: "Cheek filler", price: "450", discount_group: null },
      {
        name: "Baby Botox",
        price: "199",
        discount_group: { is_active: true, discount_percentage: 50 },
      },
    ];
  });

  it("prices known services from the database", async () => {
    expect(await priceServiceSummary("Cheek filler, Baby Botox (x2)")).toEqual({
      ok: true,
      total: 450 + 99.5 * 2,
    });
  });

  it("refuses text that is not a service we sell", async () => {
    expect(await priceServiceSummary("Cheek filler, Mystery")).toEqual({
      ok: false,
    });
    expect(await priceServiceSummary("")).toEqual({ ok: false });
  });
});

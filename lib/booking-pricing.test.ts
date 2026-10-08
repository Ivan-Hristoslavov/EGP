import { describe, it, expect } from "vitest";

import {
  discountedPriceFromGroup,
  effectivePrice,
  expectedCharge,
  expectedTotal,
  isFreeSummary,
  parseServiceSummary,
  type PricedService,
} from "./booking-pricing";

const catalogue: PricedService[] = [
  { name: "Free Discovery Consultation", price: 0 },
  { name: "Cheek & mid-face filler", price: 450 },
  { name: "Baby Botox", price: 199, discounted_price: 99.5 },
  { name: "Cellulite (thighs, buttocks, abdomen)", price: 300 },
  { name: "Gummy smile", price: 150 },
  { name: "Gummy smile", price: 120 },
];

describe("effectivePrice", () => {
  it("uses the discounted price when present", () => {
    expect(
      effectivePrice({ name: "x", price: 199, discounted_price: 99.5 }),
    ).toBe(99.5);
    expect(
      effectivePrice({ name: "x", price: 50, discounted_price: null }),
    ).toBe(50);
    expect(effectivePrice({ name: "x", price: 0 })).toBe(0);
  });
});

describe("expectedTotal", () => {
  it("sums catalogue prices times quantity, ignoring client prices", () => {
    const result = expectedTotal(
      [
        { name: "Cheek & mid-face filler", quantity: 1 },
        { name: "Baby Botox", quantity: 2 },
      ],
      catalogue,
    );

    expect(result).toEqual({ total: 450 + 99.5 * 2, unknown: [] });
  });

  it("is case and spacing tolerant", () => {
    expect(
      expectedTotal([{ name: "  baby botox ", quantity: 1 }], catalogue).total,
    ).toBe(99.5);
  });

  it("uses the lowest price when a name appears twice", () => {
    expect(
      expectedTotal([{ name: "Gummy smile", quantity: 1 }], catalogue).total,
    ).toBe(120);
  });

  it("reports services that are not in the catalogue", () => {
    expect(
      expectedTotal([{ name: "Made up", quantity: 1 }], catalogue).unknown,
    ).toEqual(["Made up"]);
  });

  it("treats a missing or invalid quantity as 1", () => {
    expect(
      expectedTotal([{ name: "Baby Botox", quantity: 0 }], catalogue).total,
    ).toBe(99.5);
  });
});

describe("expectedCharge", () => {
  it("is the full total when deposit is not used", () => {
    expect(
      expectedCharge(
        300,
        { enabled: true, type: "percentage", percentage: 50 },
        false,
      ),
    ).toBe(300);
  });

  it("is a percentage deposit, rounded to pence", () => {
    expect(
      expectedCharge(
        199,
        { enabled: true, type: "percentage", percentage: 50 },
        true,
      ),
    ).toBe(99.5);
    expect(
      expectedCharge(
        100.01,
        { enabled: true, type: "percentage", percentage: 33 },
        true,
      ),
    ).toBe(33.0);
  });

  it("is a fixed deposit capped at the total", () => {
    expect(
      expectedCharge(
        300,
        { enabled: true, type: "fixed", fixedAmount: 80 },
        true,
      ),
    ).toBe(80);
    expect(
      expectedCharge(
        50,
        { enabled: true, type: "fixed", fixedAmount: 80 },
        true,
      ),
    ).toBe(50);
  });

  it("requires the full price when deposits are switched off", () => {
    expect(
      expectedCharge(
        300,
        { enabled: false, type: "percentage", percentage: 50 },
        true,
      ),
    ).toBe(300);
  });
});

describe("parseServiceSummary", () => {
  const names = catalogue.map((s) => s.name);

  it("reads a single service", () => {
    expect(parseServiceSummary("Baby Botox", names)).toEqual({
      items: [{ name: "Baby Botox", quantity: 1 }],
      unmatched: "",
    });
  });

  it("reads several services with quantities", () => {
    expect(
      parseServiceSummary("Cheek & mid-face filler, Baby Botox (x2)", names),
    ).toEqual({
      items: [
        { name: "Cheek & mid-face filler", quantity: 1 },
        { name: "Baby Botox", quantity: 2 },
      ],
      unmatched: "",
    });
  });

  it("keeps commas inside a service name together", () => {
    expect(
      parseServiceSummary(
        "Cellulite (thighs, buttocks, abdomen), Baby Botox",
        names,
      ).items.map((i) => i.name),
    ).toEqual(["Cellulite (thighs, buttocks, abdomen)", "Baby Botox"]);
  });

  it("reports text that is not a known service", () => {
    const result = parseServiceSummary("Baby Botox, Book Treatment Now", names);

    expect(result.items.map((i) => i.name)).toEqual(["Baby Botox"]);
    expect(result.unmatched).toBe("Book Treatment Now");
  });
});

describe("isFreeSummary", () => {
  it("is true only when every service is free", () => {
    expect(isFreeSummary("Free Discovery Consultation", catalogue)).toBe(true);
    expect(
      isFreeSummary("Free Discovery Consultation, Baby Botox", catalogue),
    ).toBe(false);
  });

  it("is false for unknown or empty text", () => {
    expect(isFreeSummary("Book Treatment Now", catalogue)).toBe(false);
    expect(isFreeSummary("", catalogue)).toBe(false);
  });
});

describe("discountedPriceFromGroup", () => {
  it("applies an active group's percentage, rounded to pence", () => {
    expect(
      discountedPriceFromGroup(199, {
        is_active: true,
        discount_percentage: 50,
      }),
    ).toEqual({ discountPercentage: 50, discountedPrice: 99.5 });
    expect(
      discountedPriceFromGroup(100, {
        is_active: true,
        discount_percentage: "12.5",
      }),
    ).toEqual({ discountPercentage: 12.5, discountedPrice: 87.5 });
  });

  it("gives no discount for an inactive group, zero percent or no group", () => {
    expect(
      discountedPriceFromGroup(100, {
        is_active: false,
        discount_percentage: 50,
      }),
    ).toEqual({ discountPercentage: null, discountedPrice: null });
    expect(
      discountedPriceFromGroup(100, {
        is_active: true,
        discount_percentage: 0,
      }),
    ).toEqual({ discountPercentage: 0, discountedPrice: null });
    expect(discountedPriceFromGroup(100, null)).toEqual({
      discountPercentage: null,
      discountedPrice: null,
    });
  });
});

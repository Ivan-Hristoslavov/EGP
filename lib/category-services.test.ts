import { describe, it, expect } from "vitest";

import { applyLiveServices, liveFromServices } from "./category-services";

const items = [
  { slug: "cheek-mid-face-filler", name: "Cheek", price: 390, duration: 45 },
  { slug: "baby-botox", name: "Baby Botox", price: 199, duration: 15 },
  { slug: "gone", name: "Gone", price: 100, duration: 10 },
];

describe("applyLiveServices", () => {
  const live = liveFromServices([
    { slug: "cheek-mid-face-filler", price: "450", duration: 45 },
    {
      slug: "baby-botox",
      price: 199,
      discounted_price: 99.5,
      discount_percentage: 50,
      duration: 30,
    },
  ]);

  it("takes price and duration from the database", () => {
    const [cheek] = applyLiveServices(items, live);

    expect(cheek).toMatchObject({ price: 450, duration: 45, originalPrice: null });
  });

  it("shows the discounted price with the original beside it", () => {
    const botox = applyLiveServices(items, live)[1];

    expect(botox).toMatchObject({
      price: 99.5,
      originalPrice: 199,
      discountPercentage: 50,
      duration: 30,
    });
  });

  it("drops services that are no longer active", () => {
    expect(applyLiveServices(items, live).map((i) => i.slug)).toEqual([
      "cheek-mid-face-filler",
      "baby-botox",
    ]);
  });

  it("keeps the page's own list when there is no live data", () => {
    expect(applyLiveServices(items, null)).toHaveLength(3);
    expect(applyLiveServices(items, {})).toHaveLength(3);
    expect(applyLiveServices(items, null)[0].price).toBe(390);
  });
});

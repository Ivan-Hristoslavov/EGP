import { describe, it, expect } from "vitest";

import { buildWhatsAppUrl, toWhatsAppNumber } from "./whatsapp";

describe("toWhatsAppNumber", () => {
  it("keeps international numbers, digits only", () => {
    expect(toWhatsAppNumber(" +44 7944 24 20 79")).toBe("447944242079");
    expect(toWhatsAppNumber("447944242079")).toBe("447944242079");
  });

  it("turns a UK leading 0 into 44", () => {
    expect(toWhatsAppNumber("07944 24 20 79")).toBe("447944242079");
  });

  it("drops a 00 international prefix", () => {
    expect(toWhatsAppNumber("0044 7944 242079")).toBe("447944242079");
  });

  it("is empty when there is nothing usable", () => {
    expect(toWhatsAppNumber(undefined)).toBe("");
    expect(toWhatsAppNumber("n/a")).toBe("");
  });
});

describe("buildWhatsAppUrl", () => {
  it("adds an encoded message when given", () => {
    expect(buildWhatsAppUrl("07944 24 20 79", "Hi there")).toBe(
      "https://wa.me/447944242079?text=Hi%20there",
    );
    expect(buildWhatsAppUrl("+44 7944 242079")).toBe(
      "https://wa.me/447944242079",
    );
  });
});

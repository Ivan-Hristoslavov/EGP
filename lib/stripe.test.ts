import { describe, it, expect } from "vitest";
import { STRIPE_TO_DB_STATUS, STRIPE_TO_DB_METHOD, isStripeAvailable } from "./stripe";

describe("lib/stripe", () => {
  describe("STRIPE_TO_DB_STATUS", () => {
    it("maps Stripe payment statuses to DB statuses", () => {
      expect(STRIPE_TO_DB_STATUS.succeeded).toBe("paid");
      expect(STRIPE_TO_DB_STATUS.processing).toBe("pending");
      expect(STRIPE_TO_DB_STATUS.canceled).toBe("failed");
    });
  });

  describe("STRIPE_TO_DB_METHOD", () => {
    it("maps Stripe payment methods to DB methods", () => {
      expect(STRIPE_TO_DB_METHOD.card).toBe("card");
      expect(STRIPE_TO_DB_METHOD.cash).toBe("cash");
    });
  });

  describe("isStripeAvailable", () => {
    it("returns boolean", () => {
      const result = isStripeAvailable();
      expect(typeof result).toBe("boolean");
    });
  });
});

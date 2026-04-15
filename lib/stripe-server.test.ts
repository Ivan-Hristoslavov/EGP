import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";

describe("lib/stripe server helpers (isolated module load)", () => {
  let prevSecret: string | undefined;
  let prevPublishable: string | undefined;

  beforeEach(() => {
    prevSecret = process.env.STRIPE_SECRET_KEY;
    prevPublishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  });

  afterEach(() => {
    if (prevSecret === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = prevSecret;
    if (prevPublishable === undefined) {
      delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    } else {
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = prevPublishable;
    }
    vi.resetModules();
  });

  it("getStripeServer returns null when STRIPE_SECRET_KEY is missing", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const { getStripeServer } = await import("./stripe");
    expect(getStripeServer()).toBeNull();
  });

  it("getStripeServer returns a Stripe instance when key is set", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_01234567890123456789012345678901";
    const { getStripeServer } = await import("./stripe");
    const client = getStripeServer();
    expect(client).not.toBeNull();
    expect(client?.products).toBeDefined();
  });

  it("getStripe logs and returns null when publishable key is missing", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const { getStripe } = await import("./stripe");
    expect(getStripe()).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("createPaymentLink throws when Stripe is not configured", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const { createPaymentLink } = await import("./stripe");
    await expect(
      createPaymentLink({ amount: 25, description: "Test" })
    ).rejects.toThrow("Stripe is not configured");
  });

  it("createCheckoutSession throws when Stripe is not configured", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const { createCheckoutSession } = await import("./stripe");
    await expect(
      createCheckoutSession({
        amount: 25,
        description: "Test",
        successUrl: "https://example.com/ok",
        cancelUrl: "https://example.com/cancel",
      })
    ).rejects.toThrow("Stripe is not configured");
  });
});

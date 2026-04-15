import type Stripe from "stripe";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/** Real `Stripe` types do not expose `vi.fn` mocks; tests use this to assert calls. */
function stripeTestMocks(stripe: Stripe | null) {
  return stripe as unknown as {
    products: { create: ReturnType<typeof vi.fn> };
    prices: { create: ReturnType<typeof vi.fn> };
    customers: { list: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
    paymentLinks: { create: ReturnType<typeof vi.fn> };
    checkout: { sessions: { create: ReturnType<typeof vi.fn> } };
  };
}

vi.mock("stripe", () => {
  class StripeMock {
    products = {
      create: vi.fn(async () => ({ id: "prod_test" })),
    };
    prices = {
      create: vi.fn(async () => ({ id: "price_test" })),
    };
    customers = {
      list: vi.fn(async () => ({ data: [] as { id: string }[] })),
      create: vi.fn(async () => ({ id: "cus_created" })),
    };
    paymentLinks = {
      create: vi.fn(async () => ({
        id: "pl_test",
        url: "https://stripe.test/pay",
      })),
    };
    checkout = {
      sessions: {
        create: vi.fn(async () => ({
          id: "cs_test",
          url: "https://stripe.test/checkout",
        })),
      },
    };
  }
  return { default: StripeMock };
});

const loadStripeMock = vi.hoisted(() => vi.fn(() => Promise.resolve({ loadStripe: true })));

vi.mock("@stripe/stripe-js", () => ({
  loadStripe: loadStripeMock,
}));

describe("lib/stripe payment helpers (mocked SDK)", () => {
  let prevSecret: string | undefined;
  let prevPk: string | undefined;

  beforeEach(() => {
    prevSecret = process.env.STRIPE_SECRET_KEY;
    prevPk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    process.env.STRIPE_SECRET_KEY = "sk_test_mock_key_for_unit_tests_only";
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "pk_test_mock_key_for_unit_tests_only";
    vi.resetModules();
    loadStripeMock.mockClear();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.mocked(console.log).mockRestore();
    if (prevSecret === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = prevSecret;
    if (prevPk === undefined) delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    else process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = prevPk;
    vi.resetModules();
  });

  it("createPaymentLink creates product, price, and payment link", async () => {
    const { createPaymentLink } = await import("./stripe");
    const link = await createPaymentLink({
      amount: 49.99,
      description: "Consultation",
      currency: "GBP",
    });
    expect(link.url).toBe("https://stripe.test/pay");
    const { stripe } = await import("./stripe");
    const m = stripeTestMocks(stripe);
    expect(m.products.create).toHaveBeenCalled();
    expect(m.prices.create).toHaveBeenCalledWith(
      expect.objectContaining({
        unit_amount: 4999,
        currency: "gbp",
        product: "prod_test",
      })
    );
    expect(m.paymentLinks.create).toHaveBeenCalled();
  });

  it("createPaymentLink creates customer when email given and none exist", async () => {
    const { createPaymentLink, stripe } = await import("./stripe");
    const m = stripeTestMocks(stripe);
    await createPaymentLink({
      amount: 10,
      description: "Item",
      customerEmail: "buyer@example.com",
    });
    expect(m.customers.list).toHaveBeenCalledWith({
      email: "buyer@example.com",
      limit: 1,
    });
    expect(m.customers.create).toHaveBeenCalled();
  });

  it("createPaymentLink uses existing customer when list returns data", async () => {
    const { createPaymentLink, stripe } = await import("./stripe");
    const m = stripeTestMocks(stripe);
    m.customers.list.mockResolvedValue({
      data: [{ id: "cus_existing" }],
    });
    await createPaymentLink({
      amount: 10,
      description: "Item",
      customerEmail: "old@example.com",
    });
    expect(m.customers.create).not.toHaveBeenCalled();
    expect(m.paymentLinks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          stripe_customer_id: "cus_existing",
        }),
      })
    );
  });

  it("createCheckoutSession builds session and sets expiry", async () => {
    const { createCheckoutSession, stripe } = await import("./stripe");
    const m = stripeTestMocks(stripe);
    const session = await createCheckoutSession({
      amount: 100,
      description: "Service",
      successUrl: "https://example.com/ok",
      cancelUrl: "https://example.com/cancel",
    });
    expect(session.id).toBe("cs_test");
    expect(m.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "payment",
        success_url: "https://example.com/ok",
        cancel_url: "https://example.com/cancel",
      })
    );
    const call = m.checkout.sessions.create.mock.calls[0][0];
    expect(call.expires_at).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it("getStripe delegates to loadStripe when publishable key is set", async () => {
    const { getStripe } = await import("./stripe");
    const p = getStripe();
    expect(loadStripeMock).toHaveBeenCalledWith(
      "pk_test_mock_key_for_unit_tests_only"
    );
    await expect(p).resolves.toEqual({ loadStripe: true });
  });
});

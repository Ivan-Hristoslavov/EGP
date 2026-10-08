import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const m = vi.hoisted(() => ({
  assertSlotFree: vi.fn(),
  create: vi.fn(),
  validateOnlineCharge: vi.fn(),
}));

vi.mock("@/lib/booking-conflicts", () => ({
  assertSlotFree: (...a: unknown[]) => m.assertSlotFree(...a),
}));
vi.mock("@/lib/booking-pricing-server", () => ({
  validateOnlineCharge: (...a: unknown[]) => m.validateOnlineCharge(...a),
}));
vi.mock("stripe", () => ({
  default: class {
    paymentIntents = { create: (...a: unknown[]) => m.create(...a) };
  },
}));

import { POST } from "./route";

const req = (metadata: Record<string, string>) =>
  new NextRequest("http://localhost/api/stripe/create-payment-intent", {
    method: "POST",
    body: JSON.stringify({ amount: 50, metadata }),
  });

const slot = {
  selectedDate: "2026-10-20",
  selectedTime: "14:00",
  teamMemberId: "a",
  serviceDurationMinutes: "60",
};

describe("POST /api/stripe/create-payment-intent", () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    m.assertSlotFree.mockReset();
    m.validateOnlineCharge.mockReset();
    m.create.mockReset();
    m.create.mockResolvedValue({ client_secret: "cs", id: "pi_1" });
  });

  it("refuses to start a payment for a time that is already taken", async () => {
    m.assertSlotFree.mockResolvedValue({
      ok: false,
      reason: "overlap",
      adminMessage: "x",
      publicMessage: "Sorry, this time was just taken. Please choose another.",
    });

    const res = await POST(req(slot));
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.code).toBe("SLOT_TAKEN");
    expect(json.error).toBe(
      "Sorry, this time was just taken. Please choose another.",
    );
    expect(m.create).not.toHaveBeenCalled();
  });

  it("creates the payment when the time is free", async () => {
    m.assertSlotFree.mockResolvedValue({ ok: true });

    const res = await POST(req(slot));

    expect(res.status).toBe(200);
    expect(m.assertSlotFree).toHaveBeenCalledWith({
      date: "2026-10-20",
      time: "14:00",
      durationMinutes: 60,
      teamMemberId: "a",
    });
  });

  it("skips the check when the metadata has no booking slot", async () => {
    const res = await POST(req({ note: "no slot" }));

    expect(res.status).toBe(200);
    expect(m.assertSlotFree).not.toHaveBeenCalled();
  });

  it("refuses an amount that does not cover the selected services", async () => {
    m.validateOnlineCharge.mockResolvedValue({
      ok: false,
      message:
        "The prices changed or the order is not valid. Please refresh the page and try again.",
    });

    const res = await POST(
      new NextRequest("http://localhost/api/stripe/create-payment-intent", {
        method: "POST",
        body: JSON.stringify({
          amount: 1,
          metadata: { services: '[{"name":"Cheek filler","quantity":1}]' },
        }),
      }),
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.code).toBe("INVALID_AMOUNT");
    expect(m.create).not.toHaveBeenCalled();
  });

  it("overwrites deposit figures with the server's own", async () => {
    m.validateOnlineCharge.mockResolvedValue({ ok: true, total: 450 });
    m.assertSlotFree.mockResolvedValue({ ok: true });

    await POST(
      new NextRequest("http://localhost/api/stripe/create-payment-intent", {
        method: "POST",
        body: JSON.stringify({
          amount: 225,
          metadata: {
            services: '[{"name":"Cheek filler","quantity":1}]',
            isDeposit: "true",
            totalAmount: "1",
            remainingAmount: "0",
          },
        }),
      }),
    );

    expect(m.validateOnlineCharge).toHaveBeenCalledWith({
      amount: 225,
      services: '[{"name":"Cheek filler","quantity":1}]',
      isDeposit: true,
    });
    const sent = m.create.mock.calls[0][0].metadata;

    expect(sent.totalAmount).toBe("450");
    expect(sent.depositAmount).toBe("225");
    expect(sent.remainingAmount).toBe("225");
  });
});

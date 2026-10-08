import {
  discountedPriceFromGroup,
  expectedCharge,
  expectedTotal,
  isFreeSummary,
  parseServiceSummary,
  type DepositSettings,
  type OrderItem,
  type PricedService,
} from "@/lib/booking-pricing";
import { supabaseAdmin } from "@/lib/supabase";

const toPence = (pounds: number) => Math.round(pounds * 100);

/** Active services with the price the customer would really see (group discount applied). */
export async function loadServiceCatalogue(): Promise<PricedService[]> {
  const { data, error } = await supabaseAdmin
    .from("services")
    .select(
      "name, price, discount_group:discount_groups(discount_percentage, is_active)",
    )
    .eq("is_active", true);

  if (error) throw error;

  return (data ?? []).map((row: any) => {
    const price = parseFloat(String(row.price));

    return {
      name: row.name,
      price,
      discounted_price: discountedPriceFromGroup(price, row.discount_group)
        .discountedPrice,
    };
  });
}

/** Same parsing and defaults as `GET /api/deposit-settings`. */
export async function loadDepositSettings(): Promise<DepositSettings> {
  const fallback: DepositSettings = {
    enabled: false,
    type: "percentage",
    percentage: 50,
    fixedAmount: null,
  };
  const { data, error } = await supabaseAdmin
    .from("admin_settings")
    .select("value")
    .eq("key", "deposit_settings")
    .single();

  if (error || !data) return fallback;

  let value: any = data.value;

  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      value = {};
    }
  }

  const v = value && typeof value === "object" ? value : {};

  return {
    enabled: !!v.enabled,
    type: v.type === "fixed" ? "fixed" : "percentage",
    percentage: v.percentage != null ? Number(v.percentage) : 50,
    fixedAmount: v.fixedAmount != null ? Number(v.fixedAmount) : null,
  };
}

export type OnlineChargeCheck =
  | { ok: true; total: number }
  | { ok: false; message: string };

const REFRESH_MESSAGE =
  "The prices changed or the order is not valid. Please refresh the page and try again.";

/**
 * The browser says what it wants to charge; this decides if that is enough for
 * the selected services, using only prices stored in the database.
 */
export async function validateOnlineCharge(input: {
  /** Pounds, as sent by the browser. */
  amount: number;
  /** JSON text of `[{ name, quantity, ... }]` from the payment metadata. */
  services: unknown;
  isDeposit: boolean;
}): Promise<OnlineChargeCheck> {
  let parsed: unknown;

  try {
    parsed =
      typeof input.services === "string"
        ? JSON.parse(input.services)
        : input.services;
  } catch {
    return { ok: false, message: REFRESH_MESSAGE };
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { ok: false, message: REFRESH_MESSAGE };
  }

  const items: OrderItem[] = parsed.map((item: any) => ({
    name: String(item?.name ?? ""),
    quantity: Number(item?.quantity) || 1,
  }));

  const [catalogue, deposit] = await Promise.all([
    loadServiceCatalogue(),
    loadDepositSettings(),
  ]);
  const { total, unknown } = expectedTotal(items, catalogue);

  if (unknown.length > 0) return { ok: false, message: REFRESH_MESSAGE };

  const minimum = expectedCharge(total, deposit, input.isDeposit);

  if (toPence(input.amount) < toPence(minimum)) {
    return { ok: false, message: REFRESH_MESSAGE };
  }

  return { ok: true, total };
}

/** Whether a booking's service text names only free services (e.g. the free consultation). */
export async function isFreeBookingSummary(summary: string): Promise<boolean> {
  return isFreeSummary(summary, await loadServiceCatalogue());
}

/**
 * Prices the service text of a booking (e.g. "Baby Botox, Cheek filler (x2)")
 * from the database. `ok: false` when it names something we do not sell.
 */
export async function priceServiceSummary(
  summary: string,
): Promise<{ ok: true; total: number } | { ok: false }> {
  const catalogue = await loadServiceCatalogue();
  const { items, unmatched } = parseServiceSummary(
    summary,
    catalogue.map((service) => service.name),
  );

  if (items.length === 0 || unmatched) return { ok: false };

  const { total, unknown } = expectedTotal(items, catalogue);

  return unknown.length > 0 ? { ok: false } : { ok: true, total };
}

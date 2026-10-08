/**
 * Server-side price rules for online bookings. The browser's idea of a price is
 * never trusted: totals and the minimum charge are recomputed from the services
 * table.
 */

export type PricedService = {
  name: string;
  price: number;
  discounted_price?: number | null;
};

export type OrderItem = { name: string; quantity: number };

export type DepositSettings = {
  enabled: boolean;
  type: "percentage" | "fixed";
  percentage?: number | null;
  fixedAmount?: number | null;
};

/** Discount from a service's discount group, exactly as the public services list shows it. */
export function discountedPriceFromGroup(
  price: number,
  group?: {
    is_active?: boolean | null;
    discount_percentage?: number | string | null;
  } | null,
): { discountPercentage: number | null; discountedPrice: number | null } {
  const discountPercentage =
    group?.is_active && group.discount_percentage != null
      ? parseFloat(group.discount_percentage.toString())
      : null;
  const discountedPrice =
    discountPercentage != null && discountPercentage > 0
      ? Math.round(price * (1 - discountPercentage / 100) * 100) / 100
      : null;

  return { discountPercentage, discountedPrice };
}

const normalize = (name: string) => name.trim().toLowerCase();

const toPence = (pounds: number) => Math.round(pounds * 100);

/** What the customer pays per unit: the discounted price when there is one. */
export function effectivePrice(service: PricedService): number {
  return Number(service.discounted_price ?? service.price) || 0;
}

/** Lowest effective price per (normalised) name, so duplicates can never over-reject. */
function lowestPriceByName(catalogue: PricedService[]): Map<string, number> {
  const prices = new Map<string, number>();

  for (const service of catalogue) {
    const key = normalize(service.name);
    const price = effectivePrice(service);
    const known = prices.get(key);

    if (known === undefined || price < known) prices.set(key, price);
  }

  return prices;
}

export function expectedTotal(
  items: OrderItem[],
  catalogue: PricedService[],
): { total: number; unknown: string[] } {
  const prices = lowestPriceByName(catalogue);
  const unknown: string[] = [];
  let pence = 0;

  for (const item of items) {
    const price = prices.get(normalize(item.name));

    if (price === undefined) {
      unknown.push(item.name);
      continue;
    }

    const quantity =
      Number.isFinite(item.quantity) && item.quantity >= 1
        ? Math.floor(item.quantity)
        : 1;

    pence += toPence(price) * quantity;
  }

  return { total: pence / 100, unknown };
}

/** The least the customer may be charged now. */
export function expectedCharge(
  total: number,
  deposit: DepositSettings,
  payDepositOnly: boolean,
): number {
  if (!deposit.enabled || !payDepositOnly || total <= 0) return total;

  if (deposit.type === "fixed" && deposit.fixedAmount != null) {
    return Math.min(Number(deposit.fixedAmount), total);
  }

  const percentage = deposit.percentage ?? 50;

  return Math.round(((total * percentage) / 100) * 100) / 100;
}

/**
 * Reads "A, B (x2)" back into items. Service names may contain commas, so the
 * text is matched against the known names (longest first) instead of split.
 */
export function parseServiceSummary(
  summary: string,
  knownNames: string[],
): { items: OrderItem[]; unmatched: string } {
  const names = Array.from(new Set(knownNames)).sort(
    (a, b) => b.length - a.length,
  );
  const items: OrderItem[] = [];
  let rest = summary.trim();
  const leftovers: string[] = [];

  while (rest.length > 0) {
    const lower = rest.toLowerCase();
    const name = names.find((candidate) =>
      lower.startsWith(candidate.toLowerCase()),
    );

    if (name) {
      rest = rest.slice(name.length);
      const quantity = /^\s*\(x(\d+)\)/i.exec(rest);

      if (quantity) rest = rest.slice(quantity[0].length);
      items.push({ name, quantity: quantity ? Number(quantity[1]) : 1 });
    } else {
      // skip to the next separator and remember what could not be matched
      const next = rest.indexOf(", ");
      const chunk = next === -1 ? rest : rest.slice(0, next);

      leftovers.push(chunk.trim());
      rest = next === -1 ? "" : rest.slice(next);
    }

    rest = rest.replace(/^\s*,\s*/, "");
  }

  return { items, unmatched: leftovers.filter(Boolean).join(", ") };
}

/** True only when the text names services and every one of them is free. */
export function isFreeSummary(
  summary: string,
  catalogue: PricedService[],
): boolean {
  const { items, unmatched } = parseServiceSummary(
    summary,
    catalogue.map((service) => service.name),
  );

  if (items.length === 0 || unmatched) return false;

  const { total, unknown } = expectedTotal(items, catalogue);

  return unknown.length === 0 && total === 0;
}

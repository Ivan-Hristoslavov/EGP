/** What the database says about a service, keyed by slug. */
export type LiveService = {
  /** Price the customer pays (group discount applied). */
  price: number;
  /** Full price, only when a discount applies. */
  originalPrice: number | null;
  discountPercentage: number | null;
  duration: number;
};

export type LiveServiceMap = Record<string, LiveService>;

type LiveSource = {
  slug: string;
  price: number | string;
  discounted_price?: number | null;
  discount_percentage?: number | null;
  duration: number | string;
};

/** Build the map from rows shaped like `GET /api/services`. */
export function liveFromServices(services: LiveSource[]): LiveServiceMap {
  const map: LiveServiceMap = {};

  for (const service of services) {
    const full = Number(service.price);
    const discounted =
      service.discounted_price != null ? Number(service.discounted_price) : null;

    map[service.slug] = {
      price: discounted ?? full,
      originalPrice: discounted != null && discounted < full ? full : null,
      discountPercentage:
        discounted != null && discounted < full
          ? (service.discount_percentage ?? null)
          : null,
      duration: Number(service.duration),
    };
  }

  return map;
}

/**
 * Category pages keep their own copy and ordering, but price, duration and
 * availability always come from the database. With no live data (outage) the
 * page falls back to its own list; otherwise services that are no longer
 * active are left out instead of linking to a missing page.
 */
export function applyLiveServices<
  T extends { slug: string; price: number; duration: number },
>(
  items: T[],
  live: LiveServiceMap | null,
): Array<
  T & { originalPrice: number | null; discountPercentage: number | null }
> {
  const hasLive = live != null && Object.keys(live).length > 0;

  return items.flatMap((item) => {
    if (!hasLive) {
      return [{ ...item, originalPrice: null, discountPercentage: null }];
    }

    const match = live![item.slug];

    if (!match) return [];

    return [
      {
        ...item,
        price: match.price,
        duration: Number.isFinite(match.duration)
          ? match.duration
          : item.duration,
        originalPrice: match.originalPrice,
        discountPercentage: match.discountPercentage,
      },
    ];
  });
}

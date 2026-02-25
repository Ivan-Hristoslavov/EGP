"use client";

/**
 * Renders a price with optional discount: original (crossed out) + current price + optional badge.
 * Use wherever service prices are shown (header, book flow, featured services, services page, etc.)
 */
type PriceWithDiscountProps = {
  /** Current price to display (discounted or full) */
  price: number;
  /** Original price before discount; when set and > price, shown crossed out */
  originalPrice?: number | null;
  /** e.g. 20 for "20% off" badge; shown only when there is a discount */
  discountPercentage?: number | null;
  /** Quantity multiplier for line total (e.g. item.price * item.quantity) */
  quantity?: number;
  /** Size: sm, md, lg */
  size?: "sm" | "md" | "lg";
  /** Extra class for the container */
  className?: string;
  /** Show "X% off" badge */
  showBadge?: boolean;
  /** Inline (single line) or stack (original above/below new) */
  layout?: "inline" | "stack";
  /** Alignment: start (default), center (e.g. in cards), or end (e.g. header nav right-aligned) */
  align?: "start" | "center" | "end";
  /** Tighter spacing for nav/header so old and new price fit on one line */
  compact?: boolean;
};

const sizeClasses = {
  sm: { main: "text-sm", original: "text-xs", badge: "text-[10px] px-1.5 py-0.5" },
  md: { main: "text-base", original: "text-xs", badge: "text-xs px-2 py-1" },
  lg: { main: "text-lg sm:text-xl", original: "text-sm", badge: "text-xs px-2.5 py-1" },
};

export function PriceWithDiscount({
  price,
  originalPrice,
  discountPercentage,
  quantity = 1,
  size = "md",
  className = "",
  showBadge = true,
  layout = "inline",
  align = "start",
  compact = false,
}: PriceWithDiscountProps) {
  const total = price * quantity;
  const originalTotal = originalPrice != null && originalPrice > price ? originalPrice * quantity : null;
  const hasDiscount = originalTotal != null && originalTotal > total;
  const sizes = sizeClasses[size];

  if (!hasDiscount) {
    const displayTotal = Number.isInteger(total) ? total.toFixed(0) : total.toFixed(2);
    return (
      <span className={`font-semibold text-gray-900 dark:text-white ${sizes.main} ${className}`}>
        £{displayTotal}
      </span>
    );
  }

  const badgeEl = showBadge && discountPercentage != null && discountPercentage > 0 ? (
    <span
      className={`font-semibold rounded-full ${sizes.badge} bg-egp-green text-white dark:bg-egp-beige dark:text-egp-green shadow-sm ring-1 ring-egp-green/20 dark:ring-egp-beige/20`}
    >
      {discountPercentage}% off
    </span>
  ) : null;

  const alignClass =
    align === "center"
      ? "items-center text-center"
      : align === "end"
        ? "items-end text-right"
        : "items-start";
  const rowClass =
    align === "center" ? "justify-center" : align === "end" ? "justify-end" : "";

  const originalPriceClass = `${sizes.original} font-medium line-through decoration-2 text-gray-600 dark:text-gray-300 decoration-gray-500 dark:decoration-gray-400`;
  const gapClass = compact ? "gap-1" : "gap-2";

  if (layout === "stack") {
    return (
      <div className={`flex flex-col gap-1.5 ${alignClass} ${className}`} role="group" aria-label={`Price: was £${originalTotal?.toFixed(2)}, now £${total.toFixed(2)}`}>
        <div className={`flex items-center gap-1.5 flex-nowrap ${rowClass}`}>
          <span className={originalPriceClass}>
            £{originalTotal.toFixed(2)}
          </span>
          {badgeEl}
        </div>
        <span className={`font-bold tracking-tight text-gray-900 dark:text-white ${sizes.main} leading-tight`}>
           £{total.toFixed(2)}
        </span>
      </div>
    );
  }

  const inlineAlignClass =
    align === "center" ? "justify-center" : align === "end" ? "justify-end" : "";
  return (
    <span className={`inline-flex items-center ${gapClass} flex-nowrap ${inlineAlignClass} ${className}`} role="group" aria-label={`Price: was £${originalTotal?.toFixed(2)}, now £${total.toFixed(2)}`}>
      <span className={originalPriceClass}>
        £{originalTotal.toFixed(2)}
      </span>
      <span className="flex-shrink-0 text-gray-600 dark:text-gray-400 font-normal" aria-hidden="true">→</span>
      <span className={`font-bold tracking-tight text-gray-900 dark:text-white ${sizes.main} flex-shrink-0`}>
        £{total.toFixed(2)}
      </span>
      {badgeEl}
    </span>
  );
}

import { createClient } from "@supabase/supabase-js";

import { liveFromServices, type LiveServiceMap } from "@/lib/category-services";
import { discountedPriceFromGroup } from "@/lib/booking-pricing";

/** Server-side read for category pages. Never throws: `null` means "use the page's own list". */
export async function loadLiveServices(
  slugs: string[],
): Promise<LiveServiceMap | null> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data, error } = await supabase
      .from("services")
      .select(
        "slug, price, duration, discount_group:discount_groups(discount_percentage, is_active)",
      )
      .in("slug", slugs)
      .eq("is_active", true);

    if (error || !data) return null;

    return liveFromServices(
      data.map((row: any) => {
        const price = parseFloat(String(row.price));
        const { discountPercentage, discountedPrice } =
          discountedPriceFromGroup(price, row.discount_group);

        return {
          slug: row.slug,
          price,
          duration: row.duration,
          discounted_price: discountedPrice,
          discount_percentage: discountPercentage,
        };
      }),
    );
  } catch {
    return null;
  }
}

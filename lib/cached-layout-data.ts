import { unstable_cache } from "next/cache";

import {
  CACHE_TAG_ADMIN_PROFILE,
  CACHE_TAG_ADMIN_SETTINGS_SCHEMA,
  CACHE_TAG_PRICING_SCHEMA,
} from "@/lib/cache-tags";
import { getAdminProfile } from "@/lib/admin-profile";
import { supabaseAdmin } from "@/lib/supabase";

const SCHEMA_SETTING_KEYS = [
  "businessCity",
  "businessPostcode",
  "workingDays",
  "workingHoursStart",
  "workingHoursEnd",
  "vatNumber",
  "registrationNumber",
  "mcsNumber",
] as const;

export type PricingCardSchemaRow = { title: string; subtitle: string | null };

async function loadPricingForSchema(): Promise<PricingCardSchemaRow[]> {
  const { data, error } = await supabaseAdmin
    .from("pricing_cards")
    .select("title, subtitle")
    .eq("is_enabled", true)
    .order("order", { ascending: true });

  if (error) {
    return [];
  }

  return (data as PricingCardSchemaRow[]) ?? [];
}

async function loadAdminSettingsForSchema(): Promise<
  { key: string; value: unknown }[]
> {
  const { data, error } = await supabaseAdmin
    .from("admin_settings")
    .select("key, value")
    .in("key", [...SCHEMA_SETTING_KEYS]);

  if (error) {
    return [];
  }

  return data ?? [];
}

export const getCachedAdminProfile = unstable_cache(
  async () => getAdminProfile(),
  ["root-layout-admin-profile"],
  { revalidate: 120, tags: [CACHE_TAG_ADMIN_PROFILE] },
);

export const getCachedPricingCardsForSchema = unstable_cache(
  loadPricingForSchema,
  ["root-layout-pricing-schema"],
  { revalidate: 120, tags: [CACHE_TAG_PRICING_SCHEMA] },
);

export const getCachedAdminSettingsRowsForSchema = unstable_cache(
  loadAdminSettingsForSchema,
  ["root-layout-admin-settings-schema"],
  { revalidate: 120, tags: [CACHE_TAG_ADMIN_SETTINGS_SCHEMA] },
);

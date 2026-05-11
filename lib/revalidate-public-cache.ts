import { revalidateTag } from "next/cache";

import {
  CACHE_TAG_ADMIN_PROFILE,
  CACHE_TAG_ADMIN_SETTINGS_SCHEMA,
  CACHE_TAG_PRICING_SCHEMA,
} from "@/lib/cache-tags";

/** Call after mutations that affect JSON-LD / layout footer contact sourced from DB. */
export function revalidateLayoutJsonLd() {
  revalidateTag(CACHE_TAG_ADMIN_PROFILE, "max");
  revalidateTag(CACHE_TAG_PRICING_SCHEMA, "max");
  revalidateTag(CACHE_TAG_ADMIN_SETTINGS_SCHEMA, "max");
}

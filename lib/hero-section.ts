import type { HeroSection } from "@/hooks/useHeroSection";

import { unstable_cache } from "next/cache";

import { CACHE_TAG_HERO_SECTION } from "@/lib/cache-tags";
import { supabaseAdmin } from "@/lib/supabase";

async function fetchHeroSectionRow(): Promise<HeroSection | null> {
  try {
    const { data: heroSections, error } = await supabaseAdmin
      .from("hero_section")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1);

    if (error) {
      return null;
    }

    return heroSections?.length ? (heroSections[0] as HeroSection) : null;
  } catch {
    return null;
  }
}

export const getHeroSectionForPublic = unstable_cache(
  fetchHeroSectionRow,
  ["public-hero-section"],
  { revalidate: 120, tags: [CACHE_TAG_HERO_SECTION] },
);

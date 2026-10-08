import { MetadataRoute } from "next";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase";
import { siteConfig } from "@/config/site";

const baseUrl = () => siteConfig.url.replace(/\/$/, "");

function entry(
  path: string,
  opts: {
    changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"];
    priority: number;
    lastModified?: Date;
  },
): MetadataRoute.Sitemap[0] {
  const p = path.startsWith("/") ? path : `/${path}`;
  const item: MetadataRoute.Sitemap[0] = {
    url: `${baseUrl()}${p}`,
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
  };

  if (opts.lastModified !== undefined) item.lastModified = opts.lastModified;

  return item;
}

/** Same rule as the /press page: on unless switched off in the admin. */
async function isPressPageEnabled(): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from("admin_settings")
      .select("value")
      .eq("key", "press_page_enabled")
      .single();

    if (error) return error.code === "PGRST116";

    return data?.value === true || data?.value === "true";
  } catch {
    return false;
  }
}

// Service slugs that have their own page which redirects elsewhere.
const REDIRECTED_SERVICE_SLUGS = new Set(["anti-wrinkle-injections"]);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    entry("/", { changeFrequency: "weekly", priority: 1 }),
    entry("/about", { changeFrequency: "monthly", priority: 0.85 }),
    entry("/services", { changeFrequency: "weekly", priority: 0.95 }),
    entry("/blog", { changeFrequency: "weekly", priority: 0.75 }),
    entry("/find-us", { changeFrequency: "monthly", priority: 0.7 }),
    entry("/book", { changeFrequency: "weekly", priority: 0.95 }),
    entry("/book/new", { changeFrequency: "weekly", priority: 0.85 }),
    entry("/book-consultation", { changeFrequency: "monthly", priority: 0.8 }),
    entry("/conditions", { changeFrequency: "weekly", priority: 0.85 }),
    entry("/gdpr", { changeFrequency: "yearly", priority: 0.25 }),
    entry("/terms", { changeFrequency: "yearly", priority: 0.35 }),
    entry("/privacy", { changeFrequency: "yearly", priority: 0.35 }),
    entry("/services/face", { changeFrequency: "monthly", priority: 0.8 }),
    entry("/services/body", { changeFrequency: "monthly", priority: 0.8 }),
    entry("/services/fillers", { changeFrequency: "monthly", priority: 0.8 }),
    entry("/services/anti-wrinkle", {
      changeFrequency: "monthly",
      priority: 0.85,
    }),
    entry("/services/baby-botox", {
      changeFrequency: "monthly",
      priority: 0.75,
    }),
    entry("/services/free-discovery-consultation", {
      changeFrequency: "monthly",
      priority: 0.75,
    }),
  ];

  const faceConditions = [
    "acne-acne-scarring",
    "rosacea",
    "hyperpigmentation-melasma",
    "barcode-lines-around-lips",
    "bruxism",
    "dark-under-eye-circles",
    "double-chin",
    "nasolabial-folds",
    "shadows-around-nasolabial-folds",
    "under-eye-hollows",
    "eye-bags",
    "flat-cheeks",
    "flat-pebble-chin",
    "gummy-smile",
    "heavy-lower-face",
    "jowling",
    "low-eyebrows",
  ];

  const bodyConditions = [
    "cellulite",
    "cellulite-thighs-buttocks-abdomen",
    "stubborn-belly-fat",
    "stubborn-belly-fat-abdominal-fat",
    "love-handles",
    "love-handles-flanks",
    "sagging-skin",
    "sagging-skin-skin-laxity",
    "stretch-marks",
    "arm-fat-bingo-wings",
    "thigh-fat-inner-thigh-laxity",
    "double-chin-jawline-fat",
    "post-pregnancy-tummy",
    "water-retention-bloating-swelling",
  ];

  const conditionPages: MetadataRoute.Sitemap = [
    ...faceConditions,
    ...bodyConditions,
  ].map((slug) =>
    entry(`/conditions/${slug}`, { changeFrequency: "monthly", priority: 0.7 }),
  );

  const dynamic: MetadataRoute.Sitemap = [];
  let conditionsFromDb = false;

  try {
    const supabase = createClient();
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug, updated_at, published_at")
      .eq("is_published", true);

    for (const post of posts || []) {
      const last = post.updated_at || post.published_at;

      dynamic.push(
        entry(`/blog/${post.slug}`, {
          changeFrequency: "monthly",
          priority: 0.65,
          ...(last ? { lastModified: new Date(last) } : {}),
        }),
      );
    }

    const { data: services } = await supabase
      .from("services")
      .select("slug, updated_at")
      .eq("is_active", true);

    for (const s of services || []) {
      if (!s.slug || REDIRECTED_SERVICE_SLUGS.has(s.slug)) continue;
      const last = s.updated_at;

      dynamic.push(
        entry(`/services/${s.slug}`, {
          changeFrequency: "weekly",
          priority: 0.85,
          ...(last ? { lastModified: new Date(last) } : {}),
        }),
      );
    }

    const { data: conditions } = await supabase
      .from("conditions")
      .select("slug, updated_at")
      .eq("is_active", true);

    // The database is the truth; the fixed list below is only a fallback when it cannot be read.
    conditionsFromDb = (conditions || []).length > 0;

    for (const c of conditions || []) {
      if (!c.slug) continue;
      const last = c.updated_at;

      dynamic.push(
        entry(`/conditions/${c.slug}`, {
          changeFrequency: "monthly",
          priority: 0.68,
          ...(last ? { lastModified: new Date(last) } : {}),
        }),
      );
    }
  } catch {
    // Build without DB (e.g. missing env in CI)
  }

  const pressEntries: MetadataRoute.Sitemap = (await isPressPageEnabled())
    ? [entry("/press", { changeFrequency: "monthly", priority: 0.6 })]
    : [];
  const merged = [
    ...staticEntries,
    ...pressEntries,
    ...(conditionsFromDb ? [] : conditionPages),
    ...dynamic,
  ];
  const seen = new Set<string>();

  return merged.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);

    return true;
  });
}

import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/config/site";

const baseUrl = () => siteConfig.url.replace(/\/$/, "");

function entry(
  path: string,
  opts: { changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"]; priority: number; lastModified?: Date }
): MetadataRoute.Sitemap[0] {
  const p = path.startsWith("/") ? path : `/${path}`;
  return {
    url: `${baseUrl()}${p}`,
    lastModified: opts.lastModified ?? new Date(),
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    entry("/", { changeFrequency: "weekly", priority: 1, lastModified: now }),
    entry("/about", { changeFrequency: "monthly", priority: 0.85 }),
    entry("/services", { changeFrequency: "weekly", priority: 0.95 }),
    entry("/blog", { changeFrequency: "weekly", priority: 0.75 }),
    entry("/press", { changeFrequency: "monthly", priority: 0.6 }),
    entry("/find-us", { changeFrequency: "monthly", priority: 0.7 }),
    entry("/membership/signup", { changeFrequency: "monthly", priority: 0.65 }),
    entry("/membership/success", { changeFrequency: "yearly", priority: 0.2 }),
    entry("/book", { changeFrequency: "weekly", priority: 0.95 }),
    entry("/book/new", { changeFrequency: "weekly", priority: 0.85 }),
    entry("/book/success", { changeFrequency: "yearly", priority: 0.25 }),
    entry("/book-consultation", { changeFrequency: "monthly", priority: 0.8 }),
    entry("/conditions", { changeFrequency: "weekly", priority: 0.85 }),
    entry("/gdpr", { changeFrequency: "yearly", priority: 0.25 }),
    entry("/terms", { changeFrequency: "yearly", priority: 0.35 }),
    entry("/privacy", { changeFrequency: "yearly", priority: 0.35 }),
    entry("/services/face", { changeFrequency: "monthly", priority: 0.8 }),
    entry("/services/body", { changeFrequency: "monthly", priority: 0.8 }),
    entry("/services/fillers", { changeFrequency: "monthly", priority: 0.8 }),
    entry("/services/anti-wrinkle", { changeFrequency: "monthly", priority: 0.85 }),
    entry("/services/baby-botox", { changeFrequency: "monthly", priority: 0.75 }),
    entry("/services/anti-wrinkle-injections", { changeFrequency: "monthly", priority: 0.8 }),
    entry("/services/free-discovery-consultation", { changeFrequency: "monthly", priority: 0.75 }),
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

  const conditionPages: MetadataRoute.Sitemap = [...faceConditions, ...bodyConditions].map((slug) =>
    entry(`/conditions/${slug}`, { changeFrequency: "monthly", priority: 0.7 })
  );

  const dynamic: MetadataRoute.Sitemap = [];

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
          lastModified: last ? new Date(last) : now,
        })
      );
    }

    const { data: services } = await supabase.from("services").select("slug, updated_at").eq("is_active", true);

    for (const s of services || []) {
      if (!s.slug) continue;
      const last = s.updated_at;
      dynamic.push(
        entry(`/services/${s.slug}`, {
          changeFrequency: "weekly",
          priority: 0.85,
          lastModified: last ? new Date(last) : now,
        })
      );
    }

    const { data: conditions } = await supabase.from("conditions").select("slug, updated_at").eq("is_active", true);

    for (const c of conditions || []) {
      if (!c.slug) continue;
      if (faceConditions.includes(c.slug) || bodyConditions.includes(c.slug)) continue;
      const last = c.updated_at;
      dynamic.push(
        entry(`/conditions/${c.slug}`, {
          changeFrequency: "monthly",
          priority: 0.68,
          lastModified: last ? new Date(last) : now,
        })
      );
    }
  } catch {
    // Build without DB (e.g. missing env in CI)
  }

  const merged = [...staticEntries, ...conditionPages, ...dynamic];
  const seen = new Set<string>();
  return merged.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

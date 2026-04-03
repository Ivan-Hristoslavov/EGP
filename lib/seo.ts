import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

const base = () => siteConfig.url.replace(/\/$/, "");

/** Absolute canonical URL for a path (e.g. `/about` → `https://.../about`). */
export function canonicalUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base()}${p}`;
}

/** Default OG/Twitter image entries (1200×630 from `app/opengraph-image.tsx`). */
export function defaultOgImages(alt: string): NonNullable<Metadata["openGraph"]>["images"] {
  const url = canonicalUrl("/opengraph-image");
  return [
    {
      url,
      width: 1200,
      height: 630,
      alt,
    },
  ];
}

/** Social profile URLs for JSON-LD `sameAs` (non-empty only). */
export function sameAsFromSiteConfig(): string[] {
  const s = siteConfig.social;
  return [s.instagram, s.facebook, s.youtube, s.tiktok, s.linkedin, s.twitter].filter(
    (u): u is string => typeof u === "string" && u.length > 0
  );
}

/** Strip HTML / excessive whitespace for meta descriptions (max ~160 chars). */
export function toMetaDescription(text: string | null | undefined, maxLen = 160): string {
  if (!text) return siteConfig.seo.defaultDescription;
  const plain = text
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, maxLen - 1).trim()}…`;
}

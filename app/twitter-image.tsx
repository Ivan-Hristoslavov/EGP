import { createDefaultOgImageResponse, defaultOgAlt, ogImageSize } from "@/lib/og-default-image";

export const runtime = "edge";

export const alt = defaultOgAlt;
export const size = ogImageSize;
export const contentType = "image/png";

export default function TwitterImage() {
  return createDefaultOgImageResponse();
}

import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const ogImageSize = { width: 1200, height: 630 };

export const defaultOgAlt = `${siteConfig.shortName} — ${siteConfig.tagline}`;

export function createDefaultOgImageResponse() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #1c1917 0%, #292524 40%, #464C45 100%)",
          color: "#fafaf9",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: 900,
            padding: "0 48px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            {siteConfig.shortName}
          </div>
          <div
            style={{
              fontSize: 28,
              marginTop: 20,
              opacity: 0.92,
              fontWeight: 500,
              color: "#e7e5e4",
            }}
          >
            {siteConfig.tagline}
          </div>
          <div
            style={{
              fontSize: 22,
              marginTop: 28,
              opacity: 0.75,
              color: "#a8a29e",
            }}
          >
            Aesthetic clinic · London, UK
          </div>
        </div>
      </div>
    ),
    {
      ...ogImageSize,
    }
  );
}

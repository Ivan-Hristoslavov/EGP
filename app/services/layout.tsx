import type { Metadata } from "next";

import { canonicalUrl } from "@/lib/seo";

// Default for /services; every page below it that sets its own metadata overrides this.
export const metadata: Metadata = {
  title: "Aesthetic Treatments & Prices in London",
  description:
    "Browse all aesthetic treatments at EGP Aesthetics London: anti-wrinkle injections, dermal fillers, skin and body treatments. Clear prices, expert practitioners.",
  alternates: {
    canonical: canonicalUrl("/services"),
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

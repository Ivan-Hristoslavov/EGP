import type { Metadata } from "next";

import { canonicalUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Face Treatments in London | Skin Rejuvenation & Facials",
  description:
    "Advanced facial treatments in London: skin boosters, peels, microneedling, PRP, exosomes and more. Book with experienced practitioners at EGP Aesthetics.",
  alternates: {
    canonical: canonicalUrl("/services/face"),
  },
};

export default function FaceTreatmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

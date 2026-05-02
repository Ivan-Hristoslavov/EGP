import type { Metadata } from "next";

import GdprPageClient from "./gdpr-client";

import { getAdminProfile } from "@/lib/admin-profile";
import { canonicalUrl } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getAdminProfile();
  const companyName = profile?.company_name || "EGP Aesthetics";
  const canonical = canonicalUrl("/gdpr");

  return {
    title: `GDPR & Data Protection | ${companyName}`,
    description: `GDPR and data protection information for ${companyName}. Your rights and how we use your data.`,
    alternates: { canonical },
    openGraph: {
      title: `GDPR & Data Protection | ${companyName}`,
      description: `GDPR and data protection information for ${companyName}.`,
      url: canonical,
      type: "website",
      siteName: companyName,
    },
  };
}

export default function GdprPage() {
  return <GdprPageClient />;
}

import type { Metadata } from "next";

import PrivacyPageClient from "./privacy-client";

import { getAdminProfile } from "@/lib/admin-profile";
import { canonicalUrl } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getAdminProfile();
  const companyName = profile?.company_name || "Company";
  const canonical = canonicalUrl("/privacy");

  return {
    title: `Privacy Policy | ${companyName} - Aesthetic Clinic London`,
    description: `Privacy policy for ${companyName} aesthetic services. How we collect, use, and protect your personal information.`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `Privacy Policy | ${companyName}`,
      description: `Privacy policy for ${companyName} aesthetic services. How we collect, use, and protect your personal information.`,
      url: canonical,
      type: "website",
      siteName: companyName,
    },
  };
}

export default function PrivacyPage() {
  return <PrivacyPageClient />;
}

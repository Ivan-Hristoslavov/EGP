import type { Metadata } from "next";

import TermsPageClient from "./terms-client";

import { getAdminProfile } from "@/lib/admin-profile";
import { canonicalUrl } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getAdminProfile();
  const companyName = profile?.company_name || "Company";
  const canonical = canonicalUrl("/terms");

  return {
    title: `Terms & Conditions | ${companyName} - Aesthetic Clinic London`,
    description: `Terms and conditions for ${companyName} aesthetic services. Premier aesthetic clinic covering South West London.`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `Terms & Conditions | ${companyName}`,
      description: `Terms and conditions for ${companyName} aesthetic services.`,
      url: canonical,
      type: "website",
      siteName: companyName,
    },
  };
}

export default function TermsPage() {
  return <TermsPageClient />;
}

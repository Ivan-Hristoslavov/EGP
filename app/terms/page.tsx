import type { Metadata } from 'next';
import { getAdminProfile } from "@/lib/admin-profile";
import TermsPageClient from './terms-client';

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getAdminProfile();
  const companyName = profile?.company_name || "FixMyLeak";
  const canonical = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://fixmyleak.co.uk'}/terms`;
  
  return {
    title: `Terms & Conditions | ${companyName} - Emergency Plumber London`,
    description: `Terms and conditions for ${companyName} plumbing services. Professional emergency plumber covering South West London.`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `Terms & Conditions | ${companyName}`,
      description: `Terms and conditions for ${companyName} plumbing services.`,
      url: canonical,
      type: "website",
      siteName: companyName,
    },
  };
}

export default function TermsPage() {
  return <TermsPageClient />;
} 
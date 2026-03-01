import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Blog | ${siteConfig.name}`,
  description: `Aesthetic treatments, skincare tips, and beauty insights from ${siteConfig.name}. Expert advice from our practitioners.`,
  alternates: {
    canonical: `${siteConfig.url}/blog`,
  },
  openGraph: {
    title: `Blog | ${siteConfig.name}`,
    description: `Aesthetic treatments and skincare insights.`,
    url: `${siteConfig.url}/blog`,
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

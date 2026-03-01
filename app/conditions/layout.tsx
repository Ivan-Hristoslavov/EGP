import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Treatments by Condition | ${siteConfig.name}`,
  description: `Explore our aesthetic treatments by condition. Find the right treatment for your specific concerns at ${siteConfig.name}.`,
  alternates: {
    canonical: `${siteConfig.url}/conditions`,
  },
  openGraph: {
    title: `Treatments by Condition | ${siteConfig.name}`,
    description: `Find treatments for your specific concerns.`,
    url: `${siteConfig.url}/conditions`,
  },
};

export default function ConditionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

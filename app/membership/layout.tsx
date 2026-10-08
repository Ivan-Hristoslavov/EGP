import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Membership | ${siteConfig.name}`,
  description: `Join the ${siteConfig.name} membership programme for exclusive benefits, discounts, and priority booking.`,
  // The membership programme is switched off: keep these pages out of search results.
  robots: { index: false, follow: true },
};

export default function MembershipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

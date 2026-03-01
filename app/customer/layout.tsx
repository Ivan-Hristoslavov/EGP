import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Customer Portal | ${siteConfig.name}`,
  description: `Manage your bookings and profile at ${siteConfig.name}.`,
  robots: {
    index: false,
    follow: true,
  },
};

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Book Appointment | ${siteConfig.name}`,
  description: `Book your aesthetic treatment at ${siteConfig.name}. Choose from our range of facial and body treatments. Easy online booking.`,
  alternates: {
    canonical: `${siteConfig.url}/book`,
  },
  openGraph: {
    title: `Book Appointment | ${siteConfig.name}`,
    description: `Book your aesthetic treatment online.`,
    url: `${siteConfig.url}/book`,
  },
};

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

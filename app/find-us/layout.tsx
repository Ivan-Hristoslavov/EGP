import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Find Us | ${siteConfig.name}`,
  description: `Visit ${siteConfig.name} - our clinic location, directions, transport options, and contact details. Easily accessible in London.`,
  alternates: {
    canonical: `${siteConfig.url}/find-us`,
  },
  openGraph: {
    title: `Find Us | ${siteConfig.name}`,
    description: `Visit our clinic - location, directions, and contact details.`,
    url: `${siteConfig.url}/find-us`,
  },
};

export default function FindUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

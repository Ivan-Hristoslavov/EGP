import type { Metadata } from 'next';
import { siteConfig } from "@/config/site";
import SectionHeroAesthetics from "@/components/SectionHeroAesthetics";
import SectionFeaturedServices from "@/components/SectionFeaturedServices";
import SectionWhyChooseUs from "@/components/SectionWhyChooseUs";
import SectionBeforeAfter from "@/components/SectionBeforeAfter";
import { ReviewsSection } from "@/components/ReviewsSection";
import { ReviewForm } from "@/components/ReviewForm";
import { FAQSection } from "@/components/FAQSection";
import SectionNewsletter from "@/components/SectionNewsletter";
// import SectionContact from "@/components/SectionContact"; // COMMENTED OUT - Will use direct booking with payment instead

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.defaultDescription,
    keywords: siteConfig.seo.keywords,
    alternates: {
      canonical: siteConfig.url,
    },
    openGraph: {
      title: siteConfig.name,
      description: siteConfig.description,
      url: siteConfig.url,
      type: "website",
      locale: "en_GB",
      siteName: siteConfig.name,
      images: [
        {
          url: `${siteConfig.url}/images/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description: siteConfig.description,
      images: [`${siteConfig.url}/images/og-image.jpg`],
    },
  };
}

export default async function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section - Full Screen */}
      <SectionHeroAesthetics />

      {/* Featured Services Carousel */}
      <SectionFeaturedServices />

      {/* Why Choose Us */}
      <SectionWhyChooseUs />

      {/* Before & After Gallery */}
      <SectionBeforeAfter />

      {/* Testimonials/Reviews */}
      <ReviewsSection />

      {/* Review Form */}
      <ReviewForm />

      {/* FAQ Section */}
      <FAQSection />

      {/* Newsletter Signup with 10% Discount */}
      <SectionNewsletter />

      {/* Contact Section - COMMENTED OUT - Will use direct booking with payment instead */}
      {/* <SectionContact /> */}
    </main>
  );
}

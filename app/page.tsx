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
import { ClientOnly } from "@/components/ClientOnly";
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
    <>
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

      {/* Review Form - ClientOnly avoids HeroUI useId hydration mismatch */}
      <ClientOnly
        fallback={
          <section className="py-12 sm:py-16 bg-egp-beige-lighter dark:bg-gray-900" id="leave-review">
            <div className="max-w-2xl mx-auto px-6 sm:px-8">
              <div className="h-96 bg-white/50 dark:bg-gray-800/30 rounded-3xl animate-pulse" />
            </div>
          </section>
        }
      >
        <ReviewForm />
      </ClientOnly>

      {/* FAQ Section - ClientOnly avoids conditional render hydration mismatch */}
      <ClientOnly
        fallback={
          <section className="py-20 bg-egp-beige-lighter dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" id="faq">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="h-64 bg-white/30 dark:bg-gray-800/30 rounded-2xl animate-pulse" />
            </div>
          </section>
        }
      >
        <FAQSection />
      </ClientOnly>

      {/* Newsletter Signup with 10% Discount - ClientOnly avoids HeroUI useId hydration mismatch */}
      <ClientOnly
        fallback={
          <section className="py-12 sm:py-16 md:py-20 bg-egp-beige-lighter dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto h-64 rounded-2xl bg-white/30 dark:bg-gray-800/30 animate-pulse" />
            </div>
          </section>
        }
      >
        <SectionNewsletter />
      </ClientOnly>

      {/* Contact Section - COMMENTED OUT - Will use direct booking with payment instead */}
      {/* <SectionContact /> */}
    </>
  );
}

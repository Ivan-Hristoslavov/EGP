import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { canonicalUrl, defaultOgImages } from "@/lib/seo";
import SectionHeroAesthetics from "@/components/SectionHeroAesthetics";
import { getHeroSectionForPublic } from "@/lib/hero-section";
import SectionFeaturedServices from "@/components/SectionFeaturedServices";
import SectionWhyChooseUs from "@/components/SectionWhyChooseUs";
import SectionBeforeAfter from "@/components/SectionBeforeAfter";
import { ReviewsSection } from "@/components/ReviewsSection";
import { ReviewForm } from "@/components/ReviewForm";
import { FAQSection } from "@/components/FAQSection";
import SectionNewsletter from "@/components/SectionNewsletter";
import { ClientOnly } from "@/components/ClientOnly";
// import SectionContact from "@/components/SectionContact"; // COMMENTED OUT - Will use direct booking with payment instead

/** Early LCP hint: raw storage URL begins fetch before hero client bundle executes. */
function HomeHeroImagePreload({
  imageUrl,
}: {
  imageUrl: string | null | undefined;
}) {
  if (!imageUrl) return null;

  return (
    <link as="image" fetchPriority="high" href={imageUrl} rel="preload" />
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const ogImages = defaultOgImages(siteConfig.name);

  return {
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.defaultDescription,
    keywords: siteConfig.seo.keywords,
    alternates: {
      canonical: canonicalUrl("/"),
    },
    openGraph: {
      title: siteConfig.name,
      description: siteConfig.description,
      url: canonicalUrl("/"),
      type: "website",
      locale: "en_GB",
      siteName: siteConfig.name,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description: siteConfig.description,
      images: [canonicalUrl("/opengraph-image")],
    },
  };
}

export default async function HomePage() {
  const heroSection = await getHeroSectionForPublic();
  const firstHeroImageUrl =
    heroSection &&
    [heroSection.image_1_url, heroSection.image_2_url, heroSection.image_3_url].find(
      (u): u is string => u != null && u !== "",
    );

  return (
    <>
      <HomeHeroImagePreload imageUrl={firstHeroImageUrl} />
      {/* Hero Section - Full Screen */}
      <SectionHeroAesthetics initialHeroSection={heroSection} />

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
          <section
            className="py-6 sm:py-10 md:py-12 bg-egp-beige-lighter dark:bg-gray-900"
            id="leave-review"
          >
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="space-y-4 mb-4 sm:mb-6">
                <div className="h-7 max-w-xs mx-auto rounded-lg bg-white/40 dark:bg-gray-800/40 animate-pulse" />
                <div className="h-5 max-w-md mx-auto rounded bg-white/30 dark:bg-gray-800/30 animate-pulse" />
              </div>
              <div className="min-h-[22rem] bg-white/50 dark:bg-gray-800/30 rounded-2xl animate-pulse" />
            </div>
          </section>
        }
      >
        <ReviewForm />
      </ClientOnly>

      {/* FAQ Section - ClientOnly avoids conditional render hydration mismatch */}
      <ClientOnly
        fallback={
          <section
            className="py-6 sm:py-8 md:py-10 bg-egp-beige-lighter dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
            id="faq"
          >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="space-y-3 mb-4 sm:mb-6 md:mb-8 text-center">
                <div className="h-5 w-40 rounded-full bg-white/40 dark:bg-gray-800/40 animate-pulse mx-auto" />
                <div className="h-6 max-w-sm rounded-lg bg-white/35 dark:bg-gray-800/35 animate-pulse mx-auto" />
                <div className="h-4 max-w-md rounded bg-white/30 dark:bg-gray-800/30 animate-pulse mx-auto" />
              </div>
              <div className="min-h-[26rem] space-y-3">
                <div className="h-14 rounded-xl bg-white/35 dark:bg-gray-800/35 animate-pulse" />
                <div className="h-14 rounded-xl bg-white/35 dark:bg-gray-800/35 animate-pulse" />
                <div className="h-14 rounded-xl bg-white/35 dark:bg-gray-800/35 animate-pulse" />
              </div>
            </div>
          </section>
        }
      >
        <FAQSection />
      </ClientOnly>

      {/* Newsletter Signup with 10% Discount - ClientOnly avoids HeroUI useId hydration mismatch */}
      <ClientOnly
        fallback={
          <section className="py-6 sm:py-10 md:py-12 bg-egp-beige-lighter dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="h-6 w-3/4 max-w-md rounded-lg bg-white/35 dark:bg-gray-800/35 animate-pulse" />
                <div className="min-h-[17rem] rounded-2xl bg-white/30 dark:bg-gray-800/30 animate-pulse" />
              </div>
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

"use client";

import { Card, CardBody } from "@heroui/card";

import BeforeAfterSlideLine from "./BeforeAfterSlideLine";

import { useGallery } from "@/hooks/useGallery";
import { badgeBackgroundClass } from "@/config/badge-styles";
import { typography, textColors, layout } from "@/config/typography";

export default function SectionBeforeAfter() {
  const { galleryItems, loading, error } = useGallery();

  // Filter items that have both before and after images, map to BeforeAfterItem format, featured first
  const beforeAfterItems = galleryItems
    .filter((item) => item.before_image_url && item.after_image_url)
    .map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category?.name || item.project_type || "Treatment",
      service: item.service?.name,
      project_type: item.project_type,
      location: item.location,
      completion_date: item.completion_date,
      before_image_url: item.before_image_url,
      after_image_url: item.after_image_url,
      description: item.description || undefined,
      is_featured: item.is_featured ?? false,
      categoryData: item.category,
      serviceData: item.service,
    }))
    .sort((a, b) =>
      a.is_featured === b.is_featured ? 0 : a.is_featured ? -1 : 1,
    );

  // If no gallery items, show placeholder
  if (loading) {
    return (
      <section className="py-8 sm:py-10 md:py-12 bg-egp-beige-lighter dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className={layout.container}>
          <div className="text-center mb-4 sm:mb-5 md:mb-6 space-y-2 sm:space-y-3">
            <div className="inline-block h-5 w-24 rounded-full bg-white/40 dark:bg-gray-700/50 animate-pulse mx-auto" />
            <div className="h-6 sm:h-7 max-w-md mx-auto rounded-lg bg-white/40 dark:bg-gray-700/50 animate-pulse" />
            <div className="h-4 max-w-xl mx-auto rounded bg-white/30 dark:bg-gray-700/40 animate-pulse" />
          </div>
          <div className="max-w-2xl sm:max-w-3xl mx-auto mb-4">
            <div className="relative bg-white/50 dark:bg-gray-800/50 rounded-xl shadow-lg overflow-hidden">
              <div className="relative w-full h-[45vh] min-h-[280px] bg-gradient-to-br from-gray-200/80 via-gray-300/60 to-gray-200/80 dark:from-gray-700/50 dark:via-gray-600/40 dark:to-gray-700/50 animate-pulse" />
            </div>
          </div>
          <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-1.5 sm:gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-md bg-white/40 dark:bg-gray-700/40 animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || beforeAfterItems.length === 0) {
    return (
      <section className="py-8 sm:py-10 md:py-12 bg-egp-beige-lighter dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className={layout.container}>
          <div className="text-center">
            <div
              className={`inline-block px-3 sm:px-4 py-1.5 sm:py-2 ${badgeBackgroundClass} text-xs sm:text-sm font-semibold mb-3 sm:mb-4 text-[#6b5f4b] dark:text-gray-200`}
            >
              Real Results
            </div>
            <h2
              className={`${typography.headingSection} ${textColors.heading} mb-3 sm:mb-4 px-4`}
            >
              Before & After Gallery
            </h2>
            <p className={`${typography.lead} max-w-2xl mx-auto px-4 mb-6`}>
              See natural, beautiful transformations we have achieved for our
              clients
            </p>
            <Card className="max-w-2xl mx-auto" shadow="lg">
              <CardBody className="p-8 text-center">
                <div className="text-6xl mb-4">✨</div>
                <h3
                  className={`${typography.headingCard} ${textColors.heading} mb-4`}
                >
                  Gallery Coming Soon
                </h3>
                <p className={`${typography.body} ${textColors.body}`}>
                  We are currently updating our before and after gallery. Check
                  back soon to see our amazing results!
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return <BeforeAfterSlideLine items={beforeAfterItems} />;
}

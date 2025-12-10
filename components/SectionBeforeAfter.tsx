"use client";

import { useGallery } from "@/hooks/useGallery";
import BeforeAfterSlideLine from "./BeforeAfterSlideLine";
import { badgeBackgroundClass } from "@/config/badge-styles";
import { Spinner } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";

export default function SectionBeforeAfter() {
  const { galleryItems, loading, error } = useGallery();

  // Filter items that have both before and after images and map to BeforeAfterItem format
  const beforeAfterItems = galleryItems
    .filter(item => 
      item.before_image_url && item.after_image_url
    )
    .map(item => ({
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
      // Full category/service objects for badges
      categoryData: item.category,
      serviceData: item.service,
    }));

  // If no gallery items, show placeholder
  if (loading) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-[#f5f1e9] dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Spinner size="lg" color="primary" />
          </div>
        </div>
      </section>
    );
  }

  if (error || beforeAfterItems.length === 0) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-[#f5f1e9] dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className={`inline-block px-3 sm:px-4 py-1.5 sm:py-2 ${badgeBackgroundClass} text-sm sm:text-base font-semibold mb-3 sm:mb-4 text-[#6b5f4b] dark:text-gray-200`}>
              Real Results
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 px-4">
              Before & After Gallery
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4 mb-8">
              See the natural, beautiful transformations we've achieved for our clients
            </p>
            <Card className="max-w-2xl mx-auto" shadow="lg">
              <CardBody className="p-12 text-center">
              <div className="text-6xl mb-4">✨</div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                Gallery Coming Soon
              </h3>
                <p className="text-default-600">
                We're currently updating our before and after gallery. Check back soon to see our amazing results!
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


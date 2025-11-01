"use client";

import { useGallery } from "@/hooks/useGallery";
import BeforeAfterSlideLine from "./BeforeAfterSlideLine";

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
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-96 mx-auto mb-8"></div>
              <div className="aspect-[16/10] bg-gray-300 dark:bg-gray-700 rounded-3xl mx-auto max-w-6xl"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || beforeAfterItems.length === 0) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 text-sm sm:text-base font-semibold mb-3 sm:mb-4">
              Real Results
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 px-4">
              Before & After Gallery
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4 mb-8">
              See the natural, beautiful transformations we've achieved for our clients
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 max-w-2xl mx-auto">
              <div className="text-6xl mb-4">✨</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Gallery Coming Soon
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We're currently updating our before and after gallery. Check back soon to see our amazing results!
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return <BeforeAfterSlideLine items={beforeAfterItems} />;
}


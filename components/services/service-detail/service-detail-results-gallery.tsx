"use client";

import type { GalleryRowForService } from "@/lib/service-detail-page-data";

import BeforeAfterSlideLine from "@/components/BeforeAfterSlideLine";

type ServiceDetailResultsGalleryProps = {
  items: GalleryRowForService[];
  serviceCategoryName: string;
};

export function ServiceDetailResultsGallery({
  items,
  serviceCategoryName,
}: ServiceDetailResultsGalleryProps) {
  if (items.length === 0) return null;

  const slideItems = items.map((g) => ({
    id: g.id,
    title: g.title,
    category: serviceCategoryName,
    before_image_url: g.before_image_url as string,
    after_image_url: g.after_image_url as string,
    description: g.description ?? undefined,
    completion_date: g.completion_date ?? undefined,
    is_featured: g.is_featured ?? false,
  }));

  return <BeforeAfterSlideLine className="!py-0" items={slideItems} />;
}

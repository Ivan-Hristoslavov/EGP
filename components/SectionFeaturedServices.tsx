"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Filter } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import Pagination from "@/components/Pagination";
import type { Service } from "@/hooks/useServices";
import { aestheticsColors } from "@/config/colors";
import { typography, textColors, layout } from "@/config/typography";
import { PriceWithDiscount } from "@/components/PriceWithDiscount";
import { ServiceDetailsModal } from "@/components/ServiceDetailsModal";
import { badgeBackgroundClass } from "@/config/badge-styles";
import ButtonPrimary from "@/components/ButtonPrimary";

// Gradient colors for different categories
const categoryGradients: Record<string, string> = {
  'FACE': 'from-[#9d9585] via-[#b5ad9d] to-[#ddd5c3]',
  'BODY': 'from-[#c4b5a0] via-[#b59c74] to-[#9d9585]',
  'LIPS': 'from-[#d8c5a7] via-[#c4b5a0] to-[#b59c74]',
  'ANTI-WRINKLE': 'from-[#4b5563] via-[#374151] to-[#1f2937]',
  'FILLERS': 'from-[#c4b5a0] via-[#b5ad9d] to-[#9d9585]',
  'SKIN': 'from-[#e4d9c8] via-[#ddd5c3] to-[#c4b5a0]',
  'HAIR': 'from-[#b5ad9d] via-[#9d9585] to-[#7a6f5a]',
  'default': 'from-[#9d9585] via-[#b5ad9d] to-[#ddd5c3]',
};

function getCategoryGradient(categoryName: string): string {
  return categoryGradients[categoryName.toUpperCase()] || categoryGradients['default'];
}

function hasDiscount(s: Service): boolean {
  return (
    (s.discounted_price != null && s.discounted_price < s.price) ||
    (s.discount_percentage != null && s.discount_percentage > 0)
  );
}

// Responsive items per page: 3 on mobile, 6 on md, 8 on lg (default 3 for mobile-first)
function useItemsPerPage() {
  const [perPage, setPerPage] = useState(3);
  useEffect(() => {
    const update = () => {
      if (typeof window === "undefined") return;
      if (window.matchMedia("(min-width: 1024px)").matches) setPerPage(8);
      else if (window.matchMedia("(min-width: 768px)").matches) setPerPage(6);
      else setPerPage(3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return perPage;
}

export default function SectionFeaturedServices() {
  const { services, isLoading } = useServices();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showDiscountedOnly, setShowDiscountedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const itemsPerPage = useItemsPerPage();

  // Whether any featured service has a discount (for showing "On offer" filter)
  const hasDiscountedFeatured = useMemo(() => {
    const featured = services.filter(s =>
      s.is_featured && (s.main_tab?.slug === 'book-now' || s.main_tab?.slug === 'by-condition')
    );
    return featured.some(hasDiscount);
  }, [services]);

  // Get unique categories from featured services only (for filters)
  const availableCategories = useMemo(() => {
    const categoriesMap = new Map<string, { id: string; name: string }>();
    
    // Only get featured services from both 'book-now' and 'by-condition' tabs
    const featuredServices = services.filter(s => 
      s.is_featured && 
      (s.main_tab?.slug === 'book-now' || s.main_tab?.slug === 'by-condition')
    );
    
    // Build category list from featured services only
    featuredServices.forEach(service => {
      if (!categoriesMap.has(service.category.id)) {
        categoriesMap.set(service.category.id, {
          id: service.category.id,
          name: service.category.name
        });
      }
    });
    
    return Array.from(categoriesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [services]);

  // Filter services based on selected category and discount - only show featured services
  const filteredServices = useMemo(() => {
    // Only include featured services from both 'book-now' and 'by-condition' main tabs
    let featured = services.filter(s => 
      s.is_featured && 
      (s.main_tab?.slug === 'book-now' || s.main_tab?.slug === 'by-condition')
    );
    
    // Apply category filter if selected
    if (selectedCategory !== "all") {
      featured = featured.filter(s => s.category.id === selectedCategory);
    }
    
    // Apply discount filter
    if (showDiscountedOnly) {
      featured = featured.filter(hasDiscount);
    }
    
    // Sort by display_order, then by name
    return featured.sort((a, b) => {
      if (a.display_order !== b.display_order) {
        return a.display_order - b.display_order;
      }
      return a.name.localeCompare(b.name);
    });
  }, [services, selectedCategory, showDiscountedOnly]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  // Reset to page 1 when category or discount filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, showDiscountedOnly]);

  if (isLoading) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-egp-beige-lighter dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className={layout.container}>
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-2 ${badgeBackgroundClass} text-xs sm:text-sm font-semibold mb-2 sm:mb-4 ${textColors.heading}`}>
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Popular Treatments</span>
            </div>
            <h2 className={`${typography.headingSection} ${textColors.heading} mb-2 sm:mb-4 px-4`}>
              Featured Services
            </h2>
            <p className={`${typography.lead} max-w-2xl mx-auto px-4`}>
              Discover our most popular aesthetic treatments
            </p>
          </div>
          
          {/* Loading Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700 rounded-2xl mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!isLoading && filteredServices.length === 0) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-egp-beige-lighter dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className={layout.container}>
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-2 ${badgeBackgroundClass} text-xs sm:text-sm font-semibold mb-2 sm:mb-4 ${textColors.heading}`}>
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Popular Treatments</span>
            </div>
            <h2 className={`${typography.headingSection} ${textColors.heading} mb-2 sm:mb-4 px-4`}>
              Featured Services
            </h2>
            <p className={`${typography.lead} max-w-2xl mx-auto px-4`}>
              Discover our most popular aesthetic treatments
            </p>
          </div>
          
          <div className="text-center py-12">
            <p className={typography.lead}>
              No featured services available at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="featured-services" className="py-12 sm:py-16 md:py-20 bg-egp-beige-lighter dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - smaller titles */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-2 ${badgeBackgroundClass} text-gray-900 dark:text-gray-200 text-xs sm:text-base font-semibold mb-2 sm:mb-4`}>
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Popular Treatments</span>
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4 px-4">
            Featured Services
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
            Discover our most popular aesthetic treatments
          </p>
        </div>

        {/* Category and Discount Filters - 4 per line */}
        {(availableCategories.length > 0 || hasDiscountedFeatured) && (
          <div className="mb-8 sm:mb-12">
            <div className={`flex items-center gap-2 ${typography.body} font-medium ${textColors.body} mb-2 sm:mb-3`}>
              <Filter className="w-4 h-4 flex-shrink-0" />
              <span>Filter:</span>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                  selectedCategory === "all"
                    ? "bg-egp-green dark:bg-egp-green-dark text-white shadow-lg scale-105"
                    : "bg-white dark:bg-egp-green text-gray-700 dark:text-white hover:bg-[#ddd5c3] dark:hover:bg-egp-green-light border border-[#c9c1b0] dark:border-egp-green-dark"
                }`}
              >
                All Services
              </button>
              
              {hasDiscountedFeatured && (
                <button
                  onClick={() => setShowDiscountedOnly(!showDiscountedOnly)}
                  className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                    showDiscountedOnly
                      ? "bg-egp-green dark:bg-egp-green-dark text-white shadow-lg scale-105"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-[#ddd5c3] dark:hover:bg-gray-700 border border-[#c9c1b0] dark:border-gray-700"
                  }`}
                >
                  On offer
                </button>
              )}
              
              {availableCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    selectedCategory === category.id
                      ? "bg-[#b5ad9d] dark:bg-[#9d9585] text-white shadow-lg scale-105"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-[#ddd5c3] dark:hover:bg-gray-700 border border-[#c9c1b0] dark:border-gray-700"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Services Grid - compact cards on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6 mb-6 sm:mb-12">
          {paginatedServices.map((service) => {
            const gradient = getCategoryGradient(service.category.name);
            
            return (
              <div
                key={service.id}
                className="group relative bg-white dark:bg-egp-green rounded-lg sm:rounded-2xl overflow-hidden shadow-md sm:shadow-lg hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] sm:hover:scale-[1.02] border border-gray-300 dark:border-egp-green-dark cursor-pointer flex flex-col"
                onClick={() => setSelectedService(service)}
              >
                {/* Image - compact on mobile */}
                <div className="h-20 sm:h-32 md:h-36 lg:h-40 relative overflow-hidden bg-gradient-to-br">
                  {service.image_url ? (
                    <>
                      <img
                        src={service.image_url}
                        alt={service.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60 group-hover:opacity-70 transition-opacity`}></div>
                    </>
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`}></div>
                  )}
                  
                  {/* Service Name Overlay - compact on mobile */}
                  <div className="absolute inset-0 flex items-center justify-center p-1.5 sm:p-4 md:p-5 z-10">
                    <h3 className={`${typography.headingCard} text-white text-center drop-shadow-lg line-clamp-2 leading-tight`}>
                      {service.name}
                    </h3>
                  </div>
                  
                  {/* Featured Badge */}
                  <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 z-10">
                    <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 text-white text-[9px] sm:text-[10px] font-bold rounded-full shadow-lg backdrop-blur-sm" style={{ backgroundColor: aestheticsColors.green.DEFAULT }}>
                      <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                      FEATURED
                    </span>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 z-10">
                    <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white text-[9px] sm:text-[10px] font-semibold rounded-full shadow-lg backdrop-blur-sm">
                      {service.category.name}
                    </span>
                  </div>
                </div>

                {/* Content - compact on mobile */}
                <div className="p-2 sm:p-4 md:p-5 lg:p-6 flex flex-col flex-1">
                  {/* Category */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 bg-[#ddd5c3]/50 dark:bg-[#c9c1b0]/30 ${textColors.body} border border-[#c9c1b0]/50 dark:border-gray-600/50 rounded-full ${typography.small} font-semibold`}>
                      {service.category.name}
                    </span>
                    {service.main_tab && (
                      <span className={typography.small}>
                        • {service.main_tab.name}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {service.description && (
                    <p className={`${typography.body} ${textColors.body} mb-2 sm:mb-4 line-clamp-2`}>
                      {service.description}
                    </p>
                  )}

                  {/* Service Details */}
                  <div className={`flex flex-wrap gap-2 sm:gap-3 mb-2 sm:mb-4 ${typography.small}`}>
                    <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{service.duration} min</span>
                    </div>
                    {service.downtime_days > 0 && (
                      <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span>{service.downtime_days} days</span>
                      </div>
                    )}
                    {service.requires_consultation && (
                      <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Consultation</span>
                      </div>
                    )}
                  </div>

                  {/* Spacer to push price and button to bottom */}
                  <div className="flex-1"></div>

                  {/* Price & CTA - Fixed at bottom */}
                  <div className="pt-2 sm:pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 sm:space-y-3">
                    {/* Price */}
                    <div className="text-center flex flex-col items-center gap-1 w-full">
                      <PriceWithDiscount
                        price={service.discounted_price ?? service.price}
                        originalPrice={service.discount_percentage ? service.price : null}
                        discountPercentage={service.discount_percentage}
                        size="lg"
                        layout="stack"
                        align="center"
                      />
                    </div>
                    {/* Button */}
                    <ButtonPrimary
                      onPress={() => {
                        setSelectedService(service);
                      }}
                      variant="primary"
                      className="w-full !bg-transparent border-2 border-egp-green dark:border-egp-beige !text-egp-green dark:!text-egp-beige hover:!bg-egp-green hover:!text-white dark:hover:!bg-egp-beige dark:hover:!text-gray-900 rounded-xl font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
                      endContent={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    >
                      Learn More
                    </ButtonPrimary>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mb-8 sm:mb-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={filteredServices.length}
              limit={itemsPerPage}
              onPageChange={(page) => {
                setCurrentPage(page);
                // Scroll to top of Featured Services section
                const section = document.getElementById('featured-services');
                if (section) {
                  const offset = 100; // Account for fixed header
                  const sectionTop = section.getBoundingClientRect().top + window.pageYOffset - offset;
                  window.scrollTo({ top: sectionTop, behavior: 'smooth' });
                }
              }}
              className="justify-center"
            />
          </div>
        )}

        {/* View All Button */}
        <div className="text-center px-4">
          <ButtonPrimary
            as={Link}
            href="/services"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
            endContent={<ArrowRight className="w-5 h-5" />}
          >
            View All Treatments
          </ButtonPrimary>
        </div>
      </div>

      {/* Service Details Modal */}
      <ServiceDetailsModal
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        service={selectedService ? {
          id: selectedService.id,
          name: selectedService.name,
          price: selectedService.discounted_price ?? selectedService.price,
          originalPrice: selectedService.discount_percentage ? selectedService.price : null,
          discount_percentage: selectedService.discount_percentage,
          category: selectedService.category.name,
          duration: selectedService.duration,
          description: selectedService.description,
          details: selectedService.details,
          benefits: selectedService.benefits,
          preparation: selectedService.preparation,
          aftercare: selectedService.aftercare,
          requires_consultation: selectedService.requires_consultation,
          downtime_days: selectedService.downtime_days,
          results_duration_weeks: selectedService.results_duration_weeks,
          image_url: selectedService.image_url,
          slug: selectedService.slug,
        } : null}
        showBookButton
      />
    </section>
  );
}

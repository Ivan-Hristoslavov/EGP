"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Filter, X, Clock, CheckCircle, Info, Calendar } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import Pagination from "@/components/Pagination";
import type { Service } from "@/hooks/useServices";

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

export default function SectionFeaturedServices() {
  const { services, isLoading } = useServices();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const itemsPerPage = 8;

  // Get unique categories from featured services only (for filters)
  const availableCategories = useMemo(() => {
    const categoriesMap = new Map<string, { id: string; name: string }>();
    
    // First get featured services from both 'book-now' and 'by-condition' tabs
    const featuredServices = services.filter(s => 
      s.is_featured && 
      (s.main_tab?.slug === 'book-now' || s.main_tab?.slug === 'by-condition')
    );
    
    // If no featured services, use top services by display_order from both tabs
    const servicesToUse = featuredServices.length > 0 
      ? featuredServices 
      : [...services]
          .filter(s => s.main_tab?.slug === 'book-now' || s.main_tab?.slug === 'by-condition')
          .sort((a, b) => {
            if (a.display_order !== b.display_order) {
              return a.display_order - b.display_order;
            }
            return a.name.localeCompare(b.name);
          });
    
    // Build category list from the services we're actually displaying
    servicesToUse.forEach(service => {
      if (!categoriesMap.has(service.category.id)) {
        categoriesMap.set(service.category.id, {
          id: service.category.id,
          name: service.category.name
        });
      }
    });
    
    return Array.from(categoriesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [services]);

  // Filter services based on selected category
  const filteredServices = useMemo(() => {
    // Include services from both 'book-now' and 'by-condition' main tabs
    // First try to get featured services from both tabs
    let featured = services.filter(s => 
      s.is_featured && 
      (s.main_tab?.slug === 'book-now' || s.main_tab?.slug === 'by-condition')
    );
    
    // If no featured services, fallback to top services by display_order from both tabs
    if (featured.length === 0) {
      featured = [...services]
        .filter(s => s.main_tab?.slug === 'book-now' || s.main_tab?.slug === 'by-condition')
        .sort((a, b) => {
          if (a.display_order !== b.display_order) {
            return a.display_order - b.display_order;
          }
          return a.name.localeCompare(b.name);
        });
    }
    
    // Apply category filter if selected
    if (selectedCategory !== "all") {
      featured = featured.filter(s => s.category.id === selectedCategory);
    }
    
    // Sort by display_order, then by name
    return featured.sort((a, b) => {
      if (a.display_order !== b.display_order) {
        return a.display_order - b.display_order;
      }
      return a.name.localeCompare(b.name);
    });
  }, [services, selectedCategory]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  if (isLoading) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-[#ddd5c3] dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#c9c1b0] dark:bg-gray-800 rounded-full text-gray-900 dark:text-gray-200 text-sm sm:text-base font-semibold mb-3 sm:mb-4">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Popular Treatments</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 px-4">
              Featured Services
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
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
      <section className="py-12 sm:py-16 md:py-20 bg-[#ddd5c3] dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#c9c1b0] dark:bg-gray-800 rounded-full text-gray-900 dark:text-gray-200 text-sm sm:text-base font-semibold mb-3 sm:mb-4">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Popular Treatments</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 px-4">
              Featured Services
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              Discover our most popular aesthetic treatments
            </p>
          </div>
          
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No featured services available at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="featured-services" className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-[#f0ede7] via-[#ddd5c3] to-[#c9c1b0] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#c9c1b0] dark:bg-gray-800 rounded-full text-gray-900 dark:text-gray-200 text-sm sm:text-base font-semibold mb-3 sm:mb-4 shadow-md">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Popular Treatments</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 px-4">
            Featured Services
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
            Discover our most popular aesthetic treatments
          </p>
        </div>

        {/* Category Filters */}
        {availableCategories.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filter:</span>
              </div>
              
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === "all"
                    ? "bg-[#b5ad9d] dark:bg-[#9d9585] text-white shadow-lg scale-105"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-[#ddd5c3] dark:hover:bg-gray-700 border border-[#c9c1b0] dark:border-gray-700"
                }`}
              >
                All Services
              </button>
              
              {availableCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
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

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {paginatedServices.map((service) => {
            const gradient = getCategoryGradient(service.category.name);
            
            return (
              <div
                key={service.id}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-gray-100 dark:border-gray-700 cursor-pointer"
                onClick={() => setSelectedService(service)}
              >
                {/* Image */}
                <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br">
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
                  
                  {/* Service Name Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
                    <h3 className="text-xl sm:text-2xl font-bold text-white text-center drop-shadow-lg">
                      {service.name}
                    </h3>
                  </div>
                  
                  {/* Featured Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center px-2.5 py-1 bg-[#b5ad9d]/90 dark:bg-[#9d9585]/90 text-white text-[10px] font-bold rounded-full shadow-lg backdrop-blur-sm">
                      <Sparkles className="w-3 h-3 mr-1" />
                      FEATURED
                    </span>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center px-2.5 py-1 bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white text-[10px] font-semibold rounded-full shadow-lg backdrop-blur-sm">
                      {service.category.name}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6">
                  {/* Category */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 bg-[#ddd5c3]/50 dark:bg-[#c9c1b0]/30 text-gray-800 dark:text-gray-200 border border-[#c9c1b0]/50 dark:border-gray-600/50 rounded-full text-xs font-semibold">
                      {service.category.name}
                    </span>
                    {service.main_tab && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        • {service.main_tab.name}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {service.description && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                      {service.description}
                    </p>
                  )}

                  {/* Service Details */}
                  <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-600 dark:text-gray-400">
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

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      £{service.price.toFixed(0)}
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedService(service);
                      }}
                      className="flex items-center gap-2 text-[#9d9585] dark:text-[#c9c1b0] font-semibold hover:gap-3 transition-all hover:text-[#b5ad9d] dark:hover:text-[#ddd5c3]"
                    >
                      <span className="text-sm">Learn More</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
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
          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#b5ad9d] hover:bg-[#9d9585] dark:bg-[#9d9585] dark:hover:bg-[#b5ad9d] text-white text-base sm:text-lg font-bold rounded-full transition-all shadow-xl hover:shadow-2xl active:scale-95 w-full sm:w-auto touch-manipulation"
          >
            <span>View All Treatments</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Service Details Modal */}
      {selectedService && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedService(null)}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white px-6 sm:px-8 py-6 flex items-start justify-between rounded-t-2xl flex-shrink-0">
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">{selectedService.name}</h2>
                <div className="flex flex-wrap items-center gap-4 text-blue-100">
                  <span className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span className="text-base sm:text-lg">{selectedService.duration} minutes</span>
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold">£{selectedService.price.toFixed(0)}</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                    {selectedService.category.name}
                  </span>
                  {selectedService.main_tab && (
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                      {selectedService.main_tab.name}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors ml-4 flex-shrink-0"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
              {/* Description */}
              {selectedService.description && (
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Overview
                  </h3>
                  <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    {selectedService.description}
                  </p>
                </div>
              )}

              {/* Details */}
              {selectedService.details && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Treatment Details
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {selectedService.details}
                  </p>
                </div>
              )}

              {/* Benefits */}
              {selectedService.benefits && selectedService.benefits.length > 0 && (
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Key Benefits
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedService.benefits.map((benefit: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedService.downtime_days > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className="font-semibold text-gray-900 dark:text-white">Downtime</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{selectedService.downtime_days} day{selectedService.downtime_days !== 1 ? 's' : ''}</p>
                  </div>
                )}
                
                {selectedService.results_duration_weeks && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="font-semibold text-gray-900 dark:text-white">Results Duration</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{selectedService.results_duration_weeks} week{selectedService.results_duration_weeks !== 1 ? 's' : ''}</p>
                  </div>
                )}

                {selectedService.requires_consultation && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-gray-900 dark:text-white">Consultation Required</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">Initial consultation needed before treatment</p>
                  </div>
                )}
              </div>

              {/* Preparation */}
              {selectedService.preparation && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-500">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Preparation
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {selectedService.preparation}
                  </p>
                </div>
              )}

              {/* Aftercare */}
              {selectedService.aftercare && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border-l-4 border-purple-500">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Aftercare Instructions
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {selectedService.aftercare}
                  </p>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/book?service=${selectedService.id}`}
                  onClick={() => setSelectedService(null)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 shadow-lg hover:shadow-xl text-center"
                >
                  <Calendar className="w-5 h-5" />
                  Book This Treatment - £{selectedService.price.toFixed(0)}
                </Link>
                <Link
                  href={`/services/${selectedService.slug}`}
                  onClick={() => setSelectedService(null)}
                  className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl font-semibold transition-all duration-200"
                >
                  View Full Details
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

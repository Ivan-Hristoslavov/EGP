"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { siteConfig } from "@/config/site";
import { Search, Filter, ArrowLeft, Info, Plus, Clock, CheckCircle } from "lucide-react";
import Link from 'next/link';
import { useServices } from '@/hooks/useServices';
import { aestheticsColors } from "@/config/colors";

const categories = [
  'All',
  'Face',
  'Anti-Wrinkle Injections', 
  'Fillers',
  'Body'
];

const priceRanges = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under £200', min: 0, max: 199 },
  { label: '£200 - £400', min: 200, max: 400 },
  { label: '£400 - £600', min: 400, max: 600 },
  { label: 'Over £600', min: 600, max: Infinity }
];

const durationRanges = [
  { label: 'All Durations', min: 0, max: Infinity },
  { label: 'Under 45 min', min: 0, max: 44 },
  { label: '45 - 60 min', min: 45, max: 60 },
  { label: '60 - 90 min', min: 60, max: 90 },
  { label: 'Over 90 min', min: 90, max: Infinity }
];

function ServicesPageContent() {
  const searchParams = useSearchParams();
  const { services, isLoading: servicesLoading } = useServices();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All Prices');
  const [selectedDurationRange, setSelectedDurationRange] = useState('All Durations');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  
  const itemsPerPage = 12;

  // Create a lookup map from services for easy access
  const servicesDataMap = useMemo(() => {
    const map: Record<string, any> = {};
    services.forEach(service => {
      map[service.slug] = {
        name: service.name,
        price: service.price,
        category: service.category.name,
        duration: service.duration,
        description: service.description,
        details: service.details,
        benefits: service.benefits,
        preparation: service.preparation,
        aftercare: service.aftercare,
        requires_consultation: service.requires_consultation,
        downtime_days: service.downtime_days,
        results_duration_weeks: service.results_duration_weeks,
        is_featured: service.is_featured
      };
    });
    return map;
  }, [services]);

  // Handle URL parameters
  useEffect(() => {
    const category = searchParams.get('category');
    if (category && categories.includes(category)) {
      setSelectedCategory(category);
      setShowFilters(true);
    }
  }, [searchParams]);

  // Filter services based on selected criteria
  const filteredServices = useMemo(() => {
    return services
      .filter(service => {
        const serviceData = servicesDataMap[service.slug];
        if (!serviceData) return false;
        
        const matchesCategory = selectedCategory === 'All' || serviceData.category === selectedCategory;
        const selectedPriceRangeObj = priceRanges.find(range => range.label === selectedPriceRange);
        const matchesPrice = selectedPriceRangeObj ? (
          selectedPriceRangeObj.min <= serviceData.price && 
          selectedPriceRangeObj.max >= serviceData.price
        ) : true;
        const selectedDurationRangeObj = durationRanges.find(range => range.label === selectedDurationRange);
        const matchesDuration = selectedDurationRangeObj ? (
          selectedDurationRangeObj.min <= serviceData.duration && 
          selectedDurationRangeObj.max >= serviceData.duration
        ) : true;
        const matchesSearch = serviceData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (serviceData.description && serviceData.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                             serviceData.category.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesCategory && matchesPrice && matchesDuration && matchesSearch;
      })
      .map(service => [service.slug, servicesDataMap[service.slug]] as [string, any]);
  }, [services, servicesDataMap, selectedCategory, selectedPriceRange, selectedDurationRange, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when filters change
  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1);
    switch (filterType) {
      case 'category':
        setSelectedCategory(value);
        break;
      case 'price':
        setSelectedPriceRange(value);
        break;
      case 'duration':
        setSelectedDurationRange(value);
        break;
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const renderServiceModal = () => {
    if (!selectedService) return null;
    
    const service = servicesDataMap[selectedService];
    if (!service) return null;

  return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="bg-[#464C45] dark:bg-[#464C45] text-white px-8 py-6 flex items-center justify-between rounded-t-2xl flex-shrink-0">
            <div>
              <h2 className="text-3xl font-bold mb-2">{service.name}</h2>
              <div className="flex items-center gap-4 text-white/90">
                <span className="flex items-center gap-1 text-lg">
                <Clock className="w-5 h-5" />
                  {service.duration} minutes
                </span>
                <span className="text-2xl font-bold">£{service.price}</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{service.category}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedService(null)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6 overflow-y-auto flex-1">
            {/* Description */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Info className="w-5 h-5" style={{ color: aestheticsColors.green.DEFAULT }} />
                Overview
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                {service.description}
            </p>
          </div>

            {/* Details */}
            {service.details && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Treatment Details
                      </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {service.details}
                </p>
              </div>
            )}

            {/* Benefits */}
            {service.benefits && service.benefits.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Key Benefits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {service.benefits.map((benefit: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>
                    </div>
            )}

            {/* Preparation */}
            {service.preparation && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-500">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Preparation
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {service.preparation}
                </p>
                      </div>
            )}

            {/* Aftercare */}
            {service.aftercare && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border-l-4 border-purple-500">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Aftercare
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {service.aftercare}
                </p>
                    </div>
            )}

            {/* CTA Button */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href={`/book?service=${selectedService}`}
                onClick={() => setSelectedService(null)}
                className="w-full bg-[#464C45] hover:bg-[#3a4039] dark:bg-[#464C45] dark:hover:bg-[#3a4039] text-white py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl block text-center"
              >
                Book This Treatment - £{service.price}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Show loading state while services are being fetched
  if (servicesLoading) {
    return (
      <div className="min-h-screen bg-[#f5f1e9] dark:bg-gray-900 flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#464C45] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f1e9] dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/book"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#464C45] dark:hover:text-[#5a6259] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Booking
          </Link>
                </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 font-playfair">
            Our Services
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 font-montserrat font-light max-w-3xl mx-auto">
            Discover our comprehensive range of aesthetic treatments designed to enhance your natural beauty
                </p>
              </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-[#464C45] focus:ring-2 focus:ring-[#464C45]/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-[#464C45] hover:text-[#464C45] dark:hover:text-[#5a6259] transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>

          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-[#464C45] focus:ring-2 focus:ring-[#464C45]/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Price Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price Range
                  </label>
                  <select
                    value={selectedPriceRange}
                    onChange={(e) => handleFilterChange('price', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-[#464C45] focus:ring-2 focus:ring-[#464C45]/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {priceRanges.map(range => (
                      <option key={range.label} value={range.label}>{range.label}</option>
                    ))}
                  </select>
              </div>

                {/* Duration Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration
                  </label>
                  <select
                    value={selectedDurationRange}
                    onChange={(e) => handleFilterChange('duration', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-[#464C45] focus:ring-2 focus:ring-[#464C45]/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {durationRanges.map(range => (
                      <option key={range.label} value={range.label}>{range.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredServices.length} of {services.length} services
          </p>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedPriceRange('All Prices');
                setSelectedDurationRange('All Durations');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="text-[#464C45] dark:text-[#5a6259] hover:text-[#3a4039] dark:hover:text-[#464C45] transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Services Grid/List */}
        {paginatedServices.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No services found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedPriceRange('All Prices');
                setSelectedDurationRange('All Durations');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="bg-[#464C45] hover:bg-[#3a4039] dark:bg-[#464C45] dark:hover:bg-[#3a4039] text-white px-6 py-3 rounded-lg transition-all"
            >
              Show All Services
            </button>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
            {paginatedServices.map(([serviceId, service]) => (
              <div
                key={serviceId}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col h-full"
              >
                {/* Price Header */}
                <div className="bg-[#f5f1e9] dark:bg-gray-800 px-4 py-3 border-b border-[#ddd5c3]/60 dark:border-gray-700 relative rounded-t-xl">
                  {/* Featured Badge */}
                  {service.is_featured && (
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#464C45] text-white text-[10px] font-bold rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        FEATURED
                      </span>
                    </div>
                  )}
                    
                  {/* Duration Badge - Top Right */}
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-[#ddd5c3]/60 dark:border-gray-700/60 rounded-full text-[10px] font-semibold text-[#464C45] dark:text-gray-200">
                      <Clock className="w-3 h-3" />
                          {service.duration} min
                        </span>
                      </div>
                      
                  {/* Price - Centered */}
                  <div className="text-center pt-6 pb-2">
                    <div className="text-3xl font-bold text-[#464C45] dark:text-[#5a6259]">
                      £{service.price}
                    </div>
                      </div>
                    </div>
                    
                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  {/* Category Badge */}
                  <div className="mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 bg-[#464C45] dark:bg-[#464C45] text-white rounded-full text-xs font-semibold">
                          {service.category}
                        </span>
                      </div>
                  
                  {/* Service Name */}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-2">
                    {service.name}
                  </h3>
                  
                  {/* Description */}
                  {service.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed line-clamp-2">
                        {service.description}
                      </p>
                  )}
                  
                  {/* Service Details */}
                  <div className="space-y-1.5 mb-3 text-xs text-gray-500 dark:text-gray-400">
                    {service.requires_consultation && (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-[#464C45]" />
                        <span>Consultation Required</span>
                      </div>
                    )}
                    {service.downtime_days > 0 && (
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span>Downtime: {service.downtime_days} day{service.downtime_days !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {service.results_duration_weeks && (
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>Results: {service.results_duration_weeks} week{service.results_duration_weeks !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    </div>
                  
                  {/* Spacer to push buttons to bottom */}
                  <div className="flex-1"></div>
                  
                  {/* Buttons - Fixed at bottom */}
                  <div className="pt-3 border-t border-[#ddd5c3]/60 dark:border-gray-700">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedService(serviceId)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-[#464C45] text-[#464C45] dark:border-[#5a6259] dark:text-[#5a6259] rounded-lg hover:bg-[#f5f1e9] dark:hover:bg-gray-700/50 transition-colors font-medium text-xs"
                      >
                        <Info className="w-3.5 h-3.5" />
                        Details
                      </button>
                      <Link
                        href={`/book?service=${serviceId}`}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#464C45] hover:bg-[#3a4039] dark:bg-[#464C45] dark:hover:bg-[#3a4039] text-white rounded-lg transition-all font-medium text-xs shadow-sm hover:shadow-md"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Book
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-[#464C45] hover:text-[#464C45] dark:hover:text-[#5a6259] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-[#464C45] text-white'
                    : 'border border-gray-300 dark:border-gray-600 hover:border-[#464C45] hover:text-[#464C45] dark:hover:text-[#5a6259]'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-[#464C45] hover:text-[#464C45] dark:hover:text-[#5a6259] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Service Modal */}
        {renderServiceModal()}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f5f1e9] dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#464C45] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <ServicesPageContent />
    </Suspense>
  );
}
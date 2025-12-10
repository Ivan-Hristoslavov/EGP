"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { siteConfig } from "@/config/site";
import { Search, Filter, ArrowLeft, Info, Plus, Clock, CheckCircle, X } from "lucide-react";
import Link from 'next/link';
import { useServices } from '@/hooks/useServices';
import { aestheticsColors } from "@/config/colors";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Card, CardBody, Chip, Spinner, Select, SelectItem } from "@heroui/react";

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
      <Modal 
        isOpen={!!selectedService} 
        onClose={() => setSelectedService(null)}
        size="4xl"
        scrollBehavior="inside"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="bg-[#464C45] dark:bg-[#464C45] text-white flex flex-col gap-2">
                <h2 className="text-3xl font-bold">{service.name}</h2>
                <div className="flex items-center gap-4 text-white/90 flex-wrap">
                  <Chip 
                    startContent={<Clock className="w-4 h-4" />}
                    variant="flat"
                    className="bg-white/20 text-white"
                  >
                    {service.duration} minutes
                  </Chip>
                  <span className="text-2xl font-bold">£{service.price}</span>
                  <Chip 
                    variant="flat"
                    className="bg-white/20 text-white"
                  >
                    {service.category}
                  </Chip>
                </div>
              </ModalHeader>

              <ModalBody className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5" style={{ color: aestheticsColors.green.DEFAULT }} />
                    Overview
                  </h3>
                  <p className="text-lg text-default-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Details */}
                {service.details && (
                  <Card>
                    <CardBody>
                      <h3 className="text-xl font-bold text-foreground mb-3">
                        Treatment Details
                      </h3>
                      <p className="text-default-600 leading-relaxed">
                        {service.details}
                      </p>
                    </CardBody>
                  </Card>
                )}

                {/* Benefits */}
                {service.benefits && service.benefits.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-success" />
                      Key Benefits
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {service.benefits.map((benefit: string, index: number) => (
                        <Card key={index} className="bg-success-50 dark:bg-success-900/20">
                          <CardBody className="p-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                              <span className="text-default-700">{benefit}</span>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preparation */}
                {service.preparation && (
                  <Card className="bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary">
                    <CardBody>
                      <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                        <Info className="w-5 h-5 text-primary" />
                        Preparation
                      </h3>
                      <p className="text-default-600 leading-relaxed">
                        {service.preparation}
                      </p>
                    </CardBody>
                  </Card>
                )}

                {/* Aftercare */}
                {service.aftercare && (
                  <Card className="bg-secondary-50 dark:bg-secondary-900/20 border-l-4 border-secondary">
                    <CardBody>
                      <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                        <Info className="w-5 h-5 text-secondary" />
                        Aftercare
                      </h3>
                      <p className="text-default-600 leading-relaxed">
                        {service.aftercare}
                      </p>
                    </CardBody>
                  </Card>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  as={Link}
                  href={`/book?service=${selectedService}`}
                  onPress={onClose}
                  className="bg-[#464C45] dark:bg-[#464C45] text-white"
                  size="lg"
                >
                  Book This Treatment - £{service.price}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    );
  };

  // Show loading state while services are being fetched
  if (servicesLoading) {
    return (
      <div className="min-h-screen bg-[#f5f1e9] dark:bg-gray-900 flex items-center justify-center py-8">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-default-500">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f1e9] dark:bg-gray-900">
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#464C45] dark:hover:text-[#5a6259] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
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
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onValueChange={handleSearch}
                startContent={<Search className="w-5 h-5 text-default-400" />}
                variant="bordered"
                size="lg"
                isClearable
                onClear={() => handleSearch('')}
              />
            </div>

            {/* Filter Toggle */}
            <Button
              variant="bordered"
              onPress={() => setShowFilters(!showFilters)}
              startContent={<Filter className="w-5 h-5" />}
            >
              Filters
            </Button>

          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Filter */}
                <Select
                  label="Category"
                  selectedKeys={[selectedCategory]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    handleFilterChange('category', selected || 'All');
                  }}
                  variant="bordered"
                >
                  {categories.map(category => (
                    <SelectItem key={category}>{category}</SelectItem>
                  ))}
                </Select>

                {/* Price Filter */}
                <Select
                  label="Price Range"
                  selectedKeys={[selectedPriceRange]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    handleFilterChange('price', selected || 'All Prices');
                  }}
                  variant="bordered"
                >
                  {priceRanges.map(range => (
                    <SelectItem key={range.label}>{range.label}</SelectItem>
                  ))}
                </Select>

                {/* Duration Filter */}
                <Select
                  label="Duration"
                  selectedKeys={[selectedDurationRange]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    handleFilterChange('duration', selected || 'All Durations');
                  }}
                  variant="bordered"
                >
                  {durationRanges.map(range => (
                    <SelectItem key={range.label}>{range.label}</SelectItem>
                  ))}
                </Select>
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
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col h-full"
              >
                {/* Header (similar to conditions but with category badge) */}
                <div className="bg-[#f5f1e9] dark:bg-gray-800 px-4 py-3 border-b border-[#ddd5c3]/60 dark:border-gray-700 relative rounded-t-xl">
                  {/* Category Badge - Top Left */}
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center px-2 py-0.5 bg-[#464C45] text-white text-[10px] font-semibold rounded-full">
                      {service.category}
                    </span>
                  </div>
                  
                  {/* Duration Badge - Top Right */}
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-[#ddd5c3]/60 dark:border-gray-700/60 rounded-full text-[10px] font-semibold text-[#464C45] dark:text-gray-200">
                      <Clock className="w-3 h-3" />
                      {service.duration} min
                    </span>
                  </div>
                  
                  {/* Service Name - Centered */}
                  <div className="text-center pt-6 pb-2">
                    <h3 className="text-lg font-bold text-[#464C45] dark:text-[#5a6259] leading-tight line-clamp-2 mb-1">
                      {service.name}
                    </h3>
                    {/* Price */}
                    <div className="text-2xl font-bold text-[#464C45] dark:text-[#5a6259]">
                      £{service.price}
                    </div>
                  </div>
                </div>
                    
                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
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
                  
                  {/* Buttons */}
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => setSelectedService(serviceId)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-[#464C45] text-[#464C45] dark:text-[#5a6259] dark:border-[#5a6259] rounded-lg hover:bg-[#464C45]/10 dark:hover:bg-[#5a6259]/10 transition-colors font-medium text-sm"
                    >
                      <Info className="w-4 h-4" />
                      Details
                    </button>
                    <Link
                      href={`/book?service=${serviceId}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#ddd5c3] text-white rounded-lg hover:from-[#857d68] hover:via-[#aea693] hover:to-[#c9c1b0] transition-all font-medium text-sm shadow-md hover:shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                      Book
                    </Link>
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
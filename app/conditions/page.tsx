"use client";

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { typography, layout, textColors } from "@/config/typography";
import { Search, Filter, ArrowLeft, Info, Plus, CheckCircle } from "lucide-react";
import Link from 'next/link';
import { useConditions } from "@/hooks/useConditions";
import { useServices } from "@/hooks/useServices";
import type { Condition } from "@/hooks/useConditions";
import type { Service } from "@/hooks/useServices";
import { PriceWithDiscount } from "@/components/PriceWithDiscount";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Card, CardBody, CardHeader, Chip, Spinner, Select, SelectItem } from "@heroui/react";

/** Get price for condition by matching service slug or parsing treatments */
function getConditionPrice(condition: Condition, services: Service[]): { price: number; originalPrice?: number | null; discountPercentage?: number | null } | null {
  const match = services.find(s => s.slug === condition.slug);
  if (match) {
    const price = match.discounted_price ?? match.price;
    return {
      price: typeof price === "number" ? price : Number(price),
      originalPrice: match.discount_percentage && match.discounted_price ? match.price : null,
      discountPercentage: match.discount_percentage ?? null,
    };
  }
  const treatments = Array.isArray(condition.treatments) ? condition.treatments : [];
  const prices = treatments
    .map(t => typeof t === "string" ? t.match(/£(\d+(?:\.\d+)?)/) : null)
    .filter((m): m is RegExpMatchArray => !!m)
    .map(m => parseFloat(m[1]));
  if (prices.length > 0) {
    const min = Math.min(...prices);
    return { price: min };
  }
  return null;
}

// Category mapping: display name -> filter value
const categoryMapping: Record<string, string> = {
  'All': 'All',
  'Face Condition': 'Face Conditions',
  'Body Condition': 'Body Conditions'
};

const categories = Object.keys(categoryMapping);

// Helper function to convert category value to display name
const getCategoryDisplayName = (categoryValue: string): string => {
  const entry = Object.entries(categoryMapping).find(
    ([_, value]) => value === categoryValue
  );
  return entry ? entry[0] : categoryValue;
};


function ConditionsPageContent() {
  const searchParams = useSearchParams();
  const { conditions, isLoading: conditionsLoading } = useConditions();
  const { services } = useServices();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  
  const itemsPerPage = 12;

  // Handle URL parameters
  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      // Find the display name from the filter value
      const displayName = Object.keys(categoryMapping).find(
        key => categoryMapping[key] === category
      ) || category;
      if (displayName && categories.includes(displayName)) {
        setSelectedCategory(displayName);
        setShowFilters(true);
      }
    }
  }, [searchParams]);

  // Filter conditions based on selected criteria
  const filteredConditions = useMemo(() => {
    // Ensure conditions is always an array
    if (!Array.isArray(conditions)) {
      return [];
    }
    
    return conditions.filter((condition) => {
      // Map display name to filter value
      const categoryFilterValue = categoryMapping[selectedCategory] || selectedCategory;
      const matchesCategory = categoryFilterValue === 'All' || condition.category === categoryFilterValue;
      const matchesSearch = condition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           condition.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           condition.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [conditions, selectedCategory, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredConditions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedConditions = filteredConditions.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const renderConditionModal = () => {
    if (!selectedCondition) return null;
    if (!Array.isArray(conditions)) return null;
    
    const condition = conditions.find(c => c.slug === selectedCondition);
    if (!condition) return null;

    // Parse treatments from JSONB array
    const treatments = Array.isArray(condition.treatments) 
      ? condition.treatments 
      : typeof condition.treatments === 'string' 
        ? JSON.parse(condition.treatments) 
        : [];

    return (
      <Modal 
        isOpen={!!selectedCondition} 
        onClose={() => setSelectedCondition(null)}
        size="4xl"
        scrollBehavior="inside"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="bg-egp-green dark:bg-egp-green-dark text-white flex flex-col gap-2">
                <h2 className="text-xl sm:text-2xl font-bold">{condition.title}</h2>
              <div className="flex items-center gap-4 text-white/90">
                  <Chip 
                    variant="flat"
                    className="bg-white/20 text-white"
                  >
                    {getCategoryDisplayName(condition.category)}
                  </Chip>
          </div>
              </ModalHeader>
              <ModalBody className="space-y-6">
            {/* Description */}
            <div>
                  <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-egp-beige-darkest" />
                Overview
              </h3>
                  <p className="text-sm text-default-600 leading-relaxed">
                {condition.description}
              </p>
            </div>

            {/* Treatments */}
            {condition.treatments && condition.treatments.length > 0 && (
              <div>
                    <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-egp-green" />
                  Available Treatments
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {condition.treatments.map((treatment, index) => (
                        <Card key={index} className="bg-egp-green-bg-light dark:bg-egp-green-dark/20">
                          <CardBody className="p-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle className="w-4 h-4 text-egp-green flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-default-700">{treatment}</span>
                    </div>
                          </CardBody>
                        </Card>
                  ))}
                </div>
              </div>
            )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  as={Link}
                  href={
                    (() => {
                      const match = services.find((s) => s.slug === condition.slug);
                      return match?.id ? `/book?pendingServiceId=${match.id}` : "/book";
                    })()
                  }
                  onPress={onClose}
                  className="bg-egp-green dark:bg-egp-green-dark text-white hover:opacity-90"
                  size="lg"
                >
                Book Treatment for This Condition
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    );
  };

  if (conditionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className={`${layout.containerWide}`}>
          <div className="text-center py-20">
            <Spinner size="lg" />
            <p className="mt-4 text-default-500">Loading conditions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f1e9] dark:bg-gray-900">
      <div className={`${layout.containerWide} pt-20 sm:pt-24 pb-8 sm:pb-12`}>
        {/* Header - Back on left, Conditions We Treat centered */}
        <div className="relative flex items-center justify-between mb-3 sm:mb-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#9d9585] dark:hover:text-[#b5ad9d] transition-colors flex-shrink-0 z-10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <h1 className={`absolute left-1/2 -translate-x-1/2 text-base sm:text-xl md:text-2xl font-bold ${textColors.heading} font-playfair`}>
            Conditions We Treat
          </h1>
          <div className="w-14 sm:w-20" aria-hidden />
        </div>

        <div className="text-center mb-6 sm:mb-8">
          <p className={`${typography.lead} font-montserrat font-light max-w-2xl mx-auto text-sm sm:text-base`}>
            Discover our comprehensive range of treatments for various aesthetic concerns and conditions
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-5 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Search conditions..."
                value={searchTerm}
                onValueChange={handleSearch}
                startContent={<Search className="w-4 h-4 text-default-400" />}
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
              startContent={<Filter className="w-4 h-4" />}
            >
              Filters
            </Button>

          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Category Filter */}
                <Select
                  label="Category"
                  selectedKeys={[selectedCategory]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setSelectedCategory(selected || 'All');
                  }}
                  variant="bordered"
                  >
                    {categories.map(category => (
                    <SelectItem key={category}>{category}</SelectItem>
                    ))}
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className={`${typography.small}`}>
            Showing {filteredConditions.length} of {Array.isArray(conditions) ? conditions.length : 0} conditions
          </p>
          {(selectedCategory !== 'All' || searchTerm) && (
            <Button
              onPress={() => {
                setSelectedCategory('All');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              variant="light"
              size="sm"
              className="text-egp-green dark:text-egp-green-light hover:text-egp-green-dark"
            >
              Clear all filters
            </Button>
          )}
        </div>

        {/* Conditions Grid/List */}
        {paginatedConditions.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No conditions found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters or search terms
            </p>
            <Button
              onPress={() => {
                setSelectedCategory('All');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="bg-egp-green hover:bg-egp-green-dark text-white"
              size="md"
            >
              Show All Conditions
            </Button>
          </div>
        ) : (
          <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
            {paginatedConditions.map((condition) => (
              <Card
                key={condition.id}
                className="h-full"
                shadow="sm"
              >
                <CardHeader className="bg-egp-beige-lighter dark:bg-egp-green-dark px-2 sm:px-2.5 py-2 sm:py-2.5 border-b border-egp-beige-dark/60 dark:border-egp-green flex flex-col items-center text-center">
                  {/* Category Badge - Centered */}
                  <div className="flex justify-center mb-1.5">
                    <Chip
                      size="sm"
                      className="bg-egp-green text-white text-[8px] h-5"
                      variant="flat"
                    >
                      {getCategoryDisplayName(condition.category)}
                    </Chip>
                  </div>

                  {/* Title and Price - Centered */}
                  <div className="w-full">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 mb-0.5">
                      {condition.title}
                    </h3>
                    {(() => {
                      const priceInfo = getConditionPrice(condition, services);
                      if (!priceInfo) return null;
                      return (
                        <div className="flex justify-center">
                          <PriceWithDiscount
                            price={priceInfo.price}
                            originalPrice={priceInfo.originalPrice}
                            discountPercentage={priceInfo.discountPercentage}
                            size="sm"
                            layout="stack"
                            align="center"
                          />
                        </div>
                      );
                    })()}
                  </div>
                </CardHeader>

                <CardBody
                  className="p-2 sm:p-2.5 flex flex-col flex-1 cursor-pointer min-h-0 items-center text-center"
                  onClick={() => setSelectedCondition(condition.slug)}
                >
                  {/* Description */}
                  {condition.description && (
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 mb-2 leading-snug line-clamp-2 w-full">
                      {condition.description}
                    </p>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-1 mt-auto pt-1 justify-center w-full" onClick={(e) => e.stopPropagation()}>
                    <Button
                      onPress={() => setSelectedCondition(condition.slug)}
                      variant="bordered"
                      size="sm"
                      className="flex-1 min-w-0 border-egp-green text-egp-green dark:text-white dark:border-egp-green text-xs h-8"
                      startContent={<Info className="w-2.5 h-2.5" />}
                    >
                      Details
                    </Button>
                    <Link
                      href={
                        (() => {
                          const match = services.find(s => s.slug === condition.slug);
                          return match?.id ? `/book?pendingServiceId=${match.id}` : "/book";
                        })()
                      }
                    >
                      <Button
                        size="sm"
                        className="flex-1 w-full min-w-0 bg-egp-green text-white text-xs h-8"
                        startContent={<Plus className="w-2.5 h-2.5" />}
                      >
                        Book
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination - matches services */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
              isDisabled={currentPage === 1}
              variant="bordered"
              size="sm"
              className="border-gray-300 dark:border-gray-600 hover:border-egp-green hover:text-egp-green"
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onPress={() => setCurrentPage(page)}
                size="sm"
                variant={currentPage === page ? "solid" : "bordered"}
                className={
                  currentPage === page
                    ? "bg-egp-green text-white"
                    : "border-gray-300 dark:border-gray-600 hover:border-egp-green hover:text-egp-green"
                }
              >
                {page}
              </Button>
            ))}
            <Button
              onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              isDisabled={currentPage === totalPages}
              variant="bordered"
              size="sm"
              className="border-gray-300 dark:border-gray-600 hover:border-egp-green hover:text-egp-green"
            >
              Next
            </Button>
          </div>
        )}

        {/* Condition Modal */}
        {renderConditionModal()}
      </div>
    </div>
  );
}

export default function ConditionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-egp-green mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <ConditionsPageContent />
    </Suspense>
  );
}
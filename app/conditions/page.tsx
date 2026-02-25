"use client";

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { siteConfig } from "@/config/site";
import { typography, layout, textColors } from "@/config/typography";
import { Search, Filter, ArrowLeft, Info, Plus, CheckCircle, X } from "lucide-react";
import Link from 'next/link';
import { useConditions } from "@/hooks/useConditions";
import type { Condition } from "@/hooks/useConditions";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Card, CardBody, Chip, Spinner, Select, SelectItem, Pagination } from "@heroui/react";

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
  const { conditions, isLoading } = useConditions();
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
              <ModalHeader className="bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#ddd5c3] text-white flex flex-col gap-2">
                <h2 className="text-3xl font-bold">{condition.title}</h2>
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
                href="/book/new"
                  onPress={onClose}
                  className="bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#ddd5c3] text-white"
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

  if (isLoading) {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={`${layout.containerWide} pt-24 pb-16`}>
        {/* Header - Back on left, Conditions We Treat centered */}
        <div className="relative flex items-center justify-between mb-4 sm:mb-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#9d9585] dark:hover:text-[#b5ad9d] transition-colors flex-shrink-0 z-10"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <h1 className={`absolute left-1/2 -translate-x-1/2 text-lg sm:text-2xl md:text-3xl font-bold ${textColors.heading} font-playfair`}>
            Conditions We Treat
          </h1>
          <div className="w-14 sm:w-20" aria-hidden />
        </div>

        <div className="text-center mb-12">
          <p className={`${typography.lead} font-montserrat font-light max-w-3xl mx-auto`}>
            Discover our comprehensive range of treatments for various aesthetic concerns and conditions
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
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
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredConditions.length} of {Array.isArray(conditions) ? conditions.length : 0} conditions
          </p>
          {(selectedCategory !== 'All' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="text-[#9d9585] dark:text-[#b5ad9d] hover:text-[#857d68] dark:hover:text-[#c9c1b0] transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Conditions Grid/List */}
        {paginatedConditions.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">No conditions found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#ddd5c3] text-white px-6 py-3 rounded-lg hover:from-[#857d68] hover:via-[#aea693] hover:to-[#c9c1b0] transition-all"
            >
              Show All Conditions
            </button>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
            {paginatedConditions.map((condition) => (
              <div
                key={condition.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col h-full"
              >
                {/* Header (similar to services but without price) */}
                <div className="bg-[#f5f1e9] dark:bg-gray-800 px-4 py-3 border-b border-[#ddd5c3]/60 dark:border-gray-700 relative rounded-t-xl">
                  {/* Category Badge - Top Left */}
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center px-2 py-0.5 bg-[#464C45] text-white text-[10px] font-semibold rounded-full">
                      {getCategoryDisplayName(condition.category)}
                    </span>
                        </div>
                  
                  {/* Title - Centered */}
                  <div className="text-center pt-6 pb-2">
                    <h3 className="text-base font-bold text-egp-green dark:text-egp-green-light leading-tight line-clamp-2">
                      {condition.title}
                    </h3>
                      </div>
                    </div>
                    
                    {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  {/* Description */}
                  {condition.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed line-clamp-3 flex-1">
                        {condition.description}
                      </p>
                  )}
                      
                      {/* Buttons */}
                  <div className="flex gap-2 mt-auto">
                        <button
                          onClick={() => setSelectedCondition(condition.slug)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-[#464C45] text-[#464C45] dark:text-[#5a6259] dark:border-[#5a6259] rounded-lg hover:bg-[#464C45]/10 dark:hover:bg-[#5a6259]/10 transition-colors font-medium text-sm"
                        >
                          <Info className="w-3.5 h-3.5" />
                          Details
                        </button>
                        <Link
                          href="/book/new"
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#ddd5c3] text-white rounded-lg hover:from-[#857d68] hover:via-[#aea693] hover:to-[#c9c1b0] transition-all font-medium text-sm shadow-md hover:shadow-lg"
                        >
                          <Plus className="w-3.5 h-3.5" />
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
          <div className="flex justify-center items-center mt-8">
            <Pagination
              total={totalPages}
              page={currentPage}
              onChange={setCurrentPage}
              color="primary"
              classNames={{
                wrapper: "gap-0",
                item: "w-8 h-8 text-small rounded-lg",
                cursor: "bg-gradient-to-br from-egp-beige-darkest to-egp-beige-dark text-white font-bold",
              }}
            />
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
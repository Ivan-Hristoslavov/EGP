"use client";

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { siteConfig } from "@/config/site";
import { Search, Filter, Grid, List, ArrowLeft, Info, Plus, Clock, CheckCircle } from "lucide-react";
import Link from 'next/link';
import { useConditions } from "@/hooks/useConditions";
import type { Condition } from "@/hooks/useConditions";

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white px-8 py-6 flex items-center justify-between rounded-t-2xl flex-shrink-0">
            <div>
              <h2 className="text-3xl font-bold mb-2">{condition.title}</h2>
              <div className="flex items-center gap-4 text-rose-100">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{getCategoryDisplayName(condition.category)}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedCondition(null)}
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
                <Info className="w-5 h-5 text-rose-500" />
                Overview
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                {condition.description}
              </p>
            </div>

            {/* Treatments */}
            {condition.treatments && condition.treatments.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Available Treatments
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {condition.treatments.map((treatment, index) => (
                    <div key={index} className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{treatment}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Button */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href={`/book?condition=${selectedCondition}`}
                onClick={() => setSelectedCondition(null)}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl block text-center"
              >
                Book Treatment for This Condition
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading conditions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 font-playfair">
            Conditions We Treat
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 font-montserrat font-light max-w-3xl mx-auto">
            Discover our comprehensive range of treatments for various aesthetic concerns and conditions
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
                placeholder="Search conditions..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>

            {/* View Mode */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-rose-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-rose-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
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
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
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
            Showing {filteredConditions.length} of {Array.isArray(conditions) ? conditions.length : 0} conditions
          </p>
          {(selectedCategory !== 'All' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
            >
              Clear all filters
            </button>
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
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all"
            >
              Show All Conditions
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {paginatedConditions.map((condition) => (
              <div
                key={condition.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden ${
                  viewMode === 'list' ? 'flex items-center p-8' : 'p-0'
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Image Placeholder */}
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10"></div>
                      <div className="text-center z-10">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Condition Image</p>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{condition.title}</h3>
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-3">
                          {getCategoryDisplayName(condition.category)}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed text-sm line-clamp-2">
                        {condition.description}
                      </p>
                      
                      {/* Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => setSelectedCondition(condition.slug)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-medium text-sm"
                        >
                          <Info className="w-4 h-4" />
                          Details
                        </button>
                        <Link
                          href={`/book?condition=${condition.slug}`}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all font-medium text-sm shadow-md hover:shadow-lg"
                        >
                          <Plus className="w-4 h-4" />
                          Book
                        </Link>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* List View with Image */}
                    <div className="w-32 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg flex items-center justify-center mr-6 flex-shrink-0">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-1">
                          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400">Image</p>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{condition.title}</h3>
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-4">
                          {getCategoryDisplayName(condition.category)}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                        {condition.description}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-6 flex-shrink-0">
                      <button
                        onClick={() => setSelectedCondition(condition.slug)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 border border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-medium text-sm"
                      >
                        <Info className="w-4 h-4" />
                        Details
                      </button>
                      <Link
                        href={`/book?condition=${condition.slug}`}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all font-medium text-sm shadow-md hover:shadow-lg"
                      >
                        <Plus className="w-4 h-4" />
                        Book
                      </Link>
                    </div>
                  </>
                )}
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
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-rose-500 text-white'
                    : 'border border-gray-300 dark:border-gray-600 hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <ConditionsPageContent />
    </Suspense>
  );
}
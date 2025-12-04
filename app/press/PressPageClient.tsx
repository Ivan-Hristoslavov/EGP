"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { Award, FileText, Star, ArrowLeft, ChevronDown, Filter, X } from "lucide-react";

interface PressItem {
  id: string;
  type: 'award' | 'press_feature';
  title: string;
  organisation?: string | null;
  publication?: string | null;
  year?: string | null;
  date?: string | null;
  description?: string | null;
  image_url?: string | null;
  is_featured: boolean;
  display_order: number;
}

interface PressPageClientProps {
  awards: PressItem[];
  pressFeatures: PressItem[];
}

export function PressPageClient({ awards, pressFeatures }: PressPageClientProps) {
  // Filter state
  const [activeFilter, setActiveFilter] = useState<'all' | 'award' | 'press'>('all');
  
  // State to track expanded descriptions
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  
  // State for modal
  const [selectedItem, setSelectedItem] = useState<PressItem | null>(null);
  const [modalDescriptionExpanded, setModalDescriptionExpanded] = useState(false);
  
  const toggleDescription = (itemId: string) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Combine and filter items
  let filteredItems: PressItem[] = [];
  
  if (activeFilter === 'all') {
    filteredItems = [...awards, ...pressFeatures];
  } else if (activeFilter === 'award') {
    filteredItems = awards;
  } else {
    filteredItems = pressFeatures;
  }

  // Sort by display_order first (primary), then featured status, then by date/year (newest first)
  filteredItems.sort((a, b) => {
    // Primary sort: display_order (ascending - lower numbers first)
    if (a.display_order !== b.display_order) {
      return a.display_order - b.display_order;
    }
    
    // Secondary sort: Featured items first (within same display_order)
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    
    // Tertiary sort: by date/year (newest first)
    const dateA = a.type === 'award' 
      ? (a.year ? parseInt(a.year) : 0)
      : (a.date ? new Date(a.date).getTime() : 0);
    const dateB = b.type === 'award'
      ? (b.year ? parseInt(b.year) : 0)
      : (b.date ? new Date(b.date).getTime() : 0);
    
    return dateB - dateA;
  });

  const featuredItems = filteredItems.filter(item => item.is_featured);
  const regularItems = filteredItems.filter(item => !item.is_featured);
  
  // Function to group items into rows ensuring no empty space
  const groupItemsIntoRows = (items: PressItem[], isFeatured: boolean) => {
    if (items.length === 0) return [];
    
    const rows: Array<{ items: PressItem[]; rowType: 'large-small' | 'three-small' | 'small-large' }> = [];
    let i = 0;
    let patternIndex = 0;
    
    while (i < items.length) {
      const remaining = items.length - i;
      const patternType = patternIndex % 3;
      
      // If we have few items left, adjust pattern to fill row
      if (remaining === 1) {
        // Only one item left - use large-small type but will render as full width
        rows.push({ items: [items[i]], rowType: 'large-small' });
        i++;
        break;
      } else if (remaining === 2) {
        // Two items left - use large-small pattern
        rows.push({ items: [items[i], items[i + 1]], rowType: 'large-small' });
        i += 2;
        break;
      } else if (remaining === 3) {
        // Three items left - use three-small pattern
        rows.push({ items: [items[i], items[i + 1], items[i + 2]], rowType: 'three-small' });
        i += 3;
        break;
      }
      
      // Normal pattern application
      if (patternType === 0) {
        // Pattern: Large + Small (8 + 4 = 12)
        rows.push({ items: [items[i], items[i + 1]], rowType: 'large-small' });
        i += 2;
      } else if (patternType === 1) {
        // Pattern: 3 Small (4 + 4 + 4 = 12)
        rows.push({ items: [items[i], items[i + 1], items[i + 2]], rowType: 'three-small' });
        i += 3;
      } else {
        // Pattern: Small + Large (4 + 8 = 12)
        rows.push({ items: [items[i], items[i + 1]], rowType: 'small-large' });
        i += 2;
      }
      
      patternIndex++;
    }
    
    return rows;
  };
  
  // Function to get card size based on row type and position
  const getCardSizeFromRow = (rowType: string, positionInRow: number, isFeatured: boolean, isFirstFeatured: boolean, totalItemsInRow?: number) => {
    if (isFirstFeatured) {
      return { colSpan: 'col-span-12 lg:col-span-8', height: 'h-[350px] sm:h-[420px] md:h-[480px] lg:h-[520px]', isLarge: true };
    }
    
    if (isFeatured) {
      return { colSpan: 'col-span-12 sm:col-span-6 lg:col-span-4', height: 'h-[320px] sm:h-[380px] md:h-[420px]', isLarge: false };
    }
    
    // If only one item in row, make it full width to avoid empty space
    if (totalItemsInRow === 1) {
      return { colSpan: 'col-span-12', height: 'h-[350px] sm:h-[420px] md:h-[480px]', isLarge: true };
    }
    
    if (rowType === 'large-small') {
      if (positionInRow === 0) {
        return { colSpan: 'col-span-12 lg:col-span-8', height: 'h-[350px] sm:h-[420px] md:h-[480px]', isLarge: true };
      } else {
        return { colSpan: 'col-span-12 sm:col-span-6 lg:col-span-4', height: 'h-[320px] sm:h-[380px] md:h-[420px]', isLarge: false };
      }
    } else if (rowType === 'three-small') {
      return { colSpan: 'col-span-12 sm:col-span-6 lg:col-span-4', height: 'h-[320px] sm:h-[380px] md:h-[420px]', isLarge: false };
    } else { // small-large
      if (positionInRow === 0) {
        return { colSpan: 'col-span-12 sm:col-span-6 lg:col-span-4', height: 'h-[320px] sm:h-[380px] md:h-[420px]', isLarge: false };
      } else {
        return { colSpan: 'col-span-12 lg:col-span-8', height: 'h-[350px] sm:h-[420px] md:h-[480px]', isLarge: true };
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Back to Home Button */}
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#9d9585] dark:hover:text-[#b5ad9d] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
          
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 font-playfair">
              Awards & Press
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 font-montserrat font-light max-w-3xl mx-auto mb-4">
              Recognition for our commitment to excellence in aesthetic medicine.
            </p>
            
            {/* Filter Buttons */}
            <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeFilter === 'all'
                    ? 'bg-[#9d9585] text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                All ({awards.length + pressFeatures.length})
              </button>
              <button
                onClick={() => setActiveFilter('award')}
                className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeFilter === 'award'
                    ? 'bg-[#9d9585] text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Award className="w-4 h-4" />
                Awards ({awards.length})
              </button>
              <button
                onClick={() => setActiveFilter('press')}
                className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeFilter === 'press'
                    ? 'bg-[#9d9585] text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                Press ({pressFeatures.length})
              </button>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No press items available
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Check back soon for awards and press features.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {/* Featured Items */}
              {featuredItems.map((item, index) => {
                const isFirstFeatured = index === 0;
                const cardSize = getCardSizeFromRow(
                  isFirstFeatured ? 'large-small' : 'three-small',
                  isFirstFeatured ? 0 : index - 1,
                  true,
                  isFirstFeatured
                );
                const colSpan = cardSize.colSpan;
                const height = cardSize.height;
                const isLarge = cardSize.isLarge;
                
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`${colSpan} ${height} group relative rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 hover:scale-[1.02] active:scale-[0.98]`}
                  >
                    {/* Image Background */}
                    {item.image_url ? (
                      <>
                        <div className="absolute inset-0">
                          <div className="relative w-full h-full">
                            <Image
                              src={item.image_url}
                              alt={item.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 z-[1]" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#9d9585] via-[#b5ad9d] to-[#ddd5c3]" />
                    )}

                    {/* Badges - Top Right */}
                    <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 items-end">
                      {item.is_featured && (
                        <span className="px-2.5 py-1.5 bg-yellow-500/90 text-white text-[10px] font-bold rounded-full flex items-center gap-1.5 shadow-lg">
                          <Star className="w-3 h-3" />
                          Featured
                        </span>
                      )}
                      <span className={`px-2.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg text-[10px] font-bold ${
                        item.type === 'award' 
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white' 
                          : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                      }`}>
                        {item.type === 'award' ? (
                          <Award className="w-3 h-3" />
                        ) : (
                          <FileText className="w-3 h-3" />
                        )}
                        {item.type === 'award' ? 'Award' : 'Press'}
                      </span>
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 sm:p-5 md:p-6">
                      {/* Title - Top Left */}
                      <div className="flex flex-col items-start">
                        <h3 className={`text-white font-bold mb-2 ${index === 0 ? 'text-xl sm:text-2xl md:text-3xl lg:text-4xl' : 'text-lg sm:text-xl md:text-2xl'} leading-tight drop-shadow-lg`}>
                          {item.title}
                        </h3>
                      </div>

                      {/* Footer */}
                      <div className="bg-white/10 dark:bg-black/30 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20 dark:border-white/10">
                        <div
                          className="w-full"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex flex-col flex-1">
                              <p className="text-white/90 font-semibold text-sm sm:text-base">
                                {item.type === 'award' 
                                  ? item.organisation || 'Award Recognition'
                                  : item.publication || 'Media Feature'}
                              </p>
                              <p className="text-white/70 text-xs sm:text-sm">
                                {item.type === 'award' 
                                  ? item.year || new Date(item.date || '').getFullYear() || ''
                                  : item.date ? new Date(item.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' }) : ''}
                              </p>
                            </div>
                            {item.description && (
                              <ChevronDown 
                                className={`w-4 h-4 sm:w-5 sm:h-5 text-white/80 transition-transform duration-300 flex-shrink-0 ${
                                  expandedDescriptions.has(item.id) ? 'rotate-180' : ''
                                }`}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Regular Items - Row-based Layout */}
              {(() => {
                const rows = groupItemsIntoRows(regularItems, false);
                return rows.flatMap((row, rowIndex) =>
                  row.items.map((item, itemIndex) => {
                    const cardSize = getCardSizeFromRow(row.rowType, itemIndex, false, false, row.items.length);
                    const colSpan = cardSize.colSpan;
                    const height = cardSize.height;
                    const isLarge = cardSize.isLarge;
                
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`${colSpan} ${height} group relative rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 hover:scale-[1.02] active:scale-[0.98]`}
                  >
                    {/* Image Background */}
                    {item.image_url ? (
                      <>
                        <div className="absolute inset-0">
                          <div className="relative w-full h-full">
                            <Image
                              src={item.image_url}
                              alt={item.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20 z-[1]" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#9d9585] via-[#b5ad9d] to-[#ddd5c3]" />
                    )}

                    {/* Badges - Top Right */}
                    <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 items-end">
                      {item.is_featured && (
                        <span className="px-2.5 py-1.5 bg-yellow-500/90 text-white text-[10px] font-bold rounded-full flex items-center gap-1.5 shadow-lg">
                          <Star className="w-3 h-3" />
                          Featured
                        </span>
                      )}
                      <span className={`px-2.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg text-[10px] font-bold ${
                        item.type === 'award' 
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white' 
                          : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                      }`}>
                        {item.type === 'award' ? (
                          <Award className="w-3 h-3" />
                        ) : (
                          <FileText className="w-3 h-3" />
                        )}
                        {item.type === 'award' ? 'Award' : 'Press'}
                      </span>
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 sm:p-5 md:p-6">
                      {/* Title - Top Left */}
                      <div className="flex flex-col items-start">
                        <h3 className={`text-white font-bold mb-2 leading-tight line-clamp-2 drop-shadow-lg ${isLarge ? 'text-lg sm:text-xl md:text-2xl lg:text-3xl' : 'text-base sm:text-lg md:text-xl'}`}>
                          {item.title}
                        </h3>
                      </div>

                      {/* Footer */}
                      <div className="bg-white/10 dark:bg-black/30 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20 dark:border-white/10">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-col flex-1">
                            <p className="text-white/90 font-semibold text-xs sm:text-sm">
                              {item.type === 'award' 
                                ? item.organisation || 'Award Recognition'
                                : item.publication || 'Media Feature'}
                            </p>
                            <p className="text-white/70 text-[10px] sm:text-xs">
                              {item.type === 'award' 
                                ? item.year || new Date(item.date || '').getFullYear() || ''
                                : item.date ? new Date(item.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' }) : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                  })
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 dark:bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => {
            setSelectedItem(null);
            setModalDescriptionExpanded(false);
          }}
        >
          <div 
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Section with Description Overlay */}
            <div className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] overflow-hidden flex-shrink-0">
              {selectedItem.image_url ? (
                <Image
                  src={selectedItem.image_url}
                  alt={selectedItem.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#9d9585] via-[#b5ad9d] to-[#ddd5c3]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 z-[1]" />
              
              {/* Close Button - Top Right */}
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setModalDescriptionExpanded(false);
                }}
                className="absolute top-4 right-4 z-[100] p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-md hover:bg-white dark:hover:bg-gray-800 text-gray-900 dark:text-white shadow-lg hover:scale-110 transition-all duration-200"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Title and Metadata - Top Left */}
              <div className="absolute top-4 left-4 z-10 max-w-[70%] sm:max-w-[75%]">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 leading-tight drop-shadow-lg">
                  {selectedItem.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-white/90">
                  {selectedItem.type === 'award' ? (
                    <>
                      {selectedItem.organisation && (
                        <span className="text-xs sm:text-sm md:text-base font-semibold drop-shadow-md">
                          {selectedItem.organisation}
                        </span>
                      )}
                      {selectedItem.year && (
                        <span className="text-xs sm:text-sm md:text-base drop-shadow-md">
                          {selectedItem.year}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {selectedItem.publication && (
                        <span className="text-xs sm:text-sm md:text-base font-semibold drop-shadow-md">
                          {selectedItem.publication}
                        </span>
                      )}
                      {selectedItem.date && (
                        <span className="text-xs sm:text-sm md:text-base drop-shadow-md">
                          {new Date(selectedItem.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Badges - Top Right (in one line, below close button) */}
              <div className="absolute top-16 sm:top-20 right-4 z-10 flex flex-row gap-2 items-start flex-wrap justify-end">
                {selectedItem.is_featured && (
                  <span className="px-2.5 sm:px-3 py-1.5 bg-yellow-500/90 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center gap-1.5 shadow-lg">
                    <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    Featured
                  </span>
                )}
                <span className={`px-2.5 sm:px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg text-[10px] sm:text-xs font-bold ${
                  selectedItem.type === 'award' 
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                }`}>
                  {selectedItem.type === 'award' ? (
                    <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  ) : (
                    <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  )}
                  {selectedItem.type === 'award' ? 'Award' : 'Press'}
                </span>
              </div>
              
              {/* Description Overlay - Bottom */}
              {selectedItem.description && (
                <div className="absolute bottom-0 left-0 right-0 z-10 p-4 sm:p-5 md:p-6">
                  <div className="bg-white/10 dark:bg-black/30 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/20 dark:border-white/10">
                    <button
                      onClick={() => setModalDescriptionExpanded(!modalDescriptionExpanded)}
                      className="w-full cursor-pointer hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3 p-3 sm:p-4">
                        <div className="flex flex-col flex-1 text-left">
                          <p className="text-white/90 font-semibold text-sm sm:text-base mb-1">
                            Description
                          </p>
                          {!modalDescriptionExpanded && (
                            <p className="text-white/70 text-xs sm:text-sm line-clamp-2">
                              {selectedItem.description.substring(0, 100)}...
                            </p>
                          )}
                        </div>
                        <ChevronDown 
                          className={`w-4 h-4 sm:w-5 sm:h-5 text-white/80 transition-transform duration-300 flex-shrink-0 ${
                            modalDescriptionExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>
                    {modalDescriptionExpanded && (
                      <div 
                        className="transition-all duration-300 ease-in-out description-scroll"
                      >
                        <div className="text-white/95 leading-relaxed pt-2 border-t border-white/10 px-3 sm:px-4 pb-3 sm:pb-4 max-h-[200px] sm:max-h-[250px] md:max-h-[300px] overflow-y-auto text-sm sm:text-base">
                          {selectedItem.description}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



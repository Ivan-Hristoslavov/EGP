"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Move } from "lucide-react";

interface BeforeAfterItem {
  id: string;
  title: string;
  category: string;
  before_image_url: string;
  after_image_url: string;
  description?: string;
}

interface BeforeAfterSlideLineProps {
  items: BeforeAfterItem[];
  className?: string;
}

export default function BeforeAfterSlideLine({ items, className = "" }: BeforeAfterSlideLineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = items[currentIndex];

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const previous = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX);
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart;
    setDragOffset(deltaX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Determine if we should switch images based on drag distance
    const threshold = 50;
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        previous();
      } else {
        next();
      }
    }
    setDragOffset(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientX);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - dragStart;
    setDragOffset(deltaX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 50;
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        previous();
      } else {
        next();
      }
    }
    setDragOffset(0);
  };

  if (!items.length) {
    return (
      <div className={`py-12 bg-gray-50 dark:bg-gray-900 ${className}`}>
        <div className="container mx-auto px-4 text-center">
          <div className="text-gray-500 dark:text-gray-400">
            No before and after images available
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className={`py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 text-sm sm:text-base font-semibold mb-3 sm:mb-4">
            Real Results
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 px-4">
            Before & After Gallery
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
            See the natural, beautiful transformations we've achieved for our clients
          </p>
        </div>

        {/* Main Before/After Comparison */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
            {/* Interactive Before/After Container */}
            <div 
              ref={containerRef}
              className="relative aspect-[16/10] overflow-hidden cursor-col-resize select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* After Image (Background) */}
              <div className="absolute inset-0">
                <img
                  src={current.after_image_url}
                  alt={`${current.title} - After`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                  After
                </div>
              </div>

              {/* Before Image (Overlay with drag control) */}
              <div 
                className="absolute inset-0 overflow-hidden"
                style={{
                  clipPath: `inset(0 ${50 - (dragOffset / 20)}% 0 0)`,
                  transition: isDragging ? 'none' : 'clip-path 0.3s ease'
                }}
              >
                <img
                  src={current.before_image_url}
                  alt={`${current.title} - Before`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                  Before
                </div>
              </div>

              {/* Drag Handle */}
              <div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg cursor-col-resize z-10"
                style={{
                  transform: `translate(${-50 + (dragOffset / 20)}%, -50%)`,
                  transition: isDragging ? 'none' : 'transform 0.3s ease'
                }}
              >
                <Move className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </div>

              {/* Drag Instructions */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                Drag to compare • Swipe to navigate
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={previous}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-all shadow-lg z-20"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-all shadow-lg z-20"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Image Info */}
          <div className="text-center mt-6">
            <div className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-2">
              {current.category}
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {current.title}
            </h3>
            {current.description && (
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {current.description}
              </p>
            )}
          </div>
        </div>

        {/* Thumbnail Navigation */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {items.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(index)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                  currentIndex === index
                    ? "border-blue-500 scale-105 shadow-lg"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                }`}
              >
                <div className="relative w-full h-full">
                  <img
                    src={item.before_image_url}
                    alt={`${item.title} - Before`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="text-xs text-white font-medium truncate">
                      {item.title}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  currentIndex === index
                    ? "bg-blue-500 scale-125"
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center mt-8 px-4">
          Results may vary. All photos published with patient consent. Individual results depend on various factors.
        </p>
      </div>
    </section>
  );
}




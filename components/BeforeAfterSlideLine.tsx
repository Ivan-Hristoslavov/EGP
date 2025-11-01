"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Move } from "lucide-react";

interface BeforeAfterItem {
  id: string;
  title: string;
  category: string;
  service?: string;
  project_type?: string;
  location?: string;
  completion_date?: string;
  before_image_url: string;
  after_image_url: string;
  description?: string;
  categoryData?: {
    id: string;
    name: string;
    slug: string;
    main_tab?: {
      id: string;
      name: string;
      slug: string;
    };
  };
  serviceData?: {
    id: string;
    name: string;
    category?: {
      id: string;
      name: string;
      slug: string;
      main_tab?: {
        id: string;
        name: string;
        slug: string;
      };
    };
  };
}

interface BeforeAfterSlideLineProps {
  items: BeforeAfterItem[];
  className?: string;
}

export default function BeforeAfterSlideLine({ items, className = "" }: BeforeAfterSlideLineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50); // Start at 50% (middle)
  const [dragStart, setDragStart] = useState(0);
  const [startPosition, setStartPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = items[currentIndex];

  // Global mouse move handler for dragging outside container
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const percent = (mouseX / rect.width) * 100;
      const newPosition = Math.max(0, Math.min(100, percent));
      setSliderPosition(newPosition);
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!containerRef.current || !e.touches[0]) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      const percent = (touchX / rect.width) * 100;
      const newPosition = Math.max(0, Math.min(100, percent));
      setSliderPosition(newPosition);
    };

    const handleGlobalTouchEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    window.addEventListener('touchend', handleGlobalTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging]);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setSliderPosition(50); // Reset to center when changing images
  };

  const previous = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setSliderPosition(50); // Reset to center when changing images
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart(e.clientX);
    setStartPosition(sliderPosition);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const percent = (mouseX / rect.width) * 100;
    
    // Constrain between 0% and 100% - allows dragging to edges
    const newPosition = Math.max(0, Math.min(100, percent));
    setSliderPosition(newPosition);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart(touch.clientX);
    setStartPosition(sliderPosition);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const percent = (touchX / rect.width) * 100;
    
    // Constrain between 0% and 100%
    const newPosition = Math.max(0, Math.min(100, percent));
    setSliderPosition(newPosition);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
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
              onMouseMove={handleMouseMove}
              onMouseDown={(e) => {
                // Allow clicking anywhere on the container to set position
                if (!containerRef.current) return;
                const rect = containerRef.current.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const percent = (mouseX / rect.width) * 100;
                const newPosition = Math.max(0, Math.min(100, percent));
                setSliderPosition(newPosition);
                setIsDragging(true);
                setDragStart(e.clientX);
              }}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => setIsDragging(false)}
              onTouchStart={(e) => {
                // Allow touching anywhere on the container to set position
                if (!containerRef.current) return;
                const touch = e.touches[0];
                const rect = containerRef.current.getBoundingClientRect();
                const touchX = touch.clientX - rect.left;
                const percent = (touchX / rect.width) * 100;
                const newPosition = Math.max(0, Math.min(100, percent));
                setSliderPosition(newPosition);
                setIsDragging(true);
                setDragStart(touch.clientX);
              }}
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
                  clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
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

              {/* Slider Line */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10 pointer-events-none"
                style={{ 
                  left: `${sliderPosition}%`,
                  transform: 'translateX(-50%)'
                }}
              />

              {/* Drag Handle */}
              <div 
                className="absolute top-1/2 w-12 h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg cursor-col-resize z-10 border-2 border-white"
                style={{
                  left: `${sliderPosition}%`,
                  transform: 'translate(-50%, -50%)',
                  transition: isDragging ? 'none' : 'left 0.3s ease'
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
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

          {/* Image Info with Badges */}
          <div className="text-center mt-6 space-y-4">
            {/* Badges Row */}
            <div className="flex flex-wrap justify-center gap-2 mb-3">
              {current.categoryData && (
                <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-rose-500/10 to-pink-500/10 dark:from-rose-500/20 dark:to-pink-500/20 text-rose-700 dark:text-rose-300 border border-rose-300/50 dark:border-rose-700/50 rounded-full text-xs font-semibold">
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {current.categoryData.name}
                </span>
              )}
              {current.serviceData && (
                <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 dark:from-purple-500/20 dark:to-indigo-500/20 text-purple-700 dark:text-purple-300 border border-purple-300/50 dark:border-purple-700/50 rounded-full text-xs font-medium">
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  {current.serviceData.name}
                </span>
              )}
              {current.project_type && (
                <span className="inline-flex items-center px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6" />
                  </svg>
                  {current.project_type}
                </span>
              )}
              {current.completion_date && (
                <span className="inline-flex items-center px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(current.completion_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {current.title}
            </h3>
            
            {/* Description */}
            {current.description && (
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {current.description}
              </p>
            )}
          </div>
        </div>

        {/* Thumbnail Navigation */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {items.map((item, index) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentIndex(index);
                  setSliderPosition(50); // Reset slider when changing images
                }}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                  currentIndex === index
                    ? "border-rose-500 dark:border-rose-400 scale-105 shadow-xl ring-2 ring-rose-500/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-rose-300 dark:hover:border-rose-600"
                }`}
              >
                <div className="relative w-full h-full">
                  <img
                    src={item.before_image_url}
                    alt={`${item.title} - Before`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/70 transition-colors" />
                  
                  {/* Category Badge on Thumbnail */}
                  {item.categoryData && (
                    <div className="absolute top-2 left-2 right-2">
                      <span className="inline-flex items-center px-2 py-0.5 bg-rose-500/90 dark:bg-rose-600/90 text-white rounded-full text-[10px] font-semibold shadow-lg">
                        {item.categoryData.name}
                      </span>
                    </div>
                  )}
                  
                  {/* Title and Service Badge */}
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <div className="text-xs text-white font-semibold truncate mb-1 drop-shadow-lg">
                      {item.title}
                    </div>
                    {item.serviceData && (
                      <div className="text-[10px] text-white/90 truncate drop-shadow">
                        {item.serviceData.name}
                      </div>
                    )}
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




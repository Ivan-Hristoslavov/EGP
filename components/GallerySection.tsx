"use client";

import React, { useState, useRef, useEffect } from "react";
import { useGallery } from "@/hooks/useGallery";
import { useGallerySections } from "@/hooks/useGallerySections";

export function GallerySection() {
  const { galleryItems, loading, error } = useGallery();
  const { gallerySections, isLoading: sectionsLoading } = useGallerySections();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter items by selected section
  const filteredItems = selectedFilter === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.section_id === selectedFilter);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const percent = (mouseX / rect.width) * 100;
    
    // Constrain between 0% and 100% to allow full range dragging
    const newPosition = Math.max(0, Math.min(100, percent));
    setSliderPosition(newPosition);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    
    const rect = containerRef.current.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const percent = (touchX / rect.width) * 100;
    
    // Constrain between 0% and 100% to allow full range dragging
    const newPosition = Math.max(0, Math.min(100, percent));
    setSliderPosition(newPosition);
  };

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
      e.preventDefault();
      
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

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
    setSliderPosition(50); // Reset slider position
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    setSliderPosition(50); // Reset slider position
  };

  if (loading || sectionsLoading) {
    return (
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64 mx-auto mb-4"></div>
            <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || filteredItems.length === 0) {
    return (
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our Work Gallery
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {error ? "Error loading gallery" : "No projects in this section yet."}
          </p>
        </div>
      </section>
    );
  }

  const currentItem = filteredItems[currentIndex];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-500" id="gallery">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full" />
        <div className="absolute top-60 right-32 w-24 h-24 bg-purple-500 rounded-full" />
        <div className="absolute bottom-40 left-1/3 w-16 h-16 bg-yellow-500 rounded-full" />
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-green-500 rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-800 dark:text-blue-300 text-sm font-medium mb-6">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
            Before & After Gallery
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our Completed Projects
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            See the transformation we bring to homes across South West London. 
            Drag the slider to compare before and after results.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => {
              setSelectedFilter("all");
              setCurrentIndex(0);
              setSliderPosition(50);
            }}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
              selectedFilter === "all"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700"
            }`}
          >
            All Projects
          </button>
          {gallerySections
            .filter(section => {
              // Only show sections that have at least one gallery item
              return galleryItems.some(item => item.section_id === section.id);
            })
            .map((section) => (
            <button
              key={section.id}
              onClick={() => {
                setSelectedFilter(section.id);
                setCurrentIndex(0);
                setSliderPosition(50);
              }}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                selectedFilter === section.id
                  ? "text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700"
              }`}
              style={{
                backgroundColor: selectedFilter === section.id ? (section.color || '#3B82F6') : undefined
              }}
            >
              {section.title}
            </button>
          ))}
        </div>

        {/* Main Gallery Carousel */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Interactive Before/After Image Section */}
            <div className="relative h-96 lg:h-[600px] bg-gray-900">
              {/* Before/After Comparison Container */}
              <div 
                ref={containerRef}
                className="relative w-full h-full overflow-hidden cursor-col-resize select-none"
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
                }}
                onMouseUp={() => setIsDragging(false)}
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
                }}
                onTouchMove={handleTouchMove}
                onTouchEnd={() => setIsDragging(false)}
              >
                {/* After Image (Background) */}
                <div className="absolute inset-0">
                  <img
                    src={currentItem.after_image_url}
                    alt="After"
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                    After
                  </div>
                </div>

                {/* Before Image (Overlay) */}
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <img
                    src={currentItem.before_image_url}
                    alt="Before"
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
                  style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                />

                {/* Slider Handle */}
                <div 
                  className="absolute top-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center cursor-col-resize border-4 border-blue-500 z-10"
                  style={{ 
                    left: `${sliderPosition}%`, 
                    transform: 'translate(-50%, -50%)',
                    transition: isDragging ? 'none' : 'left 0.3s ease'
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                >
                  <div className="flex space-x-1">
                    <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                    <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                  </div>
                </div>

                {/* Helper Text */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                  ← Drag to compare →
                </div>
              </div>

              {/* Navigation Arrows */}
              {filteredItems.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 group z-20"
                  >
                    <svg className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 group z-20"
                  >
                    <svg className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Content Section */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className="mb-6">
                {currentItem.is_featured && (
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full mb-4">
                    ⭐ Featured Project
                  </span>
                )}
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {currentItem.title}
                </h3>
                <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
                  {currentItem.project_type && (
                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                      </svg>
                      {currentItem.project_type}
                    </div>
                  )}
                  {currentItem.location && (
                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                      </svg>
                      {currentItem.location}
                    </div>
                  )}
                  {currentItem.completion_date && (
                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                      </svg>
                      {new Date(currentItem.completion_date).toLocaleDateString('en-GB')}
                    </div>
                  )}
                </div>
              </div>

              {currentItem.description && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Project Details</h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {currentItem.description}
                  </p>
                </div>
              )}

              {/* Slider Position Indicator */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-center justify-between text-sm text-blue-800 dark:text-blue-300">
                  <span>Before: {Math.round(sliderPosition)}%</span>
                  <span>After: {Math.round(100 - sliderPosition)}%</span>
                </div>
                <div className="mt-2 h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-150"
                    style={{ width: `${sliderPosition}%` }}
                  ></div>
                </div>
              </div>

              {/* Project Counter */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Project {currentIndex + 1} of {filteredItems.length}
                </div>
                
                {/* Dots Indicator */}
                {filteredItems.length > 1 && (
                  <div className="flex space-x-2">
                    {filteredItems.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentIndex(index);
                          setSliderPosition(50);
                        }}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentIndex
                            ? "bg-blue-600 scale-125"
                            : "bg-gray-300 dark:bg-gray-600 hover:bg-blue-400"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid - Additional Projects */}
        {/* Bottom Grid - Additional Projects Section */}
        {/* {filteredItems.length > 1 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              More Projects
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.slice(0, 6).map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setCurrentIndex(index);
                    setSliderPosition(50);
                  }}
                  className={`group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                    index === currentIndex ? "ring-4 ring-blue-500" : ""
                  }`}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={item.before_image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="text-sm font-medium">{item.project_type}</p>
                      <p className="text-xs opacity-90">{item.location}</p>
                    </div>
                    <div className="absolute top-4 right-4 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                      Before/After
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}
      </div>
    </section>
  );
} 
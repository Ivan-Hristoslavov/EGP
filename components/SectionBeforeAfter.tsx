"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const beforeAfterGallery = [
  {
    id: 1,
    title: "Lip Enhancement",
    category: "Dermal Fillers",
    before: "/images/before-after/lips-before.jpg",
    after: "/images/before-after/lips-after.jpg",
  },
  {
    id: 2,
    title: "Anti-wrinkle Treatment",
    category: "Botox",
    before: "/images/before-after/botox-before.jpg",
    after: "/images/before-after/botox-after.jpg",
  },
  {
    id: 3,
    title: "Jawline Contouring",
    category: "Dermal Fillers",
    before: "/images/before-after/jawline-before.jpg",
    after: "/images/before-after/jawline-after.jpg",
  },
  {
    id: 4,
    title: "Tear Trough Treatment",
    category: "Fillers",
    before: "/images/before-after/tear-trough-before.jpg",
    after: "/images/before-after/tear-trough-after.jpg",
  },
];

export default function SectionBeforeAfter() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAfter, setShowAfter] = useState(false);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % beforeAfterGallery.length);
    setShowAfter(false);
  };

  const previous = () => {
    setCurrentIndex((prev) => (prev - 1 + beforeAfterGallery.length) % beforeAfterGallery.length);
    setShowAfter(false);
  };

  const current = beforeAfterGallery[currentIndex];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm rounded-full text-blue-300 text-sm sm:text-base font-semibold mb-3 sm:mb-4">
            Real Results
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 px-4">
            Before & After Gallery
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto px-4">
            See the natural, beautiful transformations we've achieved for our clients
          </p>
        </div>

        {/* Gallery */}
        <div className="max-w-5xl mx-auto">
          {/* Main Image */}
          <div className="relative mb-8">
            <div className="aspect-[16/10] relative bg-gray-800 rounded-3xl overflow-hidden shadow-2xl">
              {/* Placeholder gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">✨</div>
                    <div className="text-2xl font-bold mb-2">
                      {showAfter ? "After Treatment" : "Before Treatment"}
                    </div>
                    <div className="text-gray-300">{current.title}</div>
                  </div>
                </div>
              </div>

              {/* Before/After Toggle */}
              <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-10">
                <button
                  onClick={() => setShowAfter(!showAfter)}
                  className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-white/20 backdrop-blur-md border-2 border-white/50 rounded-full text-white font-bold hover:bg-white/30 transition-all shadow-xl touch-manipulation active:scale-95"
                >
                  {showAfter ? "Show Before" : "Show After"}
                </button>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={previous}
              className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all touch-manipulation active:scale-95"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all touch-manipulation active:scale-95"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
          </div>

          {/* Info */}
          <div className="text-center mb-6 sm:mb-8 px-4">
            <div className="text-xs sm:text-sm text-blue-300 font-semibold mb-1 sm:mb-2">
              {current.category}
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">
              {current.title}
            </h3>
          </div>

          {/* Thumbnail Navigation */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {beforeAfterGallery.map((item, index) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentIndex(index);
                  setShowAfter(false);
                }}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  currentIndex === index
                    ? "border-blue-400 scale-105"
                    : "border-white/20 hover:border-white/50"
                }`}
              >
                <div className="w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
                  <span className="text-xs text-white/60">{item.title}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Disclaimer */}
          <p className="text-xs sm:text-sm text-gray-400 text-center mt-6 sm:mt-8 px-4">
            Results may vary. All photos published with patient consent. Individual results depend on various factors.
          </p>
        </div>
      </div>
    </section>
  );
}


"use client";

import { useState, useEffect } from "react";
import { useAdminProfile } from "@/components/AdminProfileContext";

export function FloatingCTA() {
  const [showText, setShowText] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const adminProfile = useAdminProfile();

  const businessPhone = adminProfile?.phone || "+44 7541777225";

  // Hide text after 5 seconds, show again on hover
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(false);
    }, 20000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-6 right-4 sm:right-0 z-50">
      <div className="flex flex-col items-center gap-3">
        {/* Main CTA Button */}
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity duration-300 animate-pulse"></div>

          {/* Button */}
          <a
            href={`tel:${businessPhone}`}
            onMouseEnter={() => {
              setIsHovered(true);
              setShowText(true);
            }}
            onMouseLeave={() => setIsHovered(false)}
            className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-red-600 via-red-500 to-orange-600 hover:from-red-700 hover:via-red-600 hover:to-orange-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 active:scale-95 border-2 border-white"
            aria-label={`Call ${businessPhone} for 10 minute free consultation`}
          >
            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-25"></div>

            {/* Phone icon */}
            <svg
              className="relative w-6 h-6 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </a>
        </div>{" "}
        {/* Text label with auto-hide */}
        <div
          className={`transition-all duration-500 transform ${
            showText || isHovered
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-2 opacity-0 scale-95 pointer-events-none"
          }`}
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 rounded-full shadow-xl border border-blue-500 whitespace-nowrap">
            <span className="flex items-center justify-center gap-1 sm:gap-2">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="hidden sm:inline">10 Min Free Consultation</span>
              <span className="sm:hidden">Free Call</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

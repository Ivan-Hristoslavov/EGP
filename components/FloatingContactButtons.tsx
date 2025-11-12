"use client";

import { useState } from "react";
import { Phone, Play, Calendar, MessageCircle, X, Menu, Minimize2 } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function FloatingContactButtons() {
  const [isExpanded, setIsExpanded] = useState(false);
  const handleActionClick = () => setIsExpanded(false);

  const whatsappNumber = siteConfig.contact.whatsapp.replace(/\s/g, "").replace(/\+/g, "");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi! I'd like to book a treatment.")}`;

  return (
    <>
      {/* Desktop Windows-Style Expandable Panel */}
      <div className="hidden lg:block fixed bottom-6 right-6" style={{ zIndex: 9000 }}>
        <div className="relative flex flex-col-reverse items-end gap-3">
          {/* Main Toggle Button - Always Visible */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:shadow-3xl relative z-10 ${
              isExpanded
                ? "bg-[#9d9585] dark:bg-[#b5ad9d]"
                : "bg-[#b5ad9d] hover:bg-[#9d9585] dark:bg-[#9d9585] dark:hover:bg-[#b5ad9d] hover:scale-110"
            } text-white`}
            aria-label={isExpanded ? "Close menu" : "Open contact menu"}
          >
            {isExpanded ? (
              <X className="w-6 h-6 transition-transform duration-300" />
            ) : (
              <Menu className="w-6 h-6 transition-transform duration-300" />
            )}
          </button>

          {/* Windows-Style Expandable Panel - Appears Above Button */}
          <div
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out overflow-hidden relative z-20 ${
              isExpanded
                ? "w-80 h-auto opacity-100 translate-y-0 pointer-events-auto mb-2"
                : "w-0 h-0 opacity-0 translate-y-4 pointer-events-none mb-0"
            }`}
            style={{
              maxHeight: isExpanded ? '500px' : '0',
            }}
          >
            {/* Windows-Style Header Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-[#ddd5c3] to-[#c9c1b0] dark:from-gray-700 dark:to-gray-800 border-b border-gray-300 dark:border-gray-600">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Quick Actions</span>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-white/20 dark:hover:bg-gray-700 rounded transition-colors"
                aria-label="Minimize"
              >
                <Minimize2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-4 space-y-3">
              {/* Book Treatment Button */}
              <Link
                href="/book"
                onClick={handleActionClick}
                className="group flex items-center gap-3 w-full bg-gradient-to-r from-[#4b5563] to-[#1f2937] hover:from-[#374151] hover:to-[#111827] text-white px-4 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
              >
                <Calendar className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-semibold">Book Treatment</span>
              </Link>

              {/* Call Button */}
              <a
                href={`tel:${siteConfig.contact.phone}`}
                onClick={handleActionClick}
                className="group flex items-center gap-3 w-full bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] hover:from-[#8c846f] hover:via-[#aea693] hover:to-[#c4b5a0] text-white px-4 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
              >
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-semibold">Call Now</span>
              </a>

              {/* WhatsApp Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleActionClick}
                className="group flex items-center gap-3 w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                aria-label="Contact us on WhatsApp"
              >
                <MessageCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-semibold flex-1">WhatsApp</span>
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              </a>

              {/* Watch Videos Button */}
              <a
                href={siteConfig.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleActionClick}
                className="group flex items-center gap-3 w-full bg-gradient-to-r from-[#d8c5a7] via-[#c4b5a0] to-[#b59c74] hover:from-[#c4b5a0] hover:via-[#b19775] hover:to-[#8c744f] text-white px-4 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                aria-label="Watch our YouTube videos"
              >
                <Play className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-semibold">Watch Videos</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Windows-Style Expandable Panel - Right Corner */}
      <div className="lg:hidden fixed bottom-6 right-6" style={{ zIndex: 9000 }}>
        <div className="relative flex flex-col-reverse items-end gap-3">
          {/* Main Toggle Button - Always Visible */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:shadow-3xl relative z-10 ${
              isExpanded
                ? "bg-[#9d9585] dark:bg-[#b5ad9d]"
                : "bg-[#b5ad9d] hover:bg-[#9d9585] dark:bg-[#9d9585] dark:hover:bg-[#b5ad9d] hover:scale-110"
            } text-white`}
            aria-label={isExpanded ? "Close menu" : "Open contact menu"}
          >
            {isExpanded ? (
              <X className="w-6 h-6 transition-transform duration-300" />
            ) : (
              <Menu className="w-6 h-6 transition-transform duration-300" />
            )}
          </button>

          {/* Windows-Style Expandable Panel - Appears Above Button */}
          <div
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out overflow-hidden relative z-20 ${
              isExpanded
                ? "w-72 h-auto opacity-100 translate-y-0 pointer-events-auto mb-2"
                : "w-0 h-0 opacity-0 translate-y-4 pointer-events-none mb-0"
            }`}
            style={{
              maxHeight: isExpanded ? '450px' : '0',
            }}
          >
            {/* Windows-Style Header Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-[#ddd5c3] to-[#c9c1b0] dark:from-gray-700 dark:to-gray-800 border-b border-gray-300 dark:border-gray-600">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Quick Actions</span>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-white/20 dark:hover:bg-gray-700 rounded transition-colors"
                aria-label="Minimize"
              >
                <Minimize2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-4 space-y-3">
              <Link
                href="/book"
                onClick={handleActionClick}
                className="flex items-center gap-3 w-full bg-gradient-to-r from-[#4b5563] to-[#1f2937] hover:from-[#374151] hover:to-[#111827] text-white px-4 py-3.5 rounded-lg shadow-lg active:scale-95 transition-all touch-manipulation"
              >
                <Calendar className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-semibold">Book Treatment</span>
              </Link>

              <a
                href={`tel:${siteConfig.contact.phone}`}
                onClick={handleActionClick}
                className="flex items-center gap-3 w-full bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] hover:from-[#8c846f] hover:via-[#aea693] hover:to-[#c4b5a0] text-white px-4 py-3.5 rounded-lg shadow-lg active:scale-95 transition-all touch-manipulation"
              >
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-semibold">Call Now</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleActionClick}
                className="flex items-center gap-3 w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3.5 rounded-lg shadow-lg active:scale-95 transition-all touch-manipulation"
              >
                <MessageCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-semibold flex-1">WhatsApp</span>
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              </a>

              <a
                href={siteConfig.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleActionClick}
                className="flex items-center gap-3 w-full bg-gradient-to-r from-[#d8c5a7] via-[#c4b5a0] to-[#b59c74] hover:from-[#c4b5a0] hover:via-[#b19775] hover:to-[#8c744f] text-white px-4 py-3.5 rounded-lg shadow-lg active:scale-95 transition-all touch-manipulation"
              >
                <Play className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-semibold">Watch Videos</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

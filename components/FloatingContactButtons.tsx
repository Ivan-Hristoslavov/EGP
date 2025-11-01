"use client";

import { useState } from "react";
import { Phone, Play, Calendar, MessageCircle, X, Menu } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function FloatingContactButtons() {
  const [isExpanded, setIsExpanded] = useState(false);

  const whatsappNumber = siteConfig.contact.whatsapp.replace(/\s/g, "").replace(/\+/g, "");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi! I'd like to book a treatment.")}`;

  return (
    <>
      {/* Desktop Expandable Floating Button */}
      <div className="hidden lg:block fixed bottom-6 right-6 z-50">
        <div className="relative flex flex-col items-end gap-3">
          {/* Expanded Options */}
          <div
            className={`flex flex-col gap-3 transition-all duration-300 ${
              isExpanded
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            {/* Book Treatment Button */}
            <Link
              href="/book"
              className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
            >
              <Calendar className="w-5 h-5" />
              <span className="text-sm font-semibold whitespace-nowrap">Book Treatment</span>
            </Link>

            {/* Call Button */}
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="group flex items-center gap-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
            >
              <Phone className="w-5 h-5" />
              <span className="text-sm font-semibold whitespace-nowrap">Call Now</span>
            </a>

            {/* WhatsApp Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
              aria-label="Contact us on WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-semibold whitespace-nowrap">WhatsApp</span>
              {/* Online indicator dot */}
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse ml-1"></div>
            </a>

            {/* Watch Videos Button */}
            <a
              href={siteConfig.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
              aria-label="Watch our YouTube videos"
            >
              <Play className="w-5 h-5" />
              <span className="text-sm font-semibold whitespace-nowrap">Watch Videos</span>
            </a>
          </div>

          {/* Main Expandable Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-300 hover:shadow-3xl ${
              isExpanded
                ? "bg-[#9d9585] dark:bg-[#b5ad9d]"
                : "bg-[#b5ad9d] hover:bg-[#9d9585] dark:bg-[#9d9585] dark:hover:bg-[#b5ad9d] hover:scale-110"
            } text-white`}
            aria-label={isExpanded ? "Close menu" : "Open contact menu"}
          >
            {isExpanded ? (
              <X className="w-7 h-7 transition-transform duration-300 rotate-0" />
            ) : (
              <Menu className="w-7 h-7 transition-transform duration-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Floating Buttons - Bottom Bar with Four Buttons */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#ddd5c3] dark:bg-gray-900 border-t border-[#c9c1b0] dark:border-gray-700 shadow-2xl">
        <div className="container mx-auto px-4 py-3">
          <div className="grid grid-cols-4 gap-1">
            {/* Book Treatment Button */}
            <Link
              href="/book"
              className="flex flex-col items-center justify-center gap-1 px-1 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-full transition-all shadow-lg active:scale-95 touch-manipulation"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-[10px] leading-tight">Book</span>
            </Link>

            {/* Call Button */}
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="flex flex-col items-center justify-center gap-1 px-1 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-semibold rounded-full transition-all shadow-lg active:scale-95 touch-manipulation"
            >
              <Phone className="w-4 h-4" />
              <span className="text-[10px] leading-tight">Call</span>
            </a>

            {/* WhatsApp Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1 px-1 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-full hover:from-green-600 hover:to-green-700 transition-all shadow-md active:scale-95 touch-manipulation"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-[10px] leading-tight">WhatsApp</span>
            </a>

            {/* YouTube Button */}
            <a
              href={siteConfig.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1 px-1 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-full hover:from-red-600 hover:to-red-700 transition-all shadow-md active:scale-95 touch-manipulation"
            >
              <Play className="w-4 h-4" />
              <span className="text-[10px] leading-tight">Videos</span>
            </a>
          </div>
        </div>
      </div>

      {/* Add padding to body for mobile bottom bar */}
      <style jsx global>{`
        @media (max-width: 1023px) {
          body {
            padding-bottom: 80px;
          }
        }
      `}</style>
    </>
  );
}

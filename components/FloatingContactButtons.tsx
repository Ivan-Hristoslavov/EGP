"use client";

import { Phone, Play } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import ButtonWhatsApp from "./ButtonWhatsApp";
import ButtonBookNow from "./ButtonBookNow";

export default function FloatingContactButtons() {
  return (
    <>
      {/* Desktop Floating Buttons - Expandable Icons */}
      <div className="hidden lg:flex fixed bottom-6 right-6 z-50 flex-col gap-3 items-end">
        {/* Book Treatment Now Button */}
        <div className="group relative">
          <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer overflow-hidden">
            <svg className="w-7 h-7 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          {/* Expandable text */}
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none">
            <span className="text-sm font-semibold">Book Treatment</span>
            <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 dark:border-l-gray-800 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
          </div>
          <Link href="/book" className="absolute inset-0" />
        </div>
        
        {/* Call Button */}
        <div className="group relative">
          <a
            href={`tel:${siteConfig.contact.phone}`}
            className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300"
          >
            <Phone className="w-7 h-7 transition-transform duration-300" />
          </a>
          {/* Expandable text */}
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none">
            <span className="text-sm font-semibold">Call Now</span>
            <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 dark:border-l-gray-800 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
          </div>
        </div>
        
        {/* WhatsApp Button - Circular with glow effect */}
        <div className="group relative">
          <a
            href={`https://wa.me/${siteConfig.contact.whatsapp.replace(/\s/g, "").replace(/\+/g, "")}?text=${encodeURIComponent("Hi! I'd like to book a treatment.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300"
          >
            <svg className="w-7 h-7 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
          {/* Online indicator dot */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
          {/* Expandable text */}
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none">
            <span className="text-sm font-semibold">WhatsApp</span>
            <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 dark:border-l-gray-800 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
          </div>
        </div>
        
        {/* YouTube Videos Button */}
        <div className="group relative">
          <a
            href={siteConfig.social.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300"
            aria-label="Watch our YouTube videos"
          >
            <Play className="w-7 h-7 transition-transform duration-300" />
          </a>
          {/* Expandable text */}
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 dark:bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none">
            <span className="text-sm font-semibold">Watch Videos</span>
            <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 dark:border-l-gray-800 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
          </div>
        </div>
      </div>

      {/* Mobile Floating Buttons - Bottom Bar with Four Buttons */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-2xl">
        <div className="container mx-auto px-4 py-3">
          <div className="grid grid-cols-4 gap-1">
            {/* Book Treatment Button */}
            <ButtonBookNow size="sm" className="text-xs" />
            
            {/* Call Button */}
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="flex items-center justify-center gap-1 px-1 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-semibold rounded-full hover:from-rose-600 hover:via-pink-600 hover:to-rose-700 transition-all shadow-lg active:scale-95 touch-manipulation"
            >
              <Phone className="w-4 h-4" />
              <span className="text-xs">Call</span>
            </a>
            
            {/* WhatsApp Button */}
            <a
              href={`https://wa.me/${siteConfig.contact.whatsapp.replace(/\s/g, "").replace(/\+/g, "")}?text=${encodeURIComponent("Hi! I'd like to book a treatment.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 px-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-full hover:from-green-600 hover:to-green-700 transition-all shadow-md active:scale-95 touch-manipulation"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="text-xs">WhatsApp</span>
            </a>
            
            {/* YouTube Button */}
            <a
              href={siteConfig.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 px-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-full hover:from-red-600 hover:to-red-700 transition-all shadow-md active:scale-95 touch-manipulation"
            >
              <Play className="w-4 h-4" />
              <span className="text-xs">Videos</span>
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


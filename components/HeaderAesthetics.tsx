"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import ThemeToggleButton from "./ThemeToggleButton";
import { 
  Phone, 
  Mail, 
  MapPin, 
  X,
  ChevronDown,
} from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { useConditions } from "@/hooks/useConditions";
import type { Condition } from "@/hooks/useConditions";

export default function HeaderAesthetics() {
  const { services } = useServices();
  const { conditions } = useConditions();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Ensure component is mounted before rendering portal
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Group services by main_tab and category for mega menu
  const servicesByMainTab = useMemo(() => {
    const grouped: Record<string, Record<string, {
      category: { id: string; name: string; slug: string; display_order?: number };
      services: Array<{ name: string; price: number; slug: string }>;
    }>> = {};
    
    services.forEach(service => {
      const mainTabSlug = service.main_tab.slug;
      const categoryId = service.category.id;
      
      if (!grouped[mainTabSlug]) {
        grouped[mainTabSlug] = {};
      }
      if (!grouped[mainTabSlug][categoryId]) {
        grouped[mainTabSlug][categoryId] = {
          category: {
            id: service.category.id,
            name: service.category.name,
            slug: service.category.slug,
            display_order: service.category.display_order ?? 0
          },
          services: []
        };
      }
      grouped[mainTabSlug][categoryId].services.push({
        name: service.name,
        price: service.price,
        slug: service.slug
      });
    });
    return grouped;
  }, [services]);

  // Get Book Now services (for mega menu) with categories sorted by display_order
  const bookNowCategories = useMemo(() => {
    const bookNowData = servicesByMainTab['book-now'] || {};
    const categories = Object.values(bookNowData).map(item => item.category);
    
    // Remove duplicates by id and sort by display_order
    const uniqueCategories = Array.from(
      new Map(categories.map(cat => [cat.id, cat])).values()
    );
    
    // Sort by display_order first, then by name for consistent ordering
    return uniqueCategories.sort((a, b) => {
      const orderA = a.display_order ?? 999;
      const orderB = b.display_order ?? 999;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.name.localeCompare(b.name);
    });
  }, [servicesByMainTab]);

  const bookNowServices = useMemo(() => {
    return servicesByMainTab['book-now'] || {};
  }, [servicesByMainTab]);

  // Group conditions by category for mega menu
  const conditionsByCategory = useMemo(() => {
    const grouped: {
      face: Condition[];
      body: Condition[];
    } = {
      face: [],
      body: [],
    };

    conditions.forEach((condition) => {
      if (condition.category === "Face Conditions") {
        grouped.face.push(condition);
      } else if (condition.category === "Body Conditions") {
        grouped.body.push(condition);
      }
    });

    // Sort by display_order, then by title
    grouped.face.sort((a, b) => {
      if (a.display_order !== b.display_order) {
        return a.display_order - b.display_order;
      }
      return a.title.localeCompare(b.title);
    });

    grouped.body.sort((a, b) => {
      if (a.display_order !== b.display_order) {
        return a.display_order - b.display_order;
      }
      return a.title.localeCompare(b.title);
    });

    return grouped;
  }, [conditions]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setActiveMenu(null);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [mobileMenuOpen]);

  // Handle menu hover with delay
  const handleMenuEnter = (menuType: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setActiveMenu(menuType);
  };

  const handleMenuLeave = () => {
    const timeout = setTimeout(() => {
      setActiveMenu(null);
    }, 200); // 200ms delay before closing
    setHoverTimeout(timeout);
  };

  return (
    <>
    <header 
      className={`fixed top-0 left-0 right-0 transition-all duration-300 ${
        scrolled ? "bg-[#ddd5c3] dark:bg-gray-900 shadow-lg" : "bg-[#ddd5c3]/95 dark:bg-gray-900/95 backdrop-blur-sm"
      }`}
      style={{ zIndex: 9998 }}
    >
      {/* Top Bar - Contact Info */}
      <div className="bg-[#c9c1b0] dark:bg-gray-800 text-gray-900 dark:text-gray-100 hidden sm:block">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-9 sm:h-10 text-xs sm:text-sm">
            {/* Left side - Find Us */}
            <div className="hidden lg:flex items-center gap-4 xl:gap-6">
              <Link 
                href="/find-us" 
                className="flex items-center gap-1.5 hover:text-[#f5f1e9] transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-medium">Find Us</span>
              </Link>
            </div>

            {/* Right side - Email, Phone & Social Links */}
            <div className="flex items-center gap-2 sm:gap-4 md:gap-6 ml-auto w-full lg:w-auto justify-end">
              <a 
                href={`mailto:${siteConfig.contact.email}`}
                className="flex items-center gap-1 sm:gap-2 hover:text-[#f5f1e9] transition-colors"
              >
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden md:inline text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                  {siteConfig.contact.email}
                </span>
              </a>
              <a 
                href={`tel:${siteConfig.contact.phone}`}
                className="flex items-center gap-1 sm:gap-2 hover:text-[#f5f1e9] transition-colors font-medium"
              >
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm whitespace-nowrap">{siteConfig.contact.phone}</span>
              </a>
              
              {/* Social Links & Theme Toggle */}
              <div className="flex items-center gap-2 ml-2">
                <a
                  href={siteConfig.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href={siteConfig.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="YouTube"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                {/* Theme Toggle in Top Bar - Desktop Only */}
                <div className="hidden lg:flex ml-3 pl-3 border-l border-white/30">
                  <div className="scale-75">
                    <ThemeToggleButton />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Header - Clean No Filter Clinic Style */}
      <div className="border-b border-[#c9c1b0] dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className={`flex items-center justify-between transition-all duration-300 ${
            scrolled ? "h-16 md:h-18" : "h-20 md:h-24"
          }`}>
            {/* Left Navigation Links */}
            <nav className={`hidden lg:flex items-center transition-all duration-300 ${
              scrolled ? "gap-4 xl:gap-6 mr-6 xl:mr-8 2xl:mr-12" : "gap-6 xl:gap-8 mr-8 xl:mr-12 2xl:mr-16"
            }`}>
              <Link
                href="/about"
                className={`group relative font-montserrat text-gray-700 dark:text-gray-300 font-light transition-all duration-300 uppercase tracking-widest px-3 py-1.5 -mx-3 -my-1.5 rounded-md ${
                  scrolled ? "text-xs" : "text-xs lg:text-sm"
                }`}
              >
                <span className="relative z-10 transition-all duration-300 group-hover:text-gray-900 dark:group-hover:text-white">
                  About Us
                </span>
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-10"></span>
                <span className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md group-hover:shadow-lg border border-white/20 dark:border-gray-700/20" style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}></span>
              </Link>
              <button
                className={`group relative font-montserrat text-gray-700 dark:text-gray-300 font-light transition-all duration-300 text-xs lg:text-sm uppercase tracking-widest flex items-center gap-1 px-3 py-1.5 -mx-3 -my-1.5 rounded-md ${
                  activeMenu === 'treatments' ? 'text-gray-900 dark:text-white' : ''
                }`}
                onMouseEnter={() => handleMenuEnter('treatments')}
                onMouseLeave={handleMenuLeave}
              >
                <span className="relative z-10 transition-all duration-300 group-hover:text-gray-900 dark:group-hover:text-white">
                  Book Now
                </span>
                <ChevronDown className={`relative z-10 w-2.5 h-2.5 transition-all duration-300 ${activeMenu === 'treatments' ? 'rotate-180 text-gray-900 dark:text-white' : 'group-hover:text-gray-900 dark:group-hover:text-white'}`} />
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-10"></span>
                {/* Blurred white/black background */}
                <span className={`absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-md transition-all duration-300 border border-white/20 dark:border-gray-700/20 ${
                  activeMenu === 'treatments' ? 'opacity-100 shadow-lg' : 'opacity-0 group-hover:opacity-100 shadow-md group-hover:shadow-lg'
                }`} style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}></span>
                {/* Gradient overlay */}
                <span className={`absolute inset-0 bg-gradient-to-r from-[#9d9585]/15 via-[#b5ad9d]/15 to-[#c9c1b0]/15 rounded-md transition-all duration-300 ${
                  activeMenu === 'treatments' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`} style={{ backdropFilter: 'blur(4px)' }}></span>
              </button>
              <button
                className={`group relative font-montserrat text-gray-700 dark:text-gray-300 font-light transition-all duration-300 text-xs lg:text-sm uppercase tracking-widest flex items-center gap-1 px-3 py-1.5 -mx-3 -my-1.5 rounded-md ${
                  activeMenu === 'conditions' ? 'text-gray-900 dark:text-white' : ''
                }`}
                onMouseEnter={() => handleMenuEnter('conditions')}
                onMouseLeave={handleMenuLeave}
              >
                <span className="relative z-10 transition-all duration-300 group-hover:text-gray-900 dark:group-hover:text-white">
                  By Condition
                </span>
                <ChevronDown className={`relative z-10 w-2.5 h-2.5 transition-all duration-300 ${activeMenu === 'conditions' ? 'rotate-180 text-gray-900 dark:text-white' : 'group-hover:text-gray-900 dark:group-hover:text-white'}`} />
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-10"></span>
                {/* Blurred white/black background */}
                <span className={`absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-md transition-all duration-300 border border-white/20 dark:border-gray-700/20 ${
                  activeMenu === 'conditions' ? 'opacity-100 shadow-lg' : 'opacity-0 group-hover:opacity-100 shadow-md group-hover:shadow-lg'
                }`} style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}></span>
                {/* Gradient overlay */}
                <span className={`absolute inset-0 bg-gradient-to-r from-[#9d9585]/15 via-[#b5ad9d]/15 to-[#c9c1b0]/15 rounded-md transition-all duration-300 ${
                  activeMenu === 'conditions' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`} style={{ backdropFilter: 'blur(4px)' }}></span>
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden rounded-lg hover:bg-[#c9c1b0] dark:hover:bg-gray-800 transition-all duration-300 touch-manipulation p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center ${
                mobileMenuOpen ? 'bg-[#c9c1b0] dark:bg-gray-800' : ''
              }`}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <div className="flex flex-col justify-between w-6 h-5 transition-all duration-300">
                <span 
                  className={`block h-0.5 bg-gray-700 dark:bg-gray-300 rounded-full transition-all duration-300 ${
                    mobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                  }`}
                />
                <span 
                  className={`block h-0.5 bg-gray-700 dark:bg-gray-300 rounded-full transition-all duration-300 ${
                    mobileMenuOpen ? 'opacity-0' : ''
                  }`}
                />
                <span 
                  className={`block h-0.5 bg-gray-700 dark:bg-gray-300 rounded-full transition-all duration-300 ${
                    mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                  }`}
                />
              </div>
            </button>

            {/* Centered Logo - Clean & Clear with Maximum Distance from Navigation */}
            <Link 
              href="/" 
              className="group absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center text-center px-2 sm:px-4 md:px-6 transition-all duration-300 hover:scale-105 z-10"
            >
              <h1 className={`font-playfair font-light text-gray-900 dark:text-white whitespace-nowrap leading-tight transition-all duration-300 group-hover:brightness-110 group-hover:drop-shadow-lg ${
                scrolled 
                  ? "text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl" 
                  : "text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl"
              }`}>
                EGP AESTHETICS
              </h1>
              <p className={`font-montserrat text-gray-500 dark:text-gray-400 font-light tracking-[0.25em] sm:tracking-[0.3em] uppercase transition-all duration-300 group-hover:text-[#9d9585] dark:group-hover:text-[#c9c1b0] group-hover:tracking-[0.35em] sm:group-hover:tracking-[0.4em] ${
                scrolled ? "text-[7px] sm:text-[8px] md:text-[9px] mt-0.5" : "text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs mt-0.5 sm:mt-1"
              }`}>
                London
              </p>
              
              {/* Subtle glow effect on hover - Different for light and dark themes */}
              <div className="absolute inset-0 -z-10 rounded-full bg-[#9d9585]/25 dark:bg-[#ddd5c3]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl scale-110"></div>
              <div className="absolute inset-0 -z-10 rounded-full bg-[#c9c1b0]/20 dark:bg-[#c9c1b0]/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg scale-105"></div>
              
              {/* Animated underline effect */}
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-px bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] dark:from-[#c9c1b0] dark:via-[#ddd5c3] dark:to-[#c9c1b0] transition-all duration-300 group-hover:w-full"></div>
            </Link>

            {/* Right Navigation Links */}
            <nav className={`hidden lg:flex items-center transition-all duration-300 ${
              scrolled ? "gap-4 xl:gap-6 ml-6 xl:ml-8 2xl:ml-12" : "gap-6 xl:gap-8 ml-8 xl:ml-12 2xl:ml-16"
            }`}>
              <Link
                href="/blog"
                className={`group relative font-montserrat text-gray-700 dark:text-gray-300 font-light transition-all duration-300 uppercase tracking-widest px-3 py-1.5 -mx-3 -my-1.5 rounded-md ${
                  scrolled ? "text-xs" : "text-xs lg:text-sm"
                }`}
              >
                <span className="relative z-10 transition-all duration-300 group-hover:text-gray-900 dark:group-hover:text-white">
                  Blog
                </span>
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-10"></span>
                <span className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md group-hover:shadow-lg border border-white/20 dark:border-gray-700/20" style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}></span>
              </Link>
              <Link
                href="/press"
                className={`group relative font-montserrat text-gray-700 dark:text-gray-300 font-light transition-all duration-300 uppercase tracking-widest px-3 py-1.5 -mx-3 -my-1.5 rounded-md ${
                  scrolled ? "text-xs" : "text-xs lg:text-sm"
                }`}
              >
                <span className="relative z-10 transition-all duration-300 group-hover:text-gray-900 dark:group-hover:text-white">
                  Awards/ Press
                </span>
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-10"></span>
                <span className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md group-hover:shadow-lg border border-white/20 dark:border-gray-700/20" style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}></span>
              </Link>
              <Link
                href="/membership"
                className={`group relative font-montserrat text-gray-700 dark:text-gray-300 font-light transition-all duration-300 uppercase tracking-widest px-3 py-1.5 -mx-3 -my-1.5 rounded-md ${
                  scrolled ? "text-xs" : "text-xs lg:text-sm"
                }`}
              >
                <span className="relative z-10 transition-all duration-300 group-hover:text-gray-900 dark:group-hover:text-white">
                  Skin Membership
                </span>
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-10"></span>
                <span className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md group-hover:shadow-lg border border-white/20 dark:border-gray-700/20" style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}></span>
              </Link>
            </nav>
            {/* Mobile Theme Toggle */}
            <div className="lg:hidden">
              <ThemeToggleButton />
            </div>
          </div>
        </div>
      </div>

      {/* Mega Menu Dropdowns - Desktop Only */}
      {(activeMenu === 'treatments' || activeMenu === 'conditions') && (
        <div 
          className="hidden lg:block absolute left-0 right-0 top-full shadow-2xl overflow-hidden backdrop-blur-xl"
          style={{
            zIndex: 9999,
            animation: 'slideDown 0.3s ease-out',
          }}
          onMouseEnter={() => handleMenuEnter(activeMenu)}
          onMouseLeave={handleMenuLeave}
        >
          {/* Transparent blurred background - Glassmorphism effect */}
          <div 
            className="absolute inset-0 min-h-full bg-white/70 dark:bg-black/70 backdrop-blur-xl backdrop-saturate-150"
          ></div>
          {/* Additional transparent blur layer for depth */}
          <div 
            className="absolute inset-0 min-h-full bg-white/50 dark:bg-black/50 backdrop-blur-lg"
          ></div>
          {/* Subtle border for definition */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-200/50 dark:via-gray-700/50 to-transparent z-20"></div>
          {/* Content wrapper */}
          <div className="relative z-10">
          <div className="container mx-auto px-4 py-8">
            <div className={`grid gap-8 ${
              bookNowCategories.length === 1 ? 'grid-cols-1' :
              bookNowCategories.length === 2 ? 'grid-cols-2' :
              bookNowCategories.length === 3 ? 'grid-cols-3' :
              bookNowCategories.length >= 4 ? 'grid-cols-4' : 'grid-cols-4'
            }`}>
              {activeMenu === 'treatments' && (
                <>
                  {bookNowCategories.map((category) => {
                    const categoryServices = bookNowServices[category.id]?.services || [];
                    return (
                      <div key={category.id}>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xs font-light text-gray-700 dark:text-gray-300 uppercase tracking-widest font-montserrat">
                            {category.name}
                          </h3>
                          <Link
                            href={`/services?category=${encodeURIComponent(category.name)}`}
                            onClick={() => setActiveMenu(null)}
                            className="group relative text-xs font-medium transition-all duration-300"
                          >
                            <span className="relative z-10 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] bg-clip-text text-transparent group-hover:from-[#857d68] group-hover:via-[#aea693] group-hover:to-[#c9c1b0] transition-all duration-300">
                              View All
                            </span>
                            <span className="relative z-10 ml-1 inline-block group-hover:translate-x-1 transition-transform duration-300">→</span>
                          </Link>
                        </div>
                        <ul className="space-y-2 max-h-[600px] overflow-y-auto menu-scroll pr-2">
                          {categoryServices.map((item) => (
                            <li key={item.name}>
                              <Link
                                href={`/book?service=${item.slug}`}
                                className="group relative flex items-start justify-between gap-2 px-2 py-2 -mx-2 rounded-md text-sm text-gray-700 dark:text-gray-300 font-montserrat transition-all duration-300 hover:bg-gradient-to-r hover:from-[#f5f1e9]/80 hover:via-[#eee6d9]/80 hover:to-[#e8decd]/80 dark:hover:from-[#1f1a14]/40 dark:hover:via-[#252018]/40 dark:hover:to-[#2b251c]/40"
                                onClick={() => setActiveMenu(null)}
                              >
                                <span className="relative z-10 group-hover:translate-x-1 group-hover:text-[#8c846f] dark:group-hover:text-[#b5ad9d] transition-all duration-300">
                                  {item.name}
                                  {/* Animated underline */}
                                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] group-hover:w-full transition-all duration-300 ease-out origin-left"></span>
                                </span>
                                <span className="relative z-10 font-semibold bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] bg-clip-text text-transparent whitespace-nowrap group-hover:scale-110 transition-transform duration-300">
                                  £{item.price}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </>
              )}
              
              {activeMenu === 'conditions' && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-light text-gray-700 dark:text-gray-300 uppercase tracking-widest font-montserrat">
                        Face Conditions
                      </h3>
                      <Link
                        href="/conditions"
                        onClick={() => setActiveMenu(null)}
                        className="group relative text-xs font-medium transition-all duration-300"
                      >
                        <span className="relative z-10 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] bg-clip-text text-transparent group-hover:from-[#857d68] group-hover:via-[#aea693] group-hover:to-[#c9c1b0] transition-all duration-300">
                          View All
                        </span>
                        <span className="relative z-10 ml-1 inline-block group-hover:translate-x-1 transition-transform duration-300">→</span>
                      </Link>
                    </div>
                    <ul className="space-y-2 max-h-[600px] overflow-y-auto menu-scroll pr-2">
                      {conditionsByCategory.face.map((condition) => (
                        <li key={condition.id}>
                          <Link
                            href={`/conditions/${condition.slug}`}
                            className="group relative block px-2 py-2 -mx-2 rounded-md text-sm text-gray-700 dark:text-gray-300 font-montserrat transition-all duration-300 hover:bg-gradient-to-r hover:from-[#f5f1e9]/80 hover:via-[#eee6d9]/80 hover:to-[#e8decd]/80 dark:hover:from-[#1f1a14]/40 dark:hover:via-[#252018]/40 dark:hover:to-[#2b251c]/40"
                            onClick={() => setActiveMenu(null)}
                          >
                            <span className="relative z-10 group-hover:translate-x-1 group-hover:text-[#8c846f] dark:group-hover:text-[#b5ad9d] transition-all duration-300 inline-block">
                              {condition.title}
                              {/* Animated underline */}
                              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] group-hover:w-full transition-all duration-300 ease-out origin-left"></span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-light text-gray-700 dark:text-gray-300 uppercase tracking-widest font-montserrat">
                        Body Conditions
                      </h3>
                      <Link
                        href="/conditions?category=Body"
                        onClick={() => setActiveMenu(null)}
                        className="group relative text-xs font-medium transition-all duration-300"
                      >
                        <span className="relative z-10 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] bg-clip-text text-transparent group-hover:from-[#857d68] group-hover:via-[#aea693] group-hover:to-[#c9c1b0] transition-all duration-300">
                          View All
                        </span>
                        <span className="relative z-10 ml-1 inline-block group-hover:translate-x-1 transition-transform duration-300">→</span>
                      </Link>
                    </div>
                    <ul className="space-y-2 max-h-[600px] overflow-y-auto menu-scroll pr-2">
                      {conditionsByCategory.body.map((condition) => (
                        <li key={condition.id}>
                          <Link
                            href={`/conditions/${condition.slug}`}
                            className="group relative block px-2 py-2 -mx-2 rounded-md text-sm text-gray-700 dark:text-gray-300 font-montserrat transition-all duration-300 hover:bg-gradient-to-r hover:from-[#f5f1e9]/80 hover:via-[#eee6d9]/80 hover:to-[#e8decd]/80 dark:hover:from-[#1f1a14]/40 dark:hover:via-[#252018]/40 dark:hover:to-[#2b251c]/40"
                            onClick={() => setActiveMenu(null)}
                          >
                            <span className="relative z-10 group-hover:translate-x-1 group-hover:text-[#8c846f] dark:group-hover:text-[#b5ad9d] transition-all duration-300 inline-block">
                              {condition.title}
                              {/* Animated underline */}
                              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] group-hover:w-full transition-all duration-300 ease-out origin-left"></span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div></div>
                  <div></div>
                </>
              )}
            </div>
          </div>
          </div>
        </div>
      )}

    </header>
    {isMounted && mobileMenuOpen && createPortal(
      <div style={{ position: 'fixed', inset: 0, zIndex: 99999, pointerEvents: 'none' }}>
        {/* Backdrop */}
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
          style={{ pointerEvents: 'auto' }}
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Slide-in Menu */}
        <div className="lg:hidden fixed inset-y-0 right-0 w-[90%] max-w-[420px] bg-[#ddd5c3] dark:bg-gray-900 shadow-2xl overflow-y-auto touch-manipulation animate-slideInRight pointer-events-auto">
            {/* Mobile Menu Header with Close Button */}
            <div className="sticky top-0 z-10 bg-[#ddd5c3] dark:bg-gray-900 border-b border-[#c9c1b0] dark:border-gray-700 px-4 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white font-playfair">Menu</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -mr-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-[#c9c1b0] dark:hover:bg-gray-800 transition-colors touch-manipulation"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="px-4 sm:px-6 py-4">
            <ul className="space-y-2">
              {/* Left Navigation Items */}
              <li>
                <Link
                  href="/about"
                  className="block px-4 py-3.5 min-h-[44px] text-base text-gray-700 dark:text-gray-300 hover:bg-[#c9c1b0] dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-light transition-all duration-200 active:scale-95 font-montserrat uppercase tracking-widest flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About Us
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setActiveMenu(activeMenu === 'treatments' ? null : 'treatments')}
                  className="w-full flex items-center justify-between px-4 py-3.5 min-h-[44px] text-base text-gray-700 dark:text-gray-300 hover:bg-[#c9c1b0] dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-light transition-all duration-200 active:scale-95 touch-manipulation font-montserrat uppercase tracking-widest"
                >
                  <span>Book Now</span>
                  <ChevronDown 
                    className={`w-5 h-5 transition-transform duration-200 ${
                      activeMenu === 'treatments' ? "rotate-180" : ""
                    }`} 
                  />
                </button>
                {activeMenu === 'treatments' && (
                  <div className="mt-3 pl-2 space-y-4 bg-[#f0ede7] dark:bg-gray-800/50 rounded-lg p-4 border border-[#c9c1b0] dark:border-gray-700">
                    {bookNowCategories.map((category) => {
                      const categoryServices = bookNowServices[category.id]?.services || [];
                      return (
                        <div key={category.id} className="space-y-2">
                          <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-3 uppercase tracking-wider font-montserrat px-2">
                            {category.name}
                          </h4>
                          <ul className="space-y-1 max-h-[300px] overflow-y-auto menu-scroll pr-2">
                            {categoryServices.map((item) => (
                              <li key={item.name}>
                                <Link
                                  href={`/book?service=${item.slug}`}
                                  className="group relative flex items-center justify-between gap-3 px-3 py-2.5 min-h-[44px] text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-md transition-all duration-200 active:scale-95 touch-manipulation font-montserrat"
                                  onClick={() => {
                                    setMobileMenuOpen(false);
                                    setActiveMenu(null);
                                  }}
                                >
                                  <span className="flex-1 text-left leading-tight">
                                    {item.name}
                                  </span>
                                  <span className="font-semibold text-[#9d9585] dark:text-[#c9c1b0] whitespace-nowrap text-sm flex-shrink-0">
                                    £{item.price}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                )}
              </li>
              <li>
                <button
                  onClick={() => setActiveMenu(activeMenu === 'conditions' ? null : 'conditions')}
                  className="w-full flex items-center justify-between px-4 py-3.5 min-h-[44px] text-base text-gray-700 dark:text-gray-300 hover:bg-[#c9c1b0] dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-light transition-all duration-200 active:scale-95 touch-manipulation font-montserrat uppercase tracking-widest"
                >
                  <span>By Condition</span>
                  <ChevronDown 
                    className={`w-5 h-5 transition-transform duration-200 ${
                      activeMenu === 'conditions' ? "rotate-180" : ""
                    }`} 
                  />
                </button>
                {activeMenu === 'conditions' && (
                  <div className="mt-3 pl-2 space-y-4 bg-[#f0ede7] dark:bg-gray-800/50 rounded-lg p-4 border border-[#c9c1b0] dark:border-gray-700">
                    <div>
                      <div className="flex items-center justify-between mb-3 px-2">
                        <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider font-montserrat">
                          Face Conditions
                        </h4>
                        <Link
                          href="/conditions"
                          onClick={() => setActiveMenu(null)}
                          className="text-xs text-[#9d9585] dark:text-[#c9c1b0] hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                        >
                          View All →
                        </Link>
                      </div>
                      <ul className="space-y-1 max-h-[250px] overflow-y-auto menu-scroll pr-2">
                        {conditionsByCategory.face.map((condition) => (
                          <li key={condition.id}>
                            <Link
                              href={`/conditions/${condition.slug}`}
                              className="block px-3 py-2.5 min-h-[44px] text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-md transition-all duration-200 active:scale-95 touch-manipulation font-montserrat flex items-center"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setActiveMenu(null);
                              }}
                            >
                              {condition.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-3 px-2">
                        <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider font-montserrat">
                          Body Conditions
                        </h4>
                        <Link
                          href="/conditions?category=Body"
                          onClick={() => setActiveMenu(null)}
                          className="text-xs text-[#9d9585] dark:text-[#c9c1b0] hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                        >
                          View All →
                        </Link>
                      </div>
                      <ul className="space-y-1 max-h-[250px] overflow-y-auto menu-scroll pr-2">
                        {conditionsByCategory.body.map((condition) => (
                          <li key={condition.id}>
                            <Link
                              href={`/conditions/${condition.slug}`}
                              className="block px-3 py-2.5 min-h-[44px] text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-md transition-all duration-200 active:scale-95 touch-manipulation font-montserrat flex items-center"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setActiveMenu(null);
                              }}
                            >
                              {condition.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </li>
              <li>
                <Link
                  href="/blog"
                  className="block px-4 py-3.5 min-h-[44px] text-base text-gray-700 dark:text-gray-300 hover:bg-[#c9c1b0] dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-light transition-all duration-200 active:scale-95 font-montserrat uppercase tracking-widest flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/press"
                  className="block px-4 py-3.5 min-h-[44px] text-base text-gray-700 dark:text-gray-300 hover:bg-[#c9c1b0] dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-light transition-all duration-200 active:scale-95 font-montserrat uppercase tracking-widest flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Awards/ Press
                </Link>
              </li>
              <li>
                <Link
                  href="/membership"
                  className="block px-4 py-3.5 min-h-[44px] text-base text-gray-700 dark:text-gray-300 hover:bg-[#c9c1b0] dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-light transition-all duration-200 active:scale-95 font-montserrat uppercase tracking-widest flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Skin Membership
                </Link>
              </li>
              <li>
                <Link
                  href="/find-us"
                  className="block px-4 py-3.5 min-h-[44px] text-base text-gray-700 dark:text-gray-300 hover:bg-[#c9c1b0] dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-light transition-all duration-200 active:scale-95 font-montserrat uppercase tracking-widest flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Find Us
                </Link>
              </li>

            </ul>

          </nav>
        </div>
        </div>, document.body
      )}
  </>
  );
}
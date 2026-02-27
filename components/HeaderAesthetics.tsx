"use client";

import { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import ThemeToggleButton from "./ThemeToggleButton";
import { Phone, Mail, MapPin, X, ChevronDown } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { useConditions } from "@/hooks/useConditions";
import { PriceWithDiscount } from "@/components/PriceWithDiscount";
import type { Condition } from "@/hooks/useConditions";
import type { Service } from "@/hooks/useServices";
import { useAdminProfile, useAdminProfileContext } from "@/components/AdminProfileContext";
import { useSocialLinks } from "@/hooks/useSocialLinks";

export default function HeaderAesthetics() {
  const { services } = useServices();
  const { conditions } = useConditions();
  const adminProfile = useAdminProfile();
  const { loading: profileLoading } = useAdminProfileContext();
  const { socialLinks } = useSocialLinks();
  
  // Get contact info from admin profile, fallback to siteConfig
  const contactPhone = adminProfile?.phone || siteConfig.contact.phone;
  const contactEmail = adminProfile?.business_email || adminProfile?.email || siteConfig.contact.email;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isPressPageEnabled, setIsPressPageEnabled] = useState(true); // Default to true
  const headerRef = useRef<HTMLElement>(null);
  const [megaMenuTop, setMegaMenuTop] = useState(0);

  // Ensure component is mounted before rendering portal
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch press page enabled setting
  useEffect(() => {
    const fetchPressPageSetting = async () => {
      try {
        const response = await fetch('/api/admin/press-settings');
        if (response.ok) {
          const data = await response.json();
          setIsPressPageEnabled(data.enabled !== false); // Default to true if not set
        }
      } catch (error) {
        console.error('Failed to fetch press page setting:', error);
        // Default to true on error
        setIsPressPageEnabled(true);
      }
    };

    fetchPressPageSetting();
  }, []);

  // Group services by main_tab and category for mega menu
  const servicesByMainTab = useMemo(() => {
    const grouped: Record<
      string,
      Record<
        string,
        {
          category: {
            id: string;
            name: string;
            slug: string;
            display_order?: number;
          };
          services: Array<{ id: string; name: string; price: number; originalPrice?: number; discountPercentage?: number; slug: string }>;
        }
      >
    > = {};

    services.forEach((service) => {
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
            display_order: service.category.display_order ?? 0,
          },
          services: [],
        };
      }
      grouped[mainTabSlug][categoryId].services.push({
        id: service.id,
        name: service.name,
        price: service.discounted_price ?? service.price,
        originalPrice: service.discount_percentage ? service.price : undefined,
        discountPercentage: service.discount_percentage ?? undefined,
        slug: service.slug,
      });
    });
    return grouped;
  }, [services]);

  // Get Book Now services (for mega menu) with categories sorted by display_order
  const bookNowCategories = useMemo(() => {
    const bookNowData = servicesByMainTab["book-now"] || {};
    const categories = Object.values(bookNowData).map((item) => item.category);

    // Remove duplicates by id and sort by display_order
    const uniqueCategories = Array.from(
      new Map(categories.map((cat) => [cat.id, cat])).values()
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
    return servicesByMainTab["book-now"] || {};
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

  /** Get price for condition by matching service slug or parsing treatments */
  const getConditionPrice = (condition: Condition): { price: number; originalPrice?: number | null; discountPercentage?: number | null } | null => {
    const match = services.find((s: Service) => s.slug === condition.slug);
    if (match) {
      const price = match.discounted_price ?? match.price;
      return {
        price: typeof price === "number" ? price : Number(price),
        originalPrice: match.discount_percentage && match.discounted_price ? match.price : null,
        discountPercentage: match.discount_percentage ?? null,
      };
    }
    const treatments = Array.isArray(condition.treatments) ? condition.treatments : [];
    const prices = treatments
      .map((t: string | unknown) => (typeof t === "string" ? t.match(/£(\d+(?:\.\d+)?)/) : null))
      .filter((m): m is RegExpMatchArray => !!m)
      .map((m) => parseFloat(m[1]));
    if (prices.length > 0) return { price: Math.min(...prices) };
    return null;
  };

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
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [mobileMenuOpen]);

  // Measure header bottom for portal dropdown (so it sits flush under header, no gap on scroll)
  function updateMegaMenuTop() {
    requestAnimationFrame(() => {
      const header = headerRef.current;
      if (header) setMegaMenuTop(header.getBoundingClientRect().bottom);
    });
  }

  useLayoutEffect(() => {
    if (activeMenu === "treatments" || activeMenu === "conditions") {
      updateMegaMenuTop();
    }
  }, [activeMenu]);

  // Keep dropdown flush under header when user scrolls or resizes (header height can change)
  useEffect(() => {
    if (activeMenu !== "treatments" && activeMenu !== "conditions") return;
    updateMegaMenuTop();
    window.addEventListener("scroll", updateMegaMenuTop, true);
    window.addEventListener("resize", updateMegaMenuTop);
    return () => {
      window.removeEventListener("scroll", updateMegaMenuTop, true);
      window.removeEventListener("resize", updateMegaMenuTop);
    };
  }, [activeMenu]);

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
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 transition-all duration-300 ${
          scrolled
            ? "bg-[#ddd5c3] dark:bg-gray-900 shadow-lg"
            : "bg-[#ddd5c3]/95 dark:bg-gray-900/95 backdrop-blur-sm"
        }`}
        style={{ zIndex: 9998 }}
      >
        <div className="bg-[#c9c1b0] dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <div className="container mx-auto px-2 sm:px-4">
            {/* Mobile: Three sections - Find Us | Contacts | Social Networks - reduced gap */}
            <div className="lg:hidden flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 text-[10px] sm:text-xs md:text-sm">
              {/* Find Us */}
              <div className="flex items-center flex-shrink-0">
                <Link
                  href="/find-us"
                  className="group relative inline-flex items-center gap-1 sm:gap-1.5 font-semibold tracking-[0.12em] sm:tracking-[0.14em] uppercase text-[#3a3428] dark:text-[#f5f1e9] hover:text-[#1f1b15] dark:hover:text-[#f8efdf] transition-colors pb-0.5 px-1.5 sm:px-2 py-1 min-h-[40px] touch-manipulation"
                >
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="relative inline-block">
                    <span className="relative z-10">Find Us</span>
                    <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-gradient-to-r from-[#b09a7d] via-[#c9b79b] to-[#ddd5c3] transition-all duration-300 ease-out group-hover:w-full"></span>
                  </span>
                </Link>
              </div>

              {/* Separator */}
              <span
                className="text-gray-700/70 dark:text-gray-200/60 text-xs flex-shrink-0 px-1"
                aria-hidden="true"
              >
                |
              </span>

              {/* Contacts (Email and Phone) */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {profileLoading ? (
                  <div className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-1 min-h-[40px] touch-manipulation">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                    <div className="hidden sm:block h-3 w-20 sm:w-24 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <a
                    href={`mailto:${contactEmail}`}
                    className="group relative inline-flex items-center gap-1 sm:gap-1.5 hover:text-[#f5f1e9] transition-colors pb-0.5 px-1.5 sm:px-2 py-1 min-h-[40px] touch-manipulation"
                  >
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="relative inline-block">
                      <span className="hidden sm:inline relative z-10 text-xs">
                        {contactEmail}
                      </span>
                      <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] transition-all duration-300 ease-out group-hover:w-full"></span>
                    </span>
                  </a>
                )}
                {profileLoading ? (
                  <div className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-1 min-h-[40px] touch-manipulation">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                    <div className="hidden sm:block h-3 w-16 sm:w-20 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <a
                    href={`tel:${contactPhone}`}
                    className="group relative inline-flex items-center gap-1 sm:gap-1.5 font-semibold hover:text-[#f5f1e9] transition-colors pb-0.5 px-1.5 sm:px-2 py-1 min-h-[40px] touch-manipulation"
                  >
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="relative inline-block">
                      <span className="hidden sm:inline relative z-10 text-xs">
                        {contactPhone}
                      </span>
                      <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] transition-all duration-300 ease-out group-hover:w-full"></span>
                    </span>
                  </a>
                )}
              </div>

              {/* Separator */}
              <span
                className="text-gray-700/70 dark:text-gray-200/60 text-xs flex-shrink-0 px-1"
                aria-hidden="true"
              >
                |
              </span>

              {/* Social Networks */}
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                {socialLinks.facebook && (
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:scale-125 p-1.5 sm:p-2 min-h-[40px] min-w-[40px] flex items-center justify-center touch-manipulation"
                    aria-label="Facebook"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                )}
                {socialLinks.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:scale-125 p-1.5 sm:p-2 min-h-[40px] min-w-[40px] flex items-center justify-center touch-manipulation"
                    aria-label="Instagram"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}
                {socialLinks.youtube && (
                  <a
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:scale-125 p-1.5 sm:p-2 min-h-[40px] min-w-[40px] flex items-center justify-center touch-manipulation"
                    aria-label="YouTube"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                )}
                {socialLinks.tiktok && (
                  <a
                    href={socialLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:scale-125 p-1.5 sm:p-2 min-h-[40px] min-w-[40px] flex items-center justify-center touch-manipulation"
                    aria-label="TikTok"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Desktop: Original layout - reduced gap */}
            <div className="hidden lg:flex items-center justify-between py-2 sm:py-2.5 text-[10px] sm:text-xs md:text-sm gap-2 sm:gap-3">
              {/* Left: Find Us */}
              <div className="flex items-center justify-start">
                <Link
                  href="/find-us"
                  className="group relative inline-flex items-center gap-1.5 sm:gap-2 font-semibold tracking-[0.18em] sm:tracking-[0.14em] uppercase text-[#3a3428] dark:text-[#f5f1e9] hover:text-[#1f1b15] dark:hover:text-[#f8efdf] transition-colors pb-1"
                >
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="relative inline-block">
                    <span className="relative z-10">Find Us</span>
                    <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-gradient-to-r from-[#b09a7d] via-[#c9b79b] to-[#ddd5c3] transition-all duration-300 ease-out group-hover:w-full"></span>
                  </span>
                </Link>
              </div>

              {/* Right: Email, Phone, and Social Links */}
              <div className="flex items-center justify-end gap-2 sm:gap-3">
                  <span
                    className="text-gray-700/70 dark:text-gray-200/60"
                    aria-hidden="true"
                  >
                    |
                  </span>
                  {profileLoading ? (
                    <div className="inline-flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                      <div className="h-3 w-24 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  ) : (
                    <a
                      href={`mailto:${contactEmail}`}
                      className="group relative inline-flex items-center gap-1.5 hover:text-[#f5f1e9] transition-colors pb-1"
                    >
                      <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="relative inline-block">
                        <span className="relative z-10">
                          {contactEmail}
                        </span>
                        <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] transition-all duration-300 ease-out group-hover:w-full"></span>
                      </span>
                    </a>
                  )}
                  <span
                    className="text-gray-700/70 dark:text-gray-200/60"
                    aria-hidden="true"
                  >
                    |
                  </span>
                  {profileLoading ? (
                    <div className="inline-flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                      <div className="h-3 w-20 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  ) : (
                    <a
                      href={`tel:${contactPhone}`}
                      className="group relative inline-flex items-center gap-1.5 font-semibold hover:text-[#f5f1e9] transition-colors pb-1"
                    >
                      <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="relative inline-block">
                        <span className="relative z-10">
                          {contactPhone}
                        </span>
                        <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] transition-all duration-300 ease-out group-hover:w-full"></span>
                      </span>
                    </a>
                  )}
                <span
                  className="text-gray-700/70 dark:text-gray-200/60"
                  aria-hidden="true"
                >
                  |
                </span>
                <div className="flex items-center gap-4">
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-900 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:scale-125"
                      aria-label="Facebook"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-900 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:scale-125"
                      aria-label="Instagram"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                  )}
                  {socialLinks.youtube && (
                    <a
                      href={socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-900 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:scale-125"
                      aria-label="YouTube"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </a>
                  )}
                  {socialLinks.tiktok && (
                    <a
                      href={socialLinks.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-900 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:scale-125"
                      aria-label="TikTok"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                      </svg>
                    </a>
                  )}
                </div>
                <div className="flex pl-3 ml-1 border-l border-gray-700/40 dark:border-gray-200/20">
                  <ThemeToggleButton />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation Header - Clean No Filter Clinic Style */}
        <div className="border-b border-[#c9c1b0] dark:border-gray-800">
          <div className="container mx-auto px-4">
            <div
              className={`flex items-center justify-between transition-all duration-300 ${
                scrolled ? "h-16 md:h-18" : "h-20 md:h-24"
              }`}
            >
              {/* Left Navigation Links */}
              <nav
                className={`hidden lg:flex items-center transition-all duration-300 ${
                  scrolled
                    ? "gap-4 xl:gap-6 mr-6 xl:mr-8 2xl:mr-12"
                    : "gap-6 xl:gap-8 mr-8 xl:mr-12 2xl:mr-16"
                }`}
              >
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
                  <span
                    className="absolute inset-0 bg-white/75 dark:bg-gray-900/85 backdrop-blur-md rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md group-hover:shadow-lg border border-white/30 dark:border-gray-700/20"
                    style={{
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                    }}
                  ></span>
                </Link>
                <button
                  className={`group relative font-montserrat text-gray-700 dark:text-gray-300 font-light transition-all duration-300 text-xs lg:text-sm uppercase tracking-widest flex items-center gap-1 px-3 py-1.5 -mx-3 -my-1.5 rounded-md ${
                    activeMenu === "treatments"
                      ? "text-gray-900 dark:text-white"
                      : ""
                  }`}
                  onMouseEnter={() => handleMenuEnter("treatments")}
                  onMouseLeave={handleMenuLeave}
                >
                  <span className="relative z-10 transition-all duration-300 group-hover:text-gray-900 dark:group-hover:text-white">
                    Book Now
                  </span>
                  <ChevronDown
                    className={`relative z-10 w-2.5 h-2.5 transition-all duration-300 ${activeMenu === "treatments" ? "rotate-180 text-gray-900 dark:text-white" : "group-hover:text-gray-900 dark:group-hover:text-white"}`}
                  />
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-egp-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-10"></span>
                  {/* Blurred white/black background */}
                  <span
                    className={`absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-md transition-all duration-300 border border-white/20 dark:border-gray-700/20 ${
                      activeMenu === "treatments"
                        ? "opacity-100 shadow-lg"
                        : "opacity-0 group-hover:opacity-100 shadow-md group-hover:shadow-lg"
                    }`}
                    style={{
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                    }}
                  ></span>
                  {/* Solid color overlay */}
                  <span
                    className={`absolute inset-0 bg-egp-green/10 rounded-md transition-all duration-300 ${
                      activeMenu === "treatments"
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                    style={{ backdropFilter: "blur(4px)" }}
                  ></span>
                </button>
                <button
                  className={`group relative font-montserrat text-gray-700 dark:text-gray-300 font-light transition-all duration-300 text-xs lg:text-sm uppercase tracking-widest flex items-center gap-1 px-3 py-1.5 -mx-3 -my-1.5 rounded-md ${
                    activeMenu === "conditions"
                      ? "text-gray-900 dark:text-white"
                      : ""
                  }`}
                  onMouseEnter={() => handleMenuEnter("conditions")}
                  onMouseLeave={handleMenuLeave}
                >
                  <span className="relative z-10 transition-all duration-300 group-hover:text-gray-900 dark:group-hover:text-white">
                    By Condition
                  </span>
                  <ChevronDown
                    className={`relative z-10 w-2.5 h-2.5 transition-all duration-300 ${activeMenu === "conditions" ? "rotate-180 text-gray-900 dark:text-white" : "group-hover:text-gray-900 dark:group-hover:text-white"}`}
                  />
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-10"></span>
                  {/* Blurred white/black background */}
                  <span
                    className={`absolute inset-0 bg-white/75 dark:bg-gray-900/85 backdrop-blur-md rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md group-hover:shadow-lg border border-white/30 dark:border-gray-700/20`}
                    style={{
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                    }}
                  ></span>
                  {/* Gradient overlay */}
                  <span
                    className={`absolute inset-0 bg-gradient-to-r from-[#9d9585]/15 via-[#b5ad9d]/15 to-[#c9c1b0]/15 rounded-md transition-all duration-300 ${
                      activeMenu === "conditions"
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                    style={{ backdropFilter: "blur(4px)" }}
                  ></span>
                </button>
              </nav>

              {/* Centered Logo - Clean & Clear with Maximum Distance from Navigation */}
              <Link
                href="/"
                className="group absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center text-center px-2 sm:px-4 md:px-6 transition-all duration-300 hover:scale-105 z-10"
              >
                <h1
                  className={`font-playfair font-light text-gray-900 dark:text-white whitespace-nowrap leading-tight transition-all duration-300 group-hover:brightness-110 ${
                    scrolled
                      ? "text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl"
                      : "text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl"
                  }`}
                >
                  EGP AESTHETICS
                </h1>
                <p
                  className={`font-montserrat text-gray-700 dark:text-gray-400 font-light tracking-[0.25em] sm:tracking-[0.3em] uppercase transition-all duration-300 group-hover:text-gray-900 dark:group-hover:text-white group-hover:tracking-[0.35em] sm:group-hover:tracking-[0.4em] ${
                    scrolled
                      ? "text-[7px] sm:text-[8px] md:text-[9px] mt-0.5"
                      : "text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs mt-0.5 sm:mt-1"
                  }`}
                >
                  London
                </p>
                {/* Animated underline effect */}
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-px bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] dark:from-[#c9c1b0] dark:via-[#ddd5c3] dark:to-[#c9c1b0] transition-all duration-300 group-hover:w-full"></div>
              </Link>

              {/* Right Navigation Links */}
              <nav
                className={`hidden lg:flex items-center transition-all duration-300 ${
                  scrolled
                    ? "gap-4 xl:gap-6 ml-6 xl:ml-8 2xl:ml-12"
                    : "gap-6 xl:gap-8 ml-8 xl:ml-12 2xl:ml-16"
                }`}
              >
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
                  <span
                    className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md group-hover:shadow-lg border border-white/20 dark:border-gray-700/20"
                    style={{
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                    }}
                  ></span>
                </Link>
                {isPressPageEnabled && (
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
                    <span
                      className="absolute inset-0 bg-white/75 dark:bg-gray-900/85 backdrop-blur-md rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md group-hover:shadow-lg border border-white/30 dark:border-gray-700/20"
                      style={{
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                      }}
                    ></span>
                  </Link>
                )}
                {/* <Link
                href="/membership"
                className={`group relative font-montserrat text-gray-400 dark:text-gray-600 font-light transition-all duration-300 uppercase tracking-widest px-3 py-1.5 -mx-3 -my-1.5 rounded-md cursor-not-allowed pointer-events-none ${
                  scrolled ? "text-xs" : "text-xs lg:text-sm"
                }`}
                aria-disabled="true"
                tabIndex={-1}
              >
                <span className="relative z-10 transition-all duration-300">
                  Skin Membership
                </span>
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gray-300 dark:bg-gray-700 transform scale-x-0 transition-transform duration-300 origin-left z-10"></span>
                <span className="absolute inset-0 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-md rounded-md opacity-0 transition-all duration-300 shadow-md border border-gray-200/30 dark:border-gray-700/20" style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}></span>
              </Link> */}
              </nav>

              <button
                className="lg:hidden ml-auto p-3 rounded-full transition-all duration-500 hover:scale-110 transform hover:-translate-y-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-[#c9c1b0] dark:hover:bg-[#b5ad9d] shadow-lg hover:shadow-xl"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                <svg
                  className="h-6 w-6 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  style={{
                    transform: mobileMenuOpen
                      ? "rotate(90deg)"
                      : "rotate(0deg)",
                  }}
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  ) : (
                    <path
                      d="M4 6h16M4 12h16M4 18h16"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop mega menu is rendered via portal below so backdrop-filter blurs page content */}
      </header>
      {/* Portal: desktop mega menu (outside header so backdrop-filter blurs page) */}
      {isMounted && (activeMenu === "treatments" || activeMenu === "conditions") && typeof document !== "undefined" && createPortal(
        <div
          className="hidden lg:block fixed left-0 right-0 shadow-2xl overflow-hidden"
          style={{
            zIndex: 9999,
            top: megaMenuTop,
            bottom: 0,
            animation: "slideDown 0.3s ease-out",
          }}
          onMouseEnter={() => activeMenu && handleMenuEnter(activeMenu)}
          onMouseLeave={handleMenuLeave}
        >
          <div
            className="absolute inset-0 bg-white/40 dark:bg-black/35 border-b border-white/10 dark:border-white/5"
            style={{
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              transform: "translateZ(0)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-200/50 dark:via-gray-700/50 to-transparent z-20" />
          <div className="relative z-10 flex h-full flex-col min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="w-full max-w-[96vw] 2xl:max-w-[1600px] mx-auto px-5 sm:px-6 lg:px-8 py-6">
                <div
                className={`grid ${
                    activeMenu === "conditions"
                      ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-8 lg:gap-x-10"
                      : "gap-4 sm:gap-5 lg:gap-6"
                  } ${
                    activeMenu === "conditions"
                      ? ""
                      : bookNowCategories.length === 1
                        ? "grid-cols-1"
                        : bookNowCategories.length === 2
                          ? "grid-cols-2"
                          : bookNowCategories.length === 3
                            ? "grid-cols-3"
                            : bookNowCategories.length === 4
                              ? "grid-cols-4"
                              : bookNowCategories.length === 5
                                ? "grid-cols-5"
                                : bookNowCategories.length === 6
                                  ? "grid-cols-6"
                                  : "grid-cols-7"
                  }`}
                >
                  {activeMenu === "treatments" && (
                    <>
                      {bookNowCategories.map((category, index) => {
                        const categoryServices =
                          bookNowServices[category.id]?.services || [];
                        return (
                          <div
                            key={category.id}
                            className={`min-w-0 relative ${index > 0 ? "pl-4 lg:pl-6" : ""}`}
                          >
                            {index > 0 && (
                              <span
                                aria-hidden
                                className="absolute left-0 top-[12%] bottom-[12%] w-px bg-gray-200/60 dark:bg-gray-600/60"
                              />
                            )}
                            <div className="flex items-center justify-between gap-6 mb-5">
                              <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-widest font-montserrat">
                                {category.name}
                              </h3>
                              <Link
                                href={`/services?category=${encodeURIComponent(category.name)}`}
                                onClick={() => setActiveMenu(null)}
                                className="group relative text-xs font-medium text-gray-800 dark:text-gray-200 hover:text-egp-green dark:hover:text-egp-beige transition-all duration-300 whitespace-nowrap"
                              >
                                <span className="relative z-10">View All</span>
                                <span className="relative z-10 ml-1 inline-block group-hover:translate-x-1 transition-transform duration-300">→</span>
                              </Link>
                            </div>
                            <ul className="space-y-1 max-h-[min(78vh,680px)] overflow-y-auto menu-scroll pl-2 pr-2">
                              {categoryServices.map((item) => {
                                const hasDiscount = (item.originalPrice != null && item.originalPrice > item.price) || (item.discountPercentage != null && item.discountPercentage > 0);
                                return (
                                <li key={item.name}>
                                  <Link
                                    href="/book/new"
                                    onClick={() => {
                                      if (typeof window !== 'undefined') {
                                        sessionStorage.setItem('pendingServiceId', item.id);
                                      }
                                      setActiveMenu(null);
                                    }}
                                    className={`group relative flex px-2 py-1.5 -mx-2 rounded-md text-sm text-gray-800 dark:text-gray-200 font-montserrat transition-all duration-300 hover:bg-white/30 dark:hover:bg-white/10 ${hasDiscount ? 'flex-col gap-1.5 py-2 pr-12' : 'items-center justify-between gap-4'}`}
                                  >
                                    {hasDiscount && item.discountPercentage != null && item.discountPercentage > 0 && (
                                      <span className="absolute top-1.5 right-2 z-10 inline-flex flex-shrink-0 text-[10px] font-semibold bg-egp-green text-white dark:bg-egp-beige dark:text-egp-green px-1.5 py-0.5 rounded">
                                        {item.discountPercentage}% off
                                      </span>
                                    )}
                                    <span className="relative z-0 flex-1 min-w-0 group-hover:translate-x-1 text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-all duration-300 inline-flex items-center gap-2 flex-wrap">
                                      {item.name}
                                      <span className="absolute left-0 -bottom-0.5 w-0 h-px bg-egp-green dark:bg-egp-beige group-hover:w-full transition-all duration-300 ease-out origin-left"></span>
                                    </span>
                                    <span className={`relative z-0 flex-shrink-0 text-right min-w-0 ${hasDiscount ? 'w-full flex justify-end' : ''}`}>
                                      <PriceWithDiscount
                                        price={item.price}
                                        originalPrice={item.originalPrice}
                                        discountPercentage={item.discountPercentage}
                                        size="sm"
                                        showBadge={false}
                                        layout="inline"
                                        align={hasDiscount ? "end" : "start"}
                                        compact={true}
                                      />
                                    </span>
                                  </Link>
                                </li>
                                );
                              })}
                            </ul>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {activeMenu === "conditions" && (
                    <>
                      {/* Face Conditions - box with centered title */}
                      <div className="min-w-0 lg:col-span-2 flex flex-col">
                        <div className="flex flex-col items-center justify-center text-center mb-5">
                          <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-widest font-montserrat mb-1">
                            Face Conditions
                          </h3>
                          <Link
                            href="/conditions"
                            onClick={() => setActiveMenu(null)}
                            className="group text-xs font-medium text-gray-800 dark:text-gray-200 hover:text-egp-green dark:hover:text-egp-beige transition-all duration-300"
                          >
                            <span className="relative z-10">View All</span>
                            <span className="relative z-10 ml-1 inline-block group-hover:translate-x-1 transition-transform duration-300">→</span>
                          </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 lg:gap-x-6">
                          {[0, 1].map((col) => {
                            const faceItems = conditionsByCategory.face;
                            const mid = Math.ceil(faceItems.length / 2);
                            const slice = col === 0 ? faceItems.slice(0, mid) : faceItems.slice(mid);
                            if (slice.length === 0) return null;
                            return (
                              <ul key={`face-${col}`} className="space-y-1 max-h-[min(78vh,680px)] overflow-y-auto menu-scroll pl-2 pr-2">
                                {slice.map((condition) => {
                                  const priceInfo = getConditionPrice(condition);
                                  return (
                                    <li key={condition.id}>
                                      <Link
                                        href={`/conditions/${condition.slug}`}
                                        className="group relative flex items-center justify-between gap-2 px-2 py-1.5 -mx-2 rounded-md text-sm text-gray-800 dark:text-gray-200 font-montserrat transition-all duration-300 hover:bg-white/30 dark:hover:bg-white/10"
                                        onClick={() => setActiveMenu(null)}
                                      >
                                        <span className="relative z-10 group-hover:translate-x-1 text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-all duration-300 inline-block min-w-0">
                                          {condition.title}
                                          <span className="absolute left-0 -bottom-0.5 w-0 h-px bg-egp-green dark:bg-egp-beige group-hover:w-full transition-all duration-300 ease-out origin-left"></span>
                                        </span>
                                        {priceInfo && (
                                          <span className="relative z-10 text-xs font-semibold text-egp-green dark:text-egp-beige flex-shrink-0">
                                            £{Number.isInteger(priceInfo.price) ? priceInfo.price : priceInfo.price.toFixed(2)}
                                          </span>
                                        )}
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            );
                          })}
                        </div>
                      </div>
                      {/* Body Conditions - box with centered title, extra gap from Face */}
                      <div className="min-w-0 lg:col-span-2 flex flex-col pl-4 lg:pl-8 relative">
                        <span
                          aria-hidden
                          className="absolute left-0 top-[12%] bottom-[12%] w-px bg-gray-200/60 dark:bg-gray-600/60"
                        />
                        <div className="flex flex-col items-center justify-center text-center mb-5">
                          <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-widest font-montserrat mb-1">
                            Body Conditions
                          </h3>
                          <Link
                            href="/conditions?category=Body"
                            onClick={() => setActiveMenu(null)}
                            className="group text-xs font-medium text-gray-800 dark:text-gray-200 hover:text-egp-green dark:hover:text-egp-beige transition-all duration-300"
                          >
                            <span className="relative z-10">View All</span>
                            <span className="relative z-10 ml-1 inline-block group-hover:translate-x-1 transition-transform duration-300">→</span>
                          </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 lg:gap-x-6">
                          {[0, 1].map((col) => {
                            const bodyItems = conditionsByCategory.body;
                            const mid = Math.ceil(bodyItems.length / 2);
                            const slice = col === 0 ? bodyItems.slice(0, mid) : bodyItems.slice(mid);
                            if (slice.length === 0) return null;
                            return (
                              <ul key={`body-${col}`} className="space-y-1 max-h-[min(78vh,680px)] overflow-y-auto menu-scroll pl-2 pr-2">
                                {slice.map((condition) => {
                                  const priceInfo = getConditionPrice(condition);
                                  return (
                                    <li key={condition.id}>
                                      <Link
                                        href={`/conditions/${condition.slug}`}
                                        className="group relative flex items-center justify-between gap-2 px-2 py-1.5 -mx-2 rounded-md text-sm text-gray-800 dark:text-gray-200 font-montserrat transition-all duration-300 hover:bg-white/30 dark:hover:bg-white/10"
                                        onClick={() => setActiveMenu(null)}
                                      >
                                        <span className="relative z-10 group-hover:translate-x-1 text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-all duration-300 inline-block min-w-0">
                                          {condition.title}
                                          <span className="absolute left-0 -bottom-0.5 w-0 h-px bg-egp-green dark:bg-egp-beige group-hover:w-full transition-all duration-300 ease-out origin-left"></span>
                                        </span>
                                        {priceInfo && (
                                          <span className="relative z-10 text-xs font-semibold text-egp-green dark:text-egp-beige flex-shrink-0">
                                            £{Number.isInteger(priceInfo.price) ? priceInfo.price : priceInfo.price.toFixed(2)}
                                          </span>
                                        )}
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            );
                          })}
                        </div>
                      </div>
                      {/* CTA panel - uses remaining space, extra gap from Body */}
                      <div className="min-w-0 lg:col-span-2 flex flex-col justify-center pl-4 lg:pl-8 relative">
                        <span
                          aria-hidden
                          className="absolute left-0 top-[12%] bottom-[12%] w-px bg-gray-200/60 dark:bg-gray-600/60"
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-xs">
                          Find the right treatment for your concern. Book a consultation or browse our full conditions list.
                        </p>
                        <Link
                          href="/conditions"
                          onClick={() => setActiveMenu(null)}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-egp-green dark:text-egp-beige hover:underline"
                        >
                          View all conditions
                          <span className="inline-block group-hover:translate-x-1">→</span>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            {/* Scroll hint - always visible at bottom, outside scroll area */}
            <div className="flex-shrink-0 border-t-2 border-white/50 dark:border-gray-500/50 bg-white/20 dark:bg-black/20 px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <ChevronDown className="w-4 h-4 flex-shrink-0 opacity-80" />
              <span>Scroll within each column to see all services</span>
            </div>
          </div>
        </div>,
        document.body
      )}
      {isMounted &&
        mobileMenuOpen &&
        createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99999,
              pointerEvents: "none",
            }}
          >
            {/* Backdrop */}
            <div
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
              style={{ pointerEvents: "auto" }}
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-in Menu */}
            <div className="lg:hidden fixed inset-y-0 right-0 w-[90%] max-w-[420px] bg-[#ddd5c3] dark:bg-gray-900 shadow-2xl overflow-y-auto touch-manipulation animate-slideInRight pointer-events-auto">
              {/* Mobile Menu Header with Close Button */}
              <div className="sticky top-0 z-10 bg-[#ddd5c3] dark:bg-gray-900 border-b border-[#c9c1b0] dark:border-gray-700 px-4 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white font-playfair">
                  Menu
                </h2>
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
                      className="group relative flex px-4 py-3.5 min-h-[44px] text-base text-gray-700 dark:text-gray-300 hover:bg-[#c9c1b0] dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-light transition-all duration-200 active:scale-95 font-montserrat uppercase tracking-widest items-center pb-1"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="relative z-10">About Us</span>
                      <span className="absolute left-4 right-4 -bottom-0.5 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] transition-transform duration-300 ease-out group-hover:scale-x-100"></span>
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() =>
                        setActiveMenu(
                          activeMenu === "treatments" ? null : "treatments"
                        )
                      }
                      className="w-full flex items-center justify-between px-4 py-3.5 min-h-[44px] text-base text-gray-700 dark:text-gray-300 hover:bg-[#c9c1b0] dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-light transition-all duration-200 active:scale-95 touch-manipulation font-montserrat uppercase tracking-widest"
                    >
                      <span>Book Now</span>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform duration-200 ${
                          activeMenu === "treatments" ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {activeMenu === "treatments" && (
                      <div className="mt-3 pl-2 space-y-4 bg-[#f0ede7] dark:bg-gray-800/50 rounded-lg p-4 border border-[#c9c1b0] dark:border-gray-700">
                        {bookNowCategories.map((category) => {
                          const categoryServices =
                            bookNowServices[category.id]?.services || [];
                          return (
                            <div key={category.id} className="space-y-2">
                              <div className="flex items-center justify-between mb-3 px-2">
                                <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider font-montserrat">
                                {category.name}
                              </h4>
                                <Link
                                  href={`/services?category=${encodeURIComponent(category.name)}`}
                                  onClick={() => {
                                    setMobileMenuOpen(false);
                                    setActiveMenu(null);
                                  }}
                                  className="text-xs text-[#9d9585] dark:text-[#c9c1b0] hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                                >
                                  View All →
                                </Link>
                              </div>
                              <ul className="space-y-1 max-h-[300px] overflow-y-auto menu-scroll pr-2">
                                {categoryServices.map((item) => {
                                  const hasDiscount = (item.originalPrice != null && item.originalPrice > item.price) || (item.discountPercentage != null && item.discountPercentage > 0);
                                  return (
                                  <li key={item.name}>
                                    <Link
                                      href="/book/new"
                                      onClick={() => {
                                        if (typeof window !== 'undefined') {
                                          sessionStorage.setItem('pendingServiceId', item.id);
                                        }
                                        setMobileMenuOpen(false);
                                        setActiveMenu(null);
                                      }}
                                      className={`group relative flex px-3 py-2.5 min-h-[44px] text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-md transition-all duration-200 active:scale-95 touch-manipulation font-montserrat pb-1 ${hasDiscount ? 'flex-col gap-1.5 items-stretch pr-12' : 'items-center justify-between gap-3'}`}
                                    >
                                      {hasDiscount && item.discountPercentage != null && item.discountPercentage > 0 && (
                                        <span className="absolute top-2 right-2 z-10 inline-flex flex-shrink-0 text-[10px] font-semibold bg-egp-green text-white dark:bg-egp-beige dark:text-egp-green px-1.5 py-0.5 rounded">
                                          {item.discountPercentage}% off
                                        </span>
                                      )}
                                      <span className="relative flex-1 min-w-0 text-left leading-tight inline-flex items-center gap-2 flex-wrap pr-0">
                                        <span className="relative z-0">
                                          {item.name}
                                        </span>
                                        <span className="absolute left-0 right-0 -bottom-0.5 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] transition-transform duration-300 ease-out group-hover:scale-x-100"></span>
                                      </span>
                                      <span className={`flex-shrink-0 text-right min-w-0 z-0 ${hasDiscount ? 'w-full flex justify-end' : ''}`}>
                                        <PriceWithDiscount
                                          price={item.price}
                                          originalPrice={item.originalPrice}
                                          discountPercentage={item.discountPercentage}
                                          size="sm"
                                          showBadge={false}
                                          layout="inline"
                                          align={hasDiscount ? "end" : "start"}
                                          compact={true}
                                        />
                                      </span>
                                    </Link>
                                  </li>
                                  );
                                })}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </li>
                  <li>
                    <button
                      onClick={() =>
                        setActiveMenu(
                          activeMenu === "conditions" ? null : "conditions"
                        )
                      }
                      className="w-full flex items-center justify-between px-4 py-3.5 min-h-[44px] text-base text-gray-700 dark:text-gray-300 hover:bg-[#c9c1b0] dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-light transition-all duration-200 active:scale-95 touch-manipulation font-montserrat uppercase tracking-widest"
                    >
                      <span>By Condition</span>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform duration-200 ${
                          activeMenu === "conditions" ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {activeMenu === "conditions" && (
                      <div className="mt-3 pl-2 space-y-4 bg-[#f0ede7] dark:bg-gray-800/50 rounded-lg p-4 border border-[#c9c1b0] dark:border-gray-700">
                        <div>
                          <div className="flex items-center justify-between mb-3 px-2">
                            <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider font-montserrat">
                              Face Conditions
                            </h4>
                            <Link
                              href="/conditions"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setActiveMenu(null);
                              }}
                              className="text-xs text-[#9d9585] dark:text-[#c9c1b0] hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                            >
                              View All →
                            </Link>
                          </div>
                          <ul className="space-y-1 max-h-[250px] overflow-y-auto menu-scroll pr-2">
                            {conditionsByCategory.face.map((condition) => {
                              const priceInfo = getConditionPrice(condition);
                              return (
                                <li key={condition.id}>
                                  <Link
                                    href={`/conditions/${condition.slug}`}
                                    className="group relative flex items-center justify-between gap-2 px-3 py-2.5 min-h-[44px] text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-md transition-all duration-200 active:scale-95 touch-manipulation font-montserrat pb-1"
                                    onClick={() => {
                                      setMobileMenuOpen(false);
                                      setActiveMenu(null);
                                    }}
                                  >
                                    <span className="relative z-10 min-w-0">{condition.title}</span>
                                    {priceInfo && (
                                      <span className="relative z-10 text-xs font-semibold text-egp-green dark:text-egp-beige flex-shrink-0">
                                        £{Number.isInteger(priceInfo.price) ? priceInfo.price : priceInfo.price.toFixed(2)}
                                      </span>
                                    )}
                                    <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] transition-transform duration-300 ease-out group-hover:scale-x-100"></span>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-3 px-2">
                            <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-200 uppercase tracking-wider font-montserrat">
                              Body Conditions
                            </h4>
                            <Link
                              href="/conditions?category=Body"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setActiveMenu(null);
                              }}
                              className="text-xs text-[#9d9585] dark:text-[#c9c1b0] hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                            >
                              View All →
                            </Link>
                          </div>
                          <ul className="space-y-1 max-h-[250px] overflow-y-auto menu-scroll pr-2">
                            {conditionsByCategory.body.map((condition) => {
                              const priceInfo = getConditionPrice(condition);
                              return (
                                <li key={condition.id}>
                                  <Link
                                    href={`/conditions/${condition.slug}`}
                                    className="group relative flex items-center justify-between gap-2 px-3 py-2.5 min-h-[44px] text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-md transition-all duration-200 active:scale-95 touch-manipulation font-montserrat pb-1"
                                    onClick={() => {
                                      setMobileMenuOpen(false);
                                      setActiveMenu(null);
                                    }}
                                  >
                                    <span className="relative z-10 min-w-0">{condition.title}</span>
                                    {priceInfo && (
                                      <span className="relative z-10 text-xs font-semibold text-egp-green dark:text-egp-beige flex-shrink-0">
                                        £{Number.isInteger(priceInfo.price) ? priceInfo.price : priceInfo.price.toFixed(2)}
                                      </span>
                                    )}
                                    <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] transition-transform duration-300 ease-out group-hover:scale-x-100"></span>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    )}
                  </li>
                  <li>
                    <Link
                      href="/blog"
                      className="group relative flex px-4 py-3.5 min-h-[44px] text-base text-gray-700 dark:text-gray-300 hover:bg-[#c9c1b0] dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-light transition-all duration-200 active:scale-95 font-montserrat uppercase tracking-widest items-center pb-1"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="relative z-10">Blog</span>
                      <span className="absolute left-4 right-4 -bottom-0.5 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] transition-transform duration-300 ease-out group-hover:scale-x-100"></span>
                    </Link>
                  </li>
                  {isPressPageEnabled && (
                    <li>
                      <Link
                        href="/press"
                        className="group relative flex px-4 py-3.5 min-h-[44px] text-base text-gray-700 dark:text-gray-300 hover:bg-[#c9c1b0] dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-light transition-all duration-200 active:scale-95 font-montserrat uppercase tracking-widest items-center pb-1"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="relative z-10">Awards/ Press</span>
                        <span className="absolute left-4 right-4 -bottom-0.5 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] transition-transform duration-300 ease-out group-hover:scale-x-100"></span>
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link
                      href="/find-us"
                      className="group relative flex px-4 py-3.5 min-h-[44px] text-base text-gray-700 dark:text-gray-300 hover:bg-[#c9c1b0] dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-light transition-all duration-200 active:scale-95 font-montserrat uppercase tracking-widest items-center pb-1"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="relative z-10">Find Us</span>
                      <span className="absolute left-4 right-4 -bottom-0.5 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] transition-transform duration-300 ease-out group-hover:scale-x-100"></span>
                    </Link>
                  </li>
                </ul>

                <div className="mt-6 flex justify-center border-t border-[#c9c1b0] dark:border-gray-700 pt-4">
                  <ThemeToggleButton />
                </div>
              </nav>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

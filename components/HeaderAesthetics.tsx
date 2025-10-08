"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import ThemeToggleButton from "./ThemeToggleButton";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Menu, 
  X,
  ChevronDown,
  Calendar
} from "lucide-react";

export default function HeaderAesthetics() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

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
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white dark:bg-gray-900 shadow-lg" : "bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm"
      }`}
    >
      {/* Top Bar - Contact Info */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-9 sm:h-10 text-xs sm:text-sm">
            {/* Left side - Find Us */}
            <div className="hidden lg:flex items-center gap-4 xl:gap-6">
              <Link 
                href="/contact" 
                className="flex items-center gap-1.5 hover:text-rose-100 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-medium">Find Us</span>
              </Link>
            </div>

            {/* Right side - Email, Phone & Social Links */}
            <div className="flex items-center gap-2 sm:gap-4 md:gap-6 ml-auto w-full lg:w-auto justify-end">
              <a 
                href={`mailto:${siteConfig.contact.email}`}
                className="flex items-center gap-1 sm:gap-2 hover:text-rose-100 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden md:inline text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                  {siteConfig.contact.email}
                </span>
              </a>
              <a 
                href={`tel:${siteConfig.contact.phone}`}
                className="flex items-center gap-1 sm:gap-2 hover:text-rose-100 transition-colors font-medium"
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
                {/* Theme Toggle in Top Bar - Smaller and More to Right */}
                <div className="ml-3 pl-3 border-l border-white/30">
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
      <div className="border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20 md:h-24">
            {/* Left Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 mr-8 xl:mr-12 2xl:mr-16">
              <Link
                href="/about"
                className="font-montserrat text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 font-light transition-colors text-xs lg:text-sm uppercase tracking-widest"
              >
                About
              </Link>
              <button
                className="font-montserrat text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 font-light transition-colors text-xs lg:text-sm uppercase tracking-widest flex items-center gap-1"
                onMouseEnter={() => handleMenuEnter('treatments')}
                onMouseLeave={handleMenuLeave}
              >
                Book Now
                <ChevronDown className="w-2.5 h-2.5" />
              </button>
              <button
                className="font-montserrat text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 font-light transition-colors text-xs lg:text-sm uppercase tracking-widest flex items-center gap-1"
                onMouseEnter={() => handleMenuEnter('conditions')}
                onMouseLeave={handleMenuLeave}
              >
                By Condition
                <ChevronDown className="w-2.5 h-2.5" />
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-gray-800 transition-all touch-manipulation"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
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
              className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center text-center px-20 lg:px-24 xl:px-28 2xl:px-32"
            >
              <h1 className="font-playfair text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-gray-900 dark:text-white whitespace-nowrap leading-tight">
                EGP AESTHETICS
              </h1>
              <p className="font-montserrat text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-light mt-1 tracking-[0.3em] uppercase">
                London
              </p>
            </Link>

            {/* Right Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 ml-8 xl:ml-12 2xl:ml-16">
              <Link
                href="/blog"
                className="font-montserrat text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 font-light transition-colors text-xs lg:text-sm uppercase tracking-widest"
              >
                Blog
              </Link>
              <Link
                href="/press"
                className="font-montserrat text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 font-light transition-colors text-xs lg:text-sm uppercase tracking-widest"
              >
                Awards/ Press
              </Link>
              <Link
                href="/membership"
                className="font-montserrat text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 font-light transition-colors text-xs lg:text-sm uppercase tracking-widest"
              >
                Skin Membership
              </Link>
            </nav>

            {/* Mobile Theme Toggle */}
            <div className="lg:hidden">
              <ThemeToggleButton />
            </div>
          </div>
        </div>
      </div>

      {/* Mega Menu Dropdowns */}
      {(activeMenu === 'treatments' || activeMenu === 'conditions') && (
        <div 
          className="absolute left-0 right-0 top-full z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-lg"
          onMouseEnter={() => handleMenuEnter(activeMenu)}
          onMouseLeave={handleMenuLeave}
        >
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-4 gap-8">
              {activeMenu === 'treatments' && (
                <>
                  <div>
                    <h3 className="text-xs font-light text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-widest font-montserrat">
                      Face
                    </h3>
                    <ul className="space-y-3">
                      {[
                        { name: "Book Treatment Now", price: "From £50" },
                        { name: "Digital Skin Analysis", price: "£50" },
                        { name: "PRP", price: "£480" },
                        { name: "Exosomes", price: "£550" },
                        { name: "Polynucleotides", price: "£390" },
                        { name: "5-Point Facelift", price: "£950" },
                        { name: "Profhilo", price: "£390" },
                        { name: "Sculptra", price: "£790" },
                        { name: "Skin Boosters", price: "£230" },
                        { name: "Deep Cleansing Facial", price: "£170" },
                        { name: "Medical Skin Peels", price: "£200" },
                        { name: "Deep Hydra Detox Facial", price: "£200" },
                        { name: "NCTF Under-Eye Skin Booster", price: "£159" },
                        { name: "3-Step Under-Eye Treatment", price: "£390" },
                        { name: "Injectable Mesotherapy", price: "£170" },
                        { name: "Microneedling Facial", price: "£170" },
                        { name: "Full Face Balancing", price: "£790" }
                      ].map((item) => (
                        <li key={item.name}>
                          <Link
                            href={`/services/${item.name.toLowerCase().replace(/\s+/g, '-').replace(/[&/]/g, '').replace(/[()]/g, '')}`}
                            className="group flex items-start justify-between gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-montserrat"
                            onClick={() => setActiveMenu(null)}
                          >
                            <span className="group-hover:translate-x-1 transition-transform">
                              {item.name}
                            </span>
                            <span className="font-semibold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent whitespace-nowrap">
                              {item.price}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs font-light text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-widest font-montserrat">
                      Anti-Wrinkle Injections
                    </h3>
                    <ul className="space-y-3">
                      {[
                        { name: "Baby Botox", price: "£199" },
                        { name: "Brow Lift", price: "£279" },
                        { name: "Eye Wrinkles", price: "£179" },
                        { name: "Forehead Lines", price: "£179" },
                        { name: "Glabella Lines", price: "£179" },
                        { name: "Barcode Lips", price: "£129" },
                        { name: "Bunny Lines", price: "£129" },
                        { name: "Lip Lines", price: "£179" },
                        { name: "Gummy Smile", price: "£129" },
                        { name: "Neck Lift", price: "£329" },
                        { name: "Jaw Slimming", price: "£279" },
                        { name: "Pebble Chin", price: "£179" },
                        { name: "Bruxism", price: "£279" }
                      ].map((item) => (
                        <li key={item.name}>
                          <Link
                            href={`/services/${item.name.toLowerCase().replace(/\s+/g, '-').replace(/[&/]/g, '').replace(/[()]/g, '')}`}
                            className="group flex items-start justify-between gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-montserrat"
                            onClick={() => setActiveMenu(null)}
                          >
                            <span className="group-hover:translate-x-1 transition-transform">
                              {item.name}
                            </span>
                            <span className="font-semibold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent whitespace-nowrap">
                              {item.price}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs font-light text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-widest font-montserrat">
                      Fillers
                    </h3>
                    <ul className="space-y-3">
                      {[
                        { name: "Cheek & Mid-Face Filler", price: "£390" },
                        { name: "Chin Filler", price: "£290" },
                        { name: "Marionette Lines Filler", price: "£290" },
                        { name: "Nasolabial Folds Filler", price: "£290" },
                        { name: "Jawline Filler", price: "£550" },
                        { name: "Lip Enhancement", price: "£290" },
                        { name: "Lip Hydration", price: "£190" },
                        { name: "Tear Trough Filler", price: "£390" },
                        { name: "Temple Filler", price: "£290" },
                        { name: "Filler Dissolving", price: "£150" }
                      ].map((item) => (
                        <li key={item.name}>
                          <Link
                            href={`/services/${item.name.toLowerCase().replace(/\s+/g, '-').replace(/[&/]/g, '').replace(/[()]/g, '')}`}
                            className="group flex items-start justify-between gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-montserrat"
                            onClick={() => setActiveMenu(null)}
                          >
                            <span className="group-hover:translate-x-1 transition-transform">
                              {item.name}
                            </span>
                            <span className="font-semibold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent whitespace-nowrap">
                              {item.price}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs font-light text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-widest font-montserrat">
                      Body
                    </h3>
                    <ul className="space-y-3">
                      {[
                        { name: "Body Fat Burning Mesotherapy", price: "£170" },
                        { name: "Radiofrequency & Ultrasound", price: "£250" },
                        { name: "Fat Freezing Treatment", price: "£200" },
                        { name: "Ultrasound Lift & Tighten", price: "£190" },
                        { name: "Combined Treatment", price: "£350" }
                      ].map((item) => (
                        <li key={item.name}>
                          <Link
                            href={`/services/${item.name.toLowerCase().replace(/\s+/g, '-').replace(/[&/]/g, '').replace(/[()]/g, '')}`}
                            className="group flex items-start justify-between gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-montserrat"
                            onClick={() => setActiveMenu(null)}
                          >
                            <span className="group-hover:translate-x-1 transition-transform">
                              {item.name}
                            </span>
                            <span className="font-semibold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent whitespace-nowrap">
                              {item.price}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
              
              {activeMenu === 'conditions' && (
                <>
                  <div>
                    <h3 className="text-xs font-light text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-widest font-montserrat">
                      Face Conditions
                    </h3>
                    <ul className="space-y-3">
                      {[
                        "Acne & Acne Scarring",
                        "Rosacea",
                        "Hyperpigmentation & Melasma",
                        "Barcode Lines Around Lips",
                        "Bruxism",
                        "Dark Under-Eye Circles",
                        "Double Chin",
                        "Nasolabial Folds",
                        "Shadows Around Nasolabial Folds",
                        "Under-Eye Hollows",
                        "Eye Bags",
                        "Flat Cheeks",
                        "Flat / Pebble Chin",
                        "Gummy Smile",
                        "Heavy Lower Face",
                        "Jowling",
                        "Low Eyebrows"
                      ].map((condition) => (
                        <li key={condition}>
                          <Link
                            href={`/conditions/${condition.toLowerCase().replace(/\s+/g, '-').replace(/[&/]/g, '')}`}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-montserrat"
                            onClick={() => setActiveMenu(null)}
                          >
                            {condition}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs font-light text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-widest font-montserrat">
                      Body Conditions
                    </h3>
                    <ul className="space-y-3">
                      {[
                        "Cellulite (Thighs, Buttocks, Abdomen)",
                        "Stubborn Belly Fat / Abdominal Fat",
                        "Love Handles / Flanks",
                        "Sagging Skin (Skin Laxity)",
                        "Stretch Marks",
                        "Arm Fat & Bingo Wings",
                        "Thigh Fat & Inner Thigh Laxity",
                        "Double Chin / Jawline Fat",
                        "Post-Pregnancy Tummy",
                        "Water Retention / Bloating / Swelling"
                      ].map((condition) => (
                        <li key={condition}>
                          <Link
                            href={`/conditions/${condition.toLowerCase().replace(/\s+/g, '-').replace(/[&/]/g, '').replace(/[()]/g, '')}`}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-montserrat"
                            onClick={() => setActiveMenu(null)}
                          >
                            {condition}
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
      )}

      {/* Mobile Navigation - Slide in from right with backdrop */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Slide-in Menu */}
          <div className="lg:hidden fixed inset-y-0 right-0 w-[85%] sm:w-[380px] bg-white dark:bg-gray-900 z-50 shadow-2xl overflow-y-auto touch-manipulation animate-slideInRight">
            <nav className="container mx-auto px-4 sm:px-6 py-6">
            <ul className="space-y-1.5 sm:space-y-2">
              {/* Left Navigation Items */}
              <li>
                <Link
                  href="/about"
                  className="block px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg font-light transition-colors active:scale-95 font-montserrat uppercase tracking-widest"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setActiveMenu(activeMenu === 'treatments' ? null : 'treatments')}
                  className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg font-light transition-colors active:scale-95 touch-manipulation font-montserrat uppercase tracking-widest"
                >
                  Book Now
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform ${
                      activeMenu === 'treatments' ? "rotate-180" : ""
                    }`} 
                  />
                </button>
                {activeMenu === 'treatments' && (
                  <div className="mt-2 pl-4 sm:pl-6 space-y-3">
                    <div>
                      <h4 className="text-xs font-light text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-widest font-montserrat">
                        Face
                      </h4>
                      <ul className="space-y-1">
                        {[
                          { name: "Book Treatment Now", price: "From £50" },
                          { name: "Digital Skin Analysis", price: "£50" },
                          { name: "PRP", price: "£480" },
                          { name: "Exosomes", price: "£550" },
                          { name: "Polynucleotides", price: "£390" },
                          { name: "5-Point Facelift", price: "£950" }
                        ].map((item) => (
                          <li key={item.name}>
                            <Link
                              href={`/services/${item.name.toLowerCase().replace(/\s+/g, '-').replace(/[&/]/g, '').replace(/[()]/g, '')}`}
                              className="flex items-start justify-between gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors active:scale-95 touch-manipulation font-montserrat"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setActiveMenu(null);
                              }}
                            >
                              <span className="flex-1">{item.name}</span>
                              <span className="font-semibold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent whitespace-nowrap text-sm">
                                {item.price}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-light text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-widest font-montserrat">
                        Anti-Wrinkle Injections
                      </h4>
                      <ul className="space-y-1">
                        {[
                          { name: "Baby Botox", price: "£199" },
                          { name: "Brow Lift", price: "£279" },
                          { name: "Eye Wrinkles", price: "£179" },
                          { name: "Forehead Lines", price: "£179" },
                          { name: "Glabella Lines", price: "£179" },
                          { name: "Barcode Lips", price: "£129" }
                        ].map((item) => (
                          <li key={item.name}>
                            <Link
                              href={`/services/${item.name.toLowerCase().replace(/\s+/g, '-').replace(/[&/]/g, '').replace(/[()]/g, '')}`}
                              className="flex items-start justify-between gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors active:scale-95 touch-manipulation font-montserrat"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setActiveMenu(null);
                              }}
                            >
                              <span className="flex-1">{item.name}</span>
                              <span className="font-semibold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent whitespace-nowrap text-sm">
                                {item.price}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </li>
              <li>
                <button
                  onClick={() => setActiveMenu(activeMenu === 'conditions' ? null : 'conditions')}
                  className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg font-light transition-colors active:scale-95 touch-manipulation font-montserrat uppercase tracking-widest"
                >
                  By Condition
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform ${
                      activeMenu === 'conditions' ? "rotate-180" : ""
                    }`} 
                  />
                </button>
                {activeMenu === 'conditions' && (
                  <div className="mt-2 pl-4 sm:pl-6 space-y-3">
                    <div>
                      <h4 className="text-xs font-light text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-widest font-montserrat">
                        Face Conditions
                      </h4>
                      <ul className="space-y-1">
                        {[
                          "Acne & Acne Scarring",
                          "Rosacea",
                          "Hyperpigmentation & Melasma",
                          "Dark Under-Eye Circles",
                          "Double Chin",
                          "Nasolabial Folds"
                        ].map((condition) => (
                          <li key={condition}>
                            <Link
                              href={`/conditions/${condition.toLowerCase().replace(/\s+/g, '-').replace(/[&/]/g, '')}`}
                              className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors active:scale-95 touch-manipulation font-montserrat"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setActiveMenu(null);
                              }}
                            >
                              {condition}
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
                  className="block px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg font-light transition-colors active:scale-95 font-montserrat uppercase tracking-widest"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/press"
                  className="block px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg font-light transition-colors active:scale-95 font-montserrat uppercase tracking-widest"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Awards/ Press
                </Link>
              </li>
              <li>
                <Link
                  href="/membership"
                  className="block px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg font-light transition-colors active:scale-95 font-montserrat uppercase tracking-widest"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Skin Membership
                </Link>
              </li>

            </ul>

          </nav>
        </div>
        </>
      )}
    </header>
  );
}
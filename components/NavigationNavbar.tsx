"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useScrollDirection } from "@/hooks/useScrollDirection";
import { ThemeToggle } from "./ThemeToggle";

const navigation = [
  { name: "Home", href: "#home" },
  { name: "Services", href: "#services" },
  { 
    name: "About", 
    href: "#about",
    dropdown: [
      { name: "Our Story", href: "#our-story" },
      { name: "Service Areas", href: "#service-areas" },
      { name: "Gallery", href: "#gallery" }
    ]
  },
  { 
    name: "Support", 
    href: "#faq",
    dropdown: [
      { name: "FAQ", href: "#faq" },
      { name: "Reviews", href: "#reviews" },
    ]
  },
  { name: "Contact", href: "#contact" },
];

export default function NavigationNavbar() {
  const { scrollDirection, isScrolled } = useScrollDirection();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const routerUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hide navigation on terms and privacy pages
  const shouldHideNavigation = pathname === "/terms" || pathname === "/privacy";

  useEffect(() => {
    // Throttle function to limit how often the scroll handler runs
    const throttle = (func: () => void, delay: number) => {
      let timeoutId: NodeJS.Timeout | null = null;
      let lastExecTime = 0;
      
      return () => {
        const currentTime = Date.now();
        
        if (currentTime - lastExecTime > delay) {
          func();
          lastExecTime = currentTime;
        } else {
          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            func();
            lastExecTime = Date.now();
          }, delay - (currentTime - lastExecTime));
        }
      };
    };

    let previousSection = "";

    const handleScrollSpy = () => {
      const allSections = [
        "home", "services", "about", "our-story", "service-areas", "gallery", "faq", "reviews", "contact"
      ];
      
      // Find the section that is currently in view
      let currentSection: string | null = null;
      let minDistance = Infinity;
      
      allSections.forEach((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          
          // Get navbar and banner heights for precise calculation
          const navbar = document.querySelector('nav');
          const dayOffBanner = document.querySelector('[data-day-off-banner]') as HTMLElement;
          const navbarHeight = navbar ? navbar.offsetHeight : 80;
          const bannerHeight = dayOffBanner && dayOffBanner.offsetHeight > 0 ? dayOffBanner.offsetHeight : 0;
          const totalOffset = navbarHeight + bannerHeight + 80; // 80px threshold for better detection
          
          // Check if section is in view with precise offset
          if (rect.top <= totalOffset && rect.bottom >= totalOffset) {
            const distance = Math.abs(rect.top - totalOffset);
            if (distance < minDistance) {
              minDistance = distance;
              currentSection = section;
            }
          }
        }
      });

      if (currentSection && currentSection !== previousSection) {
        setActiveSection(currentSection);
        previousSection = currentSection;
        
        // Only update URL if we're on the home page to prevent excessive navigation
        if (pathname === "/" && currentSection !== "home") {
          // Debounce router updates to prevent excessive calls
          if (routerUpdateTimeoutRef.current) {
            clearTimeout(routerUpdateTimeoutRef.current);
          }
          
          routerUpdateTimeoutRef.current = setTimeout(() => {
            try {
              router.replace(`/#${currentSection}`, { scroll: false });
            } catch (error) {
              // Ignore navigation errors during rapid scrolling
            }
          }, 100);
        }
      }
    };

    // Check if there's a hash in the URL on initial load
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.substring(1);
      if (["home", "services", "about", "our-story", "service-areas", "gallery", "faq", "reviews", "contact"].includes(hash)) {
        setActiveSection(hash);
        previousSection = hash;
        
        // Scroll to the section after a short delay to ensure DOM is ready
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            const navbar = document.querySelector('nav');
            const dayOffBanner = document.querySelector('[data-day-off-banner]') as HTMLElement;
            
            // Get navbar height
            const navbarHeight = navbar ? navbar.offsetHeight : 80;
            
            // Get banner height if it exists
            const bannerHeight = dayOffBanner && dayOffBanner.offsetHeight > 0 ? dayOffBanner.offsetHeight : 0;
            
            // Calculate total offset with more precise positioning
            const totalOffset = navbarHeight + bannerHeight + 30; // 30px extra padding for better visibility
            
            // Get element position and calculate final scroll position
            const elementTop = element.offsetTop;
            const finalScrollPosition = Math.max(0, elementTop - totalOffset);
            
            // Scroll to precise position
            window.scrollTo({
              top: finalScrollPosition,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    }

    // Throttle scroll handler to run at most every 300ms (increased from 200ms)
    const throttledHandleScrollSpy = throttle(handleScrollSpy, 300);
    
    window.addEventListener("scroll", throttledHandleScrollSpy);
    // Initial check when component mounts
    handleScrollSpy();

    return () => {
      window.removeEventListener("scroll", throttledHandleScrollSpy);
      if (routerUpdateTimeoutRef.current) {
        clearTimeout(routerUpdateTimeoutRef.current);
      }
    };
  }, [pathname]); // Remove router from dependencies to prevent infinite re-renders

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    // If it's an anchor link (starts with #), prevent default and scroll
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const element = document.getElementById(targetId);

      if (element) {
        // Close mobile menu and dropdowns if open
        setIsMobileMenuOpen(false);
        setOpenDropdown(null);
        
        // Set active section immediately
        setActiveSection(targetId);
        
        // Update URL to reflect the section
        if (pathname === "/") {
          router.replace(`/#${targetId}`, { scroll: false });
        } else {
          router.push(`/#${targetId}`);
        }
        
        // Calculate precise scroll position
        const navbar = document.querySelector('nav');
        const dayOffBanner = document.querySelector('[data-day-off-banner]') as HTMLElement;
        
        // Get navbar height
        const navbarHeight = navbar ? navbar.offsetHeight : 80;
        
        // Get banner height if it exists
        const bannerHeight = dayOffBanner && dayOffBanner.offsetHeight > 0 ? dayOffBanner.offsetHeight : 0;
        
        // Calculate total offset with more precise positioning
        const totalOffset = navbarHeight + bannerHeight + 30; // 30px extra padding for better visibility
        
        // Get element position and calculate final scroll position
        const elementTop = element.offsetTop;
        const finalScrollPosition = Math.max(0, elementTop - totalOffset);
        
        // Scroll to precise position
        window.scrollTo({
          top: finalScrollPosition,
          behavior: 'smooth'
        });
      }
    }
    // If it's a regular link (like /privacy, /terms), let it navigate normally
    // The default behavior will handle the navigation
  };

  const isActiveDropdown = (item: any) => {
    if (!item.dropdown) return false;
    return item.dropdown.some((subItem: any) => activeSection === subItem.href.substring(1));
  };

  // Don't render navigation on terms and privacy pages
  if (shouldHideNavigation) {
    return null;
  }

  return (
    <nav className=" w-full backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 shadow-lg border-b border-white/20 dark:border-gray-800/30 transition-all duration-300">
      <div
        className={`transition-all duration-300 ease-out ${
          isScrolled
            ? "bg-white/95 dark:bg-gray-900/95 py-3 border-b border-blue-100/50 dark:border-gray-700/50"
            : "bg-white/80 dark:bg-gray-900/80 py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link
              className="text-2xl font-bold transition-all duration-500 hover:scale-110 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 drop-shadow-lg"
              href="/"
            >
              EGP
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => (
                <div key={item.name} className="relative group">
                  {item.dropdown ? (
                    <>
                      <button
                        className={`relative px-4 py-3 text-sm font-semibold transition-all duration-500 rounded-full hover:scale-110 transform hover:-translate-y-1 flex items-center gap-1 ${
                          isActiveDropdown(item)
                            ? "text-white bg-blue-600 dark:bg-blue-500 shadow-lg hover:shadow-xl hover:bg-blue-700 dark:hover:bg-blue-600"
                            : "text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 dark:hover:bg-blue-500 hover:shadow-lg"
                        }`}
                        onMouseEnter={() => setOpenDropdown(item.name)}
                        onMouseLeave={() => setOpenDropdown(null)}
                      >
                        {item.name}
                        <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                        </svg>
                        {isActiveDropdown(item) && (
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-lg" />
                        )}
                      </button>
                      
                      {/* Dropdown Menu */}
                      <div
                        className={`absolute top-full left-0 mt-2 w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-blue-100/50 dark:border-gray-600/50 transition-all duration-300 ${
                          openDropdown === item.name ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
                        }`}
                        onMouseEnter={() => setOpenDropdown(item.name)}
                        onMouseLeave={() => setOpenDropdown(null)}
                      >
                        <div className="py-2">
                          {item.dropdown.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              onClick={(e) => handleClick(e, subItem.href)}
                              className={`block px-4 py-3 text-sm font-medium transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 ${
                                activeSection === subItem.href.substring(1)
                                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                                  : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                              }`}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link
                      className={`relative px-4 py-3 text-sm font-semibold transition-all duration-500 rounded-full hover:scale-110 transform hover:-translate-y-1 ${
                        activeSection === item.href.substring(1)
                          ? "text-white bg-blue-600 dark:bg-blue-500 shadow-lg hover:shadow-xl hover:bg-blue-700 dark:hover:bg-blue-600"
                          : "text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 dark:hover:bg-blue-500 hover:shadow-lg"
                      }`}
                      href={item.href}
                      onClick={(e) => handleClick(e, item.href)}
                    >
                      {item.name}
                      {activeSection === item.href.substring(1) && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-lg" />
                      )}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Theme Toggle - Far Right */}
            <div className="hidden lg:block">
              <ThemeToggle size="md" />
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-3 rounded-full transition-all duration-500 hover:scale-110 transform hover:-translate-y-1 text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 dark:hover:bg-blue-500 shadow-lg hover:shadow-xl"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                className="h-6 w-6 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                style={{
                  transform: isMobileMenuOpen
                    ? "rotate(90deg)"
                    : "rotate(0deg)",
                }}
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
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

        {/* Mobile Menu */}
        <div
          className={`lg:hidden transition-all duration-300 overflow-hidden ${
            isMobileMenuOpen
              ? "max-h-96 opacity-100 mt-4 pb-4"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col space-y-2 p-6 rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl border border-blue-100/50 dark:border-gray-600/50 mx-4">
            {navigation.map((item, index) => (
              <div key={item.name}>
                {item.dropdown ? (
                  <>
                    <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-4 py-2">
                      {item.name}
                    </div>
                    {item.dropdown.map((subItem) => (
                      <Link
                        key={subItem.name}
                        className={`px-6 py-3 text-base font-semibold rounded-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 block ${
                          activeSection === subItem.href.substring(1)
                            ? "text-white bg-blue-600 dark:bg-blue-500 shadow-lg"
                            : "text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 dark:hover:bg-blue-500 hover:shadow-lg"
                        }`}
                        href={subItem.href}
                        style={{ animationDelay: `${index * 0.1}s` }}
                        onClick={(e) => {
                          handleClick(e, subItem.href);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </>
                ) : (
                  <Link
                    className={`px-6 py-4 text-base font-semibold rounded-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 block ${
                      activeSection === item.href.substring(1)
                        ? "text-white bg-blue-600 dark:bg-blue-500 shadow-lg"
                        : "text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 dark:hover:bg-blue-500 hover:shadow-lg"
                    }`}
                    href={item.href}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={(e) => {
                      handleClick(e, item.href);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            
            {/* Mobile Theme Toggle */}
            <div className="flex justify-center pt-4 border-t border-blue-100 dark:border-gray-600">
              <ThemeToggle size="lg" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

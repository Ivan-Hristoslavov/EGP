"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function HashNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Handle hash navigation on page load
    const handleHashNavigation = () => {
      if (typeof window !== "undefined") {
        const hash = window.location.hash;
        
        if (hash) {
          const targetId = hash.substring(1);
          const validSections = ["home", "services", "about", "our-story", "service-areas", "gallery", "faq", "reviews", "contact"];
          
          if (validSections.includes(targetId)) {
            const element = document.getElementById(targetId);
            
            if (element) {
              // Clear any existing timeout
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
              
              // Debounce the scroll calculation
              timeoutRef.current = setTimeout(() => {
                // Calculate offset based on whether day off banner is present
                const dayOffBanner = document.querySelector('[data-day-off-banner]') as HTMLElement;
                const navbar = document.querySelector('nav');
                
                let yOffset = -80; // Default navbar height
                
                if (dayOffBanner && dayOffBanner.offsetHeight > 0) {
                  yOffset -= dayOffBanner.offsetHeight; // Add banner height to offset
                }
                
                // Add navbar height if it exists
                if (navbar) {
                  yOffset -= navbar.offsetHeight;
                }
                
                const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }, 150); // Debounce delay
            }
          }
        }
      }
    };

    // Handle hash changes (when user navigates with browser back/forward)
    const handleHashChange = () => {
      handleHashNavigation();
    };

    // Initial navigation
    handleHashNavigation();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname]); // Remove router from dependencies to prevent infinite re-renders

  return null; // This component doesn't render anything
} 
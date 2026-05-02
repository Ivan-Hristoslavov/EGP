"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

import HeaderAesthetics from "./HeaderAesthetics";
import FloatingContactButtons from "./FloatingContactButtons";
import FooterAesthetics from "./FooterAesthetics";

export default function LayoutMain({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [showFreeConsultationPopup, setShowFreeConsultationPopup] =
    useState(false);
  const pathname = usePathname();

  // Check if we're in admin panel
  const isAdminPanel = pathname?.startsWith("/admin");

  // Set mounted flag after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const FREE_CONSULT_SESSION_KEY = "egp_free_consult_dismissed_session";

  const dismissFreeConsultPopup = () => {
    setShowFreeConsultationPopup(false);
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(FREE_CONSULT_SESSION_KEY, "1");
      }
    } catch {
      // ignore
    }
  };

  // Show Free Discovery Consultation popup 2.5s after page load (non-admin), unless dismissed this session
  useEffect(() => {
    if (!isMounted || isAdminPanel) return;
    try {
      if (
        typeof window !== "undefined" &&
        window.sessionStorage.getItem(FREE_CONSULT_SESSION_KEY)
      ) {
        return; // already dismissed this session – don’t show until browser is closed
      }
    } catch {
      // ignore
    }
    const t = setTimeout(() => setShowFreeConsultationPopup(true), 2500);

    return () => clearTimeout(t);
  }, [isMounted, isAdminPanel]);

  // Always use default padding class to match server render
  // Only apply dynamic padding class after mount to avoid hydration mismatch
  const paddingClass = "pt-[90px] sm:pt-[100px]";

  // If we're in admin panel, render only the children without main layout elements
  if (isAdminPanel) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <a
        className="absolute left-4 top-4 z-[99999] -translate-y-[200%] rounded-lg bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-xl outline-none transition-transform focus:translate-y-0 focus:ring-2 focus:ring-egp-green"
        href="#main-content"
      >
        Skip to main content
      </a>
      {/* Free Discovery Consultation popup */}
      {showFreeConsultationPopup && (
        <div className="fixed inset-0 z-[10020] flex items-center justify-center bg-black/40 backdrop-blur-[2px] sm:backdrop-blur-sm px-4">
          <div
            aria-labelledby="egp-free-consult-heading"
            aria-modal="true"
            className="relative z-[10021] max-w-lg w-full bg-[#f5efe2]/95 dark:bg-gray-900/95 rounded-3xl shadow-2xl border border-[#e4d9c8] dark:border-gray-700 pt-5 px-5 sm:pt-6 sm:px-6 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] overflow-hidden"
            role="dialog"
          >
            <div className="pointer-events-none absolute -top-20 -left-16 h-48 w-48 rounded-full bg-[#c9c1b0]/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-egp-green/15 blur-3xl" />
            <button
              aria-label="Close free consultation offer"
              className="absolute top-3 right-3 z-[1] min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-sm touch-manipulation"
              type="button"
              onClick={dismissFreeConsultPopup}
            >
              ✕
            </button>
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[#9d9585] dark:text-[#c9c1b0] mb-2 text-center">
              Welcome Offer
            </p>
            <h2
              className="mb-2 text-center text-[28px] font-semibold leading-tight text-gray-900 sm:text-[34px] dark:text-white"
              id="egp-free-consult-heading"
            >
              Free Discovery Consultation
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 text-center mb-4 max-w-[34ch] mx-auto leading-relaxed">
              Get your personalised treatment plan with a complimentary
              consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-1.5">
              <button
                className="flex-1 inline-flex items-center justify-center min-h-[44px] rounded-full bg-egp-green hover:bg-egp-green-dark text-white text-sm font-semibold py-3 px-4 transition-colors shadow-lg touch-manipulation"
                type="button"
                onClick={() => {
                  dismissFreeConsultPopup();
                  window.location.href =
                    "/book?service=free-discovery-consultation";
                }}
              >
                Book Free Consultation
              </button>
              <button
                className="flex-1 inline-flex items-center justify-center min-h-[44px] rounded-full border border-[#b5ad9d] dark:border-gray-500 text-gray-800 dark:text-gray-100 text-sm font-medium py-3 px-4 bg-white/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-800 transition-colors touch-manipulation"
                type="button"
                onClick={dismissFreeConsultPopup}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Aesthetics Header - Fixed position */}
      <HeaderAesthetics />

      {/* Floating Contact Buttons */}
      <FloatingContactButtons />

      {/* Main content with padding for fixed header */}
      <main
        suppressHydrationWarning
        className={`flex-grow transition-all duration-300 ${paddingClass}`}
        id="main-content"
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        {children}
      </main>
      <FooterAesthetics />
    </div>
  );
}

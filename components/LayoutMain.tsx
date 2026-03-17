"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

import { DayOffBanner } from "./DayOffBanner";
import { AdminProfile } from "@/lib/admin-profile";
import { useActiveDayOffPeriods } from "@/hooks/useDayOffPeriods";

import HeaderAesthetics from "./HeaderAesthetics";
import FloatingContactButtons from "./FloatingContactButtons";
import FooterAesthetics from './FooterAesthetics';

export default function LayoutMain({
  children,
  adminProfile,
}: {
  children: React.ReactNode;
  adminProfile: AdminProfile | null;
}) {
  const [hasDayOffBanner, setHasDayOffBanner] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showFreeConsultationPopup, setShowFreeConsultationPopup] = useState(false);
  const pathname = usePathname();
  const { activePeriods, loading } = useActiveDayOffPeriods();

  // Check if we're in admin panel
  const isAdminPanel = pathname?.startsWith("/admin");

  // Set mounted flag after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update hasDayOffBanner after mount to avoid hydration mismatch
  useEffect(() => {
    if (!isAdminPanel && isMounted) {
      setHasDayOffBanner(activePeriods.length > 0);
    }
  }, [isAdminPanel, activePeriods, isMounted]);

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
      if (typeof window !== "undefined" && window.sessionStorage.getItem(FREE_CONSULT_SESSION_KEY)) {
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
  const paddingClass = (isMounted && hasDayOffBanner)
    ? 'pt-[100px] sm:pt-[120px]'
    : 'pt-[90px] sm:pt-[100px]';

  // If we're in admin panel, render only the children without main layout elements
  if (isAdminPanel) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Free Discovery Consultation popup */}
      {showFreeConsultationPopup && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="max-w-md w-full bg-[#f5efe2] dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700 p-5 sm:p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
              onClick={dismissFreeConsultPopup}
              aria-label="Close free consultation offer"
            >
              ✕
            </button>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-amber-700 dark:text-amber-300 mb-2 text-center">
              Welcome Offer
            </p>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white text-center mb-3">
              Free Discovery Consultation
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 text-center mb-4">
              Discover the best treatment plan for you with a free initial consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                className="flex-1 inline-flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 px-4 transition-colors"
                onClick={() => {
                  dismissFreeConsultPopup();
                  window.location.href = "/book?service=free-discovery-consultation";
                }}
              >
                Book Free Discovery Consultation
              </button>
              <button
                className="flex-1 inline-flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 text-sm font-medium py-2.5 px-4 bg-white/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-800 transition-colors"
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
        className={`flex-grow transition-all duration-300 ${paddingClass}`}
        style={{ 
          position: 'relative', 
          zIndex: 1,
        }}
        suppressHydrationWarning
      >
        {children}
      </main>
      <FooterAesthetics />
    </div>
  );
}

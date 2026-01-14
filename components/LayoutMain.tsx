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

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

  // No top padding on admin (they have their own layout); on public site, padding clears the fixed header
  const paddingClass = isAdminPanel
    ? ''
    : (isMounted && hasDayOffBanner)
      ? 'pt-[100px] sm:pt-[120px]'
      : 'pt-[90px] sm:pt-[100px]';

  // Always render the same DOM structure so server and client trees match (avoids hydration error).
  // When isAdminPanel, header and footer are hidden via CSS so pathname cannot change the tree shape.
  return (
    <div className="min-h-screen flex flex-col">
      <div className={isAdminPanel ? 'hidden' : undefined}>
        <HeaderAesthetics />
        <FloatingContactButtons />
      </div>
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
      <div className={isAdminPanel ? 'hidden' : undefined}>
        <FooterAesthetics />
      </div>
    </div>
  );
}

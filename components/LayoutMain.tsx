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
  const pathname = usePathname();
  const { activePeriods, loading } = useActiveDayOffPeriods();

  // Check if we're in admin panel
  const isAdminPanel = pathname?.startsWith("/admin");

  useEffect(() => {
    if (!isAdminPanel) {
      setHasDayOffBanner(activePeriods.length > 0);
    }
  }, [isAdminPanel, activePeriods]);

  // If we're in admin panel, render only the children without main layout elements
  if (isAdminPanel) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Day Off Banner - Always at the top */}
      <DayOffBanner />
      
      {/* New Aesthetics Header - Fixed position */}
      <HeaderAesthetics />
      
      {/* Floating Contact Buttons */}
      <FloatingContactButtons />
      
      {/* Main content with padding for fixed header */}
      <main className={`flex-grow transition-all duration-300 ${hasDayOffBanner ? 'pt-[200px]' : 'pt-[180px]'}`}>
        {children}
      </main>
      <FooterAesthetics />
    </div>
  );
}

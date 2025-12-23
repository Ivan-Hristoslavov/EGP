"use client";

import { useState, useEffect, useRef } from "react";
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
  // This prevents hydration mismatch - padding changes will be handled by CSS transitions
  const paddingClass = 'pt-[90px] sm:pt-[100px]';
  
  // Ref for main element to apply dynamic padding after mount
  const mainRef = useRef<HTMLElement>(null);

  // Apply dynamic padding after mount to avoid hydration mismatch
  useEffect(() => {
    if (!isMounted || !mainRef.current) return;
    
    if (hasDayOffBanner) {
      mainRef.current.style.paddingTop = window.innerWidth >= 640 ? '120px' : '100px';
    } else {
      mainRef.current.style.paddingTop = window.innerWidth >= 640 ? '100px' : '90px';
    }
  }, [isMounted, hasDayOffBanner]);

  // Handle window resize
  useEffect(() => {
    if (!isMounted || !mainRef.current) return;
    
    const handleResize = () => {
      if (!mainRef.current) return;
      if (hasDayOffBanner) {
        mainRef.current.style.paddingTop = window.innerWidth >= 640 ? '120px' : '100px';
      } else {
        mainRef.current.style.paddingTop = window.innerWidth >= 640 ? '100px' : '90px';
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMounted, hasDayOffBanner]);

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
        ref={mainRef}
        className={`flex-grow transition-all duration-300 ${paddingClass}`}
        style={{ 
          position: 'relative', 
          zIndex: 1,
        }}
      >
        {children}
      </main>
      <FooterAesthetics />
    </div>
  );
}

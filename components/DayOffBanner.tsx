"use client";

import { useState, useEffect } from 'react';
import { useActiveDayOffPeriods, DayOffPeriod } from '@/hooks/useDayOffPeriods';
import { useScrollDirection } from '@/hooks/useScrollDirection';

interface DayOffBannerProps {
  previewPeriod?: Partial<DayOffPeriod>;
}

export function DayOffBanner({ previewPeriod }: DayOffBannerProps) {
  const [activePeriod, setActivePeriod] = useState<DayOffPeriod | null>(null);
  const { activePeriods, loading } = useActiveDayOffPeriods();
  const { isScrolled } = useScrollDirection();

  useEffect(() => {
    if (previewPeriod) {
      if (
        previewPeriod.show_banner &&
        previewPeriod.start_date &&
        previewPeriod.end_date &&
        new Date(previewPeriod.start_date) <= new Date(previewPeriod.end_date)
      ) {
        setActivePeriod(previewPeriod as DayOffPeriod);
      } else {
        setActivePeriod(null);
      }
      return;
    }
    
    // Use the active periods from the hook
    if (activePeriods.length > 0) {
      // Sort by end date and take the first one
      const sortedPeriods = [...activePeriods].sort((a, b) => 
        new Date(a.end_date).getTime() - new Date(b.end_date).getTime()
      );
      setActivePeriod(sortedPeriods[0]);
    } else {
      setActivePeriod(null);
    }
  }, [previewPeriod, activePeriods]);

  if (loading && !previewPeriod) {
    return null; // Don't show anything while loading
  }

  if (!activePeriod) return null;

  const isPreview = Boolean(previewPeriod);

  return (
    <div 
      className={`w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 shadow-lg border-b border-amber-300/50 sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-1' : 'py-3'
      }`} 
      data-day-off-banner
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex items-center space-x-3">
              <div className={`bg-amber-700 rounded-full flex items-center justify-center animate-pulse shadow-lg transition-all duration-300 ${
                isScrolled ? 'w-4 h-4' : 'w-6 h-6'
              }`}>
                <svg className={`text-white transition-all duration-300 ${
                  isScrolled ? 'h-3 w-3' : 'h-4 w-4'
                }`} fill="currentColor" viewBox="0 0 20 20">
                  <path clipRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" fillRule="evenodd" />
                </svg>
              </div>
              <span className={`font-bold text-amber-900 uppercase tracking-wide transition-all duration-300 ${
                isScrolled ? 'text-xs' : 'text-sm'
              }`}>
                Day Off Notice
              </span>
            </div>
            <div className="flex-1">
              <span className={`text-amber-900 font-medium transition-all duration-300 ${
                isScrolled ? 'text-xs' : 'text-sm'
              }`}>
                {activePeriod.banner_message || activePeriod.title}
              </span>
            </div>
            <div className={`${isPreview ? 'flex' : 'hidden md:flex'} items-center`}>
              <div className={`bg-amber-600/30 rounded-full px-4 flex items-center space-x-2 shadow-inner transition-all duration-300 ${
                isScrolled ? 'py-1' : 'py-2'
              }`}>
                <span className={`text-amber-900 transition-all duration-300 ${
                  isScrolled ? 'text-sm' : 'text-lg'
                }`}>📅</span>
                <span className={`font-semibold text-amber-900 transition-all duration-300 ${
                  isScrolled ? 'text-xs' : 'text-sm'
                }`}>
                  {new Date(activePeriod.start_date).toLocaleDateString('en-GB')}
                  {' - '}
                  {new Date(activePeriod.end_date).toLocaleDateString('en-GB')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

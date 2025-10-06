"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export type AdminSettings = {
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: string[];
  responseTime?: string;
  emergencyRate?: string;
  standardRate?: string;
  mcsCertified?: boolean;
  mcsNumber?: string;
  dayOffSettings?: {
    isEnabled: boolean;
    startDate: string;
    endDate: string;
    message: string;
  };
  [key: string]: any;
};

// VATSettings interface moved to hooks/useVATSettings.ts

// Global cache to prevent multiple API calls
let adminSettingsCache: AdminSettings | null = null;
let cachePromise: Promise<AdminSettings> | null = null;

export function useAdminSettings() {
  const [settings, setSettings] = useState<AdminSettings>(adminSettingsCache || {
    workingHoursStart: "08:00",
    workingHoursEnd: "18:00",
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    responseTime: "45 minutes",
    emergencyRate: "150",
    standardRate: "75",
    mcsCertified: false,
    mcsNumber: ""
  });
  const [isLoading, setIsLoading] = useState(!adminSettingsCache);
  const [error, setError] = useState<Error | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // If we have cached data, use it
    if (adminSettingsCache) {
      setSettings(adminSettingsCache);
      setIsLoading(false);
      return;
    }

    // If there's already a request in progress, wait for it
    if (cachePromise) {
      cachePromise.then(data => {
        setSettings(data);
        setIsLoading(false);
      }).catch(err => {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsLoading(false);
      });
      return;
    }

    // Make the API call
    cachePromise = fetch('/api/admin/settings')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch admin settings');
        }
        return response.json();
      })
      .then(responseData => {
        // The API returns the settings directly as an object
        const parsedSettings: AdminSettings = {
          workingHoursStart: "08:00",
          workingHoursEnd: "18:00",
          workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
          responseTime: "45 minutes",
          emergencyRate: "150",
          standardRate: "75",
          mcsCertified: false,
          mcsNumber: ""
        };
        
        // Merge the API response with defaults and handle type conversions
        const mergedSettings = { 
          ...parsedSettings, 
          ...responseData,
          // Ensure boolean values are properly converted
          mcsCertified: responseData.mcsCertified === true || responseData.mcsCertified === 'true',
          gasSafeRegistered: responseData.gasSafeRegistered === true || responseData.gasSafeRegistered === 'true',
          fullyInsured: responseData.fullyInsured === true || responseData.fullyInsured === 'true',
          dayOffEnabled: responseData.dayOffEnabled === true || responseData.dayOffEnabled === 'true',
          emailNotifications: responseData.emailNotifications === true || responseData.emailNotifications === 'true',
          smsNotifications: responseData.smsNotifications === true || responseData.smsNotifications === 'true',
          autoConfirmBookings: responseData.autoConfirmBookings === true || responseData.autoConfirmBookings === 'true',
          vatEnabled: responseData.vatEnabled === true || responseData.vatEnabled === 'true'
        };

        adminSettingsCache = mergedSettings;
        setSettings(mergedSettings);
        setIsLoading(false);
        return mergedSettings;
      })
      .catch(err => {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsLoading(false);
        cachePromise = null; // Reset promise on error
        throw err;
      });
  }, []);

  return {
    settings,
    isLoading,
    error,
    // Helper function to refresh cache when settings are updated
    refreshCache: () => {
      adminSettingsCache = null;
      cachePromise = null;
      hasInitialized.current = false;
    }
  };
}

// Removed duplicate useVATSettings - use the one from hooks/useVATSettings.ts instead 
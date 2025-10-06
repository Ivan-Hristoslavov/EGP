import { useState, useEffect, useCallback, useMemo } from 'react';

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  business_email: string;
  phone: string;
  company_name: string;
  company_address: string;
  about: string;
  years_of_experience: string;
  specializations: string;
  certifications: string;
  response_time: string;
  bank_name: string;
  account_number: string;
  sort_code: string;
  gas_safe_number: string;
  insurance_provider: string;
  gas_safe_registered?: boolean;
  fully_insured?: boolean;
  created_at: string;
  updated_at: string;
}

interface AdminSettings {
  gasSafeRegistered?: boolean;
  gasSafeNumber?: string;
  fullyInsured?: boolean;
  insuranceProvider?: string;
  [key: string]: any;
}

export function useAdminProfile() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both profile and settings
      const [profileResponse, settingsResponse] = await Promise.all([
        fetch('/api/admin/profile'),
        fetch('/api/admin/settings')
      ]);

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profileData = await profileResponse.json();
      setProfile(profileData);

      // Settings are optional, don't fail if they don't exist
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setSettings(settingsData);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  // Combine profile and settings data, with settings taking precedence for professional credentials
  const combinedProfile = useMemo(() => {
    if (!profile) return null;
    
    return {
      ...profile,
      // Use settings data for professional credentials if available
      gas_safe_number: settings?.gasSafeNumber || profile.gas_safe_number,
      insurance_provider: settings?.insuranceProvider || profile.insurance_provider,
      // Add boolean flags for UI display
      gas_safe_registered: settings?.gasSafeRegistered || false,
      fully_insured: settings?.fullyInsured || false,
    };
  }, [profile, settings]);

  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return { 
    profile: combinedProfile, 
    loading, 
    error,
    refresh
  };
} 
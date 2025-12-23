import { useState, useEffect, useCallback, useMemo } from 'react';

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  business_email: string;
  phone: string;
  company_name: string;
  company_address: string;
  account_number?: string;
  sort_code?: string;
  whatsapp?: string;
  how_to_find_us?: string;
  how_to_reach_us?: string;
  google_maps_address?: string;
  transport_options?: string | object;
  nearby_landmarks?: string | Array<{ name: string; type: string; distance: string }>;
  created_at: string;
  updated_at: string;
}

interface AdminSettings {
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
        // If 404 or other error, set profile to null (profile doesn't exist yet)
        if (profileResponse.status === 404) {
          setProfile(null);
        } else {
          throw new Error('Failed to fetch profile');
        }
      } else {
        const profileData = await profileResponse.json();
        // Handle null response (profile doesn't exist)
        setProfile(profileData || null);
      }

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

  // Return profile as-is (no longer combining with settings)
  const combinedProfile = useMemo(() => {
    return profile;
  }, [profile]);

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
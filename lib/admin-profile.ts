import { createClient } from '@/lib/supabase/server';

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  business_email: string;
  phone: string;
  company_name: string;
  company_address: string;
  account_number?: string;
  sort_code?: string;
  privacy_policy?: string;
  whatsapp?: string;
  how_to_find_us?: string;
  how_to_reach_us?: string;
  transport_options?: any;
  nearby_landmarks?: any;
  google_maps_address?: string;
  created_at: string;
  updated_at: string;
}

export async function getAdminProfile(): Promise<AdminProfile | null> {
  try {
    const supabase = createClient();
    
    const { data: profile, error } = await supabase
      .from('admin_profile')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching admin profile:', error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Error in getAdminProfile:', error);
    return null;
  }
} 
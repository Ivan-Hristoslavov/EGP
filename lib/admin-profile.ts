import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

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

export interface AdminContactInfo {
  phone: string;
  email: string;
}

/**
 * Get contact info from admin_profile for use in emails and API routes.
 * Falls back to env vars when DB values are missing.
 */
export async function getAdminContactInfo(): Promise<AdminContactInfo> {
  try {
    const { data: profile } = await supabaseAdmin
      .from('admin_profile')
      .select('phone, business_email')
      .single();

    return {
      phone:
        profile?.phone ||
        process.env.NEXT_PUBLIC_PHONE_NUMBER ||
        '07944 24 20 79',
      email:
        profile?.business_email ||
        process.env.ADMIN_EMAIL ||
        process.env.NEXT_PUBLIC_BUSINESS_EMAIL ||
        'info@egpaesthetics.co.uk',
    };
  } catch (error) {
    console.warn('Error fetching admin contact info:', error);
    return {
      phone: process.env.NEXT_PUBLIC_PHONE_NUMBER || '07944 24 20 79',
      email:
        process.env.ADMIN_EMAIL ||
        process.env.NEXT_PUBLIC_BUSINESS_EMAIL ||
        'info@egpaesthetics.co.uk',
    };
  }
} 
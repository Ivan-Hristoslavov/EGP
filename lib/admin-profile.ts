import { createClient } from '@/lib/supabase/server';

export interface AdminProfile {
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
  terms_and_conditions?: string;
  privacy_policy?: string;
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
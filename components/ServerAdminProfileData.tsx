import { getAdminProfile } from '@/lib/admin-profile';
import { AdminProfile } from '@/types';

interface ServerAdminProfileDataProps {
  type: keyof AdminProfile;
  fallback?: string;
  className?: string;
}

export async function ServerAdminProfileData({ type, fallback = '', className }: ServerAdminProfileDataProps) {
  try {
    const profile = await getAdminProfile();
    
    if (!profile) {
      return <span className={className}>{fallback}</span>;
    }

    const value = (profile as any)[type] || fallback;
    return <span className={className}>{value}</span>;
  } catch (error) {
    return <span className={className}>{fallback}</span>;
  }
} 
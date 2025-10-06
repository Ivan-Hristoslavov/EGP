import { getAdminProfile } from '@/lib/admin-profile';
import { MarkdownRenderer } from './MarkdownRenderer';
import { AdminProfile } from '@/types';

interface ServerAdminProfileMarkdownProps {
  type: keyof AdminProfile;
  fallback?: string;
  className?: string;
}

export async function ServerAdminProfileMarkdown({ type, fallback = '', className }: ServerAdminProfileMarkdownProps) {
  try {
    const profile = await getAdminProfile();
    
    if (!profile) {
      return <span className={className}>{fallback}</span>;
    }

    const value = (profile as any)[type] || fallback;
    
    if (type === 'about') {
      return <MarkdownRenderer content={value} className={className} />;
    }
    
    return <span className={className}>{value}</span>;
  } catch (error) {
    return <span className={className}>{fallback}</span>;
  }
} 
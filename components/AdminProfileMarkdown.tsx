"use client";

import { useAdminProfileContext } from '@/components/AdminProfileContext';
import { MarkdownRenderer } from './MarkdownRenderer';
import { AdminProfile } from '@/types';

interface AdminProfileMarkdownProps {
  type: keyof AdminProfile;
  fallback?: string;
  className?: string;
}

function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
      </div>
    </div>
  );
}

export function AdminProfileMarkdown({ type, fallback = '', className }: AdminProfileMarkdownProps) {
  const { adminProfile: profile, loading } = useAdminProfileContext();

  if (loading) {
    return <LoadingSkeleton className={className} />;
  }

  if (!profile) {
    return <span className={className}>{fallback}</span>;
  }

  const value = (profile as any)[type] || fallback;
  
  if (type === 'about') {
    return <MarkdownRenderer content={value} className={className} />;
  }
  
  return <span className={className}>{value}</span>;
} 
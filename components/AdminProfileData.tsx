"use client";

import { useAdminProfile } from '@/hooks/useAdminProfile';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { AdminProfile } from '@/types';
import { useState } from 'react';

interface ListManagerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
  description?: string;
}

function ListManager({ value, onChange, placeholder, label, description }: ListManagerProps) {
  const [newItem, setNewItem] = useState('');

  // Parse the current value into items
  const items = value
    .split(/[.,;]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  const handleAddItem = () => {
    if (newItem.trim()) {
      const updatedItems = [...items, newItem.trim()];
      onChange(updatedItems.join('. '));
      setNewItem('');
    }
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onChange(updatedItems.join('. '));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      
      {/* Current items */}
      {items.length > 0 && (
        <div className="space-y-1">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="flex items-center">
                <span className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mr-2"></span>
                <span className="text-gray-700 dark:text-gray-300 text-sm">{item}</span>
              </span>
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new item */}
      <div className="flex space-x-2">
        <input
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 text-sm"
          type="text"
          placeholder={placeholder}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          type="button"
          onClick={handleAddItem}
          disabled={!newItem.trim()}
          className="px-3 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
    </div>
  );
}

interface AdminProfileDataProps {
  type: keyof AdminProfile | 'response_time' | 'company_status' | 'years_of_experience';
  fallback?: string;
  className?: string;
  asList?: boolean;
}

export function AdminProfileData({ type, fallback = '', className, asList = false }: AdminProfileDataProps) {
  const { profile } = useAdminProfile();
  const { settings: adminSettings } = useAdminSettings();

  if (!profile && !adminSettings) {
    return <span className={className}>{fallback}</span>;
  }

  // Handle special cases that should come from admin settings
  if (type === 'response_time') {
    const value = adminSettings?.responseTime || profile?.response_time || fallback;
    return <span className={className}>{value}</span>;
  }

  // Handle company_status from admin settings
  if (type === 'company_status') {
    const value = adminSettings?.companyStatus || fallback;
    return <span className={className}>{value}</span>;
  }

  // Handle years_of_experience to ensure it includes "Years"
  if (type === 'years_of_experience') {
    const value = profile?.years_of_experience || fallback;
    // If the value doesn't already include "Years", add it
    const displayValue = value && !value.toLowerCase().includes('years') 
      ? `${value} Years` 
      : value;
    return <span className={className}>{displayValue}</span>;
  }

  // Handle list-based fields (certifications and specializations)
  if (asList && (type === 'certifications' || type === 'specializations')) {
    const value = (profile as any)?.[type] || fallback;
    
    if (!value) {
      return <span className={className}>{fallback}</span>;
    }

    // Split by common delimiters and clean up
    const items = value
      .split(/[.,;]/)
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0);

    if (items.length === 0) {
      return <span className={className}>{fallback}</span>;
    }

    return (
      <ul className={`${className} space-y-1`}>
        {items.map((item: string, index: number) => (
          <li key={index} className="flex items-start">
            <span className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
            <span className="text-gray-700 dark:text-gray-300 text-sm">{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  // Handle regular profile fields
  const value = (profile as any)?.[type] || fallback;
  return <span className={className}>{value}</span>;
}

export { ListManager }; 
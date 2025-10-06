'use client';
import { useState, useEffect, useRef } from 'react';
import { FAQItem } from '@/types';

// Global cache to prevent multiple API calls
let faqCache: { [key: string]: FAQItem[] } = {};
let cachePromises: { [key: string]: Promise<FAQItem[]> | null } = {};

export function useFAQ(adminMode = false) {
  const cacheKey = adminMode ? 'admin' : 'public';
  const [faqItems, setFaqItems] = useState<FAQItem[]>(faqCache[cacheKey] || []);
  const [isLoading, setIsLoading] = useState(!faqCache[cacheKey]);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const fetchFAQItems = async () => {
    try {
      setIsLoading(true);
      const url = adminMode ? '/api/faq?all=1' : '/api/faq';
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch FAQ items');
      const faqData = data.faqItems || [];
      faqCache[cacheKey] = faqData; // Update cache
      setFaqItems(faqData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const addFAQItem = async (faqItem: Omit<FAQItem, 'id' | 'created_at' | 'updated_at'>) => {
    const res = await fetch('/api/faq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(faqItem),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add FAQ item');
    await fetchFAQItems();
    return data.faqItem;
  };

  const updateFAQItem = async (id: string, faqItem: Partial<FAQItem>) => {
    const res = await fetch(`/api/faq/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(faqItem),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update FAQ item');
    await fetchFAQItems();
    return data.faqItem;
  };

  const deleteFAQItem = async (id: string) => {
    const res = await fetch(`/api/faq/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete FAQ item');
    await fetchFAQItems();
  };

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // If we have cached data, use it
    if (faqCache[cacheKey]) {
      setFaqItems(faqCache[cacheKey]);
      setIsLoading(false);
      return;
    }

    // If there's already a request in progress, wait for it
    if (cachePromises[cacheKey]) {
      cachePromises[cacheKey]!.then(data => {
        setFaqItems(data);
        setIsLoading(false);
      }).catch(err => {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      });
      return;
    }

    // Make the API call
    const url = adminMode ? '/api/faq?all=1' : '/api/faq';
    cachePromises[cacheKey] = fetch(url)
      .then(response => response.json())
      .then(data => {
        if (!data.faqItems) {
          throw new Error("Failed to fetch FAQ items");
        }
        const faqData = data.faqItems || [];
        faqCache[cacheKey] = faqData;
        setFaqItems(faqData);
        setIsLoading(false);
        return faqData;
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
        cachePromises[cacheKey] = null; // Reset promise on error
        throw err;
      });
  }, [adminMode, cacheKey]);

  return { faqItems, isLoading, error, addFAQItem, updateFAQItem, deleteFAQItem, refetch: fetchFAQItems };
} 
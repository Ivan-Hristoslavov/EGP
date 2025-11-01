'use client';

import { useState, useEffect, useRef } from 'react';

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  main_tab_id: string;
  display_order?: number;
}

export interface MainTab {
  id: string;
  name: string;
  slug: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  details: string | null;
  benefits: string[] | null;
  preparation: string | null;
  aftercare: string | null;
  duration: number;
  price: number;
  is_featured: boolean;
  image_url: string | null;
  requires_consultation: boolean;
  downtime_days: number;
  results_duration_weeks: number | null;
  display_order: number;
  created_at: string;
  updated_at: string;
  category: ServiceCategory;
  main_tab: MainTab;
}

// Global cache to prevent multiple API calls
let servicesCache: Service[] | null = null;
let cachePromise: Promise<Service[]> | null = null;

export function useServices() {
  const [services, setServices] = useState<Service[]>(servicesCache || []);
  const [isLoading, setIsLoading] = useState(!servicesCache);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // If we have cached data, use it
    if (servicesCache) {
      setServices(servicesCache);
      setIsLoading(false);
      return;
    }

    // If there's already a request in progress, wait for it
    if (cachePromise) {
      cachePromise.then(data => {
        setServices(data);
        setIsLoading(false);
      }).catch(err => {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      });
      return;
    }

    // Make the API call
    cachePromise = fetch('/api/services')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        return response.json();
      })
      .then(data => {
        if (!data.services) {
          throw new Error("Failed to fetch services");
        }
        const svcs = data.services || [];
        servicesCache = svcs;
        setServices(svcs);
        setIsLoading(false);
        return svcs;
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
        cachePromise = null;
        throw err;
      });
  }, []);

  const refetch = async () => {
    hasInitialized.current = false;
    servicesCache = null;
    cachePromise = null;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/services');
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      const data = await response.json();
      const svcs = data.services || [];
      servicesCache = svcs;
      setServices(svcs);
      setIsLoading(false);
      return svcs;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);
      throw err;
    }
  };

  return { services, isLoading, error, refetch };
}

// Helper function to get services by category slug
export function useServicesByCategory(categorySlug: string) {
  const { services, isLoading, error, refetch } = useServices();
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);

  useEffect(() => {
    if (!categorySlug) return;
    const filtered = services.filter(s => s.category.slug === categorySlug);
    setFilteredServices(filtered);
  }, [services, categorySlug]);

  return { services: filteredServices, isLoading, error, refetch };
}

// Helper function to get services by main_tab slug
export function useServicesByMainTab(mainTabSlug: string) {
  const { services, isLoading, error, refetch } = useServices();
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);

  useEffect(() => {
    if (!mainTabSlug) return;
    const filtered = services.filter(s => s.main_tab.slug === mainTabSlug);
    setFilteredServices(filtered);
  }, [services, mainTabSlug]);

  return { services: filteredServices, isLoading, error, refetch };
}


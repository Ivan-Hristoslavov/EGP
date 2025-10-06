import { useState, useEffect, useRef } from 'react';

interface Area {
  id: string;
  name: string;
  slug: string;
  postcode: string;
  description: string;
  response_time: string;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

// Global cache to prevent multiple API calls
let areasCache: Area[] | null = null;
let cachePromise: Promise<Area[]> | null = null;

export function useAreas() {
  const [areas, setAreas] = useState<Area[]>(areasCache || []);
  const [loading, setLoading] = useState(!areasCache);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // If we have cached data, use it
    if (areasCache) {
      setAreas(areasCache);
      setLoading(false);
      return;
    }

    // If there's already a request in progress, wait for it
    if (cachePromise) {
      cachePromise.then(data => {
        setAreas(data);
        setLoading(false);
      }).catch(err => {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      });
      return;
    }

    // Make the API call
    cachePromise = fetch('/api/areas')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch areas');
        }
        return response.json();
      })
      .then(data => {
        areasCache = data;
        setAreas(data);
        setLoading(false);
        return data;
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
        cachePromise = null; // Reset promise on error
        throw err;
      });
  }, []);

  return { areas, loading, error };
} 
'use client';

import { useState, useEffect, useRef } from 'react';
import { GallerySection } from '@/types';

// Global cache to prevent multiple API calls
let gallerySectionsCache: GallerySection[] | null = null;
let cachePromise: Promise<GallerySection[]> | null = null;

export function useGallerySections() {
  const [gallerySections, setGallerySections] = useState<GallerySection[]>(gallerySectionsCache || []);
  const [isLoading, setIsLoading] = useState(!gallerySectionsCache);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const fetchGallerySections = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/gallery-sections');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch gallery sections');
      }

      const sections = data.gallerySections || [];
      gallerySectionsCache = sections; // Update cache
      setGallerySections(sections);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching gallery sections:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addGallerySection = async (sectionData: Partial<GallerySection>) => {
    try {
      const response = await fetch('/api/gallery-sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sectionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add gallery section');
      }

      await fetchGallerySections();
      return data.gallerySection;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const updateGallerySection = async (id: number, sectionData: Partial<GallerySection>) => {
    try {
      const response = await fetch(`/api/gallery-sections`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...sectionData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update gallery section');
      }

      await fetchGallerySections();
      return data.gallerySection;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const deleteGallerySection = async (id: number) => {
    try {
      const response = await fetch(`/api/gallery-sections/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete gallery section');
      }

      await fetchGallerySections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // If we have cached data, use it
    if (gallerySectionsCache) {
      setGallerySections(gallerySectionsCache);
      setIsLoading(false);
      return;
    }

    // If there's already a request in progress, wait for it
    if (cachePromise) {
      cachePromise.then(data => {
        setGallerySections(data);
        setIsLoading(false);
      }).catch(err => {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      });
      return;
    }

    // Make the API call
    cachePromise = fetch('/api/gallery-sections')
      .then(response => response.json())
      .then(data => {
        if (!data.gallerySections) {
          throw new Error("Failed to fetch gallery sections");
        }
        const sections = data.gallerySections || [];
        gallerySectionsCache = sections;
        setGallerySections(sections);
        setIsLoading(false);
        return sections;
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
        cachePromise = null; // Reset promise on error
        throw err;
      });
  }, []);

  return {
    gallerySections,
    isLoading,
    error,
    addGallerySection,
    updateGallerySection,
    deleteGallerySection,
    refetch: fetchGallerySections,
  };
} 
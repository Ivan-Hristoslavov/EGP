'use client';
import { useState, useEffect, useRef } from 'react';
import { Review } from '@/types';

// Global cache to prevent multiple API calls
let reviewsCache: { [key: string]: Review[] } = {};
let cachePromises: { [key: string]: Promise<Review[]> | null } = {};

export function useReviews(adminMode = false) {
  const cacheKey = adminMode ? 'admin' : 'public';
  const [reviews, setReviews] = useState<Review[]>(reviewsCache[cacheKey] || []);
  const [isLoading, setIsLoading] = useState(!reviewsCache[cacheKey]);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const url = adminMode ? '/api/reviews?all=1' : '/api/reviews';
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch reviews');
      const reviewsData = data.reviews || [];
      reviewsCache[cacheKey] = reviewsData; // Update cache
      setReviews(reviewsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const addReview = async (review: Omit<Review, 'id' | 'is_approved' | 'created_at' | 'updated_at'>) => {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add review');
    await fetchReviews();
    return data.review;
  };

  const approveReview = async (id: string, is_approved: boolean) => {
    const res = await fetch(`/api/reviews/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_approved }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update review');
    await fetchReviews();
    return data.review;
  };

  const deleteReview = async (id: string) => {
    const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete review');
    await fetchReviews();
    return data.success;
  };

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // If we have cached data, use it
    if (reviewsCache[cacheKey]) {
      setReviews(reviewsCache[cacheKey]);
      setIsLoading(false);
      return;
    }

    // If there's already a request in progress, wait for it
    if (cachePromises[cacheKey]) {
      cachePromises[cacheKey]!.then(data => {
        setReviews(data);
        setIsLoading(false);
      }).catch(err => {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      });
      return;
    }

    // Make the API call
    const url = adminMode ? '/api/reviews?all=1' : '/api/reviews';
    cachePromises[cacheKey] = fetch(url)
      .then(response => response.json())
      .then(data => {
        if (!data.reviews) {
          throw new Error("Failed to fetch reviews");
        }
        const reviewsData = data.reviews || [];
        reviewsCache[cacheKey] = reviewsData;
        setReviews(reviewsData);
        setIsLoading(false);
        return reviewsData;
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
        cachePromises[cacheKey] = null; // Reset promise on error
        throw err;
      });
  }, [adminMode, cacheKey]);

  return { reviews, isLoading, error, addReview, approveReview, deleteReview, refetch: fetchReviews };
} 
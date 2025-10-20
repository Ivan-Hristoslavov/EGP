'use client';
import { useState, useEffect, useRef } from 'react';
import { Review } from '@/types';

// Dummy reviews data
const DUMMY_REVIEWS: Review[] = [
  {
    id: "dummy-review-1",
    customer_name: "Sarah Johnson",
    customer_email: "sarah.j@example.com",
    rating: 5,
    title: "Fantastic Experience!",
    comment: "Absolutely fantastic experience! The staff was professional and the results exceeded my expectations. Highly recommend!",
    is_approved: true,
    is_featured: true,
    created_at: "2025-01-05T10:00:00Z",
    updated_at: "2025-01-05T10:00:00Z"
  },
  {
    id: "dummy-review-2",
    customer_name: "Emma Williams",
    customer_email: "emma.w@example.com",
    rating: 5,
    title: "Perfect Lip Enhancement",
    comment: "The lip enhancement treatment was perfect. Natural-looking results and excellent aftercare. Will definitely be back!",
    is_approved: true,
    is_featured: true,
    created_at: "2025-01-03T10:00:00Z",
    updated_at: "2025-01-03T10:00:00Z"
  },
  {
    id: "dummy-review-3",
    customer_name: "Lisa Brown",
    customer_email: "lisa.b@example.com",
    rating: 5,
    title: "Amazing Profhilo Treatment",
    comment: "Profhilo treatment was amazing! My skin looks so much better. The practitioner was knowledgeable and made me feel comfortable throughout.",
    is_approved: true,
    is_featured: true,
    created_at: "2025-01-02T10:00:00Z",
    updated_at: "2025-01-02T10:00:00Z"
  },
  {
    id: "dummy-review-4",
    customer_name: "Rachel Green",
    customer_email: "rachel@example.com",
    rating: 5,
    title: "Great Consultation Service",
    comment: "Great consultation service. They took time to understand my needs and provided excellent advice. Very professional clinic.",
    is_approved: true,
    is_featured: false,
    created_at: "2025-01-01T10:00:00Z",
    updated_at: "2025-01-01T10:00:00Z"
  },
  {
    id: "dummy-review-5",
    customer_name: "Jessica Taylor",
    customer_email: "jessica.t@example.com",
    rating: 4,
    title: "Good Anti-Wrinkle Treatment",
    comment: "Good anti-wrinkle treatment. Results were visible and natural. The clinic has a lovely atmosphere and friendly staff.",
    is_approved: true,
    is_featured: false,
    created_at: "2024-12-30T10:00:00Z",
    updated_at: "2024-12-30T10:00:00Z"
  },
  {
    id: "dummy-review-6",
    customer_name: "Maria Garcia",
    customer_email: "maria.g@example.com",
    rating: 5,
    title: "Excellent Fat Freezing",
    comment: "Fat freezing treatment worked better than expected! Professional service and great results. Highly recommend this clinic.",
    is_approved: true,
    is_featured: false,
    created_at: "2024-12-28T10:00:00Z",
    updated_at: "2024-12-28T10:00:00Z"
  },
  {
    id: "dummy-review-7",
    customer_name: "Jennifer Davis",
    customer_email: "jennifer.d@example.com",
    rating: 5,
    title: "Skilled Dermal Fillers",
    comment: "Excellent dermal filler treatment. The practitioner was skilled and the results look very natural. Very happy with the service!",
    is_approved: false,
    is_featured: false,
    created_at: "2024-12-25T10:00:00Z",
    updated_at: "2024-12-25T10:00:00Z"
  },
  {
    id: "dummy-review-8",
    customer_name: "Amanda Wilson",
    customer_email: "amanda@example.com",
    rating: 5,
    title: "Outstanding Botox Treatment",
    comment: "Outstanding Botox treatment! Quick, painless, and effective. The clinic is clean and modern with professional staff.",
    is_approved: false,
    is_featured: false,
    created_at: "2024-12-22T10:00:00Z",
    updated_at: "2024-12-22T10:00:00Z"
  }
];

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
      
      // Use dummy data if no real reviews exist
      const finalReviews = reviewsData.length === 0 ? DUMMY_REVIEWS : reviewsData;
      reviewsCache[cacheKey] = finalReviews; // Update cache
      setReviews(finalReviews);
      setError(null);
    } catch (err) {
      // Use dummy data on error
      console.log('Error fetching reviews, using dummy data');
      reviewsCache[cacheKey] = DUMMY_REVIEWS;
      setReviews(DUMMY_REVIEWS);
      setError(null); // Don't show error when we have fallback data
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
        
        // Use dummy data if no real reviews exist
        const finalReviews = reviewsData.length === 0 ? DUMMY_REVIEWS : reviewsData;
        reviewsCache[cacheKey] = finalReviews;
        setReviews(finalReviews);
        setIsLoading(false);
        return finalReviews;
      })
      .catch(err => {
        // Use dummy data on error
        console.log('Error fetching reviews, using dummy data');
        reviewsCache[cacheKey] = DUMMY_REVIEWS;
        setReviews(DUMMY_REVIEWS);
        setError(null); // Don't show error when we have fallback data
        setIsLoading(false);
        cachePromises[cacheKey] = null; // Reset promise on error
        return DUMMY_REVIEWS;
      });
  }, [adminMode, cacheKey]);

  return { reviews, isLoading, error, addReview, approveReview, deleteReview, refetch: fetchReviews };
} 
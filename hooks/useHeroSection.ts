import { useState, useEffect, useRef } from "react";

export interface HeroSection {
  id: string;
  image_1_url: string | null;
  image_2_url: string | null;
  image_3_url: string | null;
  image_1_position?: string;
  image_2_position?: string;
  image_3_position?: string;
  badge_text: string;
  badge_icon: string;
  main_headline: string;
  sub_headline: string;
  feature_1_text: string;
  feature_2_text: string;
  feature_3_text: string;
  button_1_text: string;
  button_1_icon: string;
  button_1_link: string;
  button_1_type: string;
  button_2_text: string;
  button_2_icon: string;
  button_2_link: string | null;
  button_2_type: string;
  contact_label: string;
  phone_number: string | null;
  image_resize_enabled: boolean;
  image_max_width: number;
  image_max_height: number;
  image_quality: number;
  is_active: boolean;
  animation_duration_ms: number;
  created_at: string;
  updated_at: string;
}

// Global cache to prevent multiple API calls
let heroSectionCache: HeroSection | null = null;
let cachePromise: Promise<HeroSection | null> | null = null;

export function useHeroSection() {
  const [heroSection, setHeroSection] = useState<HeroSection | null>(heroSectionCache);
  const [isLoading, setIsLoading] = useState(!heroSectionCache);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // If we have cached data, use it
    if (heroSectionCache) {
      setHeroSection(heroSectionCache);
      setIsLoading(false);
      return;
    }

    // If there's already a request in progress, wait for it
    if (cachePromise) {
      cachePromise
        .then((data) => {
          setHeroSection(data);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Unknown error");
          setIsLoading(false);
        });
      return;
    }

    // Make the API call
    cachePromise = fetch("/api/hero-section")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch hero section");
        }
        return response.json();
      })
      .then((data) => {
        const heroData = data.heroSection || null;
        heroSectionCache = heroData;
        setHeroSection(heroData);
        setIsLoading(false);
        return heroData;
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unknown error");
        setIsLoading(false);
        cachePromise = null;
        throw err;
      });
  }, []);

  const refetch = async () => {
    hasInitialized.current = false;
    heroSectionCache = null;
    cachePromise = null;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/hero-section");
      if (!response.ok) {
        throw new Error("Failed to fetch hero section");
      }
      const data = await response.json();
      const heroData = data.heroSection || null;
      heroSectionCache = heroData;
      setHeroSection(heroData);
      setIsLoading(false);
      return heroData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  return { heroSection, isLoading, error, refetch };
}


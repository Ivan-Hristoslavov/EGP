import { useState, useEffect } from "react";

export interface Condition {
  id: string;
  title: string;
  slug: string;
  category: "Face Conditions" | "Body Conditions";
  description: string;
  treatments: string[] | null;
  popular: boolean;
  seo_title: string | null;
  seo_description: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Global cache to prevent multiple API calls
let conditionsCache: Condition[] | null = null;
let conditionsCacheTime: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useConditions() {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchConditions() {
      // Check cache first
      const now = Date.now();
      if (
        conditionsCache &&
        conditionsCacheTime &&
        now - conditionsCacheTime < CACHE_DURATION
      ) {
        setConditions(conditionsCache);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch("/api/conditions");
        
        if (!response.ok) {
          throw new Error("Failed to fetch conditions");
        }

        const data = await response.json();
        const fetchedConditions = (data.conditions || []).map((condition: any) => ({
          ...condition,
          // Parse treatments from JSONB if it's a string
          treatments: Array.isArray(condition.treatments)
            ? condition.treatments
            : typeof condition.treatments === "string"
            ? JSON.parse(condition.treatments)
            : [],
        }));

        // Update cache
        conditionsCache = fetchedConditions;
        conditionsCacheTime = now;

        setConditions(fetchedConditions);
        setError(null);
      } catch (err) {
        console.error("Error fetching conditions:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setConditions([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchConditions();
  }, []);

  return { conditions, isLoading, error };
}


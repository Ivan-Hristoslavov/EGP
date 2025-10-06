import { useState, useEffect, useRef } from "react";
import { PricingCard } from "@/types";

// Global cache to prevent multiple API calls
let pricingCardsCache: PricingCard[] | null = null;
let cachePromise: Promise<PricingCard[]> | null = null;

export function usePricingCards(isAdmin: boolean = false) {
  const [pricingCards, setPricingCards] = useState<PricingCard[]>(isAdmin ? [] : (pricingCardsCache || []));
  const [loading, setLoading] = useState(!pricingCardsCache || isAdmin);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const fetchPricingCards = async () => {
    try {
      setLoading(true);
      const url = isAdmin ? "/api/pricing-cards?admin=true" : "/api/pricing-cards";
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch pricing cards");
      }

      const cards = data.pricingCards || [];
      pricingCardsCache = cards; // Update cache
      setPricingCards(cards);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setPricingCards([]);
    } finally {
      setLoading(false);
    }
  };

  const addPricingCard = async (cardData: Omit<PricingCard, "id" | "admin_id" | "created_at" | "updated_at">) => {
    try {
      const response = await fetch("/api/pricing-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cardData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add pricing card");
      }

      setPricingCards(prev => [...prev, data.pricingCard]);
      return data.pricingCard;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const updatePricingCard = async (id: number, cardData: Partial<PricingCard>) => {
    try {
      const response = await fetch(`/api/pricing-cards/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cardData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update pricing card");
      }

      setPricingCards(prev =>
        prev.map(card => (card.id === id ? data.pricingCard : card))
      );
      return data.pricingCard;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const deletePricingCard = async (id: number) => {
    try {
      const response = await fetch(`/api/pricing-cards/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete pricing card");
      }

      setPricingCards(prev => prev.filter(card => card.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "An error occurred");
    }
  };

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // For admin requests, don't use cache to see real-time changes
    if (isAdmin) {
      fetchPricingCards();
      return;
    }

    // If we have cached data, use it
    if (pricingCardsCache) {
      setPricingCards(pricingCardsCache);
      setLoading(false);
      return;
    }

    // If there's already a request in progress, wait for it
    if (cachePromise) {
      cachePromise.then(data => {
        setPricingCards(data);
        setLoading(false);
      }).catch(err => {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      });
      return;
    }

    // Make the API call
    const url = isAdmin ? "/api/pricing-cards?admin=true" : "/api/pricing-cards";
    cachePromise = fetch(url)
      .then(response => response.json())
      .then(data => {
        if (!data.pricingCards) {
          throw new Error("Failed to fetch pricing cards");
        }
        const cards = data.pricingCards || [];
        pricingCardsCache = cards;
        setPricingCards(cards);
        setLoading(false);
        return cards;
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
        cachePromise = null; // Reset promise on error
        throw err;
      });
  }, [isAdmin]);

  return {
    pricingCards,
    loading,
    error,
    fetchPricingCards,
    addPricingCard,
    updatePricingCard,
    deletePricingCard,
  };
} 
import { useState, useEffect, useRef } from "react";
import { GalleryItem } from "@/types";

// Global cache to prevent multiple API calls
let galleryCache: GalleryItem[] | null = null;
let cachePromise: Promise<GalleryItem[]> | null = null;

export function useGallery() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(
    galleryCache || []
  );
  const [loading, setLoading] = useState(!galleryCache);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/gallery");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch gallery items");
      }

      const items = data.galleryItems || [];
      galleryCache = items; // Update cache
      setGalleryItems(items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setGalleryItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addGalleryItem = async (
    itemData: Omit<GalleryItem, "id" | "admin_id" | "created_at" | "updated_at">
  ) => {
    try {
      const response = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add gallery item");
      }

      setGalleryItems((prev) => [...prev, data.galleryItem]);
      return data.galleryItem;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const updateGalleryItem = async (
    id: string,
    itemData: Partial<GalleryItem>
  ) => {
    try {
      const response = await fetch(`/api/gallery`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...itemData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update gallery item");
      }
      setGalleryItems((prev) =>
        prev.map((item) =>
          item.id === id ? data.galleryItem : item
        )
      );
      return data.galleryItem;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const deleteGalleryItem = async (id: string) => {
    try {
      const response = await fetch(`/api/gallery?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete gallery item");
      }

      setGalleryItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "An error occurred");
    }
  };

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // If we have cached data, use it
    if (galleryCache) {
      setGalleryItems(galleryCache);
      setLoading(false);
      return;
    }

    // If there's already a request in progress, wait for it
    if (cachePromise) {
      cachePromise
        .then((data) => {
          setGalleryItems(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Unknown error");
          setLoading(false);
        });
      return;
    }

    // Make the API call
    cachePromise = fetch("/api/gallery")
      .then((response) => response.json())
      .then((data) => {
        if (!data.galleryItems) {
          throw new Error("Failed to fetch gallery items");
        }
        const items = data.galleryItems || [];
        galleryCache = items;
        setGalleryItems(items);
        setLoading(false);
        return items;
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
        cachePromise = null; // Reset promise on error
        throw err;
      });
  }, []);

  return {
    galleryItems,
    loading,
    error,
    fetchGalleryItems,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
  };
}

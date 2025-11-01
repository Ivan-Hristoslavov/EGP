'use client';
import { useState, useEffect, useRef } from 'react';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  featured_image_url: string | null;
  featured: boolean;
  is_published: boolean;
  published_at: string | null;
  read_time_minutes: number;
  seo_title: string | null;
  seo_description: string | null;
  author_name: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Global cache to prevent multiple API calls
let blogCache: { [key: string]: BlogPost[] } = {};
let cachePromises: { [key: string]: Promise<BlogPost[]> | null } = {};

export function useBlog(adminMode = false) {
  const cacheKey = adminMode ? 'admin' : 'public';
  const [posts, setPosts] = useState<BlogPost[]>(blogCache[cacheKey] || []);
  const [isLoading, setIsLoading] = useState(!blogCache[cacheKey]);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const url = adminMode ? '/api/admin/blog' : '/api/blog';
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch blog posts');
      const postsData = data.posts || [];
      blogCache[cacheKey] = postsData;
      setPosts(postsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const addPost = async (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => {
    const res = await fetch('/api/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add blog post');
    await fetchPosts();
    return data.post;
  };

  const updatePost = async (id: string, post: Partial<BlogPost>) => {
    const res = await fetch(`/api/blog/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update blog post');
    await fetchPosts();
    return data.post;
  };

  const deletePost = async (id: string) => {
    const res = await fetch(`/api/blog/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete blog post');
    await fetchPosts();
  };

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (blogCache[cacheKey]) {
      setPosts(blogCache[cacheKey]);
      setIsLoading(false);
      return;
    }

    if (cachePromises[cacheKey]) {
      cachePromises[cacheKey]!.then(data => {
        setPosts(data);
        setIsLoading(false);
      }).catch(err => {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      });
      return;
    }

    const url = adminMode ? '/api/admin/blog' : '/api/blog';
    cachePromises[cacheKey] = fetch(url)
      .then(response => response.json())
      .then(data => {
        if (!data.posts) {
          throw new Error("Failed to fetch blog posts");
        }
        const postsData = data.posts || [];
        blogCache[cacheKey] = postsData;
        setPosts(postsData);
        setIsLoading(false);
        return postsData;
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
        cachePromises[cacheKey] = null;
        throw err;
      });
  }, [adminMode, cacheKey]);

  return { posts, isLoading, error, addPost, updatePost, deletePost, refetch: fetchPosts };
}


"use client";

import Link from 'next/link';
import { useBlog } from "@/hooks/useBlog";
import { ArrowRight } from "lucide-react";

function truncateText(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export default function BlogPage() {
  const { posts, isLoading, error } = useBlog(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const featuredPosts = posts.filter(post => post.featured);
  const regularPosts = posts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 font-playfair">
            Our Blog
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            Stay informed about the latest in aesthetic treatments, skincare tips, and beauty insights.
          </p>
          
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                No blog posts available at the moment.
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Check back soon for updates!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <article className="group relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 md:col-span-2 lg:col-span-3 cursor-pointer overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-rose-200 dark:hover:border-rose-800">
                    {/* Hover overlay with "Read it" text */}
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/0 to-rose-500/0 group-hover:from-rose-500/5 group-hover:via-rose-500/10 group-hover:to-rose-500/5 transition-all duration-300 opacity-0 group-hover:opacity-100 z-0"></div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 z-50">
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full text-sm font-semibold shadow-lg">
                        <span>Read it</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="inline-block px-3 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-400 text-sm font-medium rounded-full">
                          {post.category}
                        </span>
                        <span className="inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-sm font-medium rounded-full">
                          Featured
                        </span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors duration-300">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                          {truncateText(post.excerpt, 200)}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <time className="text-sm text-gray-500 dark:text-gray-400">
                          {post.published_at
                            ? new Date(post.published_at).toLocaleDateString('en-GB', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : new Date(post.created_at).toLocaleDateString('en-GB', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                        </time>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {post.read_time_minutes} min read
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
              
              {regularPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <article className="group relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-rose-200 dark:hover:border-rose-800 flex flex-col h-full">
                    {/* Hover overlay with "Read it" text */}
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/0 to-rose-500/0 group-hover:from-rose-500/5 group-hover:via-rose-500/10 group-hover:to-rose-500/5 transition-all duration-300 opacity-0 group-hover:opacity-100 z-0"></div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 z-50">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full text-xs font-semibold shadow-lg">
                        <span>Read it</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                    
                    <div className="relative z-10 flex flex-col flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="inline-block px-3 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-400 text-sm font-medium rounded-full">
                          {post.category}
                        </span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors duration-300 line-clamp-2">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 flex-1">
                          {truncateText(post.excerpt, 120)}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-4">
                        <time className="text-sm text-gray-500 dark:text-gray-400">
                          {post.published_at
                            ? new Date(post.published_at).toLocaleDateString('en-GB', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : new Date(post.created_at).toLocaleDateString('en-GB', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                        </time>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {post.read_time_minutes} min read
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
          
          {posts.length > 0 && (
            <div className="mt-12 text-center">
              <p className="text-gray-600 dark:text-gray-300">
                More articles coming soon! Subscribe to our newsletter for updates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9d9585]"></div>
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
            className="px-6 py-3 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] text-[#3f3a31] rounded-lg hover:shadow-lg transition-all"
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
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 font-playfair">
          Our Blog
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {featuredPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <article className="group relative flex h-full flex-col rounded-[28px] border border-[#e4d9c8] dark:border-gray-700 bg-[#fdfbf8] dark:bg-gray-900/70 shadow-xl transition-all duration-300 hover:shadow-2xl md:col-span-2 xl:col-span-3">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:from-[#9d9585]/10 group-hover:via-[#b5ad9d]/10 group-hover:to-[#ddd5c3]/10 group-hover:opacity-100" />
                  <div className="absolute right-6 top-6 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-[#6b5f4b] shadow-md backdrop-blur transition-all duration-300 group-hover:bg-[#9d9585] group-hover:text-white dark:bg-gray-900/80 dark:text-[#c9c1b0]">
                    <ArrowRight className="h-4 w-4" />
                    <span>Read article</span>
                  </div>

                  <div className="relative z-10 flex flex-col gap-6 p-9 md:p-12">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-[#f5f1e9] px-4 py-2 text-sm font-semibold text-[#6b5f4b] dark:bg-gray-800/40 dark:text-[#c9c1b0]">
                        {post.category}
                      </span>
                      <span className="rounded-full bg-[#9d9585] px-4 py-2 text-sm font-semibold text-white shadow-sm">
                        Featured
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-[#7b715f] dark:text-white dark:group-hover:text-[#d9d1c1]">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                          {truncateText(post.excerpt, 220)}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                      <time>
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString('en-GB', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : new Date(post.created_at).toLocaleDateString('en-GB', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                      </time>
                      <span>{post.read_time_minutes} min read</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}

            {regularPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <article className="group relative flex h-full flex-col rounded-[28px] border border-[#e4d9c8] dark:border-gray-700 bg-[#fdfbf8] dark:bg-gray-900/70 p-8 shadow-lg transition-all duration-300 hover:shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:from-[#9d9585]/10 group-hover:via-[#b5ad9d]/10 group-hover:to-[#ddd5c3]/10 group-hover:opacity-100" />
                  <div className="absolute right-6 top-6 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-[#6b5f4b] shadow-md backdrop-blur transition-all duration-300 group-hover:bg-[#9d9585] group-hover:text-white dark:bg-gray-900/80 dark:text-[#c9c1b0]">
                    <ArrowRight className="h-4 w-4" />
                    <span>Read article</span>
                  </div>

                  <div className="relative z-10 flex flex-1 flex-col">
                    <span className="mb-4 inline-flex w-fit items-center rounded-full bg-[#f5f1e9] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#6b5f4b] dark:bg-gray-800/40 dark:text-[#c9c1b0]">
                      {post.category}
                    </span>
                    <h2 className="text-2xl font-semibold text-gray-900 transition-colors duration-300 group-hover:text-[#7b715f] dark:text-white dark:group-hover:text-[#d9d1c1]">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-4 flex-1 text-base leading-relaxed text-gray-600 dark:text-gray-300">
                        {truncateText(post.excerpt, 160)}
                      </p>
                    )}
                    <div className="mt-6 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <time>
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString('en-GB', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : new Date(post.created_at).toLocaleDateString('en-GB', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                      </time>
                      <span>{post.read_time_minutes} min read</span>
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
  );
}


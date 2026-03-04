"use client";

import Link from 'next/link';
import { useBlog } from "@/hooks/useBlog";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Spinner } from "@heroui/react";
import { typography, layout, textColors } from "@/config/typography";

function truncateText(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export default function BlogPage() {
  const { posts, isLoading, error } = useBlog(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-default-50 flex items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-default-50 flex items-center justify-center">
        <Card>
          <CardBody className="text-center">
            <p className="text-danger mb-4">{error}</p>
            <Button
              onPress={() => window.location.reload()}
              color="primary"
              className="bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] text-white"
          >
            Retry
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const featuredPosts = posts.filter(post => post.featured);
  const regularPosts = posts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className={`${layout.container} pt-20 sm:pt-24 pb-8 sm:pb-12`}>
        {/* Header - Back on left, Our Blog centered */}
        <div className="relative flex items-center justify-between mb-3 sm:mb-4">
          <Button
            as={Link}
            href="/"
            variant="light"
            size="sm"
            startContent={<ArrowLeft className="w-4 h-4" />}
            className="text-sm font-medium text-[#3a3428] dark:text-gray-200 flex-shrink-0 z-10"
          >
            Back
          </Button>
          <h1 className={`absolute left-1/2 -translate-x-1/2 text-base sm:text-xl md:text-2xl font-bold ${textColors.heading} font-playfair`}>
            Our Blog
          </h1>
          <div className="w-14 sm:w-16" aria-hidden />
        </div>

        <p className={`${typography.lead} font-montserrat font-light max-w-2xl mx-auto text-center text-xs sm:text-sm mb-4 sm:mb-8`}>
          Stay informed about the latest in aesthetic treatments, skincare tips, and beauty insights.
        </p>

        {posts.length === 0 ? (
          <Card className="py-12">
            <CardBody className="text-center">
              <p className="text-default-600 mb-4">
              No blog posts available at the moment.
            </p>
              <p className="text-default-500">
              Check back soon for updates!
            </p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
            {featuredPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="group relative flex h-full flex-col md:col-span-2" shadow="md" isPressable>
                  <CardBody className="relative z-10 flex flex-col gap-2 sm:gap-4 p-4 sm:p-6 md:p-8">
                    <div className="absolute right-3 top-3 sm:right-4 sm:top-4 z-20">
                      <Chip
                        size="sm"
                        variant="flat"
                        className="border border-divider bg-background shadow-sm backdrop-blur transition-all duration-300 group-hover:bg-[#9d9585] group-hover:text-white group-hover:border-[#9d9585]"
                        endContent={<ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />}
                      >
                        <span className="hidden sm:inline">Read article</span>
                        <span className="sm:hidden">Read</span>
                      </Chip>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip
                        size="sm"
                        variant="flat"
                        className="bg-[#f5f1e9] dark:bg-gray-800/40 text-[#6b5f4b] dark:text-[#c9c1b0] text-xs"
                      >
                        {post.category}
                      </Chip>
                      <Chip
                        size="sm"
                        color="primary"
                        className="bg-[#9d9585] text-white text-xs"
                      >
                        Featured
                      </Chip>
                    </div>
                    <div>
                      <h2 className="text-base sm:text-xl md:text-2xl font-bold text-foreground transition-colors duration-300 group-hover:text-[#7b715f]">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="mt-1.5 sm:mt-2 text-sm leading-relaxed text-default-600">
                          {truncateText(post.excerpt, 200)}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-default-500">
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
                  </CardBody>
                </Card>
              </Link>
            ))}

            {regularPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="group relative flex h-full flex-col" shadow="md" isPressable>
                  <CardBody className="relative z-10 flex flex-1 flex-col p-4 sm:p-5">
                    <div className="absolute right-3 top-3 sm:right-4 sm:top-4 z-20">
                      <Chip
                        size="sm"
                        variant="flat"
                        className="border border-divider bg-background shadow-sm backdrop-blur transition-all duration-300 group-hover:bg-[#9d9585] group-hover:text-white group-hover:border-[#9d9585]"
                        endContent={<ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />}
                      >
                        <span className="hidden sm:inline">Read article</span>
                        <span className="sm:hidden">Read</span>
                      </Chip>
                    </div>
                    <Chip
                      size="sm"
                      variant="flat"
                      className="mb-2 sm:mb-3 w-fit bg-[#f5f1e9] dark:bg-gray-800/40 text-[#6b5f4b] dark:text-[#c9c1b0] uppercase tracking-wide text-xs"
                    >
                      {post.category}
                    </Chip>
                    <h2 className="text-base sm:text-lg font-semibold text-foreground transition-colors duration-300 group-hover:text-[#7b715f]">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-1.5 sm:mt-2 flex-1 text-sm leading-relaxed text-default-600 line-clamp-3">
                        {truncateText(post.excerpt, 140)}
                      </p>
                    )}
                    <div className="mt-3 sm:mt-4 flex items-center justify-between text-xs text-default-500">
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
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {posts.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              More articles coming soon! Subscribe to our newsletter for updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


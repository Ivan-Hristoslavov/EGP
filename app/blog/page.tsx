"use client";

import Link from 'next/link';
import { useBlog } from "@/hooks/useBlog";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Spinner } from "@heroui/react";

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
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10 pt-24 pb-16">
        {/* Back to Home Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            as={Link}
            href="/"
            variant="light"
            startContent={<ArrowLeft className="w-5 h-5" />}
          >
            Back to Home
          </Button>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 font-playfair">
            Our Blog
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 font-montserrat font-light max-w-3xl mx-auto">
            Stay informed about the latest in aesthetic treatments, skincare tips, and beauty insights.
          </p>
        </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {featuredPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="group relative flex h-full flex-col md:col-span-2 xl:col-span-3" shadow="lg" isPressable>
                  <CardBody className="relative z-10 flex flex-col gap-4 sm:gap-6 p-6 sm:p-9 md:p-12">
                    <div className="absolute right-3 top-3 sm:right-6 sm:top-6 z-20">
                      <Chip
                        size="sm"
                        variant="flat"
                        className="border-2 border-divider bg-background shadow-md backdrop-blur transition-all duration-300 group-hover:bg-[#9d9585] group-hover:text-white group-hover:border-[#9d9585]"
                        endContent={<ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />}
                      >
                        <span className="hidden sm:inline">Read article</span>
                        <span className="sm:hidden">Read</span>
                      </Chip>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <Chip
                        size="sm"
                        variant="flat"
                        className="bg-[#f5f1e9] dark:bg-gray-800/40 text-[#6b5f4b] dark:text-[#c9c1b0]"
                      >
                        {post.category}
                      </Chip>
                      <Chip
                        size="sm"
                        color="primary"
                        className="bg-[#9d9585] text-white"
                      >
                        Featured
                      </Chip>
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground transition-colors duration-300 group-hover:text-[#7b715f]">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="mt-4 text-lg leading-relaxed text-default-600">
                          {truncateText(post.excerpt, 220)}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-sm text-default-500">
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
                <Card className="group relative flex h-full flex-col" shadow="lg" isPressable>
                  <CardBody className="relative z-10 flex flex-1 flex-col p-5 sm:p-8">
                    <div className="absolute right-3 top-3 sm:right-6 sm:top-6 z-20">
                      <Chip
                        size="sm"
                        variant="flat"
                        className="border-2 border-divider bg-background shadow-md backdrop-blur transition-all duration-300 group-hover:bg-[#9d9585] group-hover:text-white group-hover:border-[#9d9585]"
                        endContent={<ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />}
                      >
                        <span className="hidden sm:inline">Read article</span>
                        <span className="sm:hidden">Read</span>
                      </Chip>
                    </div>
                    <Chip
                      size="sm"
                      variant="flat"
                      className="mb-3 sm:mb-4 w-fit bg-[#f5f1e9] dark:bg-gray-800/40 text-[#6b5f4b] dark:text-[#c9c1b0] uppercase tracking-wide"
                    >
                      {post.category}
                    </Chip>
                    <h2 className="text-2xl font-semibold text-foreground transition-colors duration-300 group-hover:text-[#7b715f]">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-4 flex-1 text-base leading-relaxed text-default-600">
                        {truncateText(post.excerpt, 160)}
                      </p>
                    )}
                    <div className="mt-6 flex items-center justify-between text-sm text-default-500">
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


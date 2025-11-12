import type { Metadata } from 'next';
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { Calendar, Clock, User, ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";

async function getBlogPost(slug: string) {
  try {
    const supabase = createClient();
    const { data: post, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (error || !post) {
      return null;
    }

    return post;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
}

async function getAllPosts() {
  try {
    const supabase = createClient();
    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("id, slug, title")
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .order("published_at", { ascending: false });

    if (error || !posts) {
      return [];
    }

    return posts;
  } catch (error) {
    console.error("Error fetching all posts:", error);
    return [];
  }
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  
  if (!post) {
    return {
      title: `Post Not Found | ${siteConfig.name}`,
    };
  }

  return {
    title: post.seo_title || `${post.title} | ${siteConfig.name}`,
    description: post.seo_description || post.excerpt || `Read about ${post.title} at EGP Aesthetics London.`,
    alternates: {
      canonical: `${siteConfig.url}/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const allPosts = await getAllPosts();
  const currentIndex = allPosts.findIndex(p => p.id === post.id);
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  const publishedDate = post.published_at 
    ? new Date(post.published_at)
    : new Date(post.created_at);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-[#f5f1e9] via-[#eee6d9] to-[#e4d9c8] dark:from-gray-800 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link 
              href="/blog"
              className="inline-flex items-center gap-2 text-[#9d9585] dark:text-[#c9c1b0] hover:text-[#6b5f4b] dark:hover:text-[#e0d8c8] transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Blog</span>
            </Link>

            <div className="flex items-center gap-4 mb-6">
              <span className="inline-block px-4 py-2 bg-[#f0ede7] dark:bg-gray-800/40 text-[#6b5f4b] dark:text-[#d9d1c1] rounded-full text-sm font-medium">
                {post.category}
              </span>
              {post.featured && (
                <span className="inline-block px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full text-sm font-medium">
                  Featured
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 font-playfair">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400 mb-8">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{post.author_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <time dateTime={publishedDate.toISOString()}>
                  {publishedDate.toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{post.read_time_minutes} min read</span>
              </div>
            </div>

            {post.excerpt && (
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Featured Image */}
            {post.featured_image_url && (
              <div className="mb-8 rounded-xl overflow-hidden">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Blog Content */}
            <article className="prose prose-lg dark:prose-invert max-w-none">
              <div 
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </article>

            {/* Navigation */}
            <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between gap-6">
                {prevPost ? (
                  <Link
                    href={`/blog/${prevPost.slug}`}
                    className="group flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-[#9d9585] dark:group-hover:text-[#c9c1b0] transition-colors mt-1 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Previous Post</div>
                      <div className="font-semibold text-gray-900 dark:text-white group-hover:text-[#6b5f4b] dark:group-hover:text-[#d9d1c1] transition-colors">
                        {prevPost.title}
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div></div>
                )}

                {nextPost && (
                  <Link
                    href={`/blog/${nextPost.slug}`}
                    className="group flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-right sm:text-left"
                  >
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Next Post</div>
                      <div className="font-semibold text-gray-900 dark:text-white group-hover:text-[#6b5f4b] dark:group-hover:text-[#d9d1c1] transition-colors">
                        {nextPost.title}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#9d9585] dark:group-hover:text-[#c9c1b0] transition-colors mt-1 flex-shrink-0" />
                  </Link>
                )}
              </div>

              <div className="mt-8 text-center">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] text-[#3f3a31] rounded-lg hover:from-[#8c846f] hover:via-[#aea693] hover:to-[#bfb6a5] transition-colors font-medium"
                >
                  <ArrowLeft className="w-5 h-5" />
                  View All Posts
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


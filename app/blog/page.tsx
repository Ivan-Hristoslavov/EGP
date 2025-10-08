import type { Metadata } from 'next';
import { siteConfig } from "@/config/site";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Blog | ${siteConfig.name}`,
    description: "Read our latest articles about aesthetic treatments, skincare tips, and beauty insights from EGP Aesthetics London.",
    alternates: {
      canonical: `${siteConfig.url}/blog`,
    },
  };
}

export default function BlogPage() {
  const blogPosts = [
    {
      title: "Understanding Baby Botox: A Gentle Approach to Anti-Ageing",
      excerpt: "Learn about the benefits and considerations of baby botox treatments for younger patients seeking preventive anti-ageing solutions.",
      date: "2024-01-15",
      category: "Anti-wrinkle",
      readTime: "5 min read",
      featured: true,
    },
    {
      title: "The Science Behind Dermal Fillers",
      excerpt: "Discover how dermal fillers work, different types available, and what to expect from your treatment journey.",
      date: "2024-01-10",
      category: "Fillers",
      readTime: "7 min read",
      featured: false,
    },
    {
      title: "Skincare Routine for Optimal Results",
      excerpt: "Essential skincare tips to maintain and enhance your aesthetic treatment results for long-lasting beauty.",
      date: "2024-01-05",
      category: "Skincare",
      readTime: "6 min read",
      featured: false,
    },
    {
      title: "Profhilo: The Revolutionary Skin Remodelling Treatment",
      excerpt: "Everything you need to know about Profhilo, the innovative treatment that improves skin quality and hydration.",
      date: "2024-01-01",
      category: "Face Treatments",
      readTime: "8 min read",
      featured: true,
    },
    {
      title: "Non-Invasive Body Contouring: Fat Freezing Explained",
      excerpt: "Understanding cryolipolysis and how fat freezing treatments can help you achieve your body goals safely.",
      date: "2023-12-28",
      category: "Body Treatments",
      readTime: "6 min read",
      featured: false,
    },
    {
      title: "Preparing for Your First Aesthetic Treatment",
      excerpt: "A comprehensive guide to help you prepare for your first aesthetic procedure and what to expect.",
      date: "2023-12-25",
      category: "General",
      readTime: "10 min read",
      featured: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
            Our Blog
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            Stay informed about the latest in aesthetic treatments, skincare tips, and beauty insights.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <article key={index} className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all ${post.featured ? 'md:col-span-2 lg:col-span-3' : ''}`}>
                <div className="flex items-center gap-4 mb-4">
                  <span className="inline-block px-3 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-400 text-sm font-medium rounded-full">
                    {post.category}
                  </span>
                  {post.featured && (
                    <span className="inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-sm font-medium rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {post.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <time className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(post.date).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {post.readTime}
                  </span>
                </div>
              </article>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              More articles coming soon! Subscribe to our newsletter for updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


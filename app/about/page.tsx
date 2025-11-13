import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { siteConfig } from "@/config/site";
import { createClient } from '@/lib/supabase/server';
import ImageWithSkeleton from "@/components/ImageWithSkeleton";

type AboutContentSection = {
  id: string;
  section_type: string;
  heading?: string;
  content?: string;
  image_url?: string;
  bullet_points?: string[];
};

type ImageTextLayoutOptions = {
  index: number;
  content: ReactNode;
  priority?: boolean;
  imageSizes?: string;
  heading?: ReactNode | null;
};

function renderImageTextLayout(
  section: AboutContentSection,
  { index, content, priority = false, imageSizes = "(max-width: 768px) 100vw, 50vw", heading }: ImageTextLayoutOptions
) {
  const showImage = Boolean(section.image_url);
  const swapOnDesktop = showImage && index % 2 === 1;
  const headingContent = heading ?? section.heading;

  return (
    <section key={section.id} className="mb-16 last:mb-0">
      <div className={showImage ? "flex flex-col gap-8 md:grid md:grid-cols-2 md:gap-12" : "flex flex-col gap-6"}>
        <div className={`flex flex-col gap-6 ${showImage ? (swapOnDesktop ? "md:order-2" : "md:order-1") : ""}`}>
          {headingContent ? (
            typeof headingContent === "string" ? (
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {headingContent}
            </h2>
            ) : (
              headingContent
            )
          ) : null}
          {content}
        </div>
        {showImage && (
          <ImageWithSkeleton
            src={section.image_url as string}
            alt={section.heading || "About EGP Aesthetics"}
            fill
            className="object-cover"
            priority={priority}
            sizes={imageSizes}
            containerClassName={`relative w-full overflow-hidden rounded-2xl shadow-xl h-[260px] sm:h-[340px] md:h-[440px] ${swapOnDesktop ? "md:order-1" : "md:order-2"}`}
          />
        )}
      </div>
    </section>
  );
}

async function getAboutContent(): Promise<AboutContentSection[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('about_content')
      .select('*')
      .eq('is_active', true)
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching about content:', error);
      return [];
    }

    return (data as AboutContentSection[]) ?? [];
  } catch (error) {
    console.error('Error in getAboutContent:', error);
    return [];
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `About Us | ${siteConfig.name}`,
    description: "Learn about EGP Aesthetics London - our story, values, and commitment to providing exceptional aesthetic treatments.",
    alternates: {
      canonical: `${siteConfig.url}/about`,
    },
  };
}

export default async function AboutPage() {
  const sections = await getAboutContent();

  const renderSection = (section: AboutContentSection, index: number) => {
    switch (section.section_type) {
      case 'hero':
        return renderImageTextLayout(section, {
          index,
          heading: section.heading
            ? (
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white font-playfair">
                {section.heading}
              </h1>
            )
            : null,
          content: (
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                {section.content}
              </p>
            </div>
          ),
          priority: index === 0,
          imageSizes: "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw",
        });

      case 'story':
      case 'why_choose_us':
        return renderImageTextLayout(section, {
          index,
          content: (
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {section.content}
              </p>
            </div>
          ),
        });

      case 'values':
        return renderImageTextLayout(section, {
          index,
          content: (
            <div className="space-y-6">
              {section.content && (
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {section.content}
                </p>
              )}
              {section.bullet_points && section.bullet_points.length > 0 && (
                <ul className="space-y-3">
                  {section.bullet_points.map((bullet: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                      <span className="text-rose-500 mt-1">✓</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ),
        });

      default:
        return renderImageTextLayout(section, {
          index,
          content: (
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {section.content}
              </p>
            </div>
          ),
          imageSizes: "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw",
        });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 font-playfair">
            About EGP Aesthetics London
          </h1>
          
          {sections.length > 0 ? (
            <div>
              {sections.map((section, index) => renderSection(section, index))}
            </div>
          ) : (
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Welcome to EGP Aesthetics London, where we combine medical expertise with artistic vision to help you achieve your aesthetic goals.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
                Our Story
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Founded with a passion for natural beauty enhancement, EGP Aesthetics has been serving clients in London with exceptional aesthetic treatments. Our clinic is built on the foundation of trust, expertise, and personalized care.
              </p>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
                Our Values
              </h2>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
                <li>Safety and excellence in every treatment</li>
                <li>Natural-looking results that enhance your beauty</li>
                <li>Personalized care tailored to your unique needs</li>
                <li>Continuous education and training in latest techniques</li>
                <li>Transparent pricing and honest consultations</li>
              </ul>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
                Why Choose Us
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Our team of qualified practitioners is dedicated to providing safe, effective, and beautiful results. We stay at the forefront of aesthetic medicine, using only the latest techniques and highest quality products.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

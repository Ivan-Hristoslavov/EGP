import type { Metadata } from 'next';
import { siteConfig } from "@/config/site";
import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';

async function getAboutContent() {
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

    return data || [];
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

  // Render sections based on type
  const renderSection = (section: any, index: number) => {
    switch (section.section_type) {
      case 'hero':
        return (
          <div key={section.id} className="mb-16">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-xl text-gray-600 dark:text-gray-300">
                {section.content}
              </p>
            </div>
            {section.image_url && (
              <div className="mt-8 relative w-full h-96 rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src={section.image_url}
                  alt={section.heading || 'About EGP Aesthetics'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                />
              </div>
            )}
          </div>
        );

      case 'story':
      case 'why_choose_us':
        return (
          <div key={section.id} className={`mb-16 ${section.image_url ? 'grid md:grid-cols-2 gap-8 items-center' : ''}`}>
            <div>
              {section.heading && (
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  {section.heading}
                </h2>
              )}
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {section.content}
                </p>
              </div>
            </div>
            {section.image_url && (
              <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src={section.image_url}
                  alt={section.heading || 'About EGP Aesthetics'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}
          </div>
        );

      case 'values':
        return (
          <div key={section.id} className={`mb-16 ${section.image_url ? 'grid md:grid-cols-2 gap-8 items-start' : ''}`}>
            <div className={section.image_url ? 'order-2 md:order-1' : ''}>
              {section.heading && (
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  {section.heading}
                </h2>
              )}
              {section.content && (
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
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
            {section.image_url && (
              <div className={`relative w-full h-96 rounded-2xl overflow-hidden shadow-xl ${section.image_url ? 'order-1 md:order-2' : ''}`}>
                <Image
                  src={section.image_url}
                  alt={section.heading || 'About EGP Aesthetics'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}
          </div>
        );

      default:
        return (
          <div key={section.id} className="mb-16">
            {section.heading && (
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                {section.heading}
              </h2>
            )}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {section.content}
              </p>
            </div>
            {section.image_url && (
              <div className="mt-8 relative w-full h-96 rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src={section.image_url}
                  alt={section.heading || 'About EGP Aesthetics'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                />
              </div>
            )}
          </div>
        );
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

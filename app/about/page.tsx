import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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

// Split long content into paragraphs
function contentToParagraphs(content: string | undefined): string[] {
  if (!content?.trim()) return [];
  return content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
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
  const sections = await getAboutContent();
  const firstContent = sections[0]?.content;
  const description = firstContent
    ? (firstContent.slice(0, 160).trim() + (firstContent.length > 160 ? "…" : ""))
    : "Learn about EGP Aesthetics London - our story, values, and commitment to exceptional aesthetic treatments.";
  return {
    title: `About Us | ${siteConfig.name}`,
    description,
    alternates: {
      canonical: `${siteConfig.url}/about`,
    },
  };
}

export default async function AboutPage() {
  const sections = await getAboutContent();

  // First section with image = full-viewport hero. Rest = stacked below.
  const heroSection = sections.find((s) => s.image_url && (s.section_type === 'hero' || s.section_type === 'story'));
  const otherSections = sections.filter((s) => s.id !== heroSection?.id);

  const sectionLabel: Record<string, string> = {
    hero: 'About Us',
    story: 'Our Story',
    why_choose_us: 'Why Choose Us',
    values: 'Our Values',
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Full-viewport hero: text left, large image right */}
      {heroSection && heroSection.image_url ? (
        <section className="min-h-0 flex flex-col lg:flex-row lg:min-h-[85vh]">
          {/* Left: text — content centered or scrollable */}
          <div className="flex-1 flex flex-col min-h-0 lg:max-w-[50%]">
            <div className="flex flex-col justify-center flex-1 px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20 xl:px-24 overflow-y-auto">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-8 lg:mb-10"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-3">
                {sectionLabel[heroSection.section_type] || 'About'}
              </p>
              {heroSection.heading && (
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-6 md:mb-8 max-w-xl">
                  {heroSection.heading}
                </h1>
              )}
              <div className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed max-w-xl space-y-4">
                {contentToParagraphs(heroSection.content).length > 0 ? (
                  contentToParagraphs(heroSection.content).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))
                ) : (
                  <p>{heroSection.content}</p>
                )}
              </div>
              <Link
                href="/#services"
                className="inline-block mt-8 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 bg-egp-green dark:bg-egp-green-dark text-white hover:opacity-90 shadow-md hover:shadow-lg w-auto min-w-0"
                style={{ width: "fit-content" }}
              >
                Our Services
              </Link>
            </div>
          </div>

          {/* Right: image fits on screen with rounding */}
          <div className="relative w-full lg:w-[50%] flex-shrink-0 flex items-center justify-center lg:min-h-[85vh] p-4 lg:p-6">
            <div className="relative w-full max-h-[70vh] lg:max-h-[80vh] aspect-[3/4] lg:aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 shadow-lg">
              <ImageWithSkeleton
                src={heroSection.image_url}
                alt={heroSection.heading || 'About EGP Aesthetics'}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1023px) 100vw, 50vw"
                containerClassName="absolute inset-0 w-full h-full"
                unoptimized
              />
            </div>
          </div>
        </section>
      ) : sections.length > 0 ? (
        /* No hero image: back link only; sections render below */
        <div className="pt-8 px-6 sm:px-10 lg:px-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      ) : null}

      {/* Other sections: full width, stacked, minimal layout */}
      {otherSections.length > 0 && (
        <div className="w-full max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 py-16 lg:py-24 space-y-20">
          {otherSections.map((section) => {
            const paras = contentToParagraphs(section.content);
            const label = sectionLabel[section.section_type] || section.section_type;

            return (
              <article key={section.id} className="scroll-mt-24">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-2">
                  {label}
                </p>
                {section.heading && (
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-6">
                    {section.heading}
                  </h2>
                )}
                <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-4">
                  {paras.length > 0 ? (
                    paras.map((para, i) => <p key={i}>{para}</p>)
                  ) : (
                    <p>{section.content}</p>
                  )}
                </div>
                {section.bullet_points && section.bullet_points.length > 0 && (
                  <ul className="mt-6 space-y-3">
                    {section.bullet_points.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                        <span className="text-[#9d9585] dark:text-[#b5ad9d] mt-0.5 font-bold">✓</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            );
          })}
        </div>
      )}

      {sections.length === 0 && (
        <div className="max-w-xl mx-auto px-6 py-24 text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            About page content is being updated. Please check back soon.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-6 text-gray-900 dark:text-white font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      )}
    </div>
  );
}

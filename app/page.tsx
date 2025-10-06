import type { Metadata } from 'next';
import Image from "next/image";
import { SectionHero } from "@/components/SectionHero";
import { SectionPricing } from "@/components/SectionPricing";
import { FAQSection } from "@/components/FAQSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { GallerySection } from "@/components/GallerySection";
import { AdminProfileData } from "@/components/AdminProfileData";
import { AdminProfileMarkdown } from "@/components/AdminProfileMarkdown";
import { ReviewForm } from "@/components/ReviewForm";
import SectionContact from "@/components/SectionContact";
import { FloatingCTA } from "@/components/FloatingCTA";
import { getAdminProfile } from "@/lib/admin-profile";
import { createClient } from "@/lib/supabase/server";

interface Area {
  id: string;
  name: string;
  slug: string;
  postcode: string;
  description: string;
  response_time: string;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getAdminProfile();
  const companyName = profile?.company_name || "EGP";
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://egp.com';
  
  const responseTime = profile?.response_time || "45 minutes";
  // Normalize response time to avoid duplication (remove any existing "minute/minutes")
  const responseTimeNormalized = responseTime.replace(/\s+(minutes?|mins?)\s*/gi, '').trim();
  
  const yearsExperience = profile?.years_of_experience 
    ? (profile.years_of_experience.toLowerCase().includes('years') 
        ? profile.years_of_experience 
        : `${profile.years_of_experience} Years`)
    : "10+ Years";

  return {
    title: `${companyName} - Emergency Plumber London | Same Day Service | Clapham, Chelsea, Battersea`,
    description: `Professional emergency plumber covering South West London. Same-day service in Clapham, Balham, Chelsea, Battersea, Wandsworth, Streatham. ${responseTimeNormalized}-minute response time, ${yearsExperience} experience. Gas Safe registered, fully insured.`,
    alternates: {
      canonical: base,
    },
    openGraph: {
      title: `${companyName} - Emergency Plumber London | Same Day Service`,
      description: `Professional emergency plumber covering South West London with ${responseTimeNormalized}-minute response time. Gas Safe registered, fully insured.`,
      url: base,
      type: "website",
      locale: "en_GB",
      siteName: companyName,
      images: [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${companyName} - Emergency Plumber London`,
      description: `Professional emergency plumber covering South West London with same-day service. ${responseTimeNormalized}-minute response time.`,
      images: [],
    },
  };
}

async function getAreas(): Promise<Area[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('admin_areas_cover')
      .select('*')
      .eq('is_active', true)
      .order('order', { ascending: true });
    
    if (error) {
      console.error('Error fetching areas:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getAreas:', error);
    return [];
  }
}

export default async function HomePage() {
  const areas = await getAreas();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <SectionHero />

      {/* Services Section */}
      <section id="services">
        <SectionPricing />
      </section>
      {/* Our Story Section */}
      <section
        className="py-20 bg-white dark:bg-gray-900 transition-colors duration-500"
        id="our-story"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-800 dark:text-blue-300 text-sm font-medium mb-6">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              <span>About</span>
              <span className="mx-2">•</span>
              <AdminProfileData type="name" fallback="Plamen Zhelev" />
              <AdminProfileData type="company_status" fallback="" className="ml-2 text-xs opacity-75" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
              Professional Plumbing Services You Can Trust
            </h2>
          </div>

          {/* Main Content - Centered Layout */}
          <div className="max-w-6xl mx-auto">
            {/* Profile Image - Centered */}
            <div className="flex justify-center mb-12">
              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gray-200 flex items-center justify-center">
                  <div className="text-gray-500 text-center p-8">
                    <div className="text-6xl mb-4">🔧</div>
                    <p className="text-xl">Professional Services</p>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500 rounded-full opacity-20"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-500 rounded-full opacity-20"></div>
              </div>
            </div>

            {/* About Text - Under Image */}
            <div className="text-center mb-12">
              <div className="relative bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 dark:from-gray-800 dark:via-blue-900/20 dark:to-purple-900/20 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-10 max-w-5xl mx-auto backdrop-blur-sm">
                {/* Decorative elements */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-60"></div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full opacity-60"></div>
                <div className="absolute top-1/2 -left-4 w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-40"></div>
                
                <div className="prose prose-xl dark:prose-invert max-w-none">
                  <AdminProfileMarkdown
                    type="about"
                    fallback=""
                    className="text-gray-700 dark:text-gray-300 leading-relaxed transition-colors duration-300 text-lg"
                  />
                </div>
              </div>
            </div>

            {/* Certifications Grid - Under Text */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {/* Experience Card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-green-200/50 dark:border-green-800/50 p-4 transition-all duration-500 hover:shadow-lg hover:scale-[1.01] hover:border-green-300 dark:hover:border-green-700">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-md flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-all duration-300">
                    <svg
                      className="h-5 w-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-green-800 dark:text-green-200 mb-1 group-hover:text-green-900 dark:group-hover:text-green-100 transition-colors duration-300">
                      Experience
                    </h3>
                    <p className="text-green-700 dark:text-green-300 leading-relaxed group-hover:text-green-800 dark:group-hover:text-green-200 transition-colors duration-300 text-xs">
                      <AdminProfileData
                        type="years_of_experience"
                        fallback="10+ Years"
                      />
                    </p>
                  </div>
                </div>
              </div>

              {/* Response Time Card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50 dark:from-purple-900/20 dark:via-violet-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50 p-4 transition-all duration-500 hover:shadow-lg hover:scale-[1.01] hover:border-purple-300 dark:hover:border-purple-700">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-violet-500 to-pink-600 rounded-md flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-all duration-300">
                    <svg
                      className="h-5 w-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-purple-800 dark:text-purple-200 mb-1 group-hover:text-purple-900 dark:group-hover:text-purple-100 transition-colors duration-300">
                      Response Time
                    </h3>
                    <p className="text-purple-700 dark:text-purple-300 leading-relaxed group-hover:text-purple-800 dark:group-hover:text-purple-200 transition-colors duration-300 text-xs">
                      <AdminProfileData
                        type="response_time"
                        fallback="45 minutes"
                      />
                    </p>
                  </div>
                </div>
              </div>

              {/* Certifications Card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50 p-4 transition-all duration-500 hover:shadow-lg hover:scale-[1.01] hover:border-blue-300 dark:hover:border-blue-700">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-md flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-all duration-300">
                    <svg
                      className="h-5 w-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-blue-800 dark:text-blue-200 mb-1 group-hover:text-blue-900 dark:group-hover:text-blue-100 transition-colors duration-300">
                      Certifications
                    </h3>
                    <div className="text-blue-700 dark:text-blue-300 leading-relaxed group-hover:text-blue-800 dark:group-hover:text-blue-200 transition-colors duration-300 text-xs">
                      <AdminProfileData
                        type="certifications"
                        asList={true}
                        fallback="Kitchen plumbing specialist. Registered professional with City & Guilds Level 3 in Plumbing & Heating. Holder of CSCS JIB Gold Card."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Specializations Card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-red-900/20 rounded-lg border border-amber-200/50 dark:border-amber-800/50 p-4 transition-all duration-500 hover:shadow-lg hover:scale-[1.01] hover:border-amber-300 dark:hover:border-amber-700">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 rounded-md flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-all duration-300">
                    <svg
                      className="h-5 w-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-amber-800 dark:text-amber-200 mb-1 group-hover:text-amber-900 dark:group-hover:text-amber-100 transition-colors duration-300">
                      Specializations
                    </h3>
                    <div className="text-amber-700 dark:text-amber-300 leading-relaxed group-hover:text-amber-800 dark:group-hover:text-amber-200 transition-colors duration-300 text-xs">
                      <AdminProfileData
                        type="specializations"
                        asList={true}
                        fallback="Emergency plumbing. Bathroom plumbing & repairs. Leak detection"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Button */}
            <div className="mt-12 text-center">
              <a
                href="#contact"
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white font-semibold rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl border border-blue-500/20"
              >
                <svg
                  className="w-5 h-5 mr-3 group-hover:animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                Get Free Quote
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas Section */}
      <section
        className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-500"
        id="service-areas"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-800 dark:text-blue-300 text-sm font-medium mb-6">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
                <path
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              Service Coverage
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
              Areas We Cover
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
              Professional plumbing services across South West London with rapid
              response times
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {areas.map((area) => (
                <div
                  key={area.id}
                  className="group bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                      {area.name}
                    </h3>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors duration-300">
                      <svg
                        className="w-6 h-6 text-blue-600 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                        <path
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-300">
                    {area.postcode}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-300">
                    {area.description}
                  </p>
                </div>
              ))}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 text-center transition-all duration-300">
            <div className="flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                Outside Our Main Areas?
              </h4>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4 transition-colors duration-300">
              If you're outside these zones, feel free to contact us to check
              availability – we prioritise local response but may be able to
              help or refer you to a trusted colleague.
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium transition-colors duration-300">
              We aim to arrive within 45 minutes for emergency callouts in our
              main service areas.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <GallerySection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Reviews Section */}
      <ReviewsSection />

      {/* Contact Section */}
      <SectionContact />

      {/* Review Form Section */}
      <ReviewForm />

      {/* Floating Elements */}
      <FloatingCTA />
    </main>
  );
}

import type { Metadata } from 'next';
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { Calendar, CheckCircle, Star, ArrowRight, Phone, Target } from "lucide-react";
import { notFound } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";

async function getCondition(slug: string) {
  try {
    const supabase = createClient();
    const { data: condition, error } = await supabase
      .from("conditions")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !condition) {
      return null;
    }

    return condition;
  } catch (error) {
    console.error("Error fetching condition:", error);
    return null;
  }
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const condition = await getCondition(slug);
  
  if (!condition) {
    return {
      title: `Condition Not Found | ${siteConfig.name}`,
    };
  }

  return {
    title: `${condition.title} Treatment | ${siteConfig.name}`,
    description: condition.description,
    alternates: {
      canonical: `${siteConfig.url}/conditions/${slug}`,
    },
  };
}

export default async function ConditionPage({ params }: PageProps) {
  const { slug } = await params;
  const condition = await getCondition(slug);

  if (!condition) {
    notFound();
  }

  // Parse treatments from JSONB array
  const treatments = Array.isArray(condition.treatments) 
    ? condition.treatments 
    : typeof condition.treatments === 'string' 
      ? JSON.parse(condition.treatments) 
      : [];

  const treatmentProcess = [
    {
      step: "1",
      title: "Assessment",
      description: "Comprehensive evaluation of your specific condition"
    },
    {
      step: "2",
      title: "Treatment Plan",
      description: "Personalised treatment recommendations"
    },
    {
      step: "3",
      title: "Treatment",
      description: "Professional treatment by qualified practitioners"
    },
    {
      step: "4",
      title: "Results",
      description: "Monitor progress and plan follow-up treatments"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-egp-beige-lighter to-egp-beige-light dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              {condition.popular && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-egp-green-bg-light dark:bg-egp-green-dark/30 rounded-full text-egp-green dark:text-egp-green-light text-xs font-semibold">
                  <Star className="w-3.5 h-3.5" />
                  <span>Common Condition</span>
                </div>
              )}
              <div className="inline-block px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300 text-xs font-medium">
                {condition.category}
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
              {condition.title}
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-300 mb-8">
              {condition.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                     href="/book/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-egp-beige-darkest via-egp-beige-darker to-egp-beige-dark text-white text-base font-semibold rounded-full hover:from-egp-beige-darker hover:via-egp-beige-dark hover:to-egp-beige transition-all shadow-lg hover:shadow-xl"
              >
                <Calendar className="w-4 h-4" />
                Book Treatment Now
              </Link>
              <Link
                href={`tel:${siteConfig.contact.phone}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-egp-beige-darkest text-egp-beige-darkest dark:text-egp-beige-darker text-base font-semibold rounded-full hover:bg-egp-beige-darkest hover:text-white transition-all"
              >
                <Phone className="w-4 h-4" />
                Call Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Condition Details */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-8">
              {/* Condition Info */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Understanding {condition.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                  {condition.description}. Our expert practitioners have extensive experience treating this condition and can recommend the most effective treatment options for your specific needs.
                </p>
                <div className="flex items-center justify-center gap-3 mb-8">
                  <Target className="w-4 h-4 text-egp-beige-darkest" />
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 dark:text-white">Treatment Focus</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Personalised approach</div>
                  </div>
                </div>
              </div>

              {/* Recommended Treatments */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                  Recommended Treatments
                </h3>
                <ul className="space-y-4 max-w-md mx-auto">
                  {treatments.map((treatment: string, index: number) => (
                    <li key={index} className="flex items-center justify-center gap-3">
                      <CheckCircle className="w-4 h-4 text-egp-green flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300 text-center">{treatment}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Treatment Process */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-center mb-12">
              Treatment Process
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {treatmentProcess.map((step, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all text-center"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-egp-beige-darkest via-egp-beige-darker to-egp-beige-dark rounded-full flex items-center justify-center mb-4 mx-auto">
                    <span className="text-white font-bold text-base">{step.step}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Address Your Concerns?
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-300 mb-8">
              Book your treatment now to discuss the best treatment options for {condition.title.toLowerCase()}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                     href="/book/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-egp-beige-darkest hover:bg-egp-beige-darker text-white text-base font-semibold rounded-full transition-all shadow-lg hover:shadow-xl"
              >
                <Calendar className="w-4 h-4" />
                Book Treatment Now
              </Link>
              <Link
                href="/conditions"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-egp-beige-darkest text-egp-beige-darkest dark:text-egp-beige-darker text-base font-semibold rounded-full hover:bg-egp-beige-darkest hover:text-white transition-all"
              >
                <ArrowRight className="w-4 h-4" />
                View All Conditions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

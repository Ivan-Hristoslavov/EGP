import type { Metadata } from 'next';
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { Calendar, CheckCircle, Star, ArrowRight, Phone, Target } from "lucide-react";
import { notFound } from 'next/navigation';

// Condition data - this would typically come from a database
const conditionsData = {
  'acne-acne-scarring': {
    title: 'Acne & Acne Scarring',
    category: 'Face Conditions',
    description: 'Professional treatment for active acne and scar reduction',
    treatments: [
      'Medical Skin Peels - £200',
      'Microneedling Facial - £170',
      'PRP Treatment - £480',
      'Injectable Mesotherapy - £170'
    ],
    popular: true
  },
  'rosacea': {
    title: 'Rosacea',
    category: 'Face Conditions',
    description: 'Gentle treatments to reduce redness and inflammation',
    treatments: [
      'IPL Therapy - £250',
      'Medical Skin Peels - £200',
      'Skincare Routine - £100',
      'Injectable Mesotherapy - £170'
    ],
    popular: false
  },
  'dark-under-eye-circles': {
    title: 'Dark Under-Eye Circles',
    category: 'Face Conditions',
    description: 'Non-invasive solutions for tired-looking eyes',
    treatments: [
      'Tear Trough Filler - £390',
      'Under-Eye Skin Booster - £159',
      'PRP Treatment - £480',
      '3-Step Under-Eye Treatment - £390'
    ],
    popular: true
  },
  'double-chin': {
    title: 'Double Chin',
    category: 'Body Conditions',
    description: 'Effective fat reduction for a more defined jawline',
    treatments: [
      'Fat Freezing Treatment - £200',
      'Radiofrequency & Ultrasound - £250',
      'Ultrasound Therapy - £190',
      'Combined Treatment - £350'
    ],
    popular: true
  },
  'cellulite': {
    title: 'Cellulite',
    category: 'Body Conditions',
    description: 'Reduce the appearance of cellulite on thighs, buttocks, and abdomen',
    treatments: [
      'Radiofrequency & Ultrasound - £250',
      'Ultrasound Therapy - £190',
      'Body Fat Burning Mesotherapy - £170',
      'Combined Treatment - £350'
    ],
    popular: false
  }
};

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const condition = conditionsData[params.slug as keyof typeof conditionsData];
  
  if (!condition) {
    return {
      title: `Condition Not Found | ${siteConfig.name}`,
    };
  }

  return {
    title: `${condition.title} Treatment | ${siteConfig.name}`,
    description: condition.description,
    alternates: {
      canonical: `${siteConfig.url}/conditions/${params.slug}`,
    },
  };
}

export default function ConditionPage({ params }: PageProps) {
  const condition = conditionsData[params.slug as keyof typeof conditionsData];

  if (!condition) {
    notFound();
  }

  const treatmentProcess = [
    {
      step: "1",
      title: "Assessment",
      description: "Comprehensive evaluation of your specific condition"
    },
    {
      step: "2",
      title: "Treatment Plan",
      description: "Personalized treatment recommendations"
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
      <section className="py-16 md:py-24 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {condition.popular && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 dark:bg-rose-900/30 rounded-full text-rose-700 dark:text-rose-400 text-sm font-semibold mb-6">
                <Star className="w-4 h-4" />
                <span>Common Condition</span>
              </div>
            )}
            <div className="inline-block px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300 text-sm font-medium mb-6">
              {condition.category}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {condition.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              {condition.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/book-consultation"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-lg font-semibold rounded-full hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
              >
                <Calendar className="w-5 h-5" />
                Book Treatment Now
              </Link>
              <Link
                href={`tel:${siteConfig.contact.phone}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-rose-500 text-rose-500 dark:text-rose-400 text-lg font-semibold rounded-full hover:bg-rose-500 hover:text-white transition-all"
              >
                <Phone className="w-5 h-5" />
                Call Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Condition Details */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Condition Info */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  Understanding {condition.title}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  {condition.description}. Our expert practitioners have extensive experience treating this condition and can recommend the most effective treatment options for your specific needs.
                </p>
                <div className="flex items-center gap-3 mb-8">
                  <Target className="w-6 h-6 text-rose-500" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Treatment Focus</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Personalized approach</div>
                  </div>
                </div>
              </div>

              {/* Recommended Treatments */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Recommended Treatments
                </h3>
                <ul className="space-y-4">
                  {condition.treatments.map((treatment, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">{treatment}</span>
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-12">
              Treatment Process
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {treatmentProcess.map((step, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                    <span className="text-white font-bold text-lg">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Address Your Concerns?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Book your treatment now to discuss the best treatment options for your {condition.title.toLowerCase()}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/book-consultation"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-lg font-semibold rounded-full hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
              >
                <Calendar className="w-5 h-5" />
                Book Treatment Now
              </Link>
              <Link
                href="/conditions"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-rose-500 text-rose-500 dark:text-rose-400 text-lg font-semibold rounded-full hover:bg-rose-500 hover:text-white transition-all"
              >
                <ArrowRight className="w-5 h-5" />
                View All Conditions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

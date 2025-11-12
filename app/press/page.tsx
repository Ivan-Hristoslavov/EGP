import type { Metadata } from 'next';
import { siteConfig } from "@/config/site";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Awards & Press | ${siteConfig.name}`,
    description: "Discover our awards, press features, and media recognition at EGP Aesthetics London.",
    alternates: {
      canonical: `${siteConfig.url}/press`,
    },
  };
}

export default function PressPage() {
  const awards = [
    {
      title: "Best Aesthetic Clinic London 2024",
      organisation: "Aesthetic Awards",
      year: "2024",
      description: "Recognised for excellence in aesthetic treatments and patient care.",
    },
    {
      title: "Excellence in Patient Care 2023",
      organisation: "Aesthetic Medicine Awards",
      year: "2023",
      description: "Recognition for outstanding commitment to patient safety and satisfaction.",
    },
    {
      title: "Patient Choice Award",
      organisation: "WhatClinic",
      year: "2023",
      description: "Voted by patients as their preferred aesthetic clinic in London.",
    },
  ];

  const pressFeatures = [
    {
      title: "The Future of Aesthetic Medicine",
      publication: "Aesthetic Medicine Magazine",
      date: "2024-01-20",
      description: "Feature article on innovative treatment approaches.",
    },
    {
      title: "Natural Beauty Enhancement Trends",
      publication: "Beauty Business Weekly",
      date: "2024-01-15",
      description: "Expert insights on current aesthetic trends.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 font-playfair">
          Awards & Press
        </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            Recognition for our commitment to excellence in aesthetic medicine.
          </p>
          
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Awards & Recognition
            </h2>
            <div className="space-y-8">
              {awards.map((award, index) => (
                <div key={index} className="border-l-4 border-[#9d9585] pl-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {award.title}
                  </h3>
                  <p className="text-[#9d9585] dark:text-[#c9c1b0] font-semibold mb-2">
                    {award.organisation} • {award.year}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    {award.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
          
          <section>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Press Features
            </h2>
            <div className="space-y-6">
              {pressFeatures.map((feature, index) => (
                <div key={index} className="bg-[#f5f1e9] dark:bg-gray-900/70 border border-[#e4d9c8] dark:border-gray-700 p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {feature.publication} • {new Date(feature.date).toLocaleDateString('en-GB')}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}


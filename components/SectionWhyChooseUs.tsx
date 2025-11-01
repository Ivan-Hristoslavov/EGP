"use client";

import { Award, Shield, Heart, Sparkles, Clock, Star } from "lucide-react";
import { siteConfig } from "@/config/site";

const reasons = [
  {
    icon: Award,
    title: "Expert Practitioners",
    description: "Highly qualified and experienced aesthetic professionals dedicated to your safety and satisfaction",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: Shield,
    title: "Fully Insured",
    description: "Comprehensive insurance coverage for your peace of mind and protection",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Heart,
    title: "Personalized Care",
    description: "Tailored treatment plans designed specifically for your unique aesthetic goals",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Sparkles,
    title: "Natural Results",
    description: "Subtle enhancements that look natural and enhance your inherent beauty",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Clock,
    title: "Flexible Appointments",
    description: "Convenient booking times to fit your busy schedule, including evenings and weekends",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: Star,
    title: `${siteConfig.trust.satisfactionRate} Satisfaction`,
    description: `Over ${siteConfig.trust.treatmentsPerformed} successful treatments and consistently excellent reviews`,
    gradient: "from-yellow-500 to-orange-500",
  },
];

export default function SectionWhyChooseUs() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-warm-beige-lighter dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 px-4">
            Why Choose EGP Aesthetics?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
            Combining medical expertise with artistic vision to deliver exceptional results
          </p>
        </div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <div
                key={reason.title}
                className="group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-md hover:shadow-2xl transition-all duration-300 sm:hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-5 md:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                  {reason.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  {reason.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="mt-8 sm:mt-12 md:mt-16 flex justify-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl">
            {siteConfig.trust.certifications.map((cert) => (
              <div
                key={cert}
                className="text-center px-4 py-6 bg-blue-100 dark:bg-blue-900/40 rounded-lg border border-blue-300 dark:border-blue-700"
              >
                <div className="text-sm font-bold text-blue-900 dark:text-blue-300">{cert}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


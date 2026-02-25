"use client";

import { Award, Shield, Heart, Sparkles, Clock, Star } from "lucide-react";
import { siteConfig } from "@/config/site";
import { aestheticsColors } from "@/config/colors";
import { badgeBackgroundClass } from "@/config/badge-styles";

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
    title: "Personalised Care",
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
    <section className="py-8 sm:py-16 md:py-20 bg-egp-beige-lighter dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - compact on mobile */}
        <div className="text-center mb-6 sm:mb-12 md:mb-16">
          <div className={`inline-flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-2 ${badgeBackgroundClass} text-gray-900 dark:text-gray-200 text-xs sm:text-base font-semibold mb-2 sm:mb-4`}>
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Why Choose Us</span>
          </div>
          <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4 px-2 sm:px-4">
            Why Choose EGP Aesthetics?
          </h2>
          <p className="text-sm sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-2 sm:px-4">
            Combining medical expertise with artistic vision to deliver exceptional results
          </p>
        </div>

        {/* Reasons Grid - compact on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <div
                key={reason.title}
                className="group bg-white dark:bg-gray-800 rounded-lg sm:rounded-2xl p-3 sm:p-6 md:p-8 shadow-md hover:shadow-2xl transition-all duration-300 sm:hover:-translate-y-2 border border-gray-100 dark:border-gray-700 text-center"
              >
                <div 
                  className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-5 md:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg mx-auto"
                  style={{ backgroundColor: aestheticsColors.green.DEFAULT }}
                >
                  <Icon className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-3">
                  {reason.title}
                </h3>
                <p className="text-xs sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  {reason.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="mt-6 sm:mt-12 md:mt-16 flex justify-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 max-w-5xl w-full mx-auto px-2 sm:px-4">
            {siteConfig.trust.certifications.map((cert) => (
              <div
                key={cert}
                className="text-center px-2 sm:px-4 md:px-6 py-2 sm:py-4 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center bg-[#4b5563] dark:bg-[#1f2937] border border-[#374151] dark:border-[#111827]"
              >
                <div 
                  className="text-[10px] sm:text-sm font-bold leading-tight text-white dark:text-gray-200"
                >
                  {cert}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


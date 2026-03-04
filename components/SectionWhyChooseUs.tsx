"use client";

import { Award, Shield, Heart, Sparkles, Clock, Star } from "lucide-react";
import { siteConfig } from "@/config/site";
import { aestheticsColors } from "@/config/colors";
import { badgeBackgroundClass } from "@/config/badge-styles";
import { typography, textColors, layout } from "@/config/typography";

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
    <section className="py-6 sm:py-10 md:py-12 bg-egp-beige-lighter dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className={layout.container}>
        {/* Section Header - compact */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <div className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 ${badgeBackgroundClass} ${textColors.heading} text-xs font-semibold mb-1.5 sm:mb-3`}>
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Why Choose Us</span>
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-gray-900 dark:text-white mb-1.5 sm:mb-3 px-2 sm:px-4">
            Why Choose EGP Aesthetics?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-2 sm:px-4 leading-relaxed">
            Combining medical expertise with artistic vision to deliver exceptional results
          </p>
        </div>

        {/* Reasons Grid - compact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {reasons.map((reason) => {
            const Icon = reason.icon;
            return (
              <div
                key={reason.title}
                className="group bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 shadow-md hover:shadow-xl transition-all duration-300 sm:hover:-translate-y-1 border border-gray-100 dark:border-gray-700 text-center"
              >
                <div 
                  className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg flex items-center justify-center mb-1.5 sm:mb-3 group-hover:scale-105 transition-transform duration-300 shadow-lg mx-auto"
                  style={{ backgroundColor: aestheticsColors.green.DEFAULT }}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
                  {reason.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {reason.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="mt-4 sm:mt-6 md:mt-8 flex justify-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-3 max-w-4xl w-full mx-auto px-2 sm:px-4">
            {siteConfig.trust.certifications.map((cert) => (
              <div
                key={cert}
                className="text-center px-2 sm:px-3 md:px-4 py-1.5 sm:py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] flex items-center justify-center bg-[#4b5563] dark:bg-[#1f2937] border border-[#374151] dark:border-[#111827]"
              >
                <div className="text-[9px] sm:text-xs font-bold leading-tight text-white dark:text-gray-200">
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


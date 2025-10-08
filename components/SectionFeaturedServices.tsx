"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const featuredServices = [
  {
    title: "Baby Botox",
    category: "Anti-wrinkle",
    price: "£199",
    image: "/images/services/baby-botox.jpg",
    description: "Natural-looking wrinkle reduction",
    href: "/services/baby-botox",
    gradient: "from-purple-500 to-indigo-500",
    popular: true,
  },
  {
    title: "Lip Enhancement",
    category: "Fillers",
    price: "£290",
    image: "/images/services/lip-filler.jpg",
    description: "Fuller, more defined lips",
    href: "/services/lip-enhancement",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    title: "Profhilo",
    category: "Face Treatment",
    price: "£390",
    image: "/images/services/profhilo.jpg",
    description: "Bio-remodelling skin treatment",
    href: "/services/profhilo",
    gradient: "from-blue-500 to-cyan-500",
    popular: true,
  },
  {
    title: "Fat Freezing",
    category: "Body",
    price: "£200",
    image: "/images/services/fat-freezing.jpg",
    description: "Non-invasive fat reduction",
    href: "/services/fat-freezing",
    gradient: "from-emerald-500 to-teal-500",
  },
];

export default function SectionFeaturedServices() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-400 text-sm sm:text-base font-semibold mb-3 sm:mb-4">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Popular Treatments</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 px-4">
            Featured Services
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
            Discover our most popular aesthetic treatments
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {featuredServices.map((service) => (
            <Link
              key={service.title}
              href={service.href}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
            >
              {/* Image */}
              <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br">
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-90`}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-2xl font-bold text-white text-center px-4">
                    {service.title}
                  </h3>
                </div>
                {service.popular && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full">
                    POPULAR
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">
                  {service.category}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {service.description}
                </p>
                  <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                    {service.price}
                  </div>
                  <div className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent font-semibold group-hover:gap-3 transition-all">
                    <span className="text-sm">Learn More</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-rose-600" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center px-4">
          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white text-base sm:text-lg font-bold rounded-full hover:from-rose-600 hover:via-pink-600 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl active:scale-95 w-full sm:w-auto touch-manipulation"
          >
            <span>View All Treatments</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}


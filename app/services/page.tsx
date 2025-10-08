import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Calendar, Clock, Star } from "lucide-react";
import ButtonBookNow from "@/components/ButtonBookNow";

export const metadata: Metadata = {
  title: "Our Treatments & Services",
  description: "Explore our comprehensive range of aesthetic treatments including facial treatments, anti-wrinkle injections, dermal fillers, and body contouring in London.",
  openGraph: {
    title: "Our Treatments & Services | EGP Aesthetics London",
    description: "Expert aesthetic treatments in London. Browse our full range of services.",
  },
};

const serviceCategories = [
  {
    id: "face",
    title: "Face Treatments",
    description: "Advanced facial treatments and skin rejuvenation",
    image: "/images/categories/face.jpg",
    services: 17,
    priceFrom: "£50",
    href: "/services/face",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    id: "anti-wrinkle",
    title: "Anti-wrinkle Injections",
    description: "Botox and anti-wrinkle treatments for a youthful appearance",
    image: "/images/categories/anti-wrinkle.jpg",
    services: 13,
    priceFrom: "£129",
    href: "/services/anti-wrinkle",
    gradient: "from-purple-500 to-indigo-500",
  },
  {
    id: "fillers",
    title: "Dermal Fillers",
    description: "Volume restoration and facial enhancement",
    image: "/images/categories/fillers.jpg",
    services: 10,
    priceFrom: "£150",
    href: "/services/fillers",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "body",
    title: "Body Treatments",
    description: "Body contouring, sculpting, and skin tightening",
    image: "/images/categories/body.jpg",
    services: 5,
    priceFrom: "£170",
    href: "/services/body",
    gradient: "from-emerald-500 to-teal-500",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-rose-600 via-pink-600 to-purple-700 text-white py-12 sm:py-16 md:py-20 lg:py-32">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Transform Your Natural Beauty
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8">
              Expert aesthetic treatments tailored to your unique needs
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
              <ButtonBookNow size="lg" variant="secondary" className="w-full sm:w-auto" />
              <a
                href={`tel:${siteConfig.contact.phone}`}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border-2 border-white/50 hover:bg-yellow-400/20 hover:border-yellow-300 transition-all touch-manipulation active:scale-95"
              >
                <Clock className="w-5 h-5" />
                Call Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
              Browse By Category
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Choose from our comprehensive range of treatments designed to enhance your natural beauty
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {serviceCategories.map((category) => (
              <Link
                key={category.id}
                href={category.href}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Image Background */}
                <div className="aspect-[4/3] sm:aspect-[16/10] md:aspect-[4/3] relative bg-gradient-to-br overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-90`}></div>
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="text-center text-white">
                      <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                        {category.title}
                      </h3>
                      <p className="text-sm sm:text-base md:text-lg text-white/90">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Category Info */}
                <div className="p-4 sm:p-5 md:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm sm:text-base font-semibold">{category.services} Treatments</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs sm:text-sm text-gray-600">From</span>
                      <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                        {category.priceFrom}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent text-sm sm:text-base font-semibold group-hover:gap-3 transition-all">
                    <span>View All Treatments</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 sm:py-16 bg-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-8 sm:mb-12 px-4">
              Why Choose EGP Aesthetics?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Expert Practitioners</h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Highly qualified and experienced aesthetic practitioners
                </p>
              </div>
              <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Free Consultation</h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Complimentary consultation worth £50 for all new clients
                </p>
              </div>
              <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md sm:col-span-1 col-span-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Proven Results</h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  {siteConfig.trust.treatmentsPerformed} successful treatments performed
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-rose-600 via-pink-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Book your treatment today and discover the perfect treatment for you
          </p>
          <ButtonBookNow size="lg" variant="secondary" className="w-full sm:w-auto mx-4 sm:mx-0" />
        </div>
      </section>
    </div>
  );
}


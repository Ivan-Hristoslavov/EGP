import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import ButtonBookNow from "@/components/ButtonBookNow";

export const metadata: Metadata = {
  title: "Dermal Fillers in London | Lip, Cheek & Jawline Enhancement",
  description: "Expert dermal filler treatments in London. Lip enhancement, cheek fillers, jawline contouring, tear trough treatment. Natural results from £150.",
};

const fillerServices = [
  { name: "Cheek & Mid-Face Filler", price: 390, duration: 45, slug: "cheek-filler", popular: true },
  { name: "Chin Filler", price: 290, duration: 30, slug: "chin-filler" },
  { name: "Filler for Marionette Lines", price: 290, duration: 30, slug: "marionette-lines" },
  { name: "Filler for Nasolabial Folds", price: 290, duration: 30, slug: "nasolabial-folds" },
  { name: "Jawline Filler", price: 550, duration: 60, slug: "jawline-filler", featured: true },
  { name: "Lip Enhancement", price: 290, duration: 30, slug: "lip-enhancement", popular: true },
  { name: "Lip Hydration", price: 190, duration: 20, slug: "lip-hydration" },
  { name: "Tear Trough Filler", price: 390, duration: 45, slug: "tear-trough", popular: true },
  { name: "Temple Filler", price: 290, duration: 30, slug: "temple-filler" },
  { name: "Filler Dissolving", price: 150, duration: 20, slug: "filler-dissolving" },
];

export default function FillersPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-600 text-white py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Dermal Fillers
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Volume restoration and facial enhancement
            </p>
            <ButtonBookNow size="lg" variant="secondary" />
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fillerServices.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-fuchsia-500 hover:shadow-xl transition-all duration-300"
              >
                {service.featured && (
                  <span className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full">
                    FEATURED
                  </span>
                )}
                {service.popular && (
                  <span className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-full">
                    POPULAR
                  </span>
                )}

                <h3 className="text-xl font-bold text-gray-900 mb-3 pr-20 group-hover:text-blue-600 transition-colors">
                  {service.name}
                </h3>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration} min</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <span className="text-sm text-gray-600">From</span>
                    <div className="text-2xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent">£{service.price}</div>
                  </div>
                  <div className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent font-semibold group-hover:gap-3 transition-all">
                    <span>Book</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-fuchsia-600" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-fuchsia-600 via-pink-600 to-rose-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-4">
            Enhance Your Natural Features
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Expert dermal filler treatments with natural-looking results
          </p>
          <ButtonBookNow size="lg" variant="secondary" className="w-full sm:w-auto mx-4 sm:mx-0" />
        </div>
      </section>
    </div>
  );
}


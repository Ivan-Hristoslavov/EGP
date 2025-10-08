import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import ButtonBookNow from "@/components/ButtonBookNow";

export const metadata: Metadata = {
  title: "Anti-wrinkle Injections in London | Botox Treatments",
  description: "Expert anti-wrinkle injections in London. Baby Botox, brow lift, forehead lines, eye wrinkles. Safe, effective treatments from £129.",
};

const antiWrinkleServices = [
  { name: "Baby Botox", price: 199, duration: 15, slug: "baby-botox", popular: true },
  { name: "Brow Lift", price: 279, duration: 15, slug: "brow-lift" },
  { name: "Eye Wrinkles (Crow's Feet)", price: 179, duration: 15, slug: "eye-wrinkles" },
  { name: "Forehead Lines", price: 179, duration: 15, slug: "forehead-lines", popular: true },
  { name: "Glabella Lines (Frown Lines)", price: 179, duration: 15, slug: "glabella-lines" },
  { name: "Barcode Lips", price: 129, duration: 10, slug: "barcode-lips" },
  { name: "Bunny Lines", price: 129, duration: 10, slug: "bunny-lines" },
  { name: "Lip Lines", price: 179, duration: 15, slug: "lip-lines" },
  { name: "Gummy Smile", price: 129, duration: 10, slug: "gummy-smile" },
  { name: "Neck Lift", price: 329, duration: 20, slug: "neck-lift" },
  { name: "Jaw Slimming", price: 279, duration: 20, slug: "jaw-slimming", popular: true },
  { name: "Pebble Chin", price: 179, duration: 10, slug: "pebble-chin" },
  { name: "Bruxism Treatment (Teeth Grinding)", price: 279, duration: 20, slug: "bruxism" },
];

export default function AntiWrinklePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Anti-wrinkle Injections
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8">
              Smooth wrinkles and fine lines with expert Botox treatments
            </p>
            <ButtonBookNow size="lg" variant="secondary" />
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {antiWrinkleServices.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-purple-600 hover:shadow-xl transition-all duration-300"
              >
                {service.popular && (
                  <span className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold rounded-full">
                    POPULAR
                  </span>
                )}

                <h3 className="text-xl font-bold text-gray-900 mb-3 pr-20 group-hover:text-purple-600 transition-colors">
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
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">£{service.price}</div>
                  </div>
                  <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent font-semibold group-hover:gap-3 transition-all">
                    <span>Book</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-purple-600" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-4">
            Start Your Anti-Aging Journey Today
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Book your treatment now and discover how we can help you look and feel your best
          </p>
          <ButtonBookNow size="lg" variant="secondary" className="w-full sm:w-auto mx-4 sm:mx-0" />
        </div>
      </section>
    </div>
  );
}


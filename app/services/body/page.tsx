import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import ButtonBookNow from "@/components/ButtonBookNow";
import { typography, layout } from "@/config/typography";

export const metadata: Metadata = {
  title: "Body Contouring & Sculpting Treatments in London",
  description: "Professional body treatments including fat freezing, mesotherapy, RF skin tightening, and cellulite reduction. Transform your body from £170.",
};

const bodyServices = [
  { name: "Body Fat Burning Mesotherapy", price: 170, duration: 30, slug: "body-mesotherapy", description: "One area 20×20 cm", popular: true },
  { name: "Radiofrequency & Ultrasound", price: 250, duration: 60, slug: "rf-ultrasound", description: "Skin tightening & anti-cellulite" },
  { name: "Fat Freezing Treatment", price: 200, duration: 60, slug: "fat-freezing", description: "Abdomen, lose centimetres", featured: true },
  { name: "Ultrasound Lift & Tighten", price: 190, duration: 45, slug: "ultrasound-lift", description: "Face or body" },
  { name: "Ultrasound + Mesotherapy Combined", price: 350, duration: 75, slug: "ultrasound-mesotherapy", description: "Maximum results" },
];

export default function BodyTreatmentsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 text-white py-16 md:py-24">
        <div className={layout.container}>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className={`${typography.headingHero} mb-6`}>
              Body Treatments
            </h1>
            <p className={`${typography.lead} text-emerald-100 mb-8`}>
              Sculpt, tone, and transform your body with advanced treatments
            </p>
            <ButtonBookNow size="lg" variant="secondary" />
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className={layout.container}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bodyServices.map((service) => (
              <div
                key={service.slug}
                className="group relative bg-white dark:bg-egp-green border-2 border-gray-300 dark:border-egp-green-dark rounded-xl p-5 hover:border-egp-green dark:hover:border-egp-green hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {service.featured && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-gradient-to-r from-egp-green to-egp-green-dark text-white text-[10px] font-bold rounded-full">
                    FEATURED
                  </span>
                )}
                {service.popular && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-gradient-to-r from-egp-green to-egp-green-dark text-white text-[10px] font-bold rounded-full">
                    POPULAR
                  </span>
                )}

                <Link href={`/services/${service.slug}`} className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 pr-16 group-hover:text-egp-green transition-colors">
                    {service.name}
                  </h3>

                  {service.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">{service.description}</p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{service.duration} min</span>
                    </div>
                  </div>
                </Link>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-egp-green-dark mt-auto">
                  <div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">From</span>
                    <div className="text-lg font-bold text-egp-green dark:text-white">£{service.price}</div>
                  </div>
                  <Link
                    href={`/book?service=${service.slug}`}
                    className="flex items-center gap-2 text-egp-green dark:text-white font-semibold hover:text-egp-green-dark hover:gap-3 transition-all"
                  >
                    <span>Book</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-4">
            Transform Your Body Confidence
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Advanced body contouring treatments with visible, lasting results
          </p>
          <ButtonBookNow size="lg" variant="secondary" className="w-full sm:w-auto mx-4 sm:mx-0" />
        </div>
      </section>
    </div>
  );
}


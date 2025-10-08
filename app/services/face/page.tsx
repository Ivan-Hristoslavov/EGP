import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import ButtonBookNow from "@/components/ButtonBookNow";

export const metadata: Metadata = {
  title: "Face Treatments in London",
  description: "Advanced facial treatments including PRP, EXOSOMES, Profhilo, skin boosters, and medical skin peels. Expert aesthetic treatments in London.",
};

const faceServices = [
  { name: "Free Discovery Consultation", price: "Free", duration: 30, slug: "free-consultation", featured: true },
  { name: "Digital Skin Analysis & Consultation", price: 50, duration: 45, slug: "skin-analysis" },
  { name: "PRP Treatment", price: 480, duration: 60, slug: "prp", popular: true },
  { name: "EXOSOMES", price: 550, duration: 60, slug: "exosomes" },
  { name: "Polynucleotides", price: 390, duration: 45, slug: "polynucleotides" },
  { name: "5-Point Facelift", price: 950, duration: 90, slug: "5-point-facelift", featured: true },
  { name: "Profhilo", price: 390, duration: 30, slug: "profhilo", popular: true },
  { name: "Sculptra", price: 790, duration: 60, slug: "sculptra" },
  { name: "Skin Boosters", price: 230, duration: 30, slug: "skin-boosters" },
  { name: "Deep Cleansing Facial", price: 170, duration: 60, slug: "deep-cleansing-facial" },
  { name: "Medical Skin Peels", price: 200, duration: 45, slug: "medical-skin-peels" },
  { name: "Deep Hydra Detox Facial", price: 180, duration: 60, slug: "hydra-detox-facial" },
  { name: "NCTF Under-Eye Skin Booster", price: 159, duration: 20, slug: "nctf-under-eye" },
  { name: "3-Step Under-Eye Signature Treatment", price: 390, duration: 45, slug: "3-step-under-eye", featured: true },
  { name: "Injectable Mesotherapy", price: 250, duration: 30, slug: "injectable-mesotherapy" },
  { name: "Microneedling Facial", price: 170, duration: 60, slug: "microneedling-facial" },
  { name: "Full Face Balancing", price: 790, duration: 90, slug: "full-face-balancing" },
];

export default function FaceTreatmentsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Face Treatments
            </h1>
            <p className="text-xl md:text-2xl text-pink-100 mb-8">
              Advanced facial treatments and skin rejuvenation
            </p>
            <ButtonBookNow size="lg" variant="secondary" />
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {faceServices.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-pink-500 hover:shadow-xl transition-all duration-300"
              >
                {/* Badges */}
                <div className="flex gap-2 mb-4">
                  {service.featured && (
                    <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full">
                      FEATURED
                    </span>
                  )}
                  {service.popular && (
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-full">
                      POPULAR
                    </span>
                  )}
                </div>

                {/* Service Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {service.name}
                </h3>

                {/* Details */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration} min</span>
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    {typeof service.price === "number" ? (
                      <>
                        <span className="text-sm text-gray-600">From</span>
                        <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">£{service.price}</div>
                      </>
                    ) : (
                      <div className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">{service.price}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent font-semibold group-hover:gap-3 transition-all">
                    <span>Learn More</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-pink-600" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Not Sure Which Treatment is Right for You?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Book your treatment now and our experts will create a personalized treatment plan
          </p>
          <ButtonBookNow size="lg" variant="secondary" />
        </div>
      </section>
    </div>
  );
}


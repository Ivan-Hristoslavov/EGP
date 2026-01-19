"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import ButtonBookNow from "@/components/ButtonBookNow";
import { useServices } from "@/hooks/useServices";

export default function FaceTreatmentsPage() {
  const { services, isLoading } = useServices();

  // Filter services for Face category
  const faceServices = useMemo(() => {
    return services.filter(service => service.category.name === 'FACE');
  }, [services]);

  // Show loading state while services are being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading face treatments...</p>
        </div>
      </div>
    );
  }

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
              <div
                key={service.slug}
                className="group relative bg-white dark:bg-egp-green border-2 border-gray-300 dark:border-egp-green-dark rounded-xl p-5 hover:border-egp-green dark:hover:border-egp-green hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Badges */}
                <div className="flex gap-2 mb-3">
                  {service.is_featured && (
                    <span className="px-2 py-0.5 bg-gradient-to-r from-egp-green to-egp-green-dark text-white text-[10px] font-bold rounded-full">
                      FEATURED
                    </span>
                  )}
                </div>

                <Link href={`/services/${service.slug}`} className="flex-1">
                  {/* Service Name */}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-egp-green transition-colors">
                    {service.name}
                  </h3>

                  {/* Details */}
                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{service.duration} min</span>
                    </div>
                  </div>
                </Link>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-egp-green-dark mt-auto">
                  <div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">From</span>
                    <div className="text-lg font-bold text-egp-green dark:text-white">£{service.price}</div>
                  </div>
                  <Link
                    href={`/book?serviceId=${service.id}`}
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

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Not Sure Which Treatment is Right for You?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Book your treatment now and our experts will create a personalised treatment plan
          </p>
          <ButtonBookNow size="lg" variant="secondary" />
        </div>
      </section>
    </div>
  );
}


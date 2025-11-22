import type { Metadata } from 'next';
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { Calendar, Clock, CheckCircle, Star, ArrowRight, Phone } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Book Treatment Now | ${siteConfig.name}`,
    description: "Book your treatment now at EGP Aesthetics London. Expert assessment and personalized treatment planning.",
    alternates: {
      canonical: `${siteConfig.url}/services/book-treatment-now`,
    },
  };
}

export default function BookTreatmentNowPage() {
  const consultationBenefits = [
    "Expert skin analysis and assessment",
    "Personalized treatment recommendations",
    "Transparent pricing information",
    "No-obligation consultation",
    "Professional advice from qualified practitioners",
    "Customised treatment plan creation"
  ];

  const whatToExpect = [
    {
      step: "1",
      title: "Welcome & Introduction",
      description: "Meet your practitioner and discuss your aesthetic goals"
    },
    {
      step: "2", 
      title: "Skin Analysis",
      description: "Comprehensive assessment of your skin condition and concerns"
    },
    {
      step: "3",
      title: "Treatment Planning",
      description: "Personalized recommendations based on your individual needs"
    },
    {
      step: "4",
      title: "Q&A Session",
      description: "Answer all your questions about treatments and procedures"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 dark:bg-rose-900/30 rounded-full text-rose-700 dark:text-rose-400 text-sm font-semibold mb-6">
              <Star className="w-4 h-4" />
              <span>Most Popular</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Book Treatment Now
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Start your aesthetic journey with a personalized 30-minute consultation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/book-consultation"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-lg font-semibold rounded-full hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
              >
                <Calendar className="w-5 h-5" />
                Book Now - £50
              </Link>
              <Link
                href={`tel:${siteConfig.contact.phone}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-rose-500 text-rose-500 dark:text-rose-400 text-lg font-semibold rounded-full hover:bg-rose-500 hover:text-white transition-all"
              >
                <Phone className="w-5 h-5" />
                Call Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Service Details */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Service Info */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  About This Consultation
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  Our consultation is designed to help you understand your aesthetic options and create a personalized treatment plan that aligns with your goals and budget.
                </p>
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold">30 minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Completely Free</span>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  What You'll Get
                </h3>
                <ul className="space-y-4">
                  {consultationBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-12">
              What to Expect
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {whatToExpect.map((step, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                    <span className="text-white font-bold text-lg">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Book your consultation today and discover how we can help you achieve your aesthetic goals
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/book-consultation"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-lg font-semibold rounded-full hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
              >
                <Calendar className="w-5 h-5" />
                Book Treatment Now
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-rose-500 text-rose-500 dark:text-rose-400 text-lg font-semibold rounded-full hover:bg-rose-500 hover:text-white transition-all"
              >
                <ArrowRight className="w-5 h-5" />
                View All Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

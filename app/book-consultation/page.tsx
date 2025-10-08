import type { Metadata } from 'next';
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { Calendar, Clock, Star, CheckCircle, ArrowRight } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Book Consultation | ${siteConfig.name}`,
    description: "Book your consultation at EGP Aesthetics London. Expert aesthetic treatments with personalized care.",
    alternates: {
      canonical: `${siteConfig.url}/book-consultation`,
    },
  };
}

export default function BookConsultationPage() {
  const consultationTypes = [
    {
      title: "Book Treatment Now",
      duration: "30 minutes",
      price: "Free",
      description: "Initial assessment and treatment planning",
      features: [
        "Skin analysis",
        "Treatment recommendations",
        "Personalized plan",
        "Price transparency"
      ],
      popular: true,
    },
    {
      title: "Detailed Consultation",
      duration: "45 minutes",
      price: "£50",
      description: "Comprehensive assessment with detailed planning",
      features: [
        "Full skin analysis",
        "Digital imaging",
        "Detailed treatment plan",
        "Aftercare guidance"
      ],
      popular: false,
    },
  ];

  const treatmentCategories = [
    {
      title: "Face Treatments",
      description: "Anti-wrinkle, fillers, and skin treatments",
      treatments: [
        "Baby Botox - £199",
        "Lip Enhancement - £290",
        "Profhilo - £390",
        "5-Point Facelift - £950"
      ],
      href: "/services/face",
    },
    {
      title: "Anti-wrinkle Injections",
      description: "Natural-looking wrinkle reduction",
      treatments: [
        "Eye Wrinkles - £179",
        "Forehead Lines - £179",
        "Brow Lift - £279",
        "Neck Lift - £329"
      ],
      href: "/services/anti-wrinkle",
    },
    {
      title: "Dermal Fillers",
      description: "Volume and contour enhancement",
      treatments: [
        "Cheek Filler - £390",
        "Jawline Filler - £550",
        "Tear Trough - £390",
        "Chin Filler - £290"
      ],
      href: "/services/fillers",
    },
    {
      title: "Body Treatments",
      description: "Non-invasive body contouring",
      treatments: [
        "Fat Freezing - £200",
        "Radiofrequency - £250",
        "Mesotherapy - £170",
        "Combined Treatment - £350"
      ],
      href: "/services/body",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Book Your Consultation
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Start your aesthetic journey with a personalized consultation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-lg font-semibold rounded-full hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
              >
                <Calendar className="w-5 h-5" />
                Book Now
              </Link>
              <Link
                href={`tel:${siteConfig.contact.phone}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-rose-500 text-rose-500 dark:text-rose-400 text-lg font-semibold rounded-full hover:bg-rose-500 hover:text-white transition-all"
              >
                <Clock className="w-5 h-5" />
                Call Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Consultation Types */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-12">
              Consultation Options
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {consultationTypes.map((consultation, index) => (
                <div
                  key={index}
                  className={`relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all ${
                    consultation.popular ? 'ring-2 ring-rose-500 scale-105' : ''
                  }`}
                >
                  {consultation.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-rose-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {consultation.title}
                  </h3>
                  <div className="text-3xl font-bold text-rose-600 dark:text-rose-400 mb-4">
                    {consultation.price}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {consultation.description}
                  </p>
                  
                  <ul className="space-y-3 mb-8">
                    {consultation.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    href="/contact"
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all text-center block ${
                      consultation.popular
                        ? 'bg-rose-500 hover:bg-rose-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                    }`}
                  >
                    Book This Consultation
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Treatment Categories */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-12">
              Explore Our Treatments
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {treatmentCategories.map((category, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-105"
                >
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                    {category.description}
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    {category.treatments.map((treatment, treatmentIndex) => (
                      <li key={treatmentIndex} className="text-sm text-gray-600 dark:text-gray-400">
                        {treatment}
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    href={category.href}
                    className="inline-flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12">
              Why Choose EGP Aesthetics?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Expert Practitioners
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Highly qualified and experienced professionals
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  CQC Registered
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Fully registered and compliant with UK regulations
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Flexible Booking
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Convenient appointment times to fit your schedule
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

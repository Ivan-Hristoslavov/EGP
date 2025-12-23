"use client";

import { siteConfig } from "@/config/site";
import Link from "next/link";
import { Calendar, Clock, Star, CheckCircle, ArrowRight } from "lucide-react";
import { Card, CardBody, CardHeader, Button, Chip } from "@heroui/react";
import { aestheticsColors } from "@/config/colors";
import ButtonPrimary from "@/components/ButtonPrimary";

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
        "Personalised plan",
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
    <div className="min-h-screen bg-white dark:bg-egp-green-darker">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-egp-beige-lighter to-egp-beige-light dark:from-egp-green-dark dark:to-egp-green-darker">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Book Your Consultation
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Start your aesthetic journey with a personalised consultation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                as={Link}
                href="/book"
                size="lg"
                className="bg-gradient-to-r from-egp-green via-egp-green-light to-egp-green text-white"
                startContent={<Calendar className="w-5 h-5" />}
              >
                Book Now
              </Button>
              <Button
                as={Link}
                href={`tel:${siteConfig.contact.phone}`}
                variant="bordered"
                size="lg"
                className="border-egp-green text-egp-green dark:text-white dark:border-egp-green"
                startContent={<Clock className="w-5 h-5" />}
              >
                Call Now
              </Button>
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
                <Card
                  key={index}
                  className={`relative ${consultation.popular ? 'ring-2 ring-egp-green' : ''}`}
                  shadow="lg"
                >
                  {consultation.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <Chip
                        className="bg-egp-green text-white"
                        size="sm"
                      >
                        Most Popular
                      </Chip>
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex flex-col gap-2 w-full">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {consultation.title}
                      </h3>
                      <div className="text-3xl font-bold text-egp-green dark:text-white">
                        {consultation.price}
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {consultation.description}
                    </p>
                    
                    <ul className="space-y-3 mb-8">
                      {consultation.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button
                      as={Link}
                      href="/book"
                      className={`w-full ${
                        consultation.popular
                          ? 'bg-gradient-to-r from-egp-green via-egp-green-light to-egp-green text-white'
                          : 'bg-egp-beige-light dark:bg-egp-green-dark text-gray-900 dark:text-white'
                      }`}
                      size="lg"
                    >
                      Book This Consultation
                    </Button>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Treatment Categories */}
      <section className="py-16 md:py-24 bg-egp-beige-lighter dark:bg-egp-green-dark">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-12">
              Explore Our Treatments
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {treatmentCategories.map((category, index) => (
                <Card
                  key={index}
                  shadow="lg"
                  isPressable
                  as={Link}
                  href={category.href}
                  className="h-full"
                >
                  <CardHeader className="pb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {category.title}
                    </h3>
                  </CardHeader>
                  <CardBody className="pt-0">
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
                    
                    <ButtonPrimary
                      as={Link}
                      href={category.href}
                      variant="primary"
                      endContent={<ArrowRight className="w-4 h-4" />}
                    >
                      Learn More
                    </ButtonPrimary>
                  </CardBody>
                </Card>
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
              <Card shadow="sm" className="bg-white dark:bg-egp-green-dark">
                <CardBody className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-egp-beige-darkest to-egp-beige-dark rounded-full flex items-center justify-center mb-4">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Expert Practitioners
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Highly qualified and experienced professionals
                  </p>
                </CardBody>
              </Card>
              <Card shadow="sm" className="bg-white dark:bg-egp-green-dark">
                <CardBody className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-egp-green to-egp-green-light rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Fully Insured
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Comprehensive coverage for your peace of mind
                  </p>
                </CardBody>
              </Card>
              <Card shadow="sm" className="bg-white dark:bg-egp-green-dark">
                <CardBody className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-egp-green-dark to-egp-green rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Flexible Booking
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Convenient appointment times to fit your schedule
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

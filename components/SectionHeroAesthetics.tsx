"use client";

import { useState, useEffect } from "react";
import { Star, CheckCircle } from "lucide-react";
import ButtonBookNow from "./ButtonBookNow";
import ButtonWhatsApp from "./ButtonWhatsApp";
import { siteConfig } from "@/config/site";

export default function SectionHeroAesthetics() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Transform Your Natural Beauty",
      subtitle: "Expert aesthetic treatments in the heart of London",
      image: "/images/hero/hero-1.jpg",
    },
    {
      title: "Award-Winning Aesthetic Clinic",
      subtitle: "Trusted by thousands for natural-looking results",
      image: "/images/hero/hero-2.jpg",
    },
    {
      title: "Your Journey to Confidence",
      subtitle: "Personalized treatments tailored to your unique goals",
      image: "/images/hero/hero-3.jpg",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen min-h-[500px] sm:min-h-[600px] max-h-[900px] overflow-hidden z-20">
      {/* Background Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            currentSlide === index ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-black/80 via-black/60 to-black/40 sm:to-transparent z-10"></div>

          {/* Luxury Rose Gold Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-rose-600 via-pink-600 to-purple-700"></div>
        </div>
      ))}

      {/* Content */}
      <div className="relative z-30 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-start pt-32">
        <div className="w-full max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md rounded-full text-white mb-4 sm:mb-6 border border-white/20">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-xs sm:text-sm font-semibold">
              Award-Winning Clinic
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight font-playfair">
            {slides[currentSlide].title}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-6 sm:mb-8 leading-relaxed font-montserrat font-light">
            {slides[currentSlide].subtitle}
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 text-white text-sm sm:text-base">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
              <span className="font-medium">
                {siteConfig.trust.treatmentsPerformed} Treatments
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
              <span className="font-medium">
                {siteConfig.trust.satisfactionRate} Satisfaction
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
              <span className="font-medium">CQC Registered</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <ButtonBookNow size="lg" showIcon />
            <ButtonWhatsApp
              message="Hi! I'd like to book a treatment at EGP Aesthetics."
              className="text-base sm:text-lg w-full sm:w-auto justify-center"
            />
          </div>

          {/* Quick Contact */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-white/90 text-sm sm:text-base">
            <span>Or call us now:</span>
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="text-lg sm:text-xl font-bold text-white hover:text-yellow-300 transition-colors"
            >
              {siteConfig.contact.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-16 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-3 sm:h-4 rounded-full transition-all duration-300 touch-manipulation hover:scale-110 ${
              currentSlide === index
                ? "bg-white w-8 sm:w-10 shadow-lg"
                : "bg-white/60 hover:bg-white/80 w-3 sm:w-4 hover:w-5 sm:hover:w-6"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator - Hidden on small mobile */}
      <div className="hidden sm:block absolute bottom-8 right-4 sm:right-8 z-30 text-white animate-bounce">
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}

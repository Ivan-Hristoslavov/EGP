"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Star, CheckCircle, Award, Trophy, Sparkles, Crown, Gem, Flame, Target,
  Calendar, MessageCircle, Phone, Mail, ArrowRight, ExternalLink, Heart, Zap, Shield
} from "lucide-react";
import ButtonBookNow from "./ButtonBookNow";
import ButtonWhatsApp from "./ButtonWhatsApp";
import ButtonPrimary from "./ButtonPrimary";
import { siteConfig } from "@/config/site";
import { typography } from "@/config/typography";
import { useAdminProfile, useAdminProfileContext } from "@/components/AdminProfileContext";
import { useHeroSection } from "@/hooks/useHeroSection";
import Link from "next/link";

export default function SectionHeroAesthetics() {
  const adminProfile = useAdminProfile();
  const { loading: profileLoading } = useAdminProfileContext();
  const { heroSection, isLoading: heroLoading } = useHeroSection();
  const contactPhone = heroSection?.phone_number || adminProfile?.phone || siteConfig.contact.phone;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Use only hero section images from database
  const heroImages = heroSection
    ? [
        heroSection.image_1_url,
        heroSection.image_2_url,
        heroSection.image_3_url,
      ].filter((url): url is string => url !== null && url !== undefined)
    : [];

  // Create slides from hero images - only from database
  const slides = heroSection && heroImages.length > 0
    ? heroImages.map((image, index) => {
        const positionFields = [
          heroSection.image_1_position,
          heroSection.image_2_position,
          heroSection.image_3_position,
        ];
        return {
          title: heroSection.main_headline || "",
          subtitle: heroSection.sub_headline || "",
          image: image,
          position: positionFields[index] || "object-center",
        };
      })
    : [];

  const animationDuration = heroSection?.animation_duration_ms || 5000;

  // Fix hydration by only setting state after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, animationDuration);
    return () => clearInterval(timer);
  }, [isMounted, slides.length, animationDuration]);

  // Initialize imagesLoaded state
  useEffect(() => {
    if (!isMounted) return;
    setImagesLoaded(new Array(slides.length).fill(false));
  }, [isMounted, slides.length]);

  const handleImageLoad = (index: number) => {
    setImagesLoaded((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  // Show skeleton loader while loading or if no images
  if (heroLoading || slides.length === 0) {
    return (
      <section className="relative h-screen min-h-[500px] sm:min-h-[600px] max-h-[900px] overflow-hidden" style={{ zIndex: 1 }}>
        {/* Skeleton Loader */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
          </div>
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b sm:bg-gradient-to-r from-black/80 via-black/60 to-black/40 sm:to-transparent"></div>
        {/* Content skeleton */}
        <div className="relative z-30 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center sm:items-start sm:pt-32 pb-16 -mt-16 sm:mt-0">
          <div className="w-full max-w-3xl text-center sm:text-left space-y-6">
            <div className="h-8 bg-white/20 rounded-full w-48 mx-auto sm:mx-0 animate-pulse"></div>
            <div className="h-16 bg-white/20 rounded-lg animate-pulse"></div>
            <div className="h-6 bg-white/20 rounded-lg w-3/4 mx-auto sm:mx-0 animate-pulse"></div>
            <div className="flex gap-4 justify-center sm:justify-start">
              <div className="h-12 bg-white/20 rounded-lg w-32 animate-pulse"></div>
              <div className="h-12 bg-white/20 rounded-lg w-32 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Use 0 for initial render to match server, update after mount
  const displaySlide = isMounted ? currentSlide : 0;

  return (
    <section className="relative h-screen min-h-[500px] sm:min-h-[600px] max-h-[900px] overflow-hidden" style={{ zIndex: 1 }}>
      {/* Background Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 z-0 ${
            displaySlide === index ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Skeleton Loader */}
          {!imagesLoaded[index] && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
            </div>
          )}
          
          {/* Background Image */}
          <Image
            src={slide.image}
            alt="Hero background"
            fill
            priority={index === 0}
            sizes="100vw 100vh"
            className={`object-cover transition-opacity duration-500 ${
              imagesLoaded[index] ? "opacity-100" : "opacity-0"
            }`}
            style={{
              objectPosition: (() => {
                const pos = slide.position || "object-center";
                const positionMap: { [key: string]: string } = {
                  "object-center": "center",
                  "object-top": "top",
                  "object-bottom": "bottom",
                  "object-left": "left",
                  "object-right": "right",
                  "object-left-top": "left top",
                  "object-left-bottom": "left bottom",
                  "object-right-top": "right top",
                  "object-right-bottom": "right bottom",
                };
                return positionMap[pos] || "center";
              })(),
            }}
            onLoad={() => handleImageLoad(index)}
            onError={() => handleImageLoad(index)}
          />
          
          {/* Gradient Overlay - Lighter for owners slide */}
          <div className={`absolute inset-0 z-[1] ${
            slide.image.includes("sisters.png") 
              ? "bg-gradient-to-b sm:bg-gradient-to-r from-black/50 via-black/40 to-black/20 sm:to-transparent" 
              : "bg-gradient-to-b sm:bg-gradient-to-r from-black/80 via-black/60 to-black/40 sm:to-transparent"
          }`}></div>
        </div>
      ))}

      {/* Content */}
      <div className="relative z-30 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center sm:items-start sm:pt-32 pb-16 -mt-16 sm:mt-0">
        <div className="w-full max-w-3xl text-center sm:text-left">
          {/* Badge */}
          {(heroSection?.badge_text || !heroSection) && (
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md rounded-full text-white mb-4 sm:mb-6 border border-white/20">
              {(() => {
                const iconType = heroSection?.badge_icon || "star";
                const iconClass = "w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400";
                
                switch (iconType) {
                  case "award":
                    return <Award className={iconClass} />;
                  case "trophy":
                    return <Trophy className={iconClass} />;
                  case "sparkles":
                    return <Sparkles className={iconClass} />;
                  case "crown":
                    return <Crown className={iconClass} />;
                  case "gem":
                    return <Gem className={iconClass} />;
                  case "flame":
                    return <Flame className={iconClass} />;
                  case "target":
                    return <Target className={iconClass} />;
                  case "star":
                  default:
                    return <Star className={iconClass} />;
                }
              })()}
              <span className="text-xs sm:text-sm font-semibold">
                {heroSection?.badge_text || "Award-Winning Clinic"}
              </span>
            </div>
          )}

          {/* Main Heading - shared scale for mobile/desktop */}
          <h1 className={`${typography.headingHero} text-white mb-4 sm:mb-6 font-playfair`}>
            {slides[displaySlide]?.title || ""}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 sm:mb-8 leading-relaxed font-montserrat font-light">
            {slides[displaySlide]?.subtitle || ""}
          </p>

          {/* Trust Indicators / Features */}
          {(heroSection?.feature_1_text || heroSection?.feature_2_text || heroSection?.feature_3_text || !heroSection) && (
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 text-white text-sm sm:text-base">
              {heroSection
                ? [
                    heroSection.feature_1_text,
                    heroSection.feature_2_text,
                    heroSection.feature_3_text,
                  ]
                    .filter(Boolean)
                    .map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 sm:gap-2">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))
                : [
                    <div key="treatments" className="flex items-center gap-1.5 sm:gap-2">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                      <span className="font-medium">
                        {siteConfig.trust.treatmentsPerformed} Treatments
                      </span>
                    </div>,
                    <div key="satisfaction" className="flex items-center gap-1.5 sm:gap-2">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                      <span className="font-medium">
                        {siteConfig.trust.satisfactionRate} Satisfaction
                      </span>
                    </div>,
                    <div key="standards" className="flex items-center gap-1.5 sm:gap-2">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                      <span className="font-medium">Professional Standards</span>
                    </div>,
                  ]}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-lg sm:max-w-none justify-center sm:justify-start">
            {heroSection?.button_1_text ? (
              heroSection.button_1_type === "external" ? (
                <ButtonPrimary
                  as="a"
                  href={heroSection.button_1_link || "#contact"}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="primary"
                  size="lg"
                  startContent={
                    (() => {
                      const iconType = heroSection.button_1_icon || "calendar";
                      const iconClass = "w-5 h-5";
                      
                      switch (iconType) {
                        case "calendar":
                          return <Calendar className={iconClass} />;
                        case "whatsapp":
                          return <MessageCircle className={iconClass} />;
                        case "phone":
                          return <Phone className={iconClass} />;
                        case "mail":
                          return <Mail className={iconClass} />;
                        case "arrow-right":
                          return <ArrowRight className={iconClass} />;
                        case "external-link":
                          return <ExternalLink className={iconClass} />;
                        case "check-circle":
                          return <CheckCircle className={iconClass} />;
                        case "heart":
                          return <Heart className={iconClass} />;
                        case "zap":
                          return <Zap className={iconClass} />;
                        case "shield":
                          return <Shield className={iconClass} />;
                        default:
                          return <Calendar className={iconClass} />;
                      }
                    })()
                  }
                  className="w-full sm:w-auto"
                >
                  {heroSection.button_1_text}
                </ButtonPrimary>
              ) : (
                <ButtonPrimary
                  as={Link}
                  href={heroSection.button_1_link || "#contact"}
                  variant="primary"
                  size="lg"
                  onClick={(e) => {
                    if (heroSection.button_1_link?.startsWith("#")) {
                      e.preventDefault();
                      document
                        .getElementById(heroSection.button_1_link.substring(1))
                        ?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  startContent={
                    (() => {
                      const iconType = heroSection.button_1_icon || "calendar";
                      const iconClass = "w-5 h-5";
                      
                      switch (iconType) {
                        case "calendar":
                          return <Calendar className={iconClass} />;
                        case "whatsapp":
                          return <MessageCircle className={iconClass} />;
                        case "phone":
                          return <Phone className={iconClass} />;
                        case "mail":
                          return <Mail className={iconClass} />;
                        case "arrow-right":
                          return <ArrowRight className={iconClass} />;
                        case "external-link":
                          return <ExternalLink className={iconClass} />;
                        case "check-circle":
                          return <CheckCircle className={iconClass} />;
                        case "heart":
                          return <Heart className={iconClass} />;
                        case "zap":
                          return <Zap className={iconClass} />;
                        case "shield":
                          return <Shield className={iconClass} />;
                        default:
                          return <Calendar className={iconClass} />;
                      }
                    })()
                  }
                  className="w-full sm:w-auto"
                >
                  {heroSection.button_1_text}
                </ButtonPrimary>
              )
            ) : (
              <ButtonBookNow
                size="lg"
                showIcon
                className="w-full sm:w-auto justify-center"
              />
            )}
            {heroSection?.button_2_text ? (
              heroSection.button_2_type === "external" ? (
                <ButtonPrimary
                  as="a"
                  href={heroSection.button_2_link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant={heroSection.button_2_icon === "whatsapp" ? "whatsapp" : "secondary"}
                  size="lg"
                  startContent={
                    (() => {
                      const iconType = heroSection.button_2_icon || "whatsapp";
                      const iconClass = "w-5 h-5";
                      
                      switch (iconType) {
                        case "calendar":
                          return <Calendar className={iconClass} />;
                        case "whatsapp":
                          return <MessageCircle className={iconClass} />;
                        case "phone":
                          return <Phone className={iconClass} />;
                        case "mail":
                          return <Mail className={iconClass} />;
                        case "arrow-right":
                          return <ArrowRight className={iconClass} />;
                        case "external-link":
                          return <ExternalLink className={iconClass} />;
                        case "check-circle":
                          return <CheckCircle className={iconClass} />;
                        case "heart":
                          return <Heart className={iconClass} />;
                        case "zap":
                          return <Zap className={iconClass} />;
                        case "shield":
                          return <Shield className={iconClass} />;
                        default:
                          return <MessageCircle className={iconClass} />;
                      }
                    })()
                  }
                  className={`w-full sm:w-auto ${heroSection.button_2_icon === "whatsapp" ? "border-2 border-white/30" : ""}`}
                >
                  {heroSection.button_2_text}
                </ButtonPrimary>
              ) : (
                <ButtonPrimary
                  as={Link}
                  href={heroSection.button_2_link || "#"}
                  variant={heroSection.button_2_icon === "whatsapp" ? "whatsapp" : "secondary"}
                  size="lg"
                  startContent={
                    (() => {
                      const iconType = heroSection.button_2_icon || "whatsapp";
                      const iconClass = "w-5 h-5";
                      
                      switch (iconType) {
                        case "calendar":
                          return <Calendar className={iconClass} />;
                        case "whatsapp":
                          return <MessageCircle className={iconClass} />;
                        case "phone":
                          return <Phone className={iconClass} />;
                        case "mail":
                          return <Mail className={iconClass} />;
                        case "arrow-right":
                          return <ArrowRight className={iconClass} />;
                        case "external-link":
                          return <ExternalLink className={iconClass} />;
                        case "check-circle":
                          return <CheckCircle className={iconClass} />;
                        case "heart":
                          return <Heart className={iconClass} />;
                        case "zap":
                          return <Zap className={iconClass} />;
                        case "shield":
                          return <Shield className={iconClass} />;
                        default:
                          return <MessageCircle className={iconClass} />;
                      }
                    })()
                  }
                  className={`w-full sm:w-auto ${heroSection.button_2_icon === "whatsapp" ? "border-2 border-white/30" : ""}`}
                >
                  {heroSection.button_2_text}
                </ButtonPrimary>
              )
            ) : (
              <ButtonWhatsApp
                message="Hi! I'd like to book a treatment at EGP Aesthetics."
                className="text-base sm:text-lg w-full sm:w-auto justify-center border-2 border-white/30"
              />
            )}
          </div>

          {/* Quick Contact */}
          {(heroSection?.phone_number || !heroSection) && (
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center sm:justify-start sm:items-center gap-2 sm:gap-4 text-white/90 text-sm sm:text-base whitespace-nowrap">
              <span>{heroSection?.contact_label || "Or call us now:"}</span>
              {profileLoading || heroLoading ? (
                <div className="h-6 sm:h-7 w-32 sm:w-40 bg-white/20 dark:bg-white/10 rounded animate-pulse"></div>
              ) : (
                <a
                  href={`tel:${contactPhone}`}
                  className="text-lg sm:text-xl font-bold text-white hover:text-yellow-300 transition-colors"
                >
                  {contactPhone}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-16 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-[2] flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-3 sm:h-4 rounded-full transition-all duration-300 touch-manipulation hover:scale-110 ${
              displaySlide === index
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

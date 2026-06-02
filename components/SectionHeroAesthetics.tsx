"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Star,
  CheckCircle,
  Award,
  Trophy,
  Sparkles,
  Crown,
  Gem,
  Flame,
  Target,
  Calendar,
  MessageCircle,
  Phone,
  Mail,
  ArrowRight,
  ExternalLink,
  Heart,
  Zap,
  Shield,
} from "lucide-react";
import Link from "next/link";

import ButtonBookNow from "./ButtonBookNow";
import ButtonWhatsApp from "./ButtonWhatsApp";
import ButtonPrimary from "./ButtonPrimary";

import { siteConfig } from "@/config/site";
import { typography } from "@/config/typography";
import {
  useAdminProfile,
  useAdminProfileContext,
} from "@/components/AdminProfileContext";
import { useHeroSection } from "@/hooks/useHeroSection";

/** Base wash + left-weighted gradient so the photo reads clearly darker (overlay above image via z-index). */
const heroOverlayBaseClass =
  "pointer-events-none absolute inset-0 z-[2] bg-black/28 sm:bg-black/22";
const heroOverlayGradientClass =
  "pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(180deg,rgba(0,0,0,0.62)_0%,rgba(0,0,0,0.52)_38%,rgba(0,0,0,0.46)_100%)] sm:bg-[linear-gradient(90deg,rgba(0,0,0,0.58)_0%,rgba(0,0,0,0.52)_22%,rgba(0,0,0,0.34)_48%,rgba(0,0,0,0.14)_100%)]";

/** Build a wa.me link with UK number normalisation (strip non-digits, leading 0 -> 44). */
function buildHeroWhatsAppUrl(phone: string, message: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  const normalised = digits.startsWith("0")
    ? `44${digits.slice(1)}`
    : digits;

  return `https://wa.me/${normalised}?text=${encodeURIComponent(message)}`;
}

export default function SectionHeroAesthetics() {
  const adminProfile = useAdminProfile();
  const { loading: profileLoading } = useAdminProfileContext();
  const { heroSection, isLoading: heroLoading } = useHeroSection();
  const contactPhone = heroSection?.phone_number || adminProfile?.phone || "";
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
  const slides =
    heroSection && heroImages.length > 0
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
      <section
        className="relative h-screen min-h-[500px] sm:min-h-[600px] max-h-[900px] overflow-hidden"
        style={{ zIndex: 1 }}
      >
        {/* Skeleton Loader */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent" />
          </div>
        </div>
        {/* Darkening overlays (match loaded hero) */}
        <div className={heroOverlayBaseClass} />
        <div className={heroOverlayGradientClass} />
        {/* Content skeleton */}
        <div className="relative z-30 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center sm:items-start sm:pt-28 md:pt-32 pb-16">
          <div className="w-full max-w-3xl text-center sm:text-left space-y-6">
            <div className="h-8 bg-white/20 rounded-full w-48 mx-auto sm:mx-0 animate-pulse" />
            <div className="h-16 bg-white/20 rounded-lg animate-pulse" />
            <div className="h-6 bg-white/20 rounded-lg w-3/4 mx-auto sm:mx-0 animate-pulse" />
            <div className="flex gap-4 justify-center sm:justify-start">
              <div className="h-12 bg-white/20 rounded-lg w-32 animate-pulse" />
              <div className="h-12 bg-white/20 rounded-lg w-32 animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Use 0 for initial render to match server, update after mount
  const displaySlide = isMounted ? currentSlide : 0;

  return (
    <section
      className="relative h-screen min-h-[500px] sm:min-h-[600px] max-h-[900px] overflow-hidden"
      style={{ zIndex: 1 }}
    >
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
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent" />
            </div>
          )}

          {/* Background Image */}
          <Image
            fill
            alt="Hero background"
            className={`z-0 object-cover transition-opacity duration-500 ${
              imagesLoaded[index] ? "opacity-100" : "opacity-0"
            }`}
            priority={index === 0}
            sizes="100vw 100vh"
            src={slide.image}
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
            onError={() => handleImageLoad(index)}
            onLoad={() => handleImageLoad(index)}
          />

          {/* Darkening: base wash + gradient (z above image); gradient biased left toward headline */}
          <div className={heroOverlayBaseClass} />
          <div className={heroOverlayGradientClass} />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-30 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center sm:items-start sm:pt-28 md:pt-32 pb-16">
        <div className="w-full max-w-3xl text-center sm:text-left">
          {/* Badge */}
          {(heroSection?.badge_text || !heroSection) && (
            <div
              aria-label={`Rated 5 stars. ${heroSection?.badge_text || "Award-Winning Clinic"}`}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md rounded-full text-white mb-4 sm:mb-6 border border-white/20 font-montserrat"
            >
              <span className="text-xs sm:text-sm font-bold tabular-nums">
                5
              </span>
              {(() => {
                const iconType = heroSection?.badge_icon || "star";
                const iconClass =
                  "w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400";

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
          <h1
            className={`${typography.headingHero} text-white mb-4 sm:mb-6 font-montserrat`}
          >
            {slides[displaySlide]?.title || ""}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 sm:mb-8 leading-relaxed font-montserrat font-light">
            {slides[displaySlide]?.subtitle || ""}
          </p>

          {/* Trust Indicators / Features */}
          {(heroSection?.feature_1_text ||
            heroSection?.feature_2_text ||
            heroSection?.feature_3_text ||
            !heroSection) && (
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 text-white text-sm sm:text-base">
              {heroSection
                ? [
                    heroSection.feature_1_text,
                    heroSection.feature_2_text,
                    heroSection.feature_3_text,
                  ]
                    .filter(Boolean)
                    .map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 sm:gap-2"
                      >
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))
                : [
                    <div
                      key="treatments"
                      className="flex items-center gap-1.5 sm:gap-2"
                    >
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                      <span className="font-medium">
                        {siteConfig.trust.treatmentsPerformed} Treatments
                      </span>
                    </div>,
                    <div
                      key="satisfaction"
                      className="flex items-center gap-1.5 sm:gap-2"
                    >
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                      <span className="font-medium">
                        {siteConfig.trust.satisfactionRate} Satisfaction
                      </span>
                    </div>,
                    <div
                      key="standards"
                      className="flex items-center gap-1.5 sm:gap-2"
                    >
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                      <span className="font-medium">
                        Professional Standards
                      </span>
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
                  className="w-full sm:w-auto"
                  href={heroSection.button_1_link || "#contact"}
                  rel="noopener noreferrer"
                  size="lg"
                  startContent={(() => {
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
                  })()}
                  target="_blank"
                  variant="primary"
                >
                  {heroSection.button_1_text}
                </ButtonPrimary>
              ) : (
                <ButtonPrimary
                  as={Link}
                  className="w-full sm:w-auto"
                  href={heroSection.button_1_link || "#contact"}
                  size="lg"
                  startContent={(() => {
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
                  })()}
                  variant="primary"
                  onClick={(e) => {
                    if (heroSection.button_1_link?.startsWith("#")) {
                      e.preventDefault();
                      document
                        .getElementById(heroSection.button_1_link.substring(1))
                        ?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  {heroSection.button_1_text}
                </ButtonPrimary>
              )
            ) : (
              <ButtonBookNow
                showIcon
                className="w-full sm:w-auto justify-center"
                size="lg"
              />
            )}
            {heroSection?.button_2_text ? (
              heroSection.button_2_icon === "whatsapp" ? (
                <ButtonPrimary
                  as="a"
                  className="w-full sm:w-auto border-2 border-white/30"
                  href={buildHeroWhatsAppUrl(
                    heroSection?.phone_number ||
                      adminProfile?.phone ||
                      siteConfig.contact.whatsapp,
                    "Hi! I'd like to book a treatment at EGP Aesthetics.",
                  )}
                  rel="noopener noreferrer"
                  size="lg"
                  startContent={<MessageCircle className="w-5 h-5" />}
                  target="_blank"
                  variant="whatsapp"
                >
                  {heroSection.button_2_text}
                </ButtonPrimary>
              ) : heroSection.button_2_type === "external" ? (
                <ButtonPrimary
                  as="a"
                  className="w-full sm:w-auto"
                  href={heroSection.button_2_link || "#"}
                  rel="noopener noreferrer"
                  size="lg"
                  startContent={(() => {
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
                  })()}
                  target="_blank"
                  variant="secondary"
                >
                  {heroSection.button_2_text}
                </ButtonPrimary>
              ) : (
                <ButtonPrimary
                  as={Link}
                  className="w-full sm:w-auto"
                  href={heroSection.button_2_link || "#"}
                  size="lg"
                  startContent={(() => {
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
                  })()}
                  variant="secondary"
                >
                  {heroSection.button_2_text}
                </ButtonPrimary>
              )
            ) : (
              <ButtonWhatsApp
                className="text-base sm:text-lg w-full sm:w-auto justify-center border-2 border-white/30"
                message="Hi! I'd like to book a treatment at EGP Aesthetics."
              />
            )}
          </div>

          {/* Quick Contact */}
          {(heroSection?.phone_number || !heroSection) && (
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center sm:justify-start sm:items-center gap-2 sm:gap-4 text-white/90 text-sm sm:text-base whitespace-nowrap">
              <span>{heroSection?.contact_label || "Or call us now:"}</span>
              {profileLoading || heroLoading ? (
                <div className="h-6 sm:h-7 w-32 sm:w-40 bg-white/20 dark:bg-white/10 rounded animate-pulse" />
              ) : (
                <a
                  className="text-lg sm:text-xl font-bold text-white hover:text-yellow-300 transition-colors"
                  href={`tel:${contactPhone}`}
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
            aria-label={`Go to slide ${index + 1}`}
            className={`h-3 sm:h-4 rounded-full transition-all duration-300 touch-manipulation hover:scale-110 ${
              displaySlide === index
                ? "bg-white w-8 sm:w-10 shadow-lg"
                : "bg-white/60 hover:bg-white/80 w-3 sm:w-4 hover:w-5 sm:hover:w-6"
            }`}
            onClick={() => setCurrentSlide(index)}
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
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      </div>
    </section>
  );
}

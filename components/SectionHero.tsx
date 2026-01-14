"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAreas } from "@/hooks/useAreas";
import { useAdminProfile } from "@/components/AdminProfileContext";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { AdminProfileData } from "@/components/AdminProfileData";
import { useHeroSection } from "@/hooks/useHeroSection";

export function SectionHero() {
  const { areas, loading: areasLoading } = useAreas();
  const adminProfile = useAdminProfile();
  const { settings: adminSettings } = useAdminSettings();
  const { heroSection, isLoading: heroLoading } = useHeroSection();

  // Use only hero section images from database
  const heroImages = heroSection
    ? [
        heroSection.image_1_url,
        heroSection.image_2_url,
        heroSection.image_3_url,
      ].filter((url): url is string => url !== null && url !== undefined)
    : [];

  const [activeIdx, setActiveIdx] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);
  const animationDuration = heroSection?.animation_duration_ms || 6000;

  useEffect(() => {
    if (heroImages.length === 0) return;
    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % heroImages.length);
    }, animationDuration);
    return () => clearInterval(id);
  }, [heroImages.length, animationDuration]);

  // Initialize imagesLoaded state
  useEffect(() => {
    setImagesLoaded(new Array(heroImages.length).fill(false));
  }, [heroImages.length]);

  const handleImageLoad = (index: number) => {
    setImagesLoaded((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  // Check if credentials are available
  const hasGasSafe = adminProfile?.gas_safe_registered === true;
  const hasInsurance = adminProfile?.fully_insured && adminProfile?.insurance_provider && adminProfile.insurance_provider.trim() !== "";
  const hasCertifications = adminProfile?.certifications && adminProfile.certifications.trim() !== "";
  const hasMscCertified = adminSettings?.mcsCertified === true;

  // Show skeleton loader while loading or if no images
  if (heroLoading || heroImages.length === 0) {
    return (
      <section
        className="relative min-h-screen flex items-start justify-center overflow-hidden py-8"
        id="home"
      >
        {/* Skeleton Loader */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
          </div>
        </div>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/90 z-10" />
        {/* Content skeleton */}
        <div className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center">
          <div className="w-full max-w-2xl space-y-6">
            <div className="h-12 bg-white/20 rounded-lg animate-pulse"></div>
            <div className="h-8 bg-white/20 rounded-lg animate-pulse w-3/4 mx-auto"></div>
            <div className="h-6 bg-white/20 rounded-lg animate-pulse w-1/2 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative min-h-screen flex items-start justify-center overflow-hidden py-8"
      id="home"
    >
      {/* Background Slideshow Images */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((src, idx) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${activeIdx === idx ? "opacity-100" : "opacity-0"}`}
          >
            {/* Skeleton Loader */}
            {!imagesLoaded[idx] && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
              </div>
            )}
            {/* Background Image */}
            <Image
              src={src}
              alt="Hero background"
              fill
              priority={idx === 0}
              sizes="100vw"
              className={`object-cover transition-opacity duration-500 ${
                imagesLoaded[idx] ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => handleImageLoad(idx)}
              onError={() => handleImageLoad(idx)}
            />
          </div>
        ))}
      </div>

      {/* Overlay - Darker gradient for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/90 z-10" />

      <div className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center">
        {/* Top Row with Availability Badge and Trust Badges */}
        <div className="flex flex-col items-center mb-6 w-full">
          {/* Availability Badge */}
          {heroSection?.badge_text && (
            <div className="inline-flex items-center px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-white text-sm font-medium border border-white/20 mb-4">
              {heroSection.badge_icon === "star" && (
                <svg
                  className="w-4 h-4 mr-2 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
              {heroSection.badge_text}
            </div>
          )}

          {/* Trust Badges - Responsive, no text overflow */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-y-4 md:gap-y-0 md:gap-x-8 w-full max-w-2xl mx-auto mt-2">
            {/* Fully Insured - Dynamic */}
            {hasInsurance && (
              <div className="flex flex-1 items-center justify-center w-full md:min-w-[200px] md:max-w-[320px] min-h-[64px] bg-white/30 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-white/20">
                <div className="w-8 h-8 mr-3 flex-shrink-0 flex items-center justify-center text-blue-400">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white text-lg font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  Fully Insured
                </span>
              </div>
            )}
            
            {/* Gas Safe Registered - Dynamic */}
            {hasGasSafe && (
              <div className="flex flex-1 items-center justify-center w-full md:min-w-[200px] md:max-w-[320px] min-h-[64px] bg-white/30 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-white/20">
                <div className="w-8 h-8 mr-3 flex-shrink-0 flex items-center justify-center text-green-400">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white text-lg font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  Gas Safe Registered
                </span>
              </div>
            )}
            
            {/* MCS Certified - Dynamic */}
            {hasMscCertified && (
              <div className="flex flex-1 items-center justify-center w-full md:min-w-[200px] md:max-w-[320px] min-h-[64px] bg-white/30 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-white/20">
                <div className="text-white text-center">
                  <div className="text-lg font-bold">MCS</div>
                  <div className="text-xs">CERTIFIED</div>
                </div>
              </div>
            )}
            
            {/* Years of Experience - Always show */}
            <div className="flex flex-1 items-center justify-center w-full md:min-w-[200px] md:max-w-[320px] min-h-[64px] bg-white/30 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-white/20">
              <div className="w-8 h-8 mr-3 flex-shrink-0 flex items-center justify-center text-yellow-400">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="text-white text-lg font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                10+ Years
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 animate-fade-in-up">
            <span className="text-white">
              {heroSection?.main_headline || "Professional Aesthetic Treatments"}
            </span>
          </h1>

          {heroSection?.sub_headline && (
            <p
              className="text-lg md:text-xl text-white/90 font-medium mb-4 animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <span className="text-blue-200">{heroSection.sub_headline}</span>
            </p>
          )}

          {/* Features */}
          {(heroSection?.feature_1_text || heroSection?.feature_2_text || heroSection?.feature_3_text) && (
            <div className="flex flex-wrap justify-center gap-4 mb-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              {[heroSection.feature_1_text, heroSection.feature_2_text, heroSection.feature_3_text]
                .filter(Boolean)
                .map((feature, idx) => (
                  <div key={idx} className="flex items-center text-white/90">
                    <svg
                      className="w-5 h-5 mr-2 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Areas We Cover */}
        <div
          className="w-full mb-8 flex flex-col items-center justify-center animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="text-center mb-6 w-full">
            <h3 className="text-xl font-semibold text-white mb-2">
              Areas We Cover
            </h3>
            <div className="flex items-center justify-center text-green-400 text-sm mb-4">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              45-minute response time
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto w-full">
            {areasLoading
              ? // Loading skeleton
                Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-md rounded-lg py-3 px-2 text-center animate-pulse w-32 sm:w-36 lg:w-28 flex flex-col items-center justify-center"
                  >
                    <div className="flex justify-center mb-1">
                      <div className="w-5 h-5 bg-white/20 rounded"></div>
                    </div>
                    <div className="h-4 bg-white/20 rounded mb-1 w-full"></div>
                    <div className="h-3 bg-white/20 rounded w-8 mx-auto"></div>
                  </div>
                ))
              : areas.map((area) => (
                  <div
                    key={area.id}
                    className="bg-white/10 backdrop-blur-md hover:bg-white/15 rounded-lg py-3 px-2 text-center transition-all duration-300 shadow-lg border border-white/10 hover:border-blue-400/30 w-32 sm:w-36 lg:w-28 flex flex-col items-center justify-center"
                  >
                    <div className="flex justify-center mb-1">
                      <svg
                        className="w-5 h-5 text-blue-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div className="text-white font-semibold text-sm mb-1">
                      {area.name}
                    </div>
                    <div className="text-blue-200 text-xs">
                      {area.postcode}
                    </div>
                  </div>
                ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-2xl mx-auto animate-fade-in-up"
          style={{ animationDelay: "0.6s" }}
        >
          {heroSection?.button_1_text && (
            <a
              className="group bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg text-base font-bold transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center justify-center w-full sm:w-auto"
              href={heroSection.button_1_link || "#contact"}
              onClick={(e) => {
                if (heroSection.button_1_type === "internal" && heroSection.button_1_link?.startsWith("#")) {
                  e.preventDefault();
                  document
                    .getElementById(heroSection.button_1_link.substring(1))
                    ?.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              {heroSection.button_1_icon === "calendar" && (
                <svg
                  className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              )}
              {heroSection.button_1_text}
            </a>
          )}
          {heroSection?.button_2_text && (
            <a
              className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg text-base font-bold transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center justify-center w-full sm:w-auto"
              href={heroSection.button_2_link || "#"}
              target={heroSection.button_2_type === "external" ? "_blank" : undefined}
              rel={heroSection.button_2_type === "external" ? "noopener noreferrer" : undefined}
            >
              {heroSection.button_2_icon === "whatsapp" && (
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              )}
              {heroSection.button_2_text}
            </a>
          )}
        </div>

        {/* Contact Information */}
        {heroSection?.phone_number && (
          <div
            className="text-center mt-4 animate-fade-in-up"
            style={{ animationDelay: "0.8s" }}
          >
            <p className="text-white/70 text-sm mb-1">{heroSection.contact_label || "Or call us now:"}</p>
            <a
              href={`tel:${heroSection.phone_number}`}
              className="text-white font-bold text-lg hover:text-blue-300 transition-colors"
            >
              {heroSection.phone_number}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

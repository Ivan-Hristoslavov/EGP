"use client";

import { useAreas } from "@/hooks/useAreas";
import { useAdminProfile } from "@/components/AdminProfileContext";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { AdminProfileData } from "@/components/AdminProfileData";

export function SectionHero() {
  const { areas, loading: areasLoading } = useAreas();
  const adminProfile = useAdminProfile();
  const { settings: adminSettings } = useAdminSettings();

  // Check if credentials are available
  const hasGasSafe = adminProfile?.gas_safe_registered === true;
  const hasInsurance = adminProfile?.fully_insured && adminProfile?.insurance_provider && adminProfile.insurance_provider.trim() !== "";
  const hasCertifications = adminProfile?.certifications && adminProfile.certifications.trim() !== "";
  const hasMscCertified = adminSettings?.mcsCertified === true;

  return (
    <section
      className="relative min-h-screen flex items-start justify-center overflow-hidden py-8"
      id="home"
    >
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/video.mp4" type="video/mp4" />
        {/* Fallback for browsers that don't support video */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900" />
      </video>

      {/* Video Overlay - Darker gradient for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/90 z-10" />

      <div className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center">
        {/* Top Row with Emergency Badge and Trust Badges */}
        <div className="flex flex-col items-center mb-6 w-full">
          {/* Emergency Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-white text-sm font-medium border border-white/20 mb-4">
            <svg
              className="w-4 h-4 mr-2 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            24/7 Emergency Service
          </div>

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
                <AdminProfileData type="years_of_experience" fallback="10+ Years" />
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 animate-fade-in-up">
            <span className="text-white">Professional</span>
            <span className="block text-blue-400 mt-1">Plumbing Services</span>
          </h1>

          <p
            className="text-lg md:text-xl text-white/90 font-medium mb-4 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <span className="text-blue-200">
              Fast response • Quality guaranteed • Fair pricing
            </span>
          </p>
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
              <AdminProfileData type="response_time" fallback="45-minute" /> response time
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
          <a
            className="group bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg text-base font-bold transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center justify-center w-full sm:w-auto"
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("contact")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <svg
              className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            Book Emergency Service
          </a>
          <a
            className="bg-white/10 backdrop-blur-md hover:bg-white/15 text-white px-6 py-3 rounded-lg text-base font-medium transition-all duration-300 border border-white/20 inline-flex items-center justify-center w-full sm:w-auto"
            href="#services"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("services")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            View Pricing
          </a>
        </div>
      </div>
    </section>
  );
}

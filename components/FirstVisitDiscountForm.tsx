"use client";

import React, { useState, useEffect } from "react";
import { X, Gift, Mail, CheckCircle } from "lucide-react";
import { siteConfig } from "@/config/site";
import { setCookie, getCookie, COOKIE_NAMES } from "@/lib/cookies";
import { usePathname } from "next/navigation";

export function FirstVisitDiscountForm() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountCode, setDiscountCode] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has already seen the discount popup
    const hasSeenDiscount = getCookie(COOKIE_NAMES.DISCOUNT_SHOWN);
    // Only show on the homepage
    const isHome = pathname === "/";

    if (!hasSeenDiscount && isHome) {
      // Show after 3 seconds for first-time visitors
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setDiscountCode(null);

    if (!email) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API call to generate and send discount code
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const generatedCode = `${siteConfig.newsletter.discountCodePrefix}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      setDiscountCode(generatedCode);

      // In a real application, you would send an email here
      console.log(`Sending discount code ${generatedCode} to ${email}`);
      
      // Set cookie to remember user has seen the discount popup
      setCookie(COOKIE_NAMES.DISCOUNT_SHOWN, 'true', 365);
    } catch (error) {
      console.error("Failed to generate discount:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl mx-4 animate-fade-in-up">
        {/* Close Button */}
        <button
          onClick={() => {
            setIsOpen(false);
            setCookie(COOKIE_NAMES.DISCOUNT_SHOWN, 'true', 365);
          }}
          className="absolute -top-3 -right-3 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 z-20 shadow-lg border-2 border-gray-200"
          aria-label="Close discount form"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        {/* Main card styled like SectionNewsletter */}
        <div className="bg-gradient-to-br from-rose-600 via-pink-600 to-purple-700 rounded-2xl sm:rounded-3xl border-2 border-white/30 shadow-2xl overflow-hidden">
          {discountCode ? (
            <div className="py-10 sm:py-12 md:py-14 px-6 sm:px-8 md:px-12 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Congratulations!</h3>
              <p className="text-white/90 text-base sm:text-lg mb-5">Here's your exclusive discount code:</p>
              <div className="inline-block bg-white/20 backdrop-blur-sm border-2 border-white/50 rounded-xl px-6 sm:px-8 py-3 sm:py-4 mb-5">
                <div className="text-xs sm:text-sm text-emerald-100 mb-1">Your Discount Code</div>
                <div className="text-2xl sm:text-3xl font-bold text-white tracking-wider">{discountCode}</div>
              </div>
              <p className="text-sm text-white/80 mb-6">Check your email for details. Valid for 30 days!</p>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setCookie(COOKIE_NAMES.DISCOUNT_SHOWN, 'true', 365);
                }}
                className="px-6 py-3 bg-white text-rose-600 font-semibold rounded-full hover:bg-rose-50 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="p-6 sm:p-8 md:p-12">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6 sm:gap-8">
                {/* Content */}
                <div className="flex-1 text-white">
                  <div className="flex items-center gap-2 mb-4">
                    <Gift className="w-7 h-7 text-yellow-300" />
                    <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-400 text-gray-900 text-xs sm:text-sm font-bold rounded-full shadow-lg">EXCLUSIVE OFFER</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
                    Get {siteConfig.newsletter.welcomeDiscountPercent}% Off Your First Visit
                  </h3>
                  <p className="text-white/90 text-sm sm:text-base md:text-lg mb-6">
                    Subscribe to our newsletter and receive exclusive beauty tips, treatment guides, and special offers
                  </p>

                  {/* Form (matching SectionNewsletter styles) */}
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="flex flex-col gap-3">
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name (optional)"
                        className="w-full px-4 py-3 text-base rounded-lg bg-white/90 border border-white/50 focus:bg-white focus:ring-2 focus:ring-blue-300 outline-none transition-all"
                      />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email address"
                        className="w-full px-4 py-3 text-base rounded-lg bg-white/90 border border-white/50 focus:bg-white focus:ring-2 focus:ring-blue-300 outline-none transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-8 py-3 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-gray-900 text-lg font-bold rounded-lg hover:from-yellow-500 hover:via-amber-500 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl active:scale-95"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>Subscribing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Mail className="w-5 h-5" />
                          <span>Get My Discount Code</span>
                        </div>
                      )}
                    </button>
                  </form>

                  <p className="mt-4 text-sm text-white/80 text-center lg:text-left">
                    By subscribing, you agree to receive marketing emails. Unsubscribe anytime. <span className="underline">Privacy Policy</span>
                  </p>
                </div>

                {/* Badge */}
                <div className="hidden lg:block">
                  <div className="w-48 h-48 bg-gradient-to-br from-yellow-400 via-amber-300 to-yellow-500 rounded-full flex items-center justify-center border-4 border-white shadow-2xl">
                    <div className="text-center">
                      <div className="text-5xl font-bold bg-gradient-to-br from-rose-700 to-purple-900 bg-clip-text text-transparent mb-2">
                        {siteConfig.newsletter.welcomeDiscountPercent}%
                      </div>
                      <div className="text-gray-900 font-bold text-xl">OFF</div>
                      <div className="text-gray-800 text-sm mt-1 font-semibold">First Visit</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

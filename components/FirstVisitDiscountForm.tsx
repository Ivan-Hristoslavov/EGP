"use client";

import React, { useState, useEffect } from "react";
import { X, Gift, Mail, CheckCircle, Percent } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl mx-4 animate-fade-in-up">
        {/* Close Button */}
        <button
          onClick={() => {
            setIsOpen(false);
            setCookie(COOKIE_NAMES.DISCOUNT_SHOWN, 'true', 365);
          }}
          className="absolute -top-3 -right-3 w-9 h-9 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 z-20 shadow-lg border-2 border-gray-200 dark:border-gray-700"
          aria-label="Close discount form"
        >
          <X className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>

        {/* Main card with improved colors and dark theme */}
        <div className="bg-gradient-to-br from-[#ddd5c3] via-[#e8e1d2] to-[#ddd5c3] dark:from-gray-800 dark:via-gray-800/95 dark:to-gray-900 rounded-2xl sm:rounded-3xl border-2 border-[#c9c1b0]/50 dark:border-gray-700/50 shadow-2xl overflow-hidden">
          {discountCode ? (
            <div className="py-10 sm:py-12 md:py-14 px-6 sm:px-8 md:px-12 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#9d9585]/20 to-[#c9c1b0]/20 dark:from-[#9d9585]/30 dark:to-[#b5ad9d]/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-[#b5ad9d]/30 dark:border-[#c9c1b0]/40">
                <Percent className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Congratulations!</h3>
              <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg mb-5">Here's your exclusive discount code:</p>
              <div className="inline-block bg-gradient-to-br from-[#9d9585]/15 to-[#c9c1b0]/15 dark:from-[#9d9585]/20 dark:to-[#b5ad9d]/20 backdrop-blur-sm border-2 border-[#b5ad9d]/30 dark:border-[#c9c1b0]/40 rounded-xl px-6 sm:px-8 py-3 sm:py-4 mb-5">
                <div className="text-xs sm:text-sm text-rose-700 dark:text-rose-300 mb-1 font-medium">Your Discount Code</div>
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 dark:from-rose-400 dark:via-pink-400 dark:to-rose-400 bg-clip-text text-transparent tracking-wider">{discountCode}</div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Check your email for details. Valid for 30 days!</p>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setCookie(COOKIE_NAMES.DISCOUNT_SHOWN, 'true', 365);
                }}
                className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 dark:from-rose-600 dark:to-pink-600 text-white font-semibold rounded-full hover:from-rose-600 hover:to-pink-600 dark:hover:from-rose-700 dark:hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="p-6 sm:p-8 md:p-12">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6 sm:gap-8">
                {/* Content */}
                <div className="flex-1 text-gray-900 dark:text-white">
                  <div className="flex items-center gap-2 mb-4">
                    <Gift className="w-7 h-7 text-rose-600 dark:text-rose-400" />
                    <span className="px-3 py-1 bg-gradient-to-r from-rose-500 to-pink-500 dark:from-rose-600 dark:to-pink-600 text-white text-xs sm:text-sm font-bold rounded-full shadow-lg">EXCLUSIVE OFFER</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                    Get {siteConfig.newsletter.welcomeDiscountPercent}% Off Your First Visit
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base md:text-lg mb-6">
                    Subscribe to our newsletter and receive exclusive beauty tips, treatment guides, and special offers
                  </p>

                  {/* Form with improved styling */}
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="flex flex-col gap-3">
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name (optional)"
                        className="w-full px-4 py-3 text-base rounded-lg bg-white/95 dark:bg-gray-800/95 border border-gray-300/50 dark:border-gray-600/50 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-[#b5ad9d] focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email address"
                        className="w-full px-4 py-3 text-base rounded-lg bg-white/95 dark:bg-gray-800/95 border border-gray-300/50 dark:border-gray-600/50 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-[#b5ad9d] focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-8 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 dark:from-rose-600 dark:via-pink-600 dark:to-rose-700 text-white text-lg font-bold rounded-lg hover:from-rose-600 hover:via-pink-600 hover:to-rose-700 dark:hover:from-rose-700 dark:hover:via-pink-700 dark:hover:to-rose-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl active:scale-95"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center lg:text-left">
                    By subscribing, you agree to receive marketing emails. Unsubscribe anytime. <span className="underline hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer">Privacy Policy</span>
                  </p>
                </div>

                {/* Badge with improved colors */}
                <div className="hidden lg:block">
                  <div className="w-48 h-48 bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 dark:from-rose-600 dark:via-pink-600 dark:to-rose-700 rounded-full flex items-center justify-center border-4 border-white/50 dark:border-gray-700/50 shadow-2xl">
                    <div className="text-center">
                      <div className="text-5xl font-bold bg-gradient-to-br from-white via-gray-100 to-white dark:from-gray-100 dark:via-white dark:to-gray-100 bg-clip-text text-transparent mb-2">
                        {siteConfig.newsletter.welcomeDiscountPercent}%
                      </div>
                      <div className="text-white dark:text-gray-100 font-bold text-xl">OFF</div>
                      <div className="text-white/90 dark:text-gray-200 text-sm mt-1 font-semibold">First Visit</div>
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

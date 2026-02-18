"use client";

import React, { useState, useEffect } from "react";
import { X, Gift, Mail, Percent, Copy, Check } from "lucide-react";
import { siteConfig } from "@/config/site";
import { setCookie, getCookie, COOKIE_NAMES } from "@/lib/cookies";
import { usePathname } from "next/navigation";
import { aestheticsColors } from "@/config/colors";

export function FirstVisitDiscountForm() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    if (!discountCode) return;
    try {
      await navigator.clipboard.writeText(discountCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const input = document.createElement("input");
      input.value = discountCode;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
      // Call API to save customer, generate discount code, and send email
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName.trim() || null,
          email: email.trim(),
          mobile: mobile.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      setDiscountCode(data.discountCode);
      
      // Set cookie to remember user has seen the discount popup
      setCookie(COOKIE_NAMES.DISCOUNT_SHOWN, 'true', 365);
    } catch (error) {
      console.error("Failed to subscribe:", error);
      alert(error instanceof Error ? error.message : "Failed to subscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm pt-20 sm:pt-16">
      <div className="relative w-full max-w-2xl mx-4 animate-fade-in-up max-h-[90vh] overflow-y-auto">
        {/* Main card with improved colors and dark theme */}
        <div 
          className="relative rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden"
          style={{
            backgroundColor: aestheticsColors.green.DEFAULT,
            borderColor: aestheticsColors.green.border.dark,
            borderWidth: '2px',
            borderStyle: 'solid',
          }}
        >
          {/* Close Button */}
          <button
            onClick={() => {
              setIsOpen(false);
              setCookie(COOKIE_NAMES.DISCOUNT_SHOWN, 'true', 365);
            }}
            className="absolute top-4 right-4 z-20 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg border border-white/30"
            aria-label="Close discount form"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          {discountCode ? (
            <div className="py-10 sm:py-12 md:py-14 px-6 sm:px-8 md:px-12 text-center text-white">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-white/30 shadow-lg"
                style={{
                  background: `linear-gradient(to bottom right, ${aestheticsColors.green.DEFAULT}, ${aestheticsColors.green.dark})`,
                }}
              >
                <Percent className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Congratulations!</h3>
              <p className="text-white/90 text-base sm:text-lg mb-5">Here&apos;s your exclusive discount code:</p>
              <div
                className="inline-flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-xl px-6 sm:px-8 py-4 sm:py-5 mb-5 border-2 backdrop-blur-sm"
                style={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  borderColor: "rgba(255,255,255,0.35)",
                }}
              >
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm text-white/80 mb-1 font-semibold uppercase tracking-wide">Your Discount Code</div>
                  <div className="text-2xl sm:text-3xl font-bold text-white tracking-wider select-all">{discountCode}</div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-white transition-all shadow-lg hover:shadow-xl active:scale-95"
                  style={{
                    background: copied
                      ? "linear-gradient(to right, #2d322c, #3a4039)"
                      : "linear-gradient(to right, #9d9585, #b5ad9d, #ddd5c3)",
                  }}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Code
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm text-white/80 mb-6">Check your email for details. Valid for 30 days!</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setCookie(COOKIE_NAMES.DISCOUNT_SHOWN, "true", 365);
                  }}
                  className="px-6 py-3 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl"
                  style={{
                    background: "linear-gradient(to right, #9d9585, #b5ad9d, #ddd5c3)",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 sm:p-6 md:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 sm:gap-6">
                {/* Content */}
                <div className="flex-1 text-white">
                  <div className="flex items-center gap-2 mb-4">
                    <Gift className="w-7 h-7 text-white" />
                    <span className="px-3 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm font-semibold rounded-full border border-white/30">EXCLUSIVE OFFER</span>
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 text-white">
                    Get {siteConfig.newsletter.welcomeDiscountPercent}% Off Your First Visit
                  </h3>
                  <p className="text-white/90 text-sm sm:text-base mb-4">
                    Subscribe to our newsletter and receive exclusive beauty tips, treatment guides, and special offers
                  </p>

                  {/* Form with improved styling */}
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="flex flex-col gap-3">
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        className="w-full px-4 py-3 text-base rounded-lg bg-white dark:bg-gray-800 border border-white/30 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        style={{
                          borderColor: aestheticsColors.green.border.DEFAULT,
                        }}
                      />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email address"
                        className="w-full px-4 py-3 text-base rounded-lg bg-white dark:bg-gray-800 border border-white/30 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        style={{
                          borderColor: aestheticsColors.green.border.DEFAULT,
                        }}
                      />
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="Mobile Number"
                        className="w-full px-4 py-3 text-base rounded-lg bg-white dark:bg-gray-800 border border-white/30 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        style={{
                          borderColor: aestheticsColors.green.border.DEFAULT,
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-8 py-3 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#ddd5c3] hover:from-[#8d8575] hover:via-[#a59d8d] hover:to-[#cdc5b3] text-white text-lg font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl active:scale-95"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2 text-white">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Subscribing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-white">
                          <Mail className="w-5 h-5" />
                          <span>Get My Discount Code</span>
                        </div>
                      )}
                    </button>
                  </form>

                  <p className="mt-4 text-sm text-white/80 text-center lg:text-left">
                    By subscribing, you agree to receive marketing emails. Unsubscribe anytime. <span className="underline hover:text-white transition-colors cursor-pointer font-semibold">Privacy Policy</span>
                  </p>
                </div>

                {/* Visual Element - Green Badge */}
                <div className="hidden lg:block flex-shrink-0">
                  <div 
                    className="w-28 h-28 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      background: `linear-gradient(to bottom right, ${aestheticsColors.green.DEFAULT}, ${aestheticsColors.green.dark})`,
                      borderColor: aestheticsColors.green.border.light,
                      borderWidth: '2px',
                      borderStyle: 'solid',
                    }}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {siteConfig.newsletter.welcomeDiscountPercent}%
                      </div>
                      <div className="text-white font-bold text-xs">OFF</div>
                      <div className="text-white/90 text-[10px] mt-1 font-semibold">First Visit</div>
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle, Gift } from "lucide-react";
import { siteConfig } from "@/config/site";
import { badgeBackgroundClass } from "@/config/badge-styles";

export default function SectionNewsletter() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [mobile, setMobile] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [discountCode, setDiscountCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");

    try {
      // TODO: Implement newsletter API
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate discount code
      const code = `${siteConfig.newsletter.discountCodePrefix}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      setDiscountCode(code);
      setStatus("success");
      setEmail("");
      setFirstName("");
      setMobile("");
    } catch (error) {
      console.error("Newsletter signup error:", error);
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "success") {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-[#f5f1e9] dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#464C45] dark:bg-[#464C45] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border-2 border-[#c9c1b0] dark:border-gray-700 shadow-lg">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7V3z" />
              </svg>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 px-4">
              Welcome to EGP Aesthetics!
            </h3>
            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 px-4">
              Check your email for your exclusive discount code:
            </p>
            <div className="inline-block bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-[#c9c1b0] dark:border-gray-700 rounded-xl px-6 sm:px-8 py-3 sm:py-4 mb-4 sm:mb-6 shadow-lg">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-1 font-medium">Your Discount Code</div>
              <div className="text-2xl sm:text-3xl font-bold text-[#464C45] dark:text-[#464C45] tracking-wider">
                {discountCode}
              </div>
            </div>
            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-6 sm:mb-8 px-4">
              Use this code to get <strong className="text-gray-900 dark:text-white">{siteConfig.newsletter.welcomeDiscountPercent}% off</strong> your first treatment!
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="px-6 py-3 bg-[#464C45] dark:bg-[#464C45] text-white font-semibold rounded-full hover:bg-[#3a4039] dark:hover:bg-[#3a4039] transition-colors touch-manipulation active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-[#f5f1e9] dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/12 dark:bg-gray-900/40 backdrop-blur-lg border border-[#e4d9c8]/60 dark:border-gray-700/60 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 sm:gap-8">
              {/* Content */}
              <div className="flex-1">
                <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 ${badgeBackgroundClass} text-gray-900 dark:text-gray-200 text-sm sm:text-base font-semibold mb-3 sm:mb-4`}>
                  <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Exclusive Offer</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  Get {siteConfig.newsletter.welcomeDiscountPercent}% Off Your First Visit
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-4 sm:mb-6">
                  Subscribe to our newsletter and receive exclusive beauty tips, treatment guides, and special offers
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
                  <div className="flex flex-col gap-2.5 sm:gap-3">
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First Name (optional)"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-white/85 dark:bg-gray-900/70 border border-[#d8cbb1]/70 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[#c4b5a0]/60 outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500"
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-white/85 dark:bg-gray-900/70 border border-[#d8cbb1]/70 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[#c4b5a0]/60 outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500"
                    />
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="Mobile Number (optional)"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-white/85 dark:bg-gray-900/70 border border-[#d8cbb1]/70 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[#c4b5a0]/60 outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 sm:px-8 py-3 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#ddd5c3] text-[#3f3a31] text-base sm:text-lg font-bold rounded-xl hover:shadow-2xl hover:from-[#8c846f] hover:via-[#aea693] hover:to-[#c4b5a0] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl active:scale-95 touch-manipulation"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-[#b5ad9d] dark:border-white border-t-transparent rounded-full animate-spin"></div>
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

                {status === "error" && (
                  <p className="mt-4 text-red-200 dark:text-red-400 text-sm">
                    Sorry, there was an error. Please try again or contact us directly.
                  </p>
                )}

                {/* Privacy */}
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  By subscribing, you agree to receive marketing emails. Unsubscribe anytime. 
                  <Link href="/privacy" className="underline hover:text-gray-900 dark:hover:text-gray-200 ml-1 font-semibold transition-colors">
                    Privacy Policy
                  </Link>
                </p>
              </div>

              {/* Visual Element - Rose/Pink Luxury Badge */}
              <div className="hidden lg:block">
                <div className="w-48 h-48 bg-gradient-to-br from-[#d8c5a7] via-[#c4b5a0] to-[#b59c74] dark:from-[#9d9585] dark:via-[#b5ad9d] dark:to-[#ddd5c3] rounded-full flex items-center justify-center border-4 border-white/50 dark:border-gray-700/50 shadow-2xl">
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
        </div>
      </div>
    </section>
  );
}


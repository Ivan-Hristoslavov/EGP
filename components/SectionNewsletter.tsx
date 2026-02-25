"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Gift, Copy, Check, Sparkles } from "lucide-react";
import { siteConfig } from "@/config/site";
import { aestheticsColors } from "@/config/colors";
import { Input, Button } from "@heroui/react";
import { typography, layout, textColors } from "@/config/typography";

export default function SectionNewsletter() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [mobile, setMobile] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [discountCode, setDiscountCode] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    if (!discountCode) return;
    try {
      await navigator.clipboard.writeText(discountCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim() || !mobile.trim()) {
      setStatus("error");
      return;
    }
    setIsSubmitting(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          email: email.trim().toLowerCase(),
          mobile: mobile.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setDiscountCode(data.discountCode ?? "");
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
      <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-b from-egp-beige-lighter via-egp-beige-light/50 to-egp-beige-lighter dark:from-egp-green-darker dark:via-egp-green-dark dark:to-egp-green-darker">
        <div className={layout.container}>
          <div className="max-w-4xl mx-auto">
            {/* Success card - compact, uses more width */}
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg border border-egp-beige-dark/30 dark:border-egp-green/30 bg-white dark:bg-egp-green-dark/95 backdrop-blur-sm">
              {/* Decorative top gradient strip */}
              <div
                className="h-1.5 w-full"
                style={{
                  background: `linear-gradient(90deg, ${aestheticsColors.green.dark}, ${aestheticsColors.green.DEFAULT}, ${aestheticsColors.primary.dark}, ${aestheticsColors.green.DEFAULT})`,
                }}
              />

              <div className="px-5 sm:px-8 py-6 sm:py-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                  {/* Icon + heading block */}
                  <div className="flex items-center gap-4 sm:flex-shrink-0">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${aestheticsColors.green.DEFAULT}, ${aestheticsColors.green.dark})`,
                        boxShadow: `0 4px 12px -2px rgba(70, 76, 69, 0.3)`,
                      }}
                    >
                      <Sparkles className="w-6 h-6 text-white" strokeWidth={2} />
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider bg-egp-green/10 dark:bg-white/10 text-egp-green dark:text-white/90 border border-egp-green/20 dark:border-white/20 mb-1">
                        <Gift className="w-3 h-3" />
                        Exclusive Offer
                      </span>
                      <h3 className={`${typography.headingCard} ${textColors.heading}`}>
                        Welcome to EGP Aesthetics!
                      </h3>
                      <p className={`${typography.small} ${textColors.muted} mt-0.5`}>
                        Check your email for details.
                      </p>
                    </div>
                  </div>

                  {/* Discount code + actions - takes remaining width */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div
                      className="rounded-lg sm:rounded-xl p-4 sm:p-5 border-2"
                      style={{
                        background: `linear-gradient(135deg, ${aestheticsColors.primary.light} 0%, ${aestheticsColors.neutral.light} 100%)`,
                        borderColor: aestheticsColors.green.border.light,
                        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 8px -2px rgba(70, 76, 69, 0.12)`,
                      }}
                    >
                      <div className="flex flex-col gap-3">
                        <div className="min-w-0">
                          <p className={`${typography.small} ${textColors.muted} mb-0.5 font-semibold uppercase tracking-wider`}>
                            Your Discount Code
                          </p>
                          <p className="text-lg sm:text-xl font-bold tracking-[0.15em] text-egp-green dark:text-white select-all font-mono">
                            {discountCode}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleCopyCode}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                              copied
                                ? "bg-emerald-500/90 text-white shadow-md"
                                : "bg-egp-green hover:bg-egp-green-dark text-white shadow-md hover:shadow-lg active:scale-[0.98]"
                            }`}
                          >
                            {copied ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? "Copied!" : "Copy"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatus("idle")}
                            className="px-4 py-2 rounded-lg font-semibold text-sm bg-egp-beige-dark hover:bg-egp-beige-darker text-white dark:bg-egp-green dark:hover:bg-egp-green-dark transition-colors"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className={`${typography.small} ${textColors.muted}`}>
                      Use this code for{" "}
                      <span className="font-bold text-egp-green dark:text-white">
                        {siteConfig.newsletter.welcomeDiscountPercent}% off
                      </span>{" "}
                      your first treatment. Valid 30 days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
      <section className="py-12 sm:py-16 md:py-20 bg-egp-beige-lighter dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div 
              className="rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg"
              style={{
                backgroundColor: aestheticsColors.green.DEFAULT,
                borderColor: aestheticsColors.green.border.dark,
                borderWidth: '2px',
                borderStyle: 'solid',
              }}
            >
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 sm:gap-8">
              {/* Content */}
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm text-white text-sm sm:text-base font-semibold mb-3 sm:mb-4 rounded-full border border-white/30">
                  <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Exclusive Offer</span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">
                  Get {siteConfig.newsletter.welcomeDiscountPercent}% Off Your First Visit
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-white/90 mb-4 sm:mb-6">
                  Subscribe to our newsletter and receive exclusive beauty tips, treatment guides, and special offers
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex flex-col gap-3">
                    <Input
                      type="text"
                      isRequired
                      value={firstName}
                      onValueChange={setFirstName}
                      placeholder="First Name"
                      variant="bordered"
                      size="lg"
                      classNames={{
                        input: "bg-white dark:bg-gray-800",
                        inputWrapper: "bg-white dark:bg-gray-800",
                      }}
                      style={{
                        borderColor: aestheticsColors.green.border.DEFAULT,
                      }}
                    />
                    <Input
                      type="email"
                      isRequired
                      value={email}
                      onValueChange={setEmail}
                      placeholder="Your email address"
                      variant="bordered"
                      size="lg"
                      classNames={{
                        input: "bg-white dark:bg-gray-800",
                        inputWrapper: "bg-white dark:bg-gray-800",
                      }}
                      style={{
                        borderColor: aestheticsColors.green.border.DEFAULT,
                      }}
                    />
                    <Input
                      type="tel"
                      isRequired
                      value={mobile}
                      onValueChange={setMobile}
                      placeholder="Mobile Number"
                      variant="bordered"
                      size="lg"
                      classNames={{
                        input: "bg-white dark:bg-gray-800",
                        inputWrapper: "bg-white dark:bg-gray-800",
                      }}
                      style={{
                        borderColor: aestheticsColors.green.border.DEFAULT,
                      }}
                    />
                  </div>
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    size="lg"
                    className="w-full bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#ddd5c3] text-white font-bold shadow-xl hover:shadow-2xl"
                    startContent={!isSubmitting && <Mail className="w-5 h-5" />}
                  >
                    {isSubmitting ? "Subscribing..." : "Get My Discount Code"}
                  </Button>
                </form>

                {status === "error" && (
                  <p className="mt-4 text-red-200 dark:text-red-400 text-sm">
                    Sorry, there was an error. Please try again or contact us directly.
                  </p>
                )}

                {/* Privacy */}
                <p className="mt-4 text-sm text-white/80">
                  By subscribing, you agree to receive marketing emails. Unsubscribe anytime. 
                  <Link href="/privacy" className="underline hover:text-white ml-1 font-semibold transition-colors">
                    Privacy Policy
                  </Link>
                </p>
              </div>

              {/* Visual Element - Green Badge */}
              <div className="hidden lg:block">
                <div 
                  className="w-32 h-32 rounded-full flex items-center justify-center shadow-lg"
                  style={{
                    background: `linear-gradient(to bottom right, ${aestheticsColors.green.DEFAULT}, ${aestheticsColors.green.dark})`,
                    borderColor: aestheticsColors.green.border.light,
                    borderWidth: '2px',
                    borderStyle: 'solid',
                  }}
                >
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
                      {siteConfig.newsletter.welcomeDiscountPercent}%
                    </div>
                    <div className="text-white font-bold text-sm">OFF</div>
                    <div className="text-white/90 text-xs mt-1 font-semibold">First Visit</div>
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


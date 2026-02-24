"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Gift, Copy, Check } from "lucide-react";
import { siteConfig } from "@/config/site";
import { aestheticsColors } from "@/config/colors";
import { Input, Button, Card, CardBody, Chip } from "@heroui/react";

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
      <section className="py-12 sm:py-16 md:py-20 bg-egp-beige-lighter dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 px-4">
              Welcome to EGP Aesthetics!
            </h3>
            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 px-4">
              Check your email for your exclusive discount code:
            </p>
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-[#c9c1b0] dark:border-gray-700 shadow-lg">
              <CardBody className="px-6 sm:px-8 py-3 sm:py-4">
                <div className="text-xs sm:text-sm text-default-500 mb-1 font-medium">Your Discount Code</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Chip
                    size="lg"
                    variant="flat"
                    className="text-2xl sm:text-3xl font-bold text-[#464C45] dark:text-[#464C45] tracking-wider bg-transparent"
                  >
                    {discountCode}
                  </Chip>
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={handleCopyCode}
                    className="bg-[#464C45] dark:bg-[#464C45] text-white min-w-0"
                    startContent={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </CardBody>
            </Card>
            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-6 sm:mb-8 px-4">
              Use this code to get <strong className="text-gray-900 dark:text-white">{siteConfig.newsletter.welcomeDiscountPercent}% off</strong> your first treatment!
            </p>
            <Button
              onPress={() => setStatus("idle")}
              color="primary"
              size="lg"
              className="bg-[#464C45] dark:bg-[#464C45] text-white font-semibold"
            >
              Close
            </Button>
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


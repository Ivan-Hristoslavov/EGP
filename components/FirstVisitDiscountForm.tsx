"use client";

import React, { useState, useEffect } from "react";
import { X, Gift, Mail } from "lucide-react";
import { Button, Input } from "@heroui/react";
import { setCookie, getCookie, COOKIE_NAMES } from "@/lib/cookies";

export function FirstVisitDiscountForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountCode, setDiscountCode] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has already seen the discount popup
    const hasSeenDiscount = getCookie(COOKIE_NAMES.DISCOUNT_SHOWN);
    
    if (!hasSeenDiscount) {
      // Show after 3 seconds for first-time visitors
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

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
      const generatedCode = `FIRST10${Math.floor(Math.random() * 900) + 100}`; // e.g., FIRST10123
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
      <div className="relative bg-gradient-to-r from-pink-500 via-purple-600 to-purple-800 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 animate-fade-in-up">
        {/* Discount Badge */}
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-400 rounded-full shadow-lg flex flex-col items-center justify-center border-4 border-white z-10">
          <div className="text-2xl font-bold text-purple-800">10%</div>
          <div className="text-xs font-semibold text-white">OFF</div>
          <div className="text-xs font-semibold text-white">First Visit</div>
        </div>

        {/* Close Button - Positioned in middle and under the discount circle */}
        <button
          onClick={() => {
            setIsOpen(false);
            // Set cookie to remember user has seen the discount popup
            setCookie(COOKIE_NAMES.DISCOUNT_SHOWN, 'true', 365);
          }}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 z-20 shadow-lg border-2 border-gray-200"
          aria-label="Close discount form"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        {discountCode ? (
          <div className="text-center text-white">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
              <p className="text-white/90">
                Here's your exclusive discount code:
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm text-white font-bold text-3xl py-4 px-6 rounded-2xl mb-6 border border-white/30">
              {discountCode}
            </div>
            <p className="text-sm text-white/80 mb-6">
              Check your email for details. Valid for 30 days!
            </p>
            <Button
              fullWidth
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-xl"
              onPress={() => {
                setIsOpen(false);
                // Set cookie to remember user has seen the discount popup
                setCookie('egp_discount_shown', 'true', 365);
              }}
            >
              Got It!
            </Button>
          </div>
        ) : (
          <div className="text-white">
            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center px-3 py-1 bg-yellow-400 rounded-full text-black text-xs font-bold mb-3">
                <Gift className="w-4 h-4 mr-1" />
                EXCLUSIVE OFFER
              </div>
              <h3 className="text-2xl font-bold mb-3">
                Get 10% Off Your First Visit
              </h3>
              <p className="text-white/90 text-sm">
                Subscribe to our newsletter and receive exclusive beauty tips, treatment guides, and special offers.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="First Name (optional)"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full"
                classNames={{
                  input: "bg-white/90 text-gray-900 placeholder-gray-500",
                  inputWrapper: "bg-white/90 border-white/30 hover:bg-white focus-within:bg-white"
                }}
              />
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                classNames={{
                  input: "bg-white/90 text-gray-900 placeholder-gray-500",
                  inputWrapper: "bg-white/90 border-white/30 hover:bg-white focus-within:bg-white"
                }}
                required
              />
              <Button
                type="submit"
                fullWidth
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-xl shadow-lg"
                isLoading={isSubmitting}
                startContent={<Mail className="w-5 h-5" />}
              >
                {isSubmitting ? "Sending..." : "Get My Discount Code"}
              </Button>
            </form>

            {/* Disclaimer */}
            <p className="text-xs text-white/70 mt-4 text-center">
              By subscribing, you agree to receive marketing emails. Unsubscribe anytime.{" "}
              <span className="underline cursor-pointer hover:text-white">Privacy Policy</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

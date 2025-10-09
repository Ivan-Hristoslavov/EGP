"use client";

import { useState } from "react";
import Link from "next/link";

type PricingTier = {
  name: string;
  description: string;
  price: number;
  features: string[];
  isPopular?: boolean;
};

const pricingTiers: PricingTier[] = [
  {
    name: "Consultation",
    description: "Expert aesthetic consultation",
    price: 85,
    features: [
      "Same day availability",
      "Expert practitioner",
      "Personalized treatment plan",
      "Product recommendations",
      "Free follow-up advice",
    ],
    isPopular: true,
  },
  {
    name: "Standard Treatment",
    description: "Professional aesthetic treatments",
    price: 65,
    features: [
      "Next day appointment",
      "Standard working hours",
      "Premium products used",
      "Aftercare included",
      "Results consultation",
    ],
  },
  {
    name: "Treatment Package",
    description: "Complete aesthetic treatment package",
    price: 2500,
    features: [
      "Multiple treatments included",
      "Premium product range",
      "Regular follow-ups",
      "12-month support",
      "Free consultations",
    ],
  },
];

export function CardPricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  // Calculate annual prices (only for subscription-like services)
  const getPrice = (price: number, isSubscription: boolean = false) => {
    if (isSubscription && isAnnual) {
      return (price * 10).toFixed(2); // 2 months free for annual
    }

    return price.toFixed(2);
  };

  return (
    <div className="py-12 bg-white dark:bg-gray-900 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Clear, upfront pricing with no hidden costs
          </p>
        </div>

        <div className="mt-12 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl shadow-sm flex flex-col transition-colors duration-300 ${
                tier.isPopular
                  ? "border-black ring-2 ring-black"
                  : "border-gray-200"
              }`}
            >
              {tier.isPopular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-32 rounded-full bg-black px-3 py-1 text-center text-sm font-semibold text-white">
                  Most Popular
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {tier.name}
                </h3>
                <p className="mt-4 text-gray-500 dark:text-gray-400">{tier.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    £{getPrice(tier.price)}
                  </span>
                  {tier.name === "Bathroom Installation" ? (
                    <span className="text-base font-medium text-gray-500">
                      {" "}
                      starting from
                    </span>
                  ) : (
                    <span className="text-base font-medium text-gray-500">
                      {" "}
                      /hour
                    </span>
                  )}
                </p>
                <ul className="mt-6 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-6 w-6 text-black"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M5 13l4 4L19 7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500 dark:text-gray-400">{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  className={`block w-full rounded-full px-6 py-3 text-center text-sm font-semibold ${
                    tier.isPopular
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-white text-black border border-black hover:bg-gray-50"
                  } transition-colors`}
                  href="/book-now"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            * All prices are in GBP and include VAT. Parts and materials are
            charged separately.
            <br />
            * Consultation fee applies for all initial appointments.
            <br />* Prices may vary based on location and job complexity.
          </p>
        </div>
      </div>
    </div>
  );
}

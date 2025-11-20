"use client";

import { useState } from "react";
import { useFAQ } from "@/hooks/useFAQ";
import { aestheticsColors } from "@/config/colors";
import { badgeBackgroundClass } from "@/config/badge-styles";
import { HelpCircle } from "lucide-react";

export function FAQSection() {
  const { faqItems, isLoading, error } = useFAQ();
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-[#f5f1e9] dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500" id="faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-gray-600 dark:text-gray-300">Loading FAQ...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error || faqItems.length === 0) {
    return (
      <section className="py-20 bg-[#f5f1e9] dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500" id="faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 ${badgeBackgroundClass} text-gray-900 dark:text-gray-200 text-sm sm:text-base font-semibold mb-3 sm:mb-4`}>
              <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Questions & Answers</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {error ? "Error loading FAQ" : "No FAQ items available yet."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-[#f5f1e9] dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 ${badgeBackgroundClass} text-gray-900 dark:text-gray-200 text-sm sm:text-base font-semibold mb-3 sm:mb-4`}>
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Questions & Answers</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Find answers to common questions about our aesthetic treatments
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={item.id}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-600 overflow-hidden"
            >
              <button
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                onClick={() => toggleItem(index)}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                  {item.question}
                </h3>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${
                    openItems.includes(index) ? "rotate-180" : ""
                  }`}
                  style={{ backgroundColor: aestheticsColors.green.DEFAULT }}
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19 9l-7 7-7-7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  openItems.includes(index)
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                } overflow-hidden`}
              >
                <div className="px-8 pb-6">
                  <div className="border-t border-gray-100 dark:border-gray-600 pt-4">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

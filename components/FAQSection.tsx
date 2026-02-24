"use client";

import { useState } from "react";
import { useFAQ } from "@/hooks/useFAQ";
import { aestheticsColors } from "@/config/colors";
import { badgeBackgroundClass } from "@/config/badge-styles";
import { HelpCircle } from "lucide-react";
import { Accordion, AccordionItem, Card, CardBody, Spinner, Chip } from "@heroui/react";

const FAQ_INITIAL_COUNT = 3;

export function FAQSection() {
  const { faqItems, isLoading, error } = useFAQ();
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [showAllFaq, setShowAllFaq] = useState(false);

  const visibleFaqItems = showAllFaq ? faqItems : faqItems.slice(0, FAQ_INITIAL_COUNT);
  const remainingCount = faqItems.length - FAQ_INITIAL_COUNT;
  const hasMore = !showAllFaq && remainingCount > 0;

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-egp-beige-lighter dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500" id="faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-default-500">Loading FAQ...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || faqItems.length === 0) {
    return (
      <section className="py-20 bg-egp-beige-lighter dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500" id="faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 ${badgeBackgroundClass} text-gray-900 dark:text-gray-200 text-sm sm:text-base font-semibold mb-3 sm:mb-4`}>
              <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Questions & Answers</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {error ? "Error loading FAQ" : "No FAQ items available yet."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 sm:py-12 md:py-16 lg:py-20 bg-egp-beige-lighter dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 ${badgeBackgroundClass} text-gray-900 dark:text-gray-200 text-sm sm:text-base font-semibold mb-3 sm:mb-4`}>
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Questions & Answers</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Find answers to common questions about our aesthetic treatments
          </p>
        </div>

        <Accordion 
          variant="light" 
          selectionMode="multiple"
          defaultExpandedKeys={[]}
          className="gap-3 sm:gap-4"
          itemClasses={{
            base: "bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border-0",
            title: "text-base sm:text-lg font-semibold",
            content: "text-default-600 dark:text-default-400 leading-relaxed px-4 sm:px-8 pb-4 sm:pb-6 text-sm sm:text-base",
            trigger: "px-4 sm:px-8 py-4 sm:py-6 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl sm:rounded-2xl",
          }}
        >
          {visibleFaqItems.map((item) => (
            <AccordionItem
              key={item.id}
              aria-label={item.question}
              title={
                <h3 className="text-base sm:text-lg font-semibold text-foreground pr-4">
                  {item.question}
                </h3>
              }
            >
              <p className="text-default-600 dark:text-default-400 leading-relaxed">
                {item.answer}
              </p>
            </AccordionItem>
          ))}
        </Accordion>

        {hasMore && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setShowAllFaq(true)}
              className="px-5 py-2.5 rounded-xl bg-egp-green dark:bg-egp-green-dark text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Show more {remainingCount} question{remainingCount !== 1 ? "s" : ""}
            </button>
          </div>
        )}
        {showAllFaq && faqItems.length > FAQ_INITIAL_COUNT && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowAllFaq(false)}
              className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Show less
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { useFAQ } from "@/hooks/useFAQ";
import { badgeBackgroundClass } from "@/config/badge-styles";
import { typography, textColors } from "@/config/typography";
import { HelpCircle } from "lucide-react";
import { Accordion, AccordionItem, Spinner } from "@heroui/react";

const FAQ_INITIAL_COUNT = 3;

/** Renders FAQ answer with proper paragraphs and bullet lists */
function FAQAnswer({ text }: { text: string }) {
  const parts = text.split(/\n\n+/);
  return (
    <div className={`${typography.body} ${textColors.body} space-y-3`}>
      {parts.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;
        const lines = trimmed.split(/\n/).map((l) => l.trim()).filter(Boolean);
        const bulletIdx = lines.findIndex((l) => l.startsWith("•"));
        const hasBullets = bulletIdx >= 0;
        if (hasBullets) {
          const beforeBullets = lines.slice(0, bulletIdx);
          const bulletItems = lines.slice(bulletIdx);
          return (
            <div key={i} className="space-y-2">
              {beforeBullets.length > 0 && (
                <p className="leading-relaxed">{beforeBullets.join(" ")}</p>
              )}
              <ul className="list-disc list-inside space-y-1.5 pl-1 marker:text-egp-green dark:marker:text-egp-green-light">
                {bulletItems.map((b, j) => (
                  <li key={j} className="leading-relaxed">{b.replace(/^•\s*/, "").trim()}</li>
                ))}
              </ul>
            </div>
          );
        }
        return (
          <p key={i} className="leading-relaxed">
            {trimmed.replace(/\n/g, " ")}
          </p>
        );
      })}
    </div>
  );
}

export function FAQSection() {
  const { faqItems, isLoading, error } = useFAQ();
  const [showAllFaq, setShowAllFaq] = useState(false);

  const visibleFaqItems = showAllFaq ? faqItems : faqItems.slice(0, FAQ_INITIAL_COUNT);
  const remainingCount = faqItems.length - FAQ_INITIAL_COUNT;
  const hasMore = !showAllFaq && remainingCount > 0;

  if (isLoading) {
    return (
      <section className="py-8 sm:py-10 md:py-12 bg-egp-beige-lighter dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500" id="faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-3 text-default-500 text-sm">Loading FAQ...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || faqItems.length === 0) {
    return (
      <section className="py-8 sm:py-10 md:py-12 bg-egp-beige-lighter dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500" id="faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 ${badgeBackgroundClass} text-gray-900 dark:text-gray-200 text-xs font-semibold mb-2 sm:mb-3`}>
              <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Questions & Answers</span>
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">
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
    <section className="py-6 sm:py-8 md:py-10 bg-egp-beige-lighter dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <div className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 ${badgeBackgroundClass} text-gray-900 dark:text-gray-200 text-xs font-semibold mb-2 sm:mb-3`}>
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Questions & Answers</span>
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find answers to common questions about our aesthetic treatments
          </p>
        </div>

        <Accordion
          variant="light"
          selectionMode="multiple"
          defaultExpandedKeys={[]}
          disableIndicatorAnimation={false}
          className="gap-0 px-0 divide-y divide-gray-200 dark:divide-gray-700"
          itemClasses={{
            base: "bg-transparent border-0 shadow-none rounded-none",
            title: "text-base sm:text-lg font-semibold text-gray-900 dark:text-white",
            content: "px-0 pb-3 sm:pb-4 pt-1",
            trigger: "px-0 py-3 sm:py-4 hover:bg-transparent rounded-none",
            indicator: "text-egp-green dark:text-egp-green-light transition-transform duration-300",
          }}
        >
          {visibleFaqItems.map((item) => (
            <AccordionItem
              key={item.id}
              aria-label={item.question}
              title={
                <span className={`${typography.headingSmall} ${textColors.heading} pr-2`}>
                  {item.question}
                </span>
              }
            >
              <div className="pt-1">
                <FAQAnswer text={item.answer} />
              </div>
            </AccordionItem>
          ))}
        </Accordion>

        {(hasMore || showAllFaq) && (
          <div className="mt-4 sm:mt-6 flex justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {hasMore && (
              <button
                type="button"
                onClick={() => setShowAllFaq(true)}
                className="px-5 py-2.5 rounded-xl bg-egp-green dark:bg-egp-green-dark text-white text-sm font-semibold hover:opacity-90 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Show more {remainingCount} question{remainingCount !== 1 ? "s" : ""}
              </button>
            )}
            {showAllFaq && faqItems.length > FAQ_INITIAL_COUNT && (
              <button
                type="button"
                onClick={() => setShowAllFaq(false)}
                className="px-5 py-2.5 rounded-xl border-2 border-egp-green dark:border-egp-green-light text-egp-green dark:text-egp-green-light text-sm font-semibold hover:bg-egp-green/10 dark:hover:bg-egp-green-light/10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Show less
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

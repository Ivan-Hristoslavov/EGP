"use client";

import type { ServiceFaqItem } from "@/lib/service-detail-enrichment";

import { Accordion, AccordionItem } from "@heroui/react";

import { typography, layout, textColors } from "@/config/typography";

type ServiceDetailFaqProps = {
  items: ServiceFaqItem[];
};

export function ServiceDetailFaq({ items }: ServiceDetailFaqProps) {
  if (items.length === 0) return null;

  return (
    <section
      className={`${layout.sectionPy} bg-egp-beige-lighter/80 dark:bg-egp-green-dark`}
      id="service-faq"
    >
      <div className={layout.container}>
        <h2
          className={`${typography.headingSection} ${textColors.heading} mb-8 text-center`}
        >
          Frequently asked questions
        </h2>
        <Accordion
          className="mx-auto max-w-3xl gap-0 divide-y divide-gray-200 px-0 dark:divide-egp-green-dark"
          defaultExpandedKeys={[]}
          itemClasses={{
            base: "bg-transparent border-0 shadow-none rounded-none",
            title: `${typography.headingSmall} ${textColors.heading}`,
            content: "px-0 pb-4 pt-1",
            trigger:
              "px-0 py-4 hover:bg-egp-beige-lighter/50 dark:hover:bg-egp-green/50 rounded-lg",
            indicator:
              "text-egp-green dark:text-egp-beige transition-transform duration-300",
          }}
          selectionMode="multiple"
          variant="light"
        >
          {items.map((item) => (
            <AccordionItem
              key={item.id}
              aria-label={item.question}
              title={item.question}
            >
              <p
                className={`${typography.body} ${textColors.body} whitespace-pre-wrap`}
              >
                {item.answer}
              </p>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

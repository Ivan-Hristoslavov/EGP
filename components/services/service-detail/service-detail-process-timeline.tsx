import type { ServiceDetailEnrichment } from "@/lib/service-detail-enrichment";

import { typography, layout, textColors } from "@/config/typography";

type ServiceDetailProcessTimelineProps = {
  enrichment: ServiceDetailEnrichment;
  detailsMentionsTechnique: boolean;
};

export function ServiceDetailProcessTimeline({
  enrichment,
  detailsMentionsTechnique,
}: ServiceDetailProcessTimelineProps) {
  const steps = enrichment.processSteps;
  const lastIndex = steps.length - 1;

  return (
    <section
      className={`${layout.sectionPy} bg-white dark:bg-egp-green-darker`}
    >
      <div className={layout.container}>
        <h2
          className={`${typography.headingSection} ${textColors.heading} mb-10 text-center`}
        >
          Treatment process
        </h2>
        <ol className="mx-auto max-w-3xl">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-4 sm:gap-5">
              <div className="flex w-10 shrink-0 flex-col items-center sm:w-11">
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-egp-green bg-white text-sm font-bold text-egp-green dark:border-egp-beige dark:bg-egp-green dark:text-egp-beige sm:h-10 sm:w-10"
                >
                  {index + 1}
                </span>
                {index < lastIndex ? (
                  <div
                    aria-hidden
                    className="mt-2 w-0.5 flex-1 min-h-[2.75rem] rounded-full bg-egp-green/25 dark:bg-egp-beige/25"
                  />
                ) : null}
              </div>
              <div className={`min-w-0 ${index < lastIndex ? "pb-10" : "pb-0"}`}>
                <h3
                  className={`${typography.headingCard} ${textColors.heading} mb-2 pt-0.5`}
                >
                  {step.title}
                </h3>
                <p className={`${typography.body} ${textColors.body}`}>
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
        {detailsMentionsTechnique ? (
          <p
            className={`${typography.small} ${textColors.muted} mx-auto mt-8 max-w-2xl text-center`}
          >
            Cannula or needle selection is tailored to your anatomy and
            treatment plan for comfort and safety.
          </p>
        ) : null}
      </div>
    </section>
  );
}

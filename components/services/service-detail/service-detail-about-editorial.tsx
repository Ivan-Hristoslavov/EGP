import type { ServiceDetailEnrichment } from "@/lib/service-detail-enrichment";

import { CheckCircle } from "lucide-react";

import { typography, layout, textColors } from "@/config/typography";

type ServiceDetailAboutEditorialProps = {
  serviceTitle: string;
  description: string;
  details: string | null;
  benefits: string[];
  enrichment: ServiceDetailEnrichment;
};

export function ServiceDetailAboutEditorial({
  serviceTitle,
  description,
  details,
  benefits,
  enrichment,
}: ServiceDetailAboutEditorialProps) {
  return (
    <section
      className={`${layout.sectionPy} bg-white dark:bg-egp-green-darker`}
    >
      <div className={layout.container}>
        <div className="mx-auto max-w-3xl">
          <h2
            className={`${typography.headingSection} ${textColors.heading} mb-4`}
          >
            About this treatment
          </h2>
          <p className={`${typography.leadCompact} ${textColors.body} mb-6`}>
            {enrichment.seoIntro}
          </p>
          {description ? (
            <p className={`${typography.body} ${textColors.body} mb-6`}>
              {description}
            </p>
          ) : null}
          {details ? (
            <div className="mb-8">
              <h3
                className={`${typography.headingCard} ${textColors.heading} mb-3`}
              >
                How {serviceTitle} works
              </h3>
              <p
                className={`${typography.body} ${textColors.body} whitespace-pre-wrap`}
              >
                {details}
              </p>
            </div>
          ) : null}
          {benefits.length > 0 ? (
            <div>
              <h3
                className={`${typography.headingCard} ${textColors.heading} mb-4`}
              >
                Key benefits
              </h3>
              <ul className="flex flex-col gap-3">
                {benefits.map((benefit, index) => (
                  <li
                    key={`${index}-${benefit.slice(0, 20)}`}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle
                      aria-hidden
                      className="mt-0.5 h-5 w-5 shrink-0 text-egp-green dark:text-egp-beige"
                    />
                    <span className={`${typography.body} ${textColors.body}`}>
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

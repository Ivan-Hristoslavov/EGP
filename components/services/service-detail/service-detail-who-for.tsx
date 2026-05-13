import type { ServiceDetailEnrichment } from "@/lib/service-detail-enrichment";

import { CheckCircle, XCircle } from "lucide-react";

import { typography, layout, textColors } from "@/config/typography";

type ServiceDetailWhoForProps = {
  requiresConsultation: boolean;
  enrichment: ServiceDetailEnrichment;
};

export function ServiceDetailWhoFor({
  requiresConsultation,
  enrichment,
}: ServiceDetailWhoForProps) {
  return (
    <section
      className={`${layout.sectionPy} bg-egp-beige-lighter/80 dark:bg-egp-green-dark`}
    >
      <div className={layout.container}>
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <h2
              className={`${typography.headingSection} ${textColors.heading} mb-6`}
            >
              Who is this for?
            </h2>
            <ul className="flex flex-col gap-3">
              {enrichment.whoFor.map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <CheckCircle
                    aria-hidden
                    className="mt-0.5 h-5 w-5 shrink-0 text-egp-green dark:text-egp-beige"
                  />
                  <span className={`${typography.body} ${textColors.body}`}>
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3
              className={`${typography.headingCard} ${textColors.heading} mb-4`}
            >
              Who may not be suitable
            </h3>
            <ul className="mb-6 flex flex-col gap-3">
              {enrichment.whoNotFor.map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <XCircle
                    aria-hidden
                    className="mt-0.5 h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500"
                  />
                  <span className={`${typography.body} ${textColors.body}`}>
                    {line}
                  </span>
                </li>
              ))}
            </ul>
            {requiresConsultation ? (
              <div
                className={`rounded-xl border border-egp-green/25 bg-white/80 p-4 dark:border-egp-beige/20 dark:bg-egp-green/40`}
              >
                <p className={`${typography.body} ${textColors.body}`}>
                  <strong className={textColors.heading}>
                    Consultation-first approach.
                  </strong>{" "}
                  We assess suitability, anatomy, and goals before confirming
                  any injectable treatment plan.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

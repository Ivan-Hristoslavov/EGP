import type { ServiceDetailEnrichment } from "@/lib/service-detail-enrichment";

import { typography, layout, textColors } from "@/config/typography";

type ServiceDetailPricingPanelProps = {
  servicePriceDisplay: string;
  enrichment: ServiceDetailEnrichment;
};

export function ServiceDetailPricingPanel({
  servicePriceDisplay,
  enrichment,
}: ServiceDetailPricingPanelProps) {
  return (
    <section
      className={`${layout.sectionPy} bg-egp-beige-lighter/80 dark:bg-egp-green-dark`}
    >
      <div className={layout.container}>
        <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-egp-green-dark dark:bg-egp-green md:p-10">
          <h2
            className={`${typography.headingSection} ${textColors.heading} mb-2 text-center`}
          >
            Investment
          </h2>
          <p
            className={`${typography.leadCompact} ${textColors.muted} mb-8 text-center`}
          >
            Transparent starting prices — your final plan is confirmed after
            consultation.
          </p>
          <p
            className={`${typography.headingCard} ${textColors.heading} mb-6 text-center`}
          >
            From {servicePriceDisplay}
          </p>
          <ul className="mb-6 flex flex-col gap-3">
            {enrichment.pricingNotes.map((note) => (
              <li
                key={note.slice(0, 40)}
                className={`${typography.body} ${textColors.body} flex gap-2`}
              >
                <span
                  aria-hidden
                  className="text-egp-green dark:text-egp-beige"
                >
                  ·
                </span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
          <p className={`${typography.small} ${textColors.muted} text-center`}>
            Finance or staged payments may be discussed where available — ask
            during your visit.
          </p>
        </div>
      </div>
    </section>
  );
}

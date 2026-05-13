import type { ServiceDetailEnrichment } from "@/lib/service-detail-enrichment";

import { typography, layout, textColors } from "@/config/typography";

type ServiceDetailResultsLongevityProps = {
  resultsDurationWeeks: number | null;
  downtimeDays: number | null;
  aftercare: string | null;
  enrichment: ServiceDetailEnrichment;
};

export function ServiceDetailResultsLongevity({
  resultsDurationWeeks,
  downtimeDays,
  aftercare,
  enrichment,
}: ServiceDetailResultsLongevityProps) {
  const aftercareExcerpt =
    aftercare && aftercare.trim().length > 0
      ? aftercare.trim().slice(0, 420) +
        (aftercare.trim().length > 420 ? "…" : "")
      : null;

  return (
    <section
      className={`${layout.sectionPy} bg-egp-beige-lighter/80 dark:bg-egp-green-dark`}
    >
      <div className={layout.container}>
        <div className="mx-auto max-w-3xl">
          <h2
            className={`${typography.headingSection} ${textColors.heading} mb-6`}
          >
            Results & longevity
          </h2>
          <ul
            className={`mb-6 list-disc space-y-2 pl-5 ${typography.body} ${textColors.body}`}
          >
            {resultsDurationWeeks != null && resultsDurationWeeks > 0 ? (
              <li>
                How long results last depends on product, area, and metabolism;
                your plan may reference durability up to{" "}
                <strong>{resultsDurationWeeks} weeks</strong> in appropriate
                cases.
              </li>
            ) : (
              <li>
                Expected duration is discussed at consultation based on product
                choice and your goals.
              </li>
            )}
            {downtimeDays != null && downtimeDays > 0 ? (
              <li>
                Typical social or activity downtime is often around{" "}
                <strong>
                  {downtimeDays} day{downtimeDays === 1 ? "" : "s"}
                </strong>
                ; bruising or swelling can vary.
              </li>
            ) : (
              <li>
                Many patients return to usual activities quickly; personalised
                aftercare will reflect your treatment.
              </li>
            )}
          </ul>
          {enrichment.longevityParagraphs.map((para) => (
            <p
              key={para.slice(0, 40)}
              className={`${typography.body} ${textColors.body} mb-4`}
            >
              {para}
            </p>
          ))}
          {aftercareExcerpt ? (
            <div className="rounded-xl border border-gray-200 bg-white/90 p-5 dark:border-egp-green-dark dark:bg-egp-green">
              <h3
                className={`${typography.headingSmall} ${textColors.heading} mb-2`}
              >
                Aftercare highlights
              </h3>
              <p
                className={`${typography.body} ${textColors.body} whitespace-pre-wrap`}
              >
                {aftercareExcerpt}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

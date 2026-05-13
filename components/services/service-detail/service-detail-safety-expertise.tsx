import type { ServiceDetailEnrichment } from "@/lib/service-detail-enrichment";
import type { TeamSpotlightMember } from "@/lib/service-detail-page-data";

import Image from "next/image";
import { Shield } from "lucide-react";

import { typography, layout, textColors } from "@/config/typography";

type ServiceDetailSafetyExpertiseProps = {
  enrichment: ServiceDetailEnrichment;
  teamMember: TeamSpotlightMember | null;
};

export function ServiceDetailSafetyExpertise({
  enrichment,
  teamMember,
}: ServiceDetailSafetyExpertiseProps) {
  return (
    <section
      className={`${layout.sectionPy} bg-white dark:bg-egp-green-darker`}
    >
      <div className={layout.container}>
        <h2
          className={`${typography.headingSection} ${textColors.heading} mb-8 text-center`}
        >
          Safety & expertise
        </h2>
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:items-start">
          <ul className="flex flex-col gap-4">
            {enrichment.safetyBullets.map((bullet) => (
              <li
                key={bullet.slice(0, 48)}
                className="flex gap-3 rounded-xl border border-gray-200 bg-egp-beige-lighter/40 p-4 dark:border-egp-green-dark dark:bg-egp-green"
              >
                <Shield
                  aria-hidden
                  className="mt-0.5 h-6 w-6 shrink-0 text-egp-green dark:text-egp-beige"
                />
                <span className={`${typography.body} ${textColors.body}`}>
                  {bullet}
                </span>
              </li>
            ))}
          </ul>
          <div className="rounded-2xl border border-gray-200 bg-egp-beige-lighter/30 p-6 dark:border-egp-green-dark dark:bg-egp-green">
            {teamMember ? (
              <>
                <h3
                  className={`${typography.headingCard} ${textColors.heading} mb-4`}
                >
                  Your medical-led team
                </h3>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  {teamMember.image_url ? (
                    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-gray-200 dark:border-egp-green-dark">
                      <Image
                        fill
                        alt={teamMember.name}
                        className="object-cover"
                        sizes="112px"
                        src={teamMember.image_url}
                      />
                    </div>
                  ) : null}
                  <div className="min-w-0">
                    <p
                      className={`${typography.headingSmall} ${textColors.heading}`}
                    >
                      {teamMember.name}
                    </p>
                    <p
                      className={`${typography.small} font-medium text-egp-green dark:text-egp-beige`}
                    >
                      {teamMember.role}
                    </p>
                    {teamMember.experience_years ? (
                      <p
                        className={`${typography.small} ${textColors.muted} mt-1`}
                      >
                        {teamMember.experience_years}
                      </p>
                    ) : null}
                    {teamMember.certifications ? (
                      <p
                        className={`${typography.small} ${textColors.body} mt-3 leading-relaxed`}
                      >
                        {teamMember.certifications}
                      </p>
                    ) : null}
                  </div>
                </div>
              </>
            ) : (
              <p className={`${typography.body} ${textColors.body}`}>
                Treatments are delivered by qualified practitioners under a
                medical-led model. Team profiles and credentials are available
                at consultation and on request.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

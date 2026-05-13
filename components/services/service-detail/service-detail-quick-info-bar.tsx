import type { ReactNode } from "react";
import type { ServiceDetailEnrichment } from "@/lib/service-detail-enrichment";

import {
  Activity,
  Clock,
  Moon,
  PoundSterling,
  Shield,
  UserCheck,
} from "lucide-react";

import { typography, layout, textColors } from "@/config/typography";

type ServiceDetailQuickInfoBarProps = {
  serviceDurationDisplay: string;
  servicePriceDisplay: string;
  resultsDurationWeeks: number | null;
  downtimeDays: number | null;
  enrichment: ServiceDetailEnrichment;
};

function InfoCell({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-gray-200/90 bg-white p-4 shadow-sm dark:border-egp-green-dark dark:bg-egp-green">
      <span className="mt-0.5 shrink-0 text-egp-green dark:text-egp-beige [&>svg]:h-6 [&>svg]:w-6">
        {icon}
      </span>
      <div className="min-w-0">
        <p
          className={`${typography.small} font-medium uppercase tracking-wide ${textColors.muted}`}
        >
          {label}
        </p>
        <p
          className={`${typography.headingSmall} ${textColors.heading} mt-0.5`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export function ServiceDetailQuickInfoBar({
  serviceDurationDisplay,
  servicePriceDisplay,
  resultsDurationWeeks,
  downtimeDays,
  enrichment,
}: ServiceDetailQuickInfoBarProps) {
  const resultsLabel =
    resultsDurationWeeks != null && resultsDurationWeeks > 0
      ? `Up to ${resultsDurationWeeks} weeks`
      : "Discussed at consultation";

  const downtimeLabel =
    downtimeDays != null && downtimeDays > 0
      ? `~${downtimeDays} day${downtimeDays === 1 ? "" : "s"} typical`
      : "Minimal for most patients";

  return (
    <section
      aria-label="Treatment quick facts"
      className="border-y border-gray-200/80 bg-egp-beige-lighter/60 py-8 dark:border-egp-green-dark dark:bg-egp-green-dark/50"
    >
      <div className={layout.container}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCell
            icon={<Clock aria-hidden />}
            label="Duration"
            value={serviceDurationDisplay}
          />
          <InfoCell
            icon={<Moon aria-hidden />}
            label="Downtime"
            value={downtimeLabel}
          />
          <InfoCell
            icon={<Shield aria-hidden />}
            label="Results"
            value={resultsLabel}
          />
          <InfoCell
            icon={<Activity aria-hidden />}
            label="Comfort"
            value={enrichment.painLevelLabel}
          />
          <InfoCell
            icon={<PoundSterling aria-hidden />}
            label="Price"
            value={`From ${servicePriceDisplay}`}
          />
          <InfoCell
            icon={<UserCheck aria-hidden />}
            label="Suitable for"
            value={enrichment.suitableCandidatesSummary}
          />
        </div>
      </div>
    </section>
  );
}

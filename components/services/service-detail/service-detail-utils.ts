import { typography, textColors } from "@/config/typography";

/** Shared card shell: white / green dark, EGP borders */
export const egpCardSurface =
  "border border-gray-200 bg-white shadow-sm dark:border-egp-green-dark dark:bg-egp-green dark:shadow-none";

export const egpCardHeroGlass = `${egpCardSurface} backdrop-blur-md`;

export const egpIconAccent = "text-egp-green dark:text-egp-beige";

export const egpChipPopularClassNames = {
  base: "border border-amber-200/80 bg-amber-50 text-amber-900 dark:border-egp-beige/30 dark:bg-egp-beige/15 dark:text-egp-beige",
};

export const egpChipCategoryClassNames = {
  base: "border border-egp-green/30 bg-egp-green/10 text-egp-green dark:border-egp-beige/40 dark:bg-egp-beige/10 dark:text-egp-beige",
};

export const egpChipConsultClassNames = {
  base: "border border-gray-200 bg-egp-beige-lighter text-gray-800 dark:border-egp-green-dark dark:bg-egp-green-darker dark:text-egp-beige",
};

export function proseDetailClass() {
  return `${typography.body} ${textColors.body} whitespace-pre-wrap`;
}

export type ServiceExtraSection = {
  key: string;
  title: string;
  content: string;
};

export function buildExtraSections(
  details: string | null,
  preparation: string | null,
  aftercare: string | null,
): ServiceExtraSection[] {
  const sections: ServiceExtraSection[] = [];

  if (details?.trim()) {
    sections.push({
      key: "details",
      title: "Treatment details",
      content: details.trim(),
    });
  }

  if (preparation?.trim()) {
    sections.push({
      key: "preparation",
      title: "Preparation",
      content: preparation.trim(),
    });
  }

  if (aftercare?.trim()) {
    sections.push({
      key: "aftercare",
      title: "Aftercare",
      content: aftercare.trim(),
    });
  }

  return sections;
}

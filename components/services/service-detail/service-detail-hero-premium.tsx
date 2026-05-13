import type { ServiceDetailEnrichment } from "@/lib/service-detail-enrichment";

import Image from "next/image";
import Link from "next/link";
import { Calendar, MessageCircle, Phone, Sparkles } from "lucide-react";

import { getButtonClasses } from "@/config/design-system";
import { typography, layout, textColors } from "@/config/typography";

type ServiceDetailHeroPremiumProps = {
  serviceTitle: string;
  serviceCategory: string;
  servicePriceDisplay: string;
  imageUrl: string | null;
  isPopular: boolean;
  requiresConsultation: boolean;
  bookHref: string;
  callHref: string;
  whatsappHref: string;
  enrichment: ServiceDetailEnrichment;
};

export function ServiceDetailHeroPremium({
  serviceTitle,
  serviceCategory,
  servicePriceDisplay,
  imageUrl,
  isPopular,
  requiresConsultation,
  bookHref,
  callHref,
  whatsappHref,
  enrichment,
}: ServiceDetailHeroPremiumProps) {
  return (
    <section
      className={`${layout.sectionPy} scroll-mt-36 md:scroll-mt-40 bg-gradient-to-b from-egp-beige-lighter via-white to-egp-beige-lighter/40 dark:from-egp-green-dark dark:via-egp-green-darker dark:to-egp-green-dark`}
    >
      <div className={layout.containerWide}>
        <div className="relative z-[5] mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            className={`inline-flex min-h-10 items-center gap-2 rounded-full border-2 border-egp-green bg-egp-beige-lighter/95 px-4 py-2 text-sm font-semibold text-egp-green shadow-sm backdrop-blur-sm transition-colors hover:bg-egp-beige-lighter dark:border-egp-beige dark:bg-egp-green-darker/95 dark:text-egp-beige dark:hover:bg-egp-green-dark`}
            href="/services"
          >
            ← All treatments
          </Link>
          <p
            className={`${typography.small} uppercase tracking-[0.2em] ${textColors.muted}`}
          >
            London medical aesthetics
          </p>
        </div>

        <div
          className={`grid gap-10 lg:items-center lg:gap-14 ${imageUrl ? "lg:grid-cols-2" : ""}`}
        >
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              {isPopular ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 dark:border-egp-beige/30 dark:bg-egp-beige/15 dark:text-egp-beige">
                  <Sparkles aria-hidden className="h-3 w-3 shrink-0" />
                  Popular treatment
                </span>
              ) : null}
              <span className="inline-flex items-center rounded-full border border-egp-green/30 bg-egp-green/10 px-3 py-1 text-xs font-semibold text-egp-green dark:border-egp-beige/40 dark:bg-egp-beige/10 dark:text-egp-beige">
                {serviceCategory}
              </span>
              {requiresConsultation ? (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-egp-beige-lighter px-3 py-1 text-xs font-semibold text-gray-800 dark:border-egp-green-dark dark:bg-egp-green-darker dark:text-egp-beige">
                  Consultation recommended
                </span>
              ) : null}
            </div>

            <h1
              className={`${typography.headingHero} ${textColors.heading} mb-4 max-w-xl tracking-tight`}
            >
              {serviceTitle}
            </h1>
            <p
              className={`${typography.lead} ${textColors.body} mb-6 max-w-xl`}
            >
              {enrichment.tagline}
            </p>

            <p className={`${typography.body} ${textColors.muted} mb-2`}>
              From{" "}
              <span className={`font-semibold ${textColors.heading}`}>
                {servicePriceDisplay}
              </span>
            </p>

            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 text-center text-base font-semibold transition-opacity hover:opacity-95 ${getButtonClasses("primary")}`}
                href={bookHref}
              >
                <Calendar aria-hidden className="h-5 w-5 shrink-0" />
                Book consultation
              </Link>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-egp-green bg-transparent px-5 text-center text-base font-semibold text-egp-green transition-colors hover:bg-egp-green/5 dark:border-egp-beige dark:text-egp-beige dark:hover:bg-egp-beige/10`}
                  href={callHref}
                >
                  <Phone aria-hidden className="h-5 w-5 shrink-0" />
                  Speak to specialist
                </Link>
                <Link
                  className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-center text-base font-semibold text-white transition-opacity hover:opacity-95 ${getButtonClasses("whatsapp")}`}
                  href={whatsappHref}
                  rel="noreferrer"
                  target="_blank"
                >
                  <MessageCircle aria-hidden className="h-5 w-5 shrink-0" />
                  WhatsApp
                </Link>
              </div>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {enrichment.trustBadgeLabels.map((label) => (
                <li
                  key={label}
                  className={`flex items-center gap-2 border border-gray-200/80 bg-white/60 px-3 py-2 text-sm font-medium text-gray-800 backdrop-blur-sm dark:border-egp-green-dark dark:bg-egp-green/40 dark:text-egp-beige`}
                >
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-egp-green dark:bg-egp-beige"
                  />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {imageUrl ? (
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-gray-200/80 shadow-xl dark:border-egp-green-dark dark:shadow-none sm:aspect-[3/4]">
                <Image
                  fill
                  priority
                  alt={serviceTitle}
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  src={imageUrl}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-6 pt-24">
                  <p className="text-sm font-medium text-white/95">
                    Treatment imagery — individual results vary. Consultation
                    required for suitability.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

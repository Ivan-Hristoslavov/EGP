import type { ServiceDetailEnrichment } from "@/lib/service-detail-enrichment";
import type { ReviewsSummary } from "@/lib/service-detail-page-data";

import Link from "next/link";
import { Calendar, MessageCircle, Phone, Star } from "lucide-react";

import { getButtonClasses } from "@/config/design-system";
import { typography, layout, textColors } from "@/config/typography";

type ServiceDetailFinalCtaProps = {
  bookHref: string;
  callHref: string;
  whatsappHref: string;
  servicePriceDisplay: string;
  enrichment: ServiceDetailEnrichment;
  reviews: ReviewsSummary;
};

export function ServiceDetailFinalCta({
  bookHref,
  callHref,
  whatsappHref,
  servicePriceDisplay,
  enrichment,
  reviews,
}: ServiceDetailFinalCtaProps) {
  return (
    <section
      className={`${layout.sectionPy} bg-gradient-to-b from-egp-beige-lighter to-white dark:from-egp-green-dark dark:to-egp-green-darker`}
    >
      <div className={layout.container}>
        <div className="mx-auto max-w-3xl text-center">
          <h2
            className={`${typography.headingSection} ${textColors.heading} mb-4`}
          >
            {enrichment.finalCtaHeadline}
          </h2>
          {reviews.averageRating > 0 ? (
            <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
              <div className="flex items-center gap-0.5 text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    aria-hidden
                    className={`h-5 w-5 ${
                      star <= Math.round(reviews.averageRating)
                        ? "fill-current"
                        : "fill-none opacity-25"
                    }`}
                  />
                ))}
              </div>
              <span className={`${typography.small} ${textColors.muted}`}>
                {reviews.averageRating.toFixed(1)} · from recent patient reviews
              </span>
            </div>
          ) : null}
          <div className="mb-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Link
              className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-8 text-base font-semibold ${getButtonClasses("primary")}`}
              href={bookHref}
            >
              <Calendar aria-hidden className="h-5 w-5 shrink-0" />
              Book consultation — {servicePriceDisplay}
            </Link>
            <Link
              className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-egp-green px-6 text-base font-semibold text-egp-green dark:border-egp-beige dark:text-egp-beige`}
              href={callHref}
            >
              <Phone aria-hidden className="h-5 w-5 shrink-0" />
              Call the clinic
            </Link>
            <Link
              className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 text-base font-semibold text-white ${getButtonClasses("whatsapp")}`}
              href={whatsappHref}
              rel="noreferrer"
              target="_blank"
            >
              <MessageCircle aria-hidden className="h-5 w-5 shrink-0" />
              WhatsApp
            </Link>
          </div>
          {reviews.snippets.length > 0 ? (
            <div className="grid gap-4 text-left sm:grid-cols-3">
              {reviews.snippets.map((s) => (
                <blockquote
                  key={s.id}
                  className="rounded-xl border border-gray-200 bg-white/80 p-4 dark:border-egp-green-dark dark:bg-egp-green"
                >
                  <p
                    className={`${typography.small} ${textColors.body} line-clamp-4`}
                  >
                    “{s.comment.slice(0, 160)}
                    {s.comment.length > 160 ? "…" : ""}”
                  </p>
                  <footer
                    className={`${typography.small} mt-2 font-semibold ${textColors.muted}`}
                  >
                    — {s.customer_name}
                  </footer>
                </blockquote>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

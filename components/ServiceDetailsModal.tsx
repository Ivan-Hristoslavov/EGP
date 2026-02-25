"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import Link from "next/link";
import { X, Info, CheckCircle, Clock, Calendar, Shield } from "lucide-react";
import { typography, textColors } from "@/config/typography";
import { PriceWithDiscount } from "@/components/PriceWithDiscount";
import ButtonPrimary from "@/components/ButtonPrimary";

/** Normalized service shape - accepts various API/map formats */
export interface ServiceDetailsData {
  id?: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  discount_percentage?: number | null;
  discountPercentage?: number | null;
  category: string;
  duration: number;
  description?: string | null;
  details?: string | null;
  benefits?: string[] | null;
  preparation?: string | null;
  aftercare?: string | null;
  requires_consultation?: boolean;
  requiresConsultation?: boolean;
  downtime_days?: number;
  downtimeDays?: number;
  results_duration_weeks?: number | null;
  resultsDurationWeeks?: number | null;
  image_url?: string | null;
  imageUrl?: string | null;
  slug?: string | null;
}

interface ServiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceDetailsData | null;
  /** Show Book button (default true). Set false when already in booking flow. */
  showBookButton?: boolean;
}

function normalizeService(s: ServiceDetailsData): ServiceDetailsData {
  const discountPct = s.discount_percentage ?? s.discountPercentage ?? null;
  return {
    ...s,
    price: s.price ?? 0,
    category: s.category ?? "",
    duration: s.duration ?? 0,
    requires_consultation: s.requires_consultation ?? s.requiresConsultation ?? false,
    downtime_days: s.downtime_days ?? s.downtimeDays ?? 0,
    results_duration_weeks: s.results_duration_weeks ?? s.resultsDurationWeeks ?? null,
    originalPrice: s.originalPrice ?? null,
    discount_percentage: discountPct,
    discountPercentage: discountPct,
  };
}

export function ServiceDetailsModal({
  isOpen,
  onClose,
  service,
  showBookButton = true,
}: ServiceDetailsModalProps) {
  if (!service) return null;

  const s = normalizeService(service);
  const displayPrice = s.price;
  const hasDiscount = (s.originalPrice != null && s.originalPrice > s.price) ||
    (s.discount_percentage != null && s.discount_percentage > 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        backdrop: "bg-black/60 backdrop-blur-sm",
        base: "bg-white dark:bg-gray-900 border border-[#e4d9c8] dark:border-gray-700",
      }}
    >
      <ModalContent>
        {(onCloseModal) => (
          <>
            {/* Dark header - works in light and dark mode */}
            <ModalHeader className="bg-[#464C45] dark:bg-gray-800 text-white rounded-t-2xl [&>button]:hidden py-5 sm:py-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 w-full pr-10">
                <div className="flex-1 min-w-0">
                  <h2 className={`${typography.headingCard} text-white font-playfair`}>
                    {s.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-white/90 text-sm">
                    <span className="flex items-center gap-1.5 bg-white/15 rounded-lg px-2.5 py-1">
                      <Clock className="w-4 h-4" />
                      {s.duration} min
                    </span>
                    <span className="flex items-center bg-white/15 rounded-lg px-2.5 py-1">
                      {hasDiscount ? (
                        <PriceWithDiscount
                          price={displayPrice}
                          originalPrice={s.originalPrice ?? undefined}
                          discountPercentage={s.discount_percentage ?? undefined}
                          size="sm"
                          layout="inline"
                          className="text-white [&_.line-through]:text-white/70 [&_.font-bold]:text-white"
                        />
                      ) : (
                        <span className="font-bold">£{displayPrice.toFixed(0)}</span>
                      )}
                    </span>
                    <span className="bg-white/15 rounded-lg px-2.5 py-1 font-medium">
                      {s.category}
                    </span>
                  </div>
                </div>
                {s.image_url || s.imageUrl ? (
                  <div className="hidden sm:block w-16 h-16 rounded-xl overflow-hidden border border-white/30 flex-shrink-0">
                    <img
                      src={s.image_url || s.imageUrl || ""}
                      alt={s.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : null}
              </div>
              <button
                onClick={onCloseModal}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </ModalHeader>

            <ModalBody className="py-5 sm:py-6 space-y-5">
              {/* Meta grid: Downtime, Results Duration, Consultation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(s.downtime_days ?? 0) > 0 && (
                  <div className="bg-[#f5f1e9] dark:bg-gray-800/60 border border-[#e4d9c8] dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-[#6b5f4b] dark:text-egp-beige font-semibold text-sm mb-1">
                      <Shield className="w-4 h-4" />
                      Downtime
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                      {(s.downtime_days ?? 0)} day{(s.downtime_days ?? 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
                {(s.results_duration_weeks ?? 0) > 0 && (
                  <div className="bg-[#f5f1e9] dark:bg-gray-800/60 border border-[#e4d9c8] dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-[#6b5f4b] dark:text-egp-beige font-semibold text-sm mb-1">
                      <svg className="w-4 h-4 text-egp-green dark:text-egp-beige" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Results Duration
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                      {(s.results_duration_weeks ?? 0)} week{(s.results_duration_weeks ?? 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
                {!!s.requires_consultation && (
                  <div className="bg-[#e8f5e9] dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800 dark:text-green-300 font-semibold text-sm mb-1">
                      <CheckCircle className="w-4 h-4" />
                      Consultation Required
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      Initial consultation needed before treatment
                    </p>
                  </div>
                )}
              </div>

              {/* Overview */}
              {s.description && (
                <div>
                  <h3 className={`${typography.headingSmall} ${textColors.heading} mb-2 flex items-center gap-2`}>
                    <Info className="w-5 h-5 text-egp-green dark:text-egp-beige" />
                    Overview
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              )}

              {/* Treatment Details */}
              {s.details && (
                <div className="bg-white/80 dark:bg-gray-900/50 rounded-xl border border-[#e4d9c8] dark:border-gray-700 p-5">
                  <h3 className={`${typography.headingSmall} ${textColors.heading} mb-2`}>
                    Treatment experience
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {s.details}
                  </p>
                </div>
              )}

              {/* Benefits */}
              {s.benefits && s.benefits.length > 0 && (
                <div>
                  <h3 className={`${typography.headingSmall} ${textColors.heading} mb-2 flex items-center gap-2`}>
                    <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                    Key benefits
                  </h3>
                  <ul className="list-disc list-inside space-y-1.5 text-gray-700 dark:text-gray-300">
                    {s.benefits.map((benefit, i) => (
                      <li key={i}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preparation & Aftercare */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {s.preparation && (
                  <div className="bg-[#f5f1e9] dark:bg-gray-800/40 border border-[#e4d9c8] dark:border-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-[#6b5f4b] dark:text-egp-beige mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-egp-green dark:text-egp-beige" />
                      Preparation tips
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {s.preparation}
                    </p>
                  </div>
                )}
                {s.aftercare && (
                  <div className="bg-[#f5f1e9] dark:bg-gray-800/40 border border-[#e4d9c8] dark:border-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-[#6b5f4b] dark:text-egp-beige mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-egp-green dark:text-egp-beige" />
                      Aftercare guidance
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {s.aftercare}
                    </p>
                  </div>
                )}
              </div>
            </ModalBody>

            <ModalFooter className="border-t border-[#e4d9c8] dark:border-gray-700 gap-2 flex-row justify-end">
              <button
                type="button"
                onClick={onCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Close
              </button>
              {showBookButton && (s.id || s.slug) && (
                <ButtonPrimary
                  as={Link}
                  href={s.id ? `/book?pendingServiceId=${s.id}` : "/book"}
                  variant="primary"
                  size="md"
                  className="bg-[#464C45] dark:bg-gray-700 hover:bg-[#3a4039] dark:hover:bg-gray-600 text-white"
                  onClick={onCloseModal}
                  startContent={<Calendar className="w-4 h-4" />}
                >
                  Book This Treatment - £{displayPrice.toFixed(0)}
                </ButtonPrimary>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

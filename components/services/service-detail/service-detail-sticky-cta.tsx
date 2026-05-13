"use client";

import { Button } from "@heroui/react";
import Link from "next/link";
import { Calendar } from "lucide-react";

import { getButtonClasses } from "@/config/design-system";

type ServiceDetailStickyCtaProps = {
  bookHref: string;
  servicePriceDisplay: string;
};

export function ServiceDetailStickyCta({
  bookHref,
  servicePriceDisplay,
}: ServiceDetailStickyCtaProps) {
  return (
    <div
      aria-label="Book consultation"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-gray-200 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-sm dark:border-egp-green-dark dark:bg-egp-green-darker/95 md:hidden"
      role="region"
    >
      <Button
        as={Link}
        className={`min-h-12 w-full touch-manipulation ${getButtonClasses("primary")}`}
        href={bookHref}
        size="lg"
        startContent={<Calendar aria-hidden className="h-5 w-5 shrink-0" />}
      >
        Book consultation — {servicePriceDisplay}
      </Button>
    </div>
  );
}

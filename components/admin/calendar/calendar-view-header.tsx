"use client";

import type { ReactNode } from "react";

import { Button } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CalendarViewHeaderProps {
  title: string;
  subtitle?: string;
  todayLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  statsSlot?: ReactNode;
  prevAriaLabel?: string;
  nextAriaLabel?: string;
}

export function CalendarViewHeader({
  title,
  subtitle,
  todayLabel,
  onPrev,
  onNext,
  onToday,
  statsSlot,
  prevAriaLabel = "Previous",
  nextAriaLabel = "Next",
}: CalendarViewHeaderProps) {
  return (
    <div className="border-b border-default-200/80 bg-content1 dark:border-default-100/20">
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:p-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold leading-tight tracking-tight text-foreground sm:text-xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-default-500 sm:text-sm">
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
          <Button
            isIconOnly
            aria-label={prevAriaLabel}
            className="min-h-11 min-w-11 text-default-600"
            radius="full"
            variant="light"
            onPress={onPrev}
          >
            <ChevronLeft aria-hidden className="h-5 w-5" />
          </Button>
          <Button
            className="min-h-11 rounded-full px-3 text-sm font-medium sm:px-4"
            color="primary"
            size="sm"
            variant="flat"
            onPress={onToday}
          >
            {todayLabel}
          </Button>
          <Button
            isIconOnly
            aria-label={nextAriaLabel}
            className="min-h-11 min-w-11 text-default-600"
            radius="full"
            variant="light"
            onPress={onNext}
          >
            <ChevronRight aria-hidden className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {statsSlot ? (
        <div className="border-t border-default-200/60 px-3 pb-3 pt-2.5 dark:border-default-100/15 sm:px-4">
          {statsSlot}
        </div>
      ) : null}
    </div>
  );
}

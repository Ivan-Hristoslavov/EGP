"use client";

import { Button } from "@heroui/react";
import type { ReactNode } from "react";

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
    <div className="sticky top-0 z-20 border-b border-default-200/80 bg-content1/85 shadow-sm shadow-black/5 ring-1 ring-black/5 backdrop-blur-md supports-[backdrop-filter]:bg-content1/70 dark:border-default-100/20 dark:shadow-black/20 dark:ring-white/10">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-default-500 sm:text-sm">
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-1.5">
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
            className="min-h-11 rounded-full px-4 font-medium"
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
        <div className="border-t border-default-200/60 px-4 pb-4 pt-3 dark:border-default-100/15">
          {statsSlot}
        </div>
      ) : null}
    </div>
  );
}

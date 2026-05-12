"use client";

import type { CalendarStatsStrip } from "./calendar-types";

import { CheckCircle } from "lucide-react";

export interface CalendarStatsChipsProps {
  stats: CalendarStatsStrip;
}

export function CalendarStatsChips({ stats }: CalendarStatsChipsProps) {
  if (stats.total <= 0) return null;

  const chip =
    "inline-flex shrink-0 snap-start items-center gap-2 rounded-full border border-default-200/80 bg-default-100/50 px-3 py-1.5 text-xs text-default-600 dark:border-default-100/20 dark:bg-default-50/10 dark:text-default-400";

  return (
    <div className="-mx-1 flex flex-nowrap items-center gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:thin] sm:flex-wrap sm:overflow-visible">
      <div className={chip}>
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
        <span>
          <span className="font-semibold text-foreground">{stats.total}</span>{" "}
          Total
        </span>
      </div>
      {stats.completed > 0 ? (
        <div className={chip}>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
          <span>
            <span className="font-semibold text-foreground">
              {stats.completed}
            </span>{" "}
            Completed
          </span>
        </div>
      ) : null}
      {stats.scheduled > 0 ? (
        <div className={chip}>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <span>
            <span className="font-semibold text-foreground">
              {stats.scheduled}
            </span>{" "}
            Scheduled
          </span>
        </div>
      ) : null}
      {stats.pending > 0 ? (
        <div className={chip}>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
          <span>
            <span className="font-semibold text-foreground">
              {stats.pending}
            </span>{" "}
            Pending
          </span>
        </div>
      ) : null}
      {stats.cancelled > 0 ? (
        <div className={chip}>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
          <span>
            <span className="font-semibold text-foreground">
              {stats.cancelled}
            </span>{" "}
            Cancelled
          </span>
        </div>
      ) : null}
      {stats.paid > 0 ? (
        <div className={chip}>
          <CheckCircle
            aria-hidden
            className="h-3.5 w-3.5 shrink-0 text-success"
          />
          <span>
            <span className="font-semibold text-foreground">{stats.paid}</span>{" "}
            Paid
          </span>
        </div>
      ) : null}
      {stats.totalAmount > 0 ? (
        <div className={`${chip} ml-auto sm:ml-0`}>
          <span className="font-semibold text-foreground">
            Total: £{stats.totalAmount.toFixed(2)}
          </span>
        </div>
      ) : null}
    </div>
  );
}

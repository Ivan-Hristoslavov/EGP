"use client";

import type { DragEvent } from "react";
import type { AdminCalendarBooking } from "./calendar-types";

import clsx from "clsx";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";

function statusMeta(status: AdminCalendarBooking["status"]) {
  switch (status) {
    case "completed":
      return {
        pill: "border-success-500/25 bg-success/10 text-success-700 dark:text-success-300",
        dot: "bg-success",
        icon: (
          <CheckCircle aria-hidden className="h-3 w-3 shrink-0 opacity-80" />
        ),
      };
    case "confirmed":
      return {
        pill: "border-primary-500/30 bg-primary/10 text-primary-700 dark:text-primary-300",
        dot: "bg-primary",
        icon: (
          <CheckCircle aria-hidden className="h-3 w-3 shrink-0 opacity-80" />
        ),
      };
    case "scheduled":
      return {
        pill: "border-primary-500/25 bg-primary/8 text-primary-800 dark:text-primary-200",
        dot: "bg-primary",
        icon: (
          <CheckCircle aria-hidden className="h-3 w-3 shrink-0 opacity-70" />
        ),
      };
    case "pending":
      return {
        pill: "border-warning-500/30 bg-warning/10 text-warning-800 dark:text-warning-200",
        dot: "bg-warning",
        icon: (
          <AlertCircle aria-hidden className="h-3 w-3 shrink-0 opacity-80" />
        ),
      };
    case "cancelled":
      return {
        pill: "border-danger-500/25 bg-danger/10 text-danger-700 dark:text-danger-300",
        dot: "bg-danger",
        icon: <XCircle aria-hidden className="h-3 w-3 shrink-0 opacity-80" />,
      };
    default:
      return {
        pill: "border-default-300 bg-default-100 text-default-800 dark:border-default-100/30 dark:bg-default-100/10 dark:text-default-200",
        dot: "bg-default-500",
        icon: (
          <AlertCircle aria-hidden className="h-3 w-3 shrink-0 opacity-70" />
        ),
      };
  }
}

export interface BookingEventPillProps {
  booking: AdminCalendarBooking;
  formatTime: (t: string) => string;
  variant: "month" | "week";
  /** Month view drag-and-drop; week view uses pointer only. */
  draggable?: boolean;
  isDragging: boolean;
  onBookingClick: (booking: AdminCalendarBooking) => void;
  onDragStart: (e: DragEvent, booking: AdminCalendarBooking) => void;
  onDragEnd: (e: DragEvent) => void;
}

export function BookingEventPill({
  booking,
  formatTime,
  variant,
  draggable = true,
  isDragging,
  onBookingClick,
  onDragStart,
  onDragEnd,
}: BookingEventPillProps) {
  const meta = statusMeta(booking.status);
  const cursorClass = draggable ? "cursor-move" : "cursor-pointer";

  return (
    <div
      className={clsx(
        "group rounded-lg border px-1.5 py-1 text-left shadow-sm transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        cursorClass,
        meta.pill,
        isDragging && "opacity-50",
        variant === "month" && "hover:shadow-md",
        variant === "week" && "mb-1 last:mb-0",
      )}
      draggable={draggable}
      role="button"
      tabIndex={0}
      title={
        draggable
          ? `${formatTime(booking.time)} — ${booking.customer_name} (${booking.service}) — £${booking.amount}. Drag to move.`
          : `${formatTime(booking.time)} — ${booking.customer_name} (${booking.service}) — £${booking.amount}.`
      }
      onClick={(e) => {
        e.stopPropagation();
        onBookingClick(booking);
      }}
      onDragEnd={draggable ? onDragEnd : undefined}
      onDragStart={draggable ? (e) => onDragStart(e, booking) : undefined}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          onBookingClick(booking);
        }
      }}
    >
      <div className="flex min-w-0 items-start gap-1">
        <span aria-hidden className="mt-0.5 shrink-0 text-default-500">
          <Clock className="h-3 w-3" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1">
            <span className="shrink-0 text-[10px] font-medium tabular-nums sm:text-xs">
              {formatTime(booking.time)}
            </span>
            <span
              aria-hidden
              className={clsx("h-1 w-1 shrink-0 rounded-full", meta.dot)}
            />
            <span className="hidden min-w-0 truncate text-[10px] font-medium sm:inline sm:text-xs">
              {meta.icon}
            </span>
            <span className="min-w-0 flex-1 truncate text-[10px] font-semibold sm:text-xs">
              {booking.customer_name}
            </span>
          </div>
          <div className="max-h-0 overflow-hidden opacity-0 transition-[max-height,opacity] duration-200 group-hover:max-h-8 group-hover:opacity-90 sm:max-h-none sm:opacity-100">
            <div className="truncate text-[10px] text-default-600 dark:text-default-400 sm:text-[11px]">
              {booking.service}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import type { AdminCalendarBooking } from "./calendar-types";

import { Calendar as CalendarIcon, Phone } from "lucide-react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";

function chipColor(
  status: string,
): "success" | "warning" | "danger" | "default" | "primary" {
  switch (status) {
    case "completed":
    case "confirmed":
      return "success";
    case "scheduled":
      return "primary";
    case "pending":
      return "warning";
    case "cancelled":
      return "danger";
    default:
      return "default";
  }
}

export interface CalendarDayPanelProps {
  filteredBookings: AdminCalendarBooking[];
  formatTime: (t: string) => string;
  onBookingClick: (booking: AdminCalendarBooking) => void;
  onCreateBooking: () => void;
}

export function CalendarDayPanel({
  filteredBookings,
  formatTime,
  onBookingClick,
  onCreateBooking,
}: CalendarDayPanelProps) {
  if (filteredBookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-default-100 shadow-inner ring-1 ring-default-200/80 dark:bg-default-50/10 dark:ring-default-100/20">
          <CalendarIcon
            aria-hidden
            className="h-8 w-8 text-default-400 dark:text-default-500"
          />
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          No bookings for this date
        </h3>
        <p className="mt-2 max-w-sm text-sm text-default-500">
          Nothing matches your filters, or the day is empty. Create a booking to
          get started.
        </p>
        <Button
          className="mt-6 min-h-11 rounded-full"
          color="primary"
          onPress={onCreateBooking}
        >
          Create booking
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 sm:space-y-4 sm:p-5">
      {filteredBookings.map((booking) => (
        <button
          key={booking.id}
          className="w-full rounded-xl border border-default-200/80 bg-content1 p-4 text-left shadow-sm transition-all hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-default-100/15 dark:hover:border-primary/40"
          type="button"
          onClick={() => onBookingClick(booking)}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <div className="shrink-0 text-lg font-semibold tabular-nums text-foreground">
                {formatTime(booking.time)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-foreground">
                  {booking.customer_name}
                </div>
                <div className="text-sm text-default-600 dark:text-default-400">
                  {booking.service}
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-default-500">
                  <Phone aria-hidden className="h-3 w-3 shrink-0" />
                  {booking.customer_phone || "N/A"}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 flex-row items-center justify-between gap-3 sm:flex-col sm:items-end sm:gap-2">
              <Chip
                classNames={{ base: "font-medium" }}
                color={chipColor(booking.status)}
                size="sm"
                variant="flat"
              >
                {booking.status}
              </Chip>
              <div className="text-right">
                <div className="font-semibold text-foreground">
                  £{booking.amount}
                </div>
                {booking.duration ? (
                  <div className="text-xs text-default-500">
                    {booking.duration} min
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

"use client";

import type { DragEvent } from "react";
import type { AdminCalendarBooking } from "./calendar-types";
import type { PractitionerBadge } from "@/lib/calendar-practitioners";

import clsx from "clsx";

import { BookingEventPill } from "./booking-event-pill";

import { formatLocalYyyyMmDd } from "@/lib/calendar-local-date";

const WEEKDAY_LABELS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

export interface CalendarMonthGridProps {
  currentDate: Date;
  selectedDate: string;
  days: (number | null)[];
  getBookingsForDate: (
    date: number,
    month: number,
    year: number,
  ) => AdminCalendarBooking[];
  formatTime: (t: string) => string;
  draggedBookingId: string | null;
  onDayClick: (day: number) => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent, day: number) => void;
  onDragStart: (e: DragEvent, booking: AdminCalendarBooking) => void;
  onDragEnd: (e: DragEvent) => void;
  onBookingClick: (booking: AdminCalendarBooking) => void;
  onExpandDay: (date: number, month: number, year: number) => void;
  /** Optional: practitioner badge for a booking (null = unassigned). */
  getPractitioner?: (booking: AdminCalendarBooking) => PractitionerBadge | null;
}

export function CalendarMonthGrid({
  currentDate,
  selectedDate,
  days,
  getBookingsForDate,
  formatTime,
  draggedBookingId,
  onDayClick,
  onDragOver,
  onDrop,
  onDragStart,
  onDragEnd,
  onBookingClick,
  onExpandDay,
  getPractitioner,
}: CalendarMonthGridProps) {
  const y = currentDate.getFullYear();
  const m = currentDate.getMonth();

  return (
    <div className="overflow-x-auto">
      <div
        aria-label="Month calendar"
        className="grid min-w-[320px] grid-cols-7 gap-px rounded-b-xl bg-default-200/80 p-px dark:bg-default-100/15 sm:min-w-0"
        role="grid"
      >
        {WEEKDAY_LABELS.map((day) => (
          <div
            key={day}
            className="bg-content1 px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-default-500 first:rounded-tl-lg last:rounded-tr-lg sm:text-xs"
            role="columnheader"
          >
            {day}
          </div>
        ))}

        {days.map((day, index) => {
          if (!day) {
            return (
              <div
                key={`empty-${index}`}
                aria-hidden
                className="min-h-[6.5rem] bg-default-50/40 dark:bg-default-50/5 sm:min-h-[8.5rem]"
              />
            );
          }

          const dayBookings = getBookingsForDate(day, m, y);
          const cellDate = new Date(y, m, day);
          const dayDateStr = formatLocalYyyyMmDd(cellDate);
          const isTodayCell =
            new Date().getDate() === day &&
            new Date().getMonth() === m &&
            new Date().getFullYear() === y;
          const isSelected = selectedDate === dayDateStr;
          const density = Math.min(dayBookings.length, 4);

          return (
            <div
              key={`day-${day}-${index}`}
              className={clsx(
                "group relative flex min-h-[6.5rem] flex-col rounded-md bg-content1 p-1.5 outline-none transition-colors duration-200 sm:min-h-[8.5rem] sm:p-2",
                "focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "hover:bg-default-100/60 dark:hover:bg-default-50/10",
                "data-[today]:bg-primary/5 data-[today]:shadow-[inset_0_0_0_1px] data-[today]:shadow-primary/25",
                "data-[selected]:z-[1] data-[selected]:bg-primary/8 data-[selected]:shadow-[inset_0_0_0_2px] data-[selected]:shadow-primary data-[selected]:ring-1 data-[selected]:ring-primary/30",
              )}
              data-selected={isSelected ? "" : undefined}
              data-today={isTodayCell ? "" : undefined}
              role="gridcell"
              tabIndex={0}
              onClick={() => onDayClick(day)}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, day)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onDayClick(day);
                }
              }}
            >
              <div className="mb-1 flex items-center justify-between gap-1">
                <span
                  className={clsx(
                    "inline-flex h-7 min-w-7 items-center justify-center rounded-full text-sm font-semibold tabular-nums",
                    isTodayCell &&
                      "bg-primary text-primary-foreground shadow-sm",
                    !isTodayCell && isSelected && "bg-primary/15 text-primary",
                    !isTodayCell && !isSelected && "text-foreground",
                  )}
                >
                  {day}
                </span>
                {density > 0 ? (
                  <div aria-hidden className="flex gap-0.5">
                    {Array.from({ length: density }).map((_, i) => (
                      <span
                        key={i}
                        className="h-1 w-1 rounded-full bg-primary/45 dark:bg-primary/50"
                      />
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Phones: just the time plus the practitioner's colour, so it stays readable in a narrow cell */}
              <div className="flex min-h-0 flex-1 flex-col gap-1 sm:hidden">
                {dayBookings.slice(0, 3).map((booking) => {
                  const practitioner = getPractitioner?.(booking);

                  return (
                    <span
                      key={booking.id}
                      className={clsx(
                        "relative block truncate rounded bg-default-100 py-0.5 pl-2 pr-0.5 text-[10px] font-semibold leading-4 tabular-nums text-foreground",
                        booking.status === "cancelled" &&
                          "line-through opacity-60",
                      )}
                    >
                      <span
                        aria-hidden
                        className={clsx(
                          "absolute inset-y-0 left-0 w-1 rounded-l",
                          practitioner
                            ? practitioner.color.dot
                            : "bg-slate-400",
                        )}
                      />
                      {formatTime(booking.time)}
                      <span className="sr-only">
                        , {booking.customer_name}
                        {practitioner ? `, ${practitioner.name}` : ""}
                      </span>
                    </span>
                  );
                })}
                {dayBookings.length > 3 ? (
                  <span className="text-center text-[10px] font-semibold text-primary">
                    +{dayBookings.length - 3}
                    <span className="sr-only"> more bookings</span>
                  </span>
                ) : null}
              </div>

              <div className="hidden min-h-0 flex-1 flex-col gap-1 sm:flex">
                {dayBookings.slice(0, 3).map((booking) => (
                  <BookingEventPill
                    key={booking.id}
                    booking={booking}
                    formatTime={formatTime}
                    isDragging={draggedBookingId === booking.id}
                    practitioner={getPractitioner?.(booking)}
                    variant="month"
                    onBookingClick={onBookingClick}
                    onDragEnd={onDragEnd}
                    onDragStart={onDragStart}
                  />
                ))}
                {dayBookings.length > 3 ? (
                  <button
                    className="mt-auto rounded-md py-1 text-center text-[10px] font-semibold text-primary transition-colors hover:bg-primary/10 sm:text-xs"
                    title={`See all ${dayBookings.length} bookings`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onExpandDay(day, m, y);
                    }}
                  >
                    +{dayBookings.length - 3} more
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

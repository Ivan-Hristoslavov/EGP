"use client";

import type { DragEvent } from "react";
import type { AdminCalendarBooking } from "./calendar-types";

import React from "react";
import clsx from "clsx";

import { BookingEventPill } from "./booking-event-pill";

import { formatLocalYyyyMmDd } from "@/lib/calendar-local-date";

function isTodayDate(date: Date) {
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export interface CalendarWeekGridProps {
  weekDays: Date[];
  selectedDate: string;
  getBookingsForDate: (
    date: number,
    month: number,
    year: number,
  ) => AdminCalendarBooking[];
  formatTime: (t: string) => string;
  onSelectDayGoToDayView: (dayDateStr: string) => void;
  onTimeSlotActivate: (day: Date, timeSlot: string) => void;
  onBookingClick: (booking: AdminCalendarBooking) => void;
}

export function CalendarWeekGrid({
  weekDays,
  selectedDate,
  getBookingsForDate,
  formatTime,
  onSelectDayGoToDayView,
  onTimeSlotActivate,
  onBookingClick,
}: CalendarWeekGridProps) {
  const noopDragStart = (_e: DragEvent, _b: AdminCalendarBooking) => {};
  const noopDragEnd = (_e: DragEvent) => {};

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[560px] grid-cols-8 gap-px bg-default-200/70 p-px dark:bg-default-100/15">
        <div className="bg-default-100/80 px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-default-500 dark:bg-default-100/10 sm:text-xs">
          Time
        </div>

        {weekDays.map((day) => {
          const dayDateStr = formatLocalYyyyMmDd(day);
          const isSelected = selectedDate === dayDateStr;
          const todayCell = isTodayDate(day);

          return (
            <button
              key={day.toISOString()}
              className={clsx(
                "min-h-[3.25rem] cursor-pointer bg-content1 px-2 py-2 text-center transition-colors",
                "hover:bg-default-100/70 dark:hover:bg-default-50/10",
                "data-[selected]:bg-primary/12 data-[selected]:shadow-[inset_0_-2px_0_0] data-[selected]:shadow-primary",
                "data-[today]:text-primary",
              )}
              data-selected={isSelected ? "" : undefined}
              data-today={todayCell ? "" : undefined}
              type="button"
              onClick={() => onSelectDayGoToDayView(dayDateStr)}
            >
              <div className="text-[11px] font-semibold text-foreground sm:text-xs">
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div
                className={clsx(
                  "mt-0.5 text-xs tabular-nums",
                  todayCell && "font-bold text-primary",
                  !todayCell && isSelected && "font-semibold text-primary",
                  !todayCell && !isSelected && "text-default-500",
                )}
              >
                {day.getDate()}
              </div>
            </button>
          );
        })}

        {Array.from({ length: 12 }, (_, hourIndex) => {
          const hour = 8 + hourIndex;
          const hourSlots = [
            `${hour.toString().padStart(2, "0")}:00`,
            `${hour.toString().padStart(2, "0")}:30`,
          ];

          return (
            <React.Fragment key={hour}>
              <div className="col-span-8 border-t border-default-200/60 bg-default-100/50 px-2 py-1.5 text-xs font-semibold text-default-700 dark:border-default-100/15 dark:bg-default-50/10 dark:text-default-300 sm:text-sm">
                {hour}:00 – {hour + 1}:00
              </div>

              {hourSlots.map((timeSlot) => (
                <React.Fragment key={timeSlot}>
                  <div className="flex items-center justify-center bg-default-50/90 px-1 py-2 text-center text-[10px] font-medium tabular-nums text-default-600 dark:bg-default-50/5 dark:text-default-400 sm:text-xs">
                    {timeSlot}
                  </div>

                  {weekDays.map((day) => {
                    const dayDateStr = formatLocalYyyyMmDd(day);
                    const dayBookings = getBookingsForDate(
                      day.getDate(),
                      day.getMonth(),
                      day.getFullYear(),
                    ).filter((booking) => {
                      const bookingTime = booking.time
                        ? booking.time.split(":").slice(0, 2).join(":")
                        : "";

                      return bookingTime === timeSlot;
                    });
                    const isColSelected = selectedDate === dayDateStr;

                    return (
                      <div
                        key={`${day.toISOString()}-${timeSlot}`}
                        className={clsx(
                          "relative min-h-[60px] cursor-pointer p-1 transition-colors sm:min-h-[64px]",
                          "border-t border-default-200/40 dark:border-default-100/10",
                          "hover:bg-default-100/40 dark:hover:bg-default-50/10",
                          "data-[selected]:bg-primary/6 data-[selected]:shadow-[inset_3px_0_0_0] data-[selected]:shadow-primary",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                        )}
                        data-selected={isColSelected ? "" : undefined}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          onTimeSlotActivate(day, timeSlot);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onTimeSlotActivate(day, timeSlot);
                          }
                        }}
                      >
                        {dayBookings.map((booking) => (
                          <BookingEventPill
                            key={booking.id}
                            booking={booking}
                            draggable={false}
                            formatTime={formatTime}
                            isDragging={false}
                            variant="week"
                            onBookingClick={onBookingClick}
                            onDragEnd={noopDragEnd}
                            onDragStart={noopDragStart}
                          />
                        ))}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

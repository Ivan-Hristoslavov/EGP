"use client";

import type { AdminCalendarBooking } from "./calendar-types";

import clsx from "clsx";
import { CalendarOff } from "lucide-react";
import { useEffect, useState } from "react";

import { PractitionerAvatar } from "./practitioner-avatar";

import { minutesToTime, timeToMinutes } from "@/lib/booking-availability";
import {
  FILTER_ALL,
  FILTER_UNASSIGNED,
  colorForMember,
  computeDayWindow,
  durationOf,
  isMemberOffOnDate,
  layoutColumn,
  type CalendarMember,
  type PractitionerFilter,
} from "@/lib/calendar-practitioners";

const PX_PER_HOUR = 64;
const PX_PER_MINUTE = PX_PER_HOUR / 60;
const SLOT_MINUTES = 30;
const SLOT_PX = SLOT_MINUTES * PX_PER_MINUTE;
const GUTTER = "3.5rem";

export interface CalendarDayColumnsProps {
  /** YYYY-MM-DD */
  date: string;
  /** Already narrowed by search and status, but NOT by practitioner. */
  bookings: AdminCalendarBooking[];
  members: CalendarMember[];
  filter: PractitionerFilter;
  onBookingClick: (booking: AdminCalendarBooking) => void;
  onCreateAt: (args: { memberId: string; time: string }) => void;
  onAssign: (booking: AdminCalendarBooking, memberId: string) => void;
}

function localToday(): string {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function useNowMinutes(): number {
  const read = () => {
    const now = new Date();

    return now.getHours() * 60 + now.getMinutes();
  };
  const [minutes, setMinutes] = useState(read);

  useEffect(() => {
    const id = window.setInterval(() => setMinutes(read()), 60_000);

    return () => window.clearInterval(id);
  }, []);

  return minutes;
}

function rangeLabel(booking: AdminCalendarBooking): string {
  const start = timeToMinutes(booking.time);

  return `${minutesToTime(start)}–${minutesToTime(start + durationOf(booking))}`;
}

export function CalendarDayColumns({
  date,
  bookings,
  members,
  filter,
  onBookingClick,
  onCreateAt,
  onAssign,
}: CalendarDayColumnsProps) {
  const nowMinutes = useNowMinutes();
  const isToday = date === localToday();

  const memberIds = new Set(members.map((m) => m.id));
  const shownMembers =
    filter === FILTER_UNASSIGNED
      ? []
      : filter === FILTER_ALL
        ? members
        : members.filter((m) => m.id === filter);

  // "Unassigned" list also catches bookings of practitioners that are no longer active,
  // so no booking can ever disappear from the day.
  const listBookings = bookings
    .filter((b) =>
      filter === FILTER_UNASSIGNED
        ? !b.team_member_id
        : filter === FILTER_ALL
          ? !b.team_member_id || !memberIds.has(b.team_member_id)
          : false,
    )
    .sort((a, b) => a.time.localeCompare(b.time));

  const timelineBookings = bookings.filter(
    (b) =>
      b.team_member_id && shownMembers.some((m) => m.id === b.team_member_id),
  );
  const { startHour, endHour } = computeDayWindow(timelineBookings);
  const windowStart = startHour * 60;
  const totalHeight = (endHour - startHour) * PX_PER_HOUR;
  const slotCount = ((endHour - startHour) * 60) / SLOT_MINUTES;

  const columnCount =
    shownMembers.length +
    (listBookings.length > 0 || filter === FILTER_UNASSIGNED ? 1 : 0);

  if (columnCount === 0) {
    return (
      <div className="px-6 py-14 text-center text-sm text-default-500">
        No practitioners to show. Add team members on the Team page.
      </div>
    );
  }

  const nowTop = (nowMinutes - windowStart) * PX_PER_MINUTE;
  const showNow = isToday && nowTop >= 0 && nowTop <= totalHeight;

  return (
    <div className="overflow-x-auto">
      <div
        className="grid min-w-max"
        style={{
          gridTemplateColumns: `${GUTTER} repeat(${columnCount}, minmax(14rem, 1fr))`,
        }}
      >
        {/* Header row */}
        <div className="sticky top-0 z-30 border-b border-default-200 bg-content1" />
        {shownMembers.map((member) => {
          const color = colorForMember(members, member.id);
          const count = bookings.filter(
            (b) => b.team_member_id === member.id,
          ).length;
          const off = isMemberOffOnDate(member, date);

          return (
            <div
              key={member.id}
              className="sticky top-0 z-30 flex items-center gap-2 border-b border-l border-default-200 bg-content1 px-3 py-2.5"
            >
              <PractitionerAvatar
                color={color}
                imageUrl={member.image_url}
                name={member.name}
                size="md"
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">
                  {member.name}
                </div>
                <div className="text-xs text-default-500">
                  {off ? (
                    <span className="inline-flex items-center gap-1 font-medium text-warning-700 dark:text-warning-300">
                      <CalendarOff aria-hidden="true" className="h-3 w-3" />
                      Day off
                    </span>
                  ) : (
                    `${count} ${count === 1 ? "booking" : "bookings"}`
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {columnCount > shownMembers.length ? (
          <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-l border-dashed border-default-300 bg-content1 px-3 py-2.5">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashed border-slate-400 text-xs font-bold text-slate-600 dark:text-slate-300"
            >
              ?
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">
                Unassigned
              </div>
              <div className="text-xs text-default-500">
                {listBookings.length}{" "}
                {listBookings.length === 1 ? "booking" : "bookings"} · pick who
                takes them
              </div>
            </div>
          </div>
        ) : null}

        {/* Hour gutter */}
        <div className="relative" style={{ height: totalHeight }}>
          {shownMembers.length > 0
            ? Array.from({ length: endHour - startHour }, (_, i) => (
                <div
                  key={i}
                  className={clsx(
                    "absolute right-2 text-[11px] font-medium tabular-nums text-default-500",
                    i > 0 && "-translate-y-2",
                  )}
                  style={{ top: i === 0 ? 2 : i * PX_PER_HOUR }}
                >
                  {String(startHour + i).padStart(2, "0")}:00
                </div>
              ))
            : null}
        </div>

        {/* Practitioner timelines */}
        {shownMembers.map((member) => {
          const color = colorForMember(members, member.id);
          const off = isMemberOffOnDate(member, date);
          const items = layoutColumn(
            bookings.filter((b) => b.team_member_id === member.id),
            {
              windowStartMinutes: windowStart,
              pxPerMinute: PX_PER_MINUTE,
              minHeightPx: 26,
            },
          );

          return (
            <section
              key={member.id}
              aria-label={`${member.name}, ${items.length} ${items.length === 1 ? "booking" : "bookings"}${off ? ", day off" : ""}`}
              className={clsx(
                "relative border-l border-default-200",
                off &&
                  "bg-[repeating-linear-gradient(135deg,transparent_0,transparent_8px,rgba(120,120,120,0.08)_8px,rgba(120,120,120,0.08)_16px)]",
              )}
              style={{ height: totalHeight }}
            >
              {Array.from({ length: slotCount }, (_, i) => {
                const time = minutesToTime(windowStart + i * SLOT_MINUTES);
                const isHourLine = i % 2 === 0;
                const lineClass = isHourLine
                  ? "border-t border-default-200"
                  : "border-t border-dashed border-default-200/70";

                return off ? (
                  <div
                    key={time}
                    aria-hidden="true"
                    className={clsx("absolute inset-x-0", lineClass)}
                    style={{ top: i * SLOT_PX, height: SLOT_PX }}
                  />
                ) : (
                  <button
                    key={time}
                    aria-label={`New booking for ${member.name} at ${time}`}
                    className={clsx(
                      "group absolute inset-x-0 text-left transition-colors hover:bg-primary/5 focus-visible:bg-primary/10 focus-visible:outline-none",
                      lineClass,
                    )}
                    style={{ top: i * SLOT_PX, height: SLOT_PX }}
                    tabIndex={-1}
                    type="button"
                    onClick={() => onCreateAt({ memberId: member.id, time })}
                  >
                    <span className="pointer-events-none ml-2 hidden text-[11px] font-medium text-primary group-hover:inline">
                      + {time}
                    </span>
                  </button>
                );
              })}

              {off && items.length === 0 ? (
                <div className="pointer-events-none absolute inset-x-3 top-3 rounded-lg border border-warning-300 bg-warning-50 px-3 py-2 text-xs font-medium text-warning-800 dark:border-warning-500/40 dark:bg-warning-500/10 dark:text-warning-200">
                  {member.name} is off today
                </div>
              ) : null}

              {items.map(({ booking, top, height, lane, lanes }) => (
                <button
                  key={booking.id}
                  aria-label={`${rangeLabel(booking)}, ${booking.customer_name}, ${booking.service}, ${booking.status}`}
                  className={clsx(
                    "absolute z-10 overflow-hidden rounded-lg border px-2 py-1 text-left shadow-sm transition-shadow hover:shadow-md",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                    color.soft,
                    color.border,
                    booking.status === "cancelled" && "opacity-60",
                  )}
                  style={{
                    top: top + 1,
                    height: height - 2,
                    left: `calc(${(lane / lanes) * 100}% + 3px)`,
                    width: `calc(${100 / lanes}% - 6px)`,
                  }}
                  type="button"
                  onClick={() => onBookingClick(booking)}
                >
                  {height < 48 ? (
                    <span className="flex min-w-0 items-center gap-1.5 text-xs">
                      <span className="shrink-0 font-semibold tabular-nums">
                        {rangeLabel(booking).split("–")[0]}
                      </span>
                      <span
                        className={clsx(
                          "truncate font-semibold",
                          booking.status === "cancelled" && "line-through",
                        )}
                      >
                        {booking.customer_name}
                      </span>
                      {booking.status === "pending" ? (
                        <span className="shrink-0 rounded bg-warning-100 px-1 text-[10px] font-bold text-warning-800">
                          Pending
                        </span>
                      ) : null}
                    </span>
                  ) : (
                    <>
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold tabular-nums">
                        {rangeLabel(booking)}
                        {booking.status === "pending" ? (
                          <span className="rounded bg-warning-100 px-1 text-[10px] font-bold text-warning-800">
                            Pending
                          </span>
                        ) : null}
                        {booking.status === "completed" ? (
                          <span className="rounded bg-success-100 px-1 text-[10px] font-bold text-success-800">
                            Done
                          </span>
                        ) : null}
                      </span>
                      <span
                        className={clsx(
                          "block truncate text-xs font-semibold",
                          booking.status === "cancelled" && "line-through",
                        )}
                      >
                        {booking.customer_name}
                      </span>
                      {height >= 62 ? (
                        <span className="block truncate text-[11px] opacity-80">
                          {booking.service}
                        </span>
                      ) : null}
                    </>
                  )}
                </button>
              ))}

              {showNow ? (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 z-20 border-t-2 border-danger"
                  style={{ top: nowTop }}
                >
                  <span className="absolute -left-1 -top-[5px] h-2 w-2 rounded-full bg-danger" />
                </div>
              ) : null}
            </section>
          );
        })}

        {/* Unassigned list */}
        {columnCount > shownMembers.length ? (
          <section
            aria-label={`Unassigned, ${listBookings.length} ${listBookings.length === 1 ? "booking" : "bookings"}`}
            className="space-y-2 border-l border-dashed border-default-300 bg-default-50/50 p-2 dark:bg-default-50/5"
            style={{
              minHeight: shownMembers.length > 0 ? totalHeight : undefined,
            }}
          >
            {listBookings.length === 0 ? (
              <p className="px-2 py-6 text-center text-xs text-default-500">
                Everything is assigned.
              </p>
            ) : (
              listBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-lg border border-dashed border-slate-400 bg-content1 p-2 shadow-sm"
                >
                  <button
                    aria-label={`${rangeLabel(booking)}, ${booking.customer_name}, ${booking.service}, ${booking.status}, no practitioner`}
                    className="block w-full rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    type="button"
                    onClick={() => onBookingClick(booking)}
                  >
                    <span className="block text-[11px] font-semibold tabular-nums">
                      {rangeLabel(booking)}
                    </span>
                    <span className="block truncate text-xs font-semibold">
                      {booking.customer_name}
                    </span>
                    <span className="block truncate text-[11px] text-default-500">
                      {booking.service}
                    </span>
                  </button>
                  <label className="mt-2 block text-[11px] font-medium text-default-600">
                    Assign to
                    <select
                      className="mt-1 block min-h-[44px] w-full rounded-md border border-default-300 bg-content1 px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      defaultValue=""
                      onChange={(event) => {
                        if (event.target.value) {
                          onAssign(booking, event.target.value);
                        }
                        event.target.value = "";
                      }}
                    >
                      <option value="">Choose…</option>
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ))
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}

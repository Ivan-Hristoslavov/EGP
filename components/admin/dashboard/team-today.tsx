"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import { AlertTriangle, CalendarOff, ChevronRight } from "lucide-react";

import { PractitionerAvatar } from "@/components/admin/calendar/practitioner-avatar";
import {
  colorForMember,
  summarizeTeamDay,
  type CalendarMember,
} from "@/lib/calendar-practitioners";

export interface DashboardTeamTodayProps {
  members: CalendarMember[];
  bookings: Array<{
    team_member_id?: string | null;
    time: string;
    status?: string | null;
  }>;
  /** YYYY-MM-DD */
  date: string;
  /** Minutes since midnight when `date` is today, otherwise null. */
  nowMinutes: number | null;
  /** Heading, e.g. "Today" or "Thursday 15 October". */
  dayLabel: string;
  onOpenCalendar: () => void;
}

export function DashboardTeamToday({
  members,
  bookings,
  date,
  nowMinutes,
  dayLabel,
  onOpenCalendar,
}: DashboardTeamTodayProps) {
  const { rows, unassigned } = summarizeTeamDay(
    members,
    bookings,
    date,
    nowMinutes,
  );

  return (
    <Card className="h-full border border-divider shadow-sm">
      <CardHeader className="flex flex-col items-start gap-0.5 border-b border-divider px-4 py-4 sm:px-6">
        <p className="text-[11px] font-medium uppercase tracking-wide text-default-500">
          {dayLabel}
        </p>
        <h2 className="text-lg font-semibold sm:text-xl">The team</h2>
      </CardHeader>
      <CardBody className="gap-2 p-3 sm:p-4">
        {rows.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-default-500">
            No active team members yet. Add them on the Team page.
          </p>
        ) : (
          rows.map(({ member, count, nextTime, isOff }) => (
            <button
              key={member.id}
              className="flex min-h-[64px] w-full items-center gap-3 rounded-xl border border-default-200/70 px-3 py-2 text-left transition-colors hover:bg-default-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              type="button"
              onClick={onOpenCalendar}
            >
              <PractitionerAvatar
                color={colorForMember(members, member.id)}
                imageUrl={member.image_url}
                name={member.name}
                size="md"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {member.name}
                </span>
                <span className="block truncate text-xs text-default-500">
                  {isOff ? (
                    <span className="inline-flex items-center gap-1 font-medium text-warning-700 dark:text-warning-300">
                      <CalendarOff aria-hidden className="h-3 w-3" />
                      Day off
                    </span>
                  ) : count === 0 ? (
                    "Free all day"
                  ) : nextTime ? (
                    `Next at ${nextTime}`
                  ) : (
                    "All done for today"
                  )}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-right">
                <span className="text-xl font-bold tabular-nums text-foreground">
                  {count}
                </span>
                <span className="text-[11px] text-default-500">
                  {count === 1 ? "booking" : "bookings"}
                </span>
                <ChevronRight
                  aria-hidden
                  className="h-4 w-4 text-default-400"
                />
              </span>
            </button>
          ))
        )}

        {unassigned > 0 ? (
          <button
            className="flex min-h-[44px] items-center gap-2 rounded-xl border border-dashed border-warning-400 bg-warning-50 px-3 py-2 text-left text-xs font-medium text-warning-800 hover:bg-warning-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-warning-500/50 dark:bg-warning-500/10 dark:text-warning-200"
            type="button"
            onClick={onOpenCalendar}
          >
            <AlertTriangle aria-hidden className="h-4 w-4 shrink-0" />
            {unassigned} {unassigned === 1 ? "booking has" : "bookings have"} no
            practitioner. Assign {unassigned === 1 ? "it" : "them"} in the
            calendar.
          </button>
        ) : null}
      </CardBody>
    </Card>
  );
}

"use client";

import type { ReactNode } from "react";

import clsx from "clsx";

import { PractitionerAvatar } from "./practitioner-avatar";

import {
  FILTER_ALL,
  FILTER_UNASSIGNED,
  colorForMember,
  type CalendarMember,
  type PractitionerFilter as FilterValue,
} from "@/lib/calendar-practitioners";

export interface PractitionerFilterProps {
  members: CalendarMember[];
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  /** Bookings per practitioner in the visible period. */
  counts: { byMember: Record<string, number>; unassigned: number };
  total: number;
}

function Chip({
  active,
  label,
  count,
  avatar,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  avatar?: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={clsx(
        "inline-flex min-h-[44px] items-center gap-2 rounded-full border pr-4 text-sm font-semibold transition-colors",
        avatar ? "pl-2" : "pl-4",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-default-300 bg-content1 text-foreground hover:bg-default-100",
      )}
      type="button"
      onClick={onClick}
    >
      {avatar}
      <span>{label}</span>
      <span
        className={clsx(
          "rounded-full px-1.5 text-xs tabular-nums",
          active ? "bg-white/25" : "bg-default-100 text-default-600",
        )}
      >
        {count}
      </span>
    </button>
  );
}

export function PractitionerFilter({
  members,
  value,
  onChange,
  counts,
  total,
}: PractitionerFilterProps) {
  return (
    <div
      aria-label="Filter calendar by practitioner"
      className="flex flex-wrap items-center gap-2"
      role="group"
    >
      <Chip
        active={value === FILTER_ALL}
        count={total}
        label="All"
        onClick={() => onChange(FILTER_ALL)}
      />
      {members.map((member) => (
        <Chip
          key={member.id}
          active={value === member.id}
          avatar={
            <PractitionerAvatar
              color={colorForMember(members, member.id)}
              imageUrl={member.image_url}
              name={member.name}
            />
          }
          count={counts.byMember[member.id] ?? 0}
          label={member.name}
          onClick={() => onChange(member.id)}
        />
      ))}
      {counts.unassigned > 0 || value === FILTER_UNASSIGNED ? (
        <Chip
          active={value === FILTER_UNASSIGNED}
          avatar={<PractitionerAvatar name="Unassigned" />}
          count={counts.unassigned}
          label="Unassigned"
          onClick={() => onChange(FILTER_UNASSIGNED)}
        />
      ) : null}
    </div>
  );
}

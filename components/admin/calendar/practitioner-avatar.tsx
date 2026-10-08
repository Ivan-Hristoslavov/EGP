"use client";

import clsx from "clsx";
import { useState } from "react";

import {
  UNASSIGNED_COLOR,
  initialsOf,
  type PractitionerColor,
} from "@/lib/calendar-practitioners";

const SIZES = {
  xs: "h-5 w-5 text-[9px]",
  sm: "h-7 w-7 text-[11px]",
  md: "h-10 w-10 text-sm",
} as const;

export interface PractitionerAvatarProps {
  name: string;
  imageUrl?: string | null;
  /** Omit for an unassigned (dashed "?") avatar. */
  color?: PractitionerColor;
  size?: keyof typeof SIZES;
  className?: string;
}

/**
 * The practitioner's photo with a coloured ring; falls back to initials when
 * there is no photo (or it fails to load). Decorative: the name is always
 * written next to it.
 */
export function PractitionerAvatar({
  name,
  imageUrl,
  color,
  size = "sm",
  className,
}: PractitionerAvatarProps) {
  const [failed, setFailed] = useState(false);
  const palette = color ?? UNASSIGNED_COLOR;

  if (!color) {
    return (
      <span
        aria-hidden="true"
        className={clsx(
          "inline-flex shrink-0 items-center justify-center rounded-full border border-dashed border-slate-400 font-bold text-slate-600 dark:text-slate-300",
          SIZES[size],
          className,
        )}
      >
        ?
      </span>
    );
  }

  if (imageUrl && !failed) {
    return (
      <img
        alt=""
        aria-hidden="true"
        className={clsx(
          "shrink-0 rounded-full object-cover object-top ring-2 ring-offset-1 ring-offset-background",
          palette.ring,
          SIZES[size],
          className,
        )}
        loading="lazy"
        src={imageUrl}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={clsx(
        "inline-flex shrink-0 items-center justify-center rounded-full font-bold",
        palette.badge,
        SIZES[size],
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}

"use client";

import { Avatar, Button, Card, CardBody, CardHeader, Chip, Progress, Skeleton, Spinner } from "@heroui/react";
import type { UpcomingBookingRow } from "./analytics-types";

import { useEffect, useMemo, useState } from "react";
import { formatDistanceStrict } from "date-fns";
import { Calendar, Clock, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";

function parseStartMs(dateStr: string, timeStr: string): number {
  const [y, mo, d] = dateStr.split("-").map((x) => parseInt(x, 10));
  const t = (timeStr || "").trim();
  const m24 = t.match(/^(\d{1,2}):(\d{2})$/);

  if (m24 && !Number.isNaN(y)) {
    return new Date(
      y,
      mo - 1,
      d,
      parseInt(m24[1], 10),
      parseInt(m24[2], 10),
      0,
      0,
    ).getTime();
  }
  const m12 = t.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);

  if (m12 && !Number.isNaN(y)) {
    let h = parseInt(m12[1], 10);
    const min = parseInt(m12[2], 10);
    const ap = m12[3]?.toLowerCase();

    if (ap === "pm" && h < 12) h += 12;
    if (ap === "am" && h === 12) h = 0;

    return new Date(y, mo - 1, d, h, min, 0, 0).getTime();
  }
  if (!Number.isNaN(y)) return new Date(y, mo - 1, d, 9, 0, 0, 0).getTime();

  return NaN;
}

function initialsFromBooking(b: UpcomingBookingRow) {
  const c = b.customers;

  if (c?.first_name || c?.last_name) {
    const a = (c.first_name || "").charAt(0);
    const x = (c.last_name || "").charAt(0);

    return (
      `${a}${x}`.toUpperCase() || b.customer_name.slice(0, 2).toUpperCase()
    );
  }

  return b.customer_name
    .split(/\s+/)
    .map((p) => p.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatCountdown(ms: number) {
  if (ms <= 0) return "Starting now";
  const sec = Math.floor(ms / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);

  const parts: string[] = [];

  if (d) parts.push(`${d}d`);
  if (h || d) parts.push(`${h}h`);
  parts.push(`${m}m`);

  return `Next booking in ${parts.join(" ")}`;
}

/** Loading placeholder matching the “Front desk focus” hero layout. */
export function DashboardNextBookingHeroSkeleton() {
  return (
    <Card className="overflow-hidden border border-divider shadow-sm">
      <CardHeader className="flex flex-col gap-3 border-b border-divider/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-3 w-32 rounded-full" />
          <Skeleton className="h-6 w-44 max-w-full rounded-md sm:h-7 sm:w-52" />
        </div>
        <div
          aria-busy="true"
          aria-live="polite"
          className="flex shrink-0 items-center gap-2 rounded-full border border-divider bg-default-50/60 px-3 py-2 dark:bg-default-100/10"
          role="status"
        >
          <Spinner color="primary" size="sm" />
          <span className="text-xs font-medium text-default-600 dark:text-default-400">
            Loading…
          </span>
        </div>
      </CardHeader>
      <CardBody className="flex flex-col gap-5 px-4 pb-6 pt-4 sm:flex-row sm:items-center sm:px-6">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-6 w-48 max-w-full rounded-md" />
            <Skeleton className="h-4 w-full max-w-md rounded-md" />
            <Skeleton className="h-3 w-56 max-w-full rounded-md" />
            <Skeleton className="h-3 w-40 max-w-full rounded-md" />
          </div>
        </div>
        <div className="flex w-full min-w-0 flex-col gap-3 sm:ml-auto sm:w-auto sm:shrink-0">
          <Skeleton className="h-3 w-full rounded-full sm:min-w-[280px]" />
          <div className="flex flex-nowrap items-center gap-2">
            <Skeleton className="h-8 w-[5.5rem] shrink-0 rounded-lg" />
            <Skeleton className="h-8 w-[5.5rem] shrink-0 rounded-lg" />
            <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
            <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export function DashboardNextBookingHero(props: {
  booking: UpcomingBookingRow | null;
  onOpenBookings: () => void;
  onOpenCalendar: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(id);
  }, []);

  const startMs = useMemo(() => {
    if (!props.booking) return NaN;

    return parseStartMs(props.booking.date, props.booking.time);
  }, [props.booking]);

  if (!props.booking || Number.isNaN(startMs)) {
    return (
      <Card className="border border-dashed border-default-200 bg-default-50/40 dark:border-default-100/20 dark:bg-default-50/5">
        <CardBody className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <Calendar className="h-10 w-10 text-default-300" />
          <div>
            <p className="text-sm font-medium text-default-700 dark:text-default-200">
              No upcoming bookings
            </p>
            <p className="mt-1 text-xs text-default-500">
              When the next appointment is scheduled, it will appear here with a
              live countdown.
            </p>
          </div>
          <Button
            color="primary"
            size="sm"
            variant="flat"
            onPress={props.onOpenBookings}
          >
            Manage bookings
          </Button>
        </CardBody>
      </Card>
    );
  }

  const ms = startMs - now;
  const within24h = ms > 0 && ms < 24 * 60 * 60 * 1000;
  const within2h = ms > 0 && ms < 2 * 60 * 60 * 1000;
  const progress =
    ms <= 0
      ? 100
      : Math.max(0, Math.min(100, 100 - (ms / (24 * 60 * 60 * 1000)) * 100));

  const tel = props.booking.customer_phone?.replace(/\s+/g, "") || "";
  const mail =
    props.booking.customer_email || props.booking.customers?.email || "";

  return (
    <motion.div
      animate={
        within2h
          ? { boxShadow: "0 0 0 1px hsl(var(--heroui-primary-300) / 0.45)" }
          : { boxShadow: "0 0 0 1px transparent" }
      }
      transition={{
        duration: 1.6,
        repeat: within2h ? Infinity : 0,
        repeatType: "reverse",
      }}
    >
      <Card
        className={`relative overflow-hidden border shadow-sm ${
          within24h
            ? "border-primary-200/80 ring-1 ring-primary-200/50 dark:border-primary-500/25 dark:ring-primary-500/20"
            : "border-divider"
        }`}
      >
        {within24h ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-500/[0.06] via-transparent to-transparent"
          />
        ) : null}
        <CardHeader className="relative z-[1] flex flex-col gap-1 border-b border-divider/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-default-500">
              Next appointment
            </p>
            <h2 className="text-lg font-semibold sm:text-xl">
              Front desk focus
            </h2>
          </div>
          <Chip color="primary" size="sm" variant="flat">
            {formatCountdown(ms)}
          </Chip>
        </CardHeader>
        <CardBody className="relative z-[1] flex flex-col gap-5 px-4 pb-6 pt-4 sm:flex-row sm:items-center sm:px-6">
          <div className="flex flex-1 items-start gap-4">
            <Avatar
              className="h-14 w-14 text-base"
              color="primary"
              name={initialsFromBooking(props.booking)}
            />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-lg font-semibold leading-tight">
                {props.booking.customer_name}
              </p>
              <p className="truncate text-sm text-default-500">
                {props.booking.service}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-default-500">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(props.booking.date).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {props.booking.time}
                </span>
              </div>
              <p className="text-xs text-default-400">
                {ms > 0
                  ? `${formatDistanceStrict(new Date(startMs), new Date(now), { addSuffix: true })}`
                  : "This appointment time has passed — confirm status in bookings."}
              </p>
            </div>
          </div>
          <div className="flex w-full min-w-0 flex-col gap-3 sm:ml-auto sm:w-auto sm:shrink-0">
            <Progress
              aria-label="Progress toward appointment"
              className="w-full sm:min-w-[280px]"
              color="primary"
              size="md"
              value={progress}
            />
            <div
              aria-label="Booking shortcuts"
              className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-0.5 sm:overflow-visible"
              role="group"
            >
              <Button
                className="shrink-0"
                size="sm"
                variant="flat"
                onPress={props.onOpenBookings}
              >
                Bookings
              </Button>
              <Button
                className="shrink-0"
                size="sm"
                variant="flat"
                onPress={props.onOpenCalendar}
              >
                Calendar
              </Button>
              {tel ? (
                <Button
                  isIconOnly
                  aria-label="Call client"
                  as="a"
                  className="shrink-0"
                  href={`tel:${tel}`}
                  size="sm"
                  variant="bordered"
                >
                  <Phone className="h-4 w-4" />
                </Button>
              ) : null}
              {mail ? (
                <Button
                  isIconOnly
                  aria-label="Email client"
                  as="a"
                  className="shrink-0"
                  href={`mailto:${mail}`}
                  size="sm"
                  variant="bordered"
                >
                  <Mail className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

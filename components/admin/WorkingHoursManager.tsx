"use client";

import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { Calendar, Clock, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";

import { useToast } from "@/components/Toast";
import {
  parseBookingBlackoutRules,
  type BookingBlackoutRule,
} from "@/lib/booking-blackout-rules";
import { parseBookingClosedWeekdays } from "@/lib/booking-closed-weekdays";

interface WorkingHour {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_working_day: boolean;
  buffer_minutes: number;
  max_appointments: number;
}

const DAYS = [
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
  { value: 0, label: "Sunday", short: "Sun" },
];

const DAY_ORDER = DAYS.map((day) => day.value);

const sortWorkingHours = (hours: WorkingHour[]) =>
  [...hours].sort(
    (a, b) =>
      DAY_ORDER.indexOf(a.day_of_week) - DAY_ORDER.indexOf(b.day_of_week),
  );

const createDefaultHour = (dayValue: number): WorkingHour => ({
  day_of_week: dayValue,
  start_time: dayValue === 0 || dayValue === 6 ? "10:00" : "09:00",
  end_time: dayValue === 0 || dayValue === 6 ? "16:00" : "18:00",
  is_working_day: dayValue !== 0,
  buffer_minutes: 15,
  max_appointments: dayValue === 6 ? 8 : dayValue === 0 ? 0 : 12,
});

const mergeWithDefaults = (hours: WorkingHour[]) =>
  sortWorkingHours(
    DAYS.map((day) => {
      const base = createDefaultHour(day.value);
      const existing = hours.find((hour) => hour.day_of_week === day.value);

      return existing ? { ...base, ...existing } : base;
    }),
  );

export type WorkingHoursManagerHandle = {
  /** Saves weekly hours, closed weekdays, and scheduled blackouts (same as Save in standalone view). */
  saveSchedule: () => Promise<void>;
  /** Regenerates stored time slots for ~30 days from today. */
  generateSlots: () => Promise<void>;
};

type WorkingHoursManagerProps = {
  /** When true, omits page hero and uses tighter cards (e.g. calendar schedule panel). */
  embedded?: boolean;
  /** When embedded, hide the top Generate/Save bar (e.g. parent renders actions in a modal footer). */
  hideEmbeddedToolbar?: boolean;
  /** Fires when initial load / refresh loading state changes (for disabling parent footer actions). */
  onEmbeddedLoadingChange?: (isLoading: boolean) => void;
};

function newBlackoutRuleClientId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `b-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function withStableBlackoutIds(rules: BookingBlackoutRule[]): BookingBlackoutRule[] {
  return rules.map((r) => ({
    ...r,
    id: r.id && r.id.length > 0 ? r.id : newBlackoutRuleClientId(),
  }));
}

const WorkingHoursManager = forwardRef<
  WorkingHoursManagerHandle,
  WorkingHoursManagerProps
>(function WorkingHoursManager(
  { embedded = false, hideEmbeddedToolbar = false, onEmbeddedLoadingChange },
  ref,
) {
  const { showSuccess, showError } = useToast();
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [bookingClosedWeekdays, setBookingClosedWeekdays] = useState<number[]>(
    [],
  );
  const [bookingBlackoutRules, setBookingBlackoutRules] = useState<
    BookingBlackoutRule[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingSlots, setGeneratingSlots] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    onEmbeddedLoadingChange?.(loading);
  }, [loading, onEmbeddedLoadingChange]);

  const loadData = async (options?: { showToast?: boolean }) => {
    let succeeded = false;

    try {
      setLoading(true);

      const hoursResponse = await fetch("/api/admin/working-hours");
      const hoursData = await hoursResponse.json();

      if (!hoursResponse.ok) {
        throw new Error(hoursData.error || "Failed to load working hours");
      }

      const normalizedHours = hoursData.workingHours
        ? mergeWithDefaults(hoursData.workingHours)
        : mergeWithDefaults([]);

      setWorkingHours(normalizedHours);
      setBookingClosedWeekdays(
        parseBookingClosedWeekdays(hoursData.bookingClosedWeekdays),
      );
      setBookingBlackoutRules(
        withStableBlackoutIds(
          parseBookingBlackoutRules(hoursData.bookingBlackoutRules),
        ),
      );
      succeeded = true;
    } catch (error) {
      console.error("Error loading data:", error);
      showError(
        "Couldn't load schedule",
        error instanceof Error
          ? error.message
          : "Something went wrong while loading your data.",
      );
    } finally {
      setLoading(false);

      if (succeeded && options?.showToast) {
        showSuccess("Schedule refreshed", "Working hours are up to date.");
      }
    }
  };

  const handleWorkingHourChange = (
    dayOfWeek: number,
    field: keyof WorkingHour,
    value: unknown,
  ) => {
    setWorkingHours((prev) =>
      sortWorkingHours(
        prev.map((hour) => {
          if (hour.day_of_week !== dayOfWeek) return hour;

          let updated: WorkingHour = { ...hour, [field]: value };

          if (field === "is_working_day") {
            const valueBool = Boolean(value);

            if (valueBool) {
              const defaults = createDefaultHour(dayOfWeek);
              const fallbackMax = defaults.max_appointments || 8;

              updated = {
                ...updated,
                start_time: updated.start_time || defaults.start_time,
                end_time: updated.end_time || defaults.end_time,
                max_appointments:
                  updated.max_appointments && updated.max_appointments > 0
                    ? updated.max_appointments
                    : fallbackMax,
              };
            } else {
              updated = {
                ...updated,
                max_appointments: 0,
              };
            }
          }

          return updated;
        }),
      ),
    );
  };

  const toggleBookingClosedWeekday = (dayValue: number) => {
    setBookingClosedWeekdays((prev) => {
      if (prev.includes(dayValue)) {
        return prev.filter((d) => d !== dayValue);
      }

      return [...prev, dayValue].sort((a, b) => a - b);
    });
  };

  const addBookingBlackoutRule = () => {
    const today = new Date().toISOString().split("T")[0];

    setBookingBlackoutRules((prev) => [
      ...prev,
      {
        id: newBlackoutRuleClientId(),
        start_date: today,
        end_date: today,
      },
    ]);
  };

  const removeBookingBlackoutRule = (index: number) => {
    setBookingBlackoutRules((prev) => prev.filter((_, i) => i !== index));
  };

  const updateBookingBlackoutRule = (
    index: number,
    patch: Partial<Pick<BookingBlackoutRule, "start_date" | "end_date">>,
  ) => {
    setBookingBlackoutRules((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
  };

  const setBlackoutRuleAllDays = (index: number) => {
    setBookingBlackoutRules((prev) =>
      prev.map((r, i) =>
        i === index ? { ...r, weekdays: undefined } : r,
      ),
    );
  };

  const toggleBlackoutRuleWeekday = (index: number, dayValue: number) => {
    setBookingBlackoutRules((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;

        const current = r.weekdays ?? [];
        const has = current.includes(dayValue);
        const next = has
          ? current.filter((d) => d !== dayValue)
          : [...current, dayValue].sort((a, b) => a - b);

        if (next.length === 0) {
          return { ...r, weekdays: undefined };
        }

        return { ...r, weekdays: next };
      }),
    );
  };

  const saveWorkingHours = useCallback(async () => {
    try {
      setSaving(true);

      const response = await fetch("/api/admin/working-hours", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workingHours,
          bookingClosedWeekdays,
          bookingBlackoutRules,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to save working hours");
      }

      if (result.workingHours) {
        setWorkingHours(mergeWithDefaults(result.workingHours));
      }

      if (result.bookingClosedWeekdays !== undefined) {
        setBookingClosedWeekdays(
          parseBookingClosedWeekdays(result.bookingClosedWeekdays),
        );
      }

      if (result.bookingBlackoutRules !== undefined) {
        setBookingBlackoutRules(
          withStableBlackoutIds(
            parseBookingBlackoutRules(result.bookingBlackoutRules),
          ),
        );
      }

      showSuccess(
        "Working hours saved",
        "Weekly hours, recurring closed weekdays, and scheduled blackouts are updated. Regenerate slots if you rely on generated availability.",
      );
    } catch (error) {
      console.error("Error saving working hours:", error);
      showError(
        "Save failed",
        error instanceof Error
          ? error.message
          : "Unable to save your working hours.",
      );
    } finally {
      setSaving(false);
    }
  }, [
    workingHours,
    bookingClosedWeekdays,
    bookingBlackoutRules,
    showSuccess,
    showError,
  ]);

  const generateTimeSlots = useCallback(async () => {
    try {
      setGeneratingSlots(true);
      const startDate = new Date();
      const endDate = new Date();

      endDate.setDate(endDate.getDate() + 30);

      const response = await fetch("/api/admin/time-slots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to generate time slots");
      }

      const generatedCount = Array.isArray(result.summaries)
        ? result.summaries.filter(
            (summary: { skipped?: boolean; generated?: number }) =>
              !summary.skipped && (summary.generated ?? 0) > 0,
          ).length
        : 0;

      showSuccess(
        "Time slots generated",
        generatedCount > 0
          ? `Availability created for ${generatedCount} day${generatedCount === 1 ? "" : "s"}.`
          : "Availability has been recalculated with no new open days.",
      );
    } catch (error) {
      console.error("Error generating time slots:", error);
      showError(
        "Generation failed",
        error instanceof Error
          ? error.message
          : "Unable to generate time slots right now.",
      );
    } finally {
      setGeneratingSlots(false);
    }
  }, [showSuccess, showError]);

  useImperativeHandle(
    ref,
    () => ({
      saveSchedule: () => saveWorkingHours(),
      generateSlots: () => generateTimeSlots(),
    }),
    [saveWorkingHours, generateTimeSlots],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading working hours...</span>
      </div>
    );
  }

  const todayDow = new Date().getDay();
  const gap = embedded ? "gap-3" : "gap-4";
  const outerSpace = embedded ? "space-y-3" : "space-y-8";
  const inputFieldClass = embedded
    ? "w-full rounded-lg border-2 border-[#e4d9c8] dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white focus:border-[#c9c1b0] focus:ring-2 focus:ring-[#c9c1b0]/40 transition-all h-10"
    : "w-full rounded-xl border-2 border-[#e4d9c8] dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-base font-semibold text-gray-900 dark:text-white focus:border-[#c9c1b0] focus:ring-2 focus:ring-[#c9c1b0]/40 transition-all h-12";

  const actionButtons = (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        className="bg-gradient-to-r from-[#D4C9BC] to-[#E6DDD1] text-[#3f3a31] hover:from-[#CFC4B6] hover:to-[#DDD5CA] font-semibold"
        isLoading={generatingSlots}
        size={embedded ? "sm" : "md"}
        startContent={<Calendar className="h-4 w-4" />}
        onPress={generateTimeSlots}
      >
        Generate slots
      </Button>
      <Button
        className="bg-gradient-to-r from-[#CFC4B6] to-[#E6DDD1] text-[#3f3a31] hover:from-[#B8A99A] hover:to-[#D4C9BC] font-semibold"
        isLoading={saving}
        size={embedded ? "sm" : "md"}
        startContent={<Save className="h-4 w-4" />}
        onPress={saveWorkingHours}
      >
        Save
      </Button>
    </div>
  );

  return (
    <div className={`flex min-h-0 flex-col ${outerSpace}`}>
      {embedded && !hideEmbeddedToolbar ? (
        <div className="sticky top-0 z-10 -mx-1 flex flex-wrap items-center justify-end gap-2 border-b border-divider bg-content1 px-1 pb-3 pt-0">
          {actionButtons}
        </div>
      ) : !embedded ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#f5f1e9] p-2 dark:bg-gray-900/50">
              <Clock className="h-6 w-6 text-[#9d9585] dark:text-[#c9c1b0]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Working hours
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Clinic hours and appointment availability
              </p>
            </div>
          </div>
          {actionButtons}
        </div>
      ) : null}

      <Card className="border border-divider shadow-sm">
        <CardHeader className="flex flex-col items-stretch gap-2 pb-2 pt-4">
          <h3 className="text-sm font-semibold text-foreground">
            Online booking — closed weekdays
          </h3>
          <div className="space-y-2 text-xs leading-relaxed text-default-600 dark:text-default-400">
            <p>
              Tap a day to turn <strong>online booking</strong> off for that
              weekday <strong>every week</strong> (not just once). Each marked day
              is one weekday closed until you turn it back on.
            </p>
            <ul className="list-inside list-disc space-y-1 pl-0.5 marker:text-emerald-600 dark:marker:text-emerald-400">
              <li>
                Example: mark <strong>Sun</strong> → every Sunday stays hidden
                from the public book flow.
              </li>
              <li>
                Example: mark <strong>Sun</strong> and <strong>Sat</strong> →
                both weekend days closed, every week.
              </li>
            </ul>
            <p className="text-default-500">
              For a <strong>single week</strong> or <strong>specific dates</strong>{" "}
              (e.g. only the Monday three weeks from now), use{" "}
              <strong>Scheduled blackouts</strong> below. After changing these
              toggles, tap <strong>Generate slots</strong> again if you use
              generated availability.
            </p>
          </div>
        </CardHeader>
        <CardBody className="gap-2 pt-0">
          <div className="flex flex-wrap gap-1.5">
            {DAYS.map((day) => {
              const isClosed = bookingClosedWeekdays.includes(day.value);

              return (
                <Button
                  key={day.value}
                  color={isClosed ? "danger" : "default"}
                  size="sm"
                  variant={isClosed ? "solid" : "bordered"}
                  onPress={() => toggleBookingClosedWeekday(day.value)}
                >
                  {embedded ? day.short : day.label}
                  {isClosed ? (embedded ? " ✕" : " (closed)") : ""}
                </Button>
              );
            })}
          </div>
        </CardBody>
      </Card>

      <Card className="border border-divider shadow-sm">
        <CardHeader className="flex flex-col items-stretch gap-2 pb-2 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground">
              Scheduled blackouts
            </h3>
            <div className="space-y-1.5 text-xs leading-relaxed text-default-600 dark:text-default-400">
              <p>
                Pick a <strong>start</strong> and <strong>end date</strong>, then
                either every day in that range or only certain weekdays.
              </p>
              <ul className="list-inside list-disc space-y-1 pl-0.5 marker:text-emerald-600 dark:marker:text-emerald-400">
                <li>
                  <strong>All days</strong> (green button): the whole range is
                  off — e.g. 1–7 Jun closes seven calendar days for booking.
                </li>
                <li>
                  <strong>Mon, Wed…</strong>: only those weekdays inside the
                  range — e.g. 1–30 Jun + Mon closes four Mondays in June, not
                  Tuesdays.
                </li>
              </ul>
            </div>
          </div>
          <Button
            className="shrink-0 font-semibold"
            size="sm"
            startContent={<Plus className="h-4 w-4" />}
            variant="bordered"
            onPress={addBookingBlackoutRule}
          >
            Add rule
          </Button>
        </CardHeader>
        <CardBody className="gap-3 pt-0">
          {bookingBlackoutRules.length === 0 ? (
            <p className="rounded-md border border-dashed border-default-200 bg-default-50 px-3 py-2 text-center text-xs text-default-500 dark:border-default-100/20 dark:bg-default-50/5">
              No scheduled blackouts. Public booking follows weekly hours and
              recurring closed weekdays only.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {bookingBlackoutRules.map((rule, index) => {
                const key = rule.id ?? `rule-${index}`;
                const isAllDays =
                  rule.weekdays == null || rule.weekdays.length === 0;

                return (
                  <li
                    key={key}
                    className="rounded-lg border border-divider bg-content1/40 p-3 dark:bg-content1/20"
                  >
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-default-500">
                        Blackout {index + 1}
                      </span>
                      <Button
                        aria-label="Remove blackout rule"
                        color="danger"
                        size="sm"
                        variant="light"
                        onPress={() => removeBookingBlackoutRule(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="flex flex-col gap-1">
                        <label
                          className="text-[10px] font-bold uppercase tracking-wide text-default-500"
                          htmlFor={`bb-start-${key}`}
                        >
                          Start date
                        </label>
                        <input
                          className={inputFieldClass}
                          id={`bb-start-${key}`}
                          type="date"
                          value={rule.start_date}
                          onChange={(e) =>
                            updateBookingBlackoutRule(index, {
                              start_date: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label
                          className="text-[10px] font-bold uppercase tracking-wide text-default-500"
                          htmlFor={`bb-end-${key}`}
                        >
                          End date
                        </label>
                        <input
                          className={inputFieldClass}
                          id={`bb-end-${key}`}
                          type="date"
                          value={rule.end_date}
                          onChange={(e) =>
                            updateBookingBlackoutRule(index, {
                              end_date: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-default-500">
                        Apply to
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          className={
                            isAllDays
                              ? "min-h-8 min-w-0 rounded-lg border-2 border-emerald-600 bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm outline-none ring-2 ring-emerald-400/80 transition-colors hover:bg-emerald-700 dark:border-emerald-500 dark:bg-emerald-600 dark:ring-emerald-400/50"
                              : "min-h-8 min-w-0 rounded-lg border-2 border-default-200 bg-transparent px-3 py-1.5 text-sm font-medium text-foreground outline-none transition-colors hover:border-default-300 hover:bg-default-50 focus-visible:ring-2 focus-visible:ring-emerald-500/60 dark:border-default-100 dark:hover:bg-default-50/10"
                          }
                          onClick={() => setBlackoutRuleAllDays(index)}
                        >
                          All days
                        </button>
                        {DAYS.map((day) => {
                          const active =
                            !isAllDays &&
                            (rule.weekdays?.includes(day.value) ?? false);
                          const isTodayWeekday = day.value === todayDow;

                          return (
                            <button
                              key={`${key}-wd-${day.value}`}
                              type="button"
                              className={
                                active
                                  ? isTodayWeekday
                                    ? "min-h-8 min-w-0 rounded-lg border-[3px] border-emerald-600 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-950 shadow-sm outline-none ring-2 ring-emerald-500 dark:border-emerald-400 dark:bg-emerald-950/60 dark:text-emerald-50 dark:ring-emerald-400/80"
                                    : "min-h-8 min-w-0 rounded-lg border-2 border-emerald-600 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-900 outline-none ring-2 ring-emerald-500/90 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-100 dark:ring-emerald-400/70"
                                  : "min-h-8 min-w-0 rounded-lg border-2 border-default-200 bg-transparent px-3 py-1.5 text-sm font-medium text-foreground outline-none transition-colors hover:border-default-300 hover:bg-default-50 focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500/50 dark:border-default-100 dark:hover:bg-default-50/10"
                              }
                              onClick={() =>
                                toggleBlackoutRuleWeekday(index, day.value)
                              }
                            >
                              {embedded ? day.short : day.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>

      <div
        className={`grid grid-cols-1 md:grid-cols-2 ${embedded ? "xl:grid-cols-3" : "xl:grid-cols-3"} ${gap}`}
      >
        {workingHours.map((hour) => {
          const dayInfo = DAYS.find((d) => d.value === hour.day_of_week);
          const isToday = hour.day_of_week === todayDow;
          const isClosed = !hour.is_working_day;
          const summaryText = isClosed
            ? "Closed"
            : `${hour.start_time} – ${hour.end_time}`;

          return (
            <Card
              key={hour.day_of_week}
              className={
                isToday
                  ? "border-2 border-emerald-400 shadow-md ring-2 ring-emerald-200/70 dark:border-emerald-500 dark:ring-emerald-800/50"
                  : "border border-divider shadow-sm"
              }
            >
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 pb-2 pt-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-1.5">
                    <span className="rounded bg-default-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-default-600 dark:bg-default-50/10">
                      {dayInfo?.short}
                    </span>
                    {isToday ? (
                      <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-100">
                        Today
                      </span>
                    ) : null}
                  </div>
                  <h4
                    className={
                      embedded
                        ? "text-base font-bold text-foreground"
                        : "text-lg font-bold text-foreground"
                    }
                  >
                    {dayInfo?.label ?? "Day"}
                  </h4>
                  <p className="text-xs font-medium text-default-500">
                    {summaryText}
                  </p>
                </div>
                <label
                  className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md border border-divider bg-default-100 px-2 py-1.5 dark:bg-default-50/10"
                  htmlFor={`wh-open-${hour.day_of_week}`}
                >
                  <input
                    checked={hour.is_working_day}
                    className="h-4 w-4 cursor-pointer rounded border-default-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 dark:text-emerald-500"
                    id={`wh-open-${hour.day_of_week}`}
                    type="checkbox"
                    onChange={(e) =>
                      handleWorkingHourChange(
                        hour.day_of_week,
                        "is_working_day",
                        e.target.checked,
                      )
                    }
                  />
                  <span className="text-xs font-semibold text-default-700">
                    {hour.is_working_day ? "Open" : "Closed"}
                  </span>
                </label>
              </CardHeader>
              <CardBody className="gap-3 pt-0">
                {isClosed ? (
                  <p className="rounded-md border border-dashed border-default-200 bg-default-50 px-3 py-2 text-center text-xs text-default-500 dark:border-default-100/20 dark:bg-default-50/5">
                    Toggle Open to set hours and capacity.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label
                          className="text-[10px] font-bold uppercase tracking-wide text-default-500"
                          htmlFor={`wh-start-${hour.day_of_week}`}
                        >
                          Opens
                        </label>
                        <input
                          className={inputFieldClass}
                          id={`wh-start-${hour.day_of_week}`}
                          type="time"
                          value={hour.start_time}
                          onChange={(e) =>
                            handleWorkingHourChange(
                              hour.day_of_week,
                              "start_time",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label
                          className="text-[10px] font-bold uppercase tracking-wide text-default-500"
                          htmlFor={`wh-end-${hour.day_of_week}`}
                        >
                          Closes
                        </label>
                        <input
                          className={inputFieldClass}
                          id={`wh-end-${hour.day_of_week}`}
                          type="time"
                          value={hour.end_time}
                          onChange={(e) =>
                            handleWorkingHourChange(
                              hour.day_of_week,
                              "end_time",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label
                          className="text-[10px] font-bold uppercase tracking-wide text-default-500"
                          htmlFor={`wh-buffer-${hour.day_of_week}`}
                        >
                          Buffer (min)
                        </label>
                        <input
                          className={inputFieldClass}
                          id={`wh-buffer-${hour.day_of_week}`}
                          max={60}
                          min={0}
                          type="number"
                          value={hour.buffer_minutes}
                          onChange={(e) =>
                            handleWorkingHourChange(
                              hour.day_of_week,
                              "buffer_minutes",
                              Math.max(0, parseInt(e.target.value, 10) || 0),
                            )
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label
                          className="text-[10px] font-bold uppercase tracking-wide text-default-500"
                          htmlFor={`wh-max-${hour.day_of_week}`}
                        >
                          Max appts
                        </label>
                        <input
                          className={inputFieldClass}
                          id={`wh-max-${hour.day_of_week}`}
                          max={50}
                          min={1}
                          type="number"
                          value={hour.max_appointments}
                          onChange={(e) =>
                            handleWorkingHourChange(
                              hour.day_of_week,
                              "max_appointments",
                              Math.max(1, parseInt(e.target.value, 10) || 1),
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
});

export default WorkingHoursManager;

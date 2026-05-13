"use client";

export function CalendarPageSkeleton() {
  return (
    <div aria-busy aria-label="Loading calendar" className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-default-200 dark:bg-default-100/20" />
          <div className="h-4 w-full max-w-md animate-pulse rounded bg-default-100 dark:bg-default-50/10" />
        </div>
        <div className="h-11 w-36 animate-pulse rounded-full bg-default-200 dark:bg-default-100/20" />
      </div>
      <div className="h-28 animate-pulse rounded-xl bg-default-100 dark:bg-default-50/10" />
      <div className="overflow-hidden rounded-xl border border-default-200/80 dark:border-default-100/15">
        <div className="h-20 animate-pulse bg-default-100/80 dark:bg-default-50/10" />
        <div className="grid grid-cols-7 gap-px bg-default-200/60 p-px dark:bg-default-100/15">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={`h-${i}`}
              className="h-8 animate-pulse bg-content1 dark:bg-content1"
            />
          ))}
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={`c-${i}`}
              className="min-h-[5rem] animate-pulse bg-content1 dark:bg-content1"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

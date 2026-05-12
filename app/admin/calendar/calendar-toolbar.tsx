"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import type { CalendarView } from "./use-calendar-bookings";

import { Search } from "lucide-react";

import { formLayout, inputClassNames } from "@/config/design-system";

const toolbarLabelClassNames = {
  ...inputClassNames,
  label: "text-xs font-medium text-default-600",
};

interface CalendarToolbarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  selectedDate: string;
  onSelectedDateChange: (value: string) => void;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

const viewOptions: { id: CalendarView; label: string }[] = [
  { id: "month", label: "Month" },
  { id: "week", label: "Week" },
  { id: "day", label: "Day" },
];

export function CalendarToolbar({
  searchTerm,
  onSearchTermChange,
  statusFilter,
  onStatusFilterChange,
  selectedDate,
  onSelectedDateChange,
  view,
  onViewChange,
}: CalendarToolbarProps) {
  return (
    <div className="sticky top-0 z-30 max-md:-mx-1 max-md:px-1 md:static md:z-auto">
      <div
        className={`rounded-xl border border-default-200/90 bg-content1/90 p-3 shadow-sm shadow-black/5 ring-1 ring-black/5 backdrop-blur-md supports-[backdrop-filter]:bg-content1/75 dark:border-default-100/20 dark:bg-content1/85 dark:shadow-black/20 dark:ring-white/10 sm:p-4 md:backdrop-blur-none md:supports-[backdrop-filter]:bg-content1 ${formLayout.sectionGap}`}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
          <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            <Input
              classNames={toolbarLabelClassNames}
              label="Search"
              placeholder="Name, service, email…"
              size="sm"
              startContent={
                <Search className="h-4 w-4 shrink-0 text-default-400" />
              }
              type="text"
              value={searchTerm}
              onValueChange={onSearchTermChange}
            />

            <Select
              classNames={toolbarLabelClassNames}
              label="Status"
              selectedKeys={[statusFilter]}
              size="sm"
              onSelectionChange={(keys) => {
                const v = Array.from(keys)[0] as string;

                onStatusFilterChange(v || "all");
              }}
            >
              <SelectItem key="all">All status</SelectItem>
              <SelectItem key="pending">Pending</SelectItem>
              <SelectItem key="scheduled">Scheduled</SelectItem>
              <SelectItem key="confirmed">Confirmed</SelectItem>
              <SelectItem key="completed">Completed</SelectItem>
              <SelectItem key="cancelled">Cancelled</SelectItem>
            </Select>

            <Input
              classNames={toolbarLabelClassNames}
              label="Date"
              size="sm"
              type="date"
              value={selectedDate}
              onChange={(e) => onSelectedDateChange(e.target.value)}
            />
          </div>

          <div className="flex w-full flex-col gap-3 border-t border-default-200/80 pt-4 sm:border-t-0 sm:pt-0 lg:w-auto lg:max-w-[min(100%,22rem)] lg:flex-shrink-0 lg:self-end">
            <div className="min-w-0 w-full">
              <span className="mb-1.5 block text-xs font-medium text-default-600">
                View
              </span>
              <div
                aria-label="Calendar view"
                className="flex rounded-full bg-default-100/90 p-1 ring-1 ring-default-200/60 dark:bg-default-50/10 dark:ring-default-100/15"
                role="group"
              >
                {viewOptions.map(({ id, label }) => {
                  const isActive = view === id;

                  return (
                    <Button
                      key={id}
                      className="min-h-10 flex-1 rounded-full px-2 text-xs font-semibold sm:min-h-11 sm:px-3 sm:text-sm"
                      color={isActive ? "primary" : "default"}
                      size="sm"
                      variant={isActive ? "solid" : "light"}
                      onPress={() => onViewChange(id)}
                    >
                      {label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

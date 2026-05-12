"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getLocalMonthDateRangeStrings,
  getLocalWeekRangeStringsMondayStart,
} from "@/lib/calendar-local-date";

export type CalendarView = "month" | "week" | "day";

interface UseCalendarBookingsParams {
  view: CalendarView;
  currentDate: Date;
  selectedDate: string;
}

export function useCalendarBookings({
  view,
  currentDate,
  selectedDate,
}: UseCalendarBookingsParams) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const range = useMemo(() => {
    if (view === "month") {
      return getLocalMonthDateRangeStrings(
        currentDate.getFullYear(),
        currentDate.getMonth(),
      );
    }
    if (view === "week") {
      return getLocalWeekRangeStringsMondayStart(currentDate);
    }

    return { start: selectedDate, end: selectedDate };
  }, [view, currentDate, selectedDate]);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: "1",
        limit: "3000",
        date_from: range.start,
        date_to: range.end,
      });

      const response = await fetch(`/api/bookings?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const normalizedBookings = (data.bookings || []).map((booking: any) => ({
          ...booking,
          date: booking.date ? booking.date.split("T")[0] : booking.date,
        }));

        setBookings(normalizedBookings);
      } else {
        console.error("Error loading bookings:", response.statusText);
        setBookings([]);
      }
    } catch (error) {
      console.error("Error loading bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [range.start, range.end]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") loadBookings();
    }

    document.addEventListener("visibilitychange", handleVisibility);

    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [loadBookings]);

  return {
    bookings,
    setBookings,
    loading,
    loadBookings,
    range,
  };
}

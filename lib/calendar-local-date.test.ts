import { describe, it, expect, vi, afterEach } from "vitest";

import {
  addDaysUtcYyyyMmDd,
  formatLocalYyyyMmDd,
  getLocalMonthDateRangeStrings,
  getLocalTodayYyyyMmDd,
  getLocalWeekRangeStringsMondayStart,
  parseYyyyMmDdUtcDayOfWeek,
} from "./calendar-local-date";

afterEach(() => vi.useRealTimers());

describe("local calendar helpers", () => {
  it("formats local date parts with zero padding", () => {
    expect(formatLocalYyyyMmDd(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(formatLocalYyyyMmDd(new Date(2026, 11, 25))).toBe("2026-12-25");
  });

  it("returns today's local date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 8, 15, 30));

    expect(getLocalTodayYyyyMmDd()).toBe("2026-10-08");
  });

  it("gives the first and last day of a month, including leap February", () => {
    expect(getLocalMonthDateRangeStrings(2026, 9)).toEqual({
      start: "2026-10-01",
      end: "2026-10-31",
    });
    expect(getLocalMonthDateRangeStrings(2028, 1)).toEqual({
      start: "2028-02-01",
      end: "2028-02-29",
    });
  });

  it("runs the week from Monday to Sunday", () => {
    // Thursday 8 Oct 2026
    expect(getLocalWeekRangeStringsMondayStart(new Date(2026, 9, 8))).toEqual({
      start: "2026-10-05",
      end: "2026-10-11",
    });
    // Sunday belongs to the week that started the previous Monday
    expect(getLocalWeekRangeStringsMondayStart(new Date(2026, 9, 11))).toEqual({
      start: "2026-10-05",
      end: "2026-10-11",
    });
    // Monday starts its own week
    expect(getLocalWeekRangeStringsMondayStart(new Date(2026, 9, 5))).toEqual({
      start: "2026-10-05",
      end: "2026-10-11",
    });
  });
});

describe("parseYyyyMmDdUtcDayOfWeek", () => {
  it("returns the day of week for a real date", () => {
    expect(parseYyyyMmDdUtcDayOfWeek("2026-10-08")).toBe(4); // Thursday
    expect(parseYyyyMmDdUtcDayOfWeek("2026-10-11")).toBe(0); // Sunday
  });

  it("rejects malformed or impossible dates", () => {
    expect(parseYyyyMmDdUtcDayOfWeek("2026-10")).toBeNull();
    expect(parseYyyyMmDdUtcDayOfWeek("abcd-ef-gh")).toBeNull();
    expect(parseYyyyMmDdUtcDayOfWeek("2026-13-01")).toBeNull();
    expect(parseYyyyMmDdUtcDayOfWeek("2026-00-10")).toBeNull();
    expect(parseYyyyMmDdUtcDayOfWeek("2026-10-32")).toBeNull();
    expect(parseYyyyMmDdUtcDayOfWeek("2026-02-30")).toBeNull();
  });
});

describe("addDaysUtcYyyyMmDd", () => {
  it("moves across month and year ends", () => {
    expect(addDaysUtcYyyyMmDd("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDaysUtcYyyyMmDd("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDaysUtcYyyyMmDd("2026-03-01", -1)).toBe("2026-02-28");
    expect(addDaysUtcYyyyMmDd("2026-10-08", 0)).toBe("2026-10-08");
  });

  it("returns null for text that is not a date", () => {
    expect(addDaysUtcYyyyMmDd("2026-10", 1)).toBeNull();
    expect(addDaysUtcYyyyMmDd("x-y-z", 1)).toBeNull();
  });
});

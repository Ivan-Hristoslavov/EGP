import { describe, it, expect } from "vitest";

import {
  PRACTITIONER_COLORS,
  UNASSIGNED_COLOR,
  computeDayWindow,
  countByPractitioner,
  filterByPractitioner,
  getPractitionerBadge,
  initialsOf,
  isMemberOffOnDate,
  layoutColumn,
  summarizeTeamDay,
  type CalendarMember,
} from "./calendar-practitioners";

const maria: CalendarMember = { id: "m1", name: "Maria Petrova" };
const elena: CalendarMember = { id: "e1", name: "Elena" };

describe("initialsOf", () => {
  it("uses first and last name initials", () => {
    expect(initialsOf("Maria Petrova")).toBe("MP");
    expect(initialsOf("Elena")).toBe("E");
    expect(initialsOf("  anna   maria   lee ")).toBe("AL");
    expect(initialsOf("")).toBe("?");
  });
});

describe("getPractitionerBadge", () => {
  it("keeps each practitioner's colour regardless of list order", () => {
    const a = getPractitionerBadge([maria, elena], "m1");
    const b = getPractitionerBadge([elena, maria], "m1");

    expect(a?.color).toBe(b?.color);
    expect(a?.color).not.toBe(
      getPractitionerBadge([maria, elena], "e1")?.color,
    );
    expect(PRACTITIONER_COLORS).toContain(a?.color);
  });

  it("carries the practitioner's photo", () => {
    const badge = getPractitionerBadge(
      [{ ...maria, image_url: "https://example.com/maria.jpg" }],
      "m1",
    );

    expect(badge?.imageUrl).toBe("https://example.com/maria.jpg");
    expect(getPractitionerBadge([maria], "m1")?.imageUrl).toBeNull();
  });

  it("returns null for an unassigned booking", () => {
    expect(getPractitionerBadge([maria, elena], null)).toBeNull();
    expect(getPractitionerBadge([maria, elena], undefined)).toBeNull();
  });

  it("describes a practitioner that is no longer active", () => {
    const badge = getPractitionerBadge([maria], "gone");

    expect(badge?.name).toBe("Former team member");
    expect(badge?.color).toBe(UNASSIGNED_COLOR);
  });
});

describe("filterByPractitioner / countByPractitioner", () => {
  const bookings = [
    { id: "1", team_member_id: "m1" },
    { id: "2", team_member_id: "e1" },
    { id: "3", team_member_id: null },
    { id: "4" },
    { id: "5", team_member_id: "m1" },
  ];

  it("filters", () => {
    expect(filterByPractitioner(bookings, "all")).toHaveLength(5);
    expect(filterByPractitioner(bookings, "m1").map((b) => b.id)).toEqual([
      "1",
      "5",
    ]);
    expect(
      filterByPractitioner(bookings, "unassigned").map((b) => b.id),
    ).toEqual(["3", "4"]);
  });

  it("counts", () => {
    expect(countByPractitioner(bookings)).toEqual({
      byMember: { m1: 2, e1: 1 },
      unassigned: 2,
    });
  });
});

describe("isMemberOffOnDate", () => {
  const member: CalendarMember = {
    id: "m1",
    name: "Maria",
    dayOffPeriods: [{ start_date: "2026-10-12", end_date: "2026-10-14" }],
  };

  it("is inclusive on both ends", () => {
    expect(isMemberOffOnDate(member, "2026-10-11")).toBe(false);
    expect(isMemberOffOnDate(member, "2026-10-12")).toBe(true);
    expect(isMemberOffOnDate(member, "2026-10-14")).toBe(true);
    expect(isMemberOffOnDate(member, "2026-10-15")).toBe(false);
  });

  it("is false without periods", () => {
    expect(isMemberOffOnDate({ id: "x", name: "X" }, "2026-10-12")).toBe(false);
  });
});

describe("layoutColumn", () => {
  const opts = { windowStartMinutes: 9 * 60, pxPerMinute: 1 };

  it("positions a booking by start and duration", () => {
    const [item] = layoutColumn(
      [{ time: "10:00:00", service_duration_minutes: 60 }],
      opts,
    );

    expect(item.top).toBe(60);
    expect(item.height).toBe(60);
    expect(item.lane).toBe(0);
    expect(item.lanes).toBe(1);
  });

  it("falls back to the legacy duration field and then 30 minutes", () => {
    const items = layoutColumn(
      [{ time: "09:00", duration: 45 }, { time: "12:00" }],
      opts,
    );

    expect(items[0].height).toBe(45);
    expect(items[1].height).toBe(30);
  });

  it("puts overlapping bookings side by side", () => {
    const items = layoutColumn(
      [
        { id: "a", time: "10:00", service_duration_minutes: 60 },
        { id: "b", time: "10:30", service_duration_minutes: 60 },
        { id: "c", time: "13:00", service_duration_minutes: 30 },
      ],
      opts,
    );
    const byId = Object.fromEntries(items.map((i) => [i.booking.id, i]));

    expect(byId.a.lanes).toBe(2);
    expect(byId.b.lanes).toBe(2);
    expect(byId.a.lane).not.toBe(byId.b.lane);
    expect(byId.c.lanes).toBe(1);
  });

  it("never returns a box shorter than the minimum height", () => {
    const [item] = layoutColumn(
      [{ time: "10:00", service_duration_minutes: 5 }],
      { ...opts, minHeightPx: 24 },
    );

    expect(item.height).toBe(24);
  });
});

describe("computeDayWindow", () => {
  it("defaults to 09:00-18:00", () => {
    expect(computeDayWindow([])).toEqual({ startHour: 9, endHour: 18 });
  });

  it("widens to fit early and late bookings", () => {
    expect(
      computeDayWindow([
        { time: "07:30", service_duration_minutes: 60 },
        { time: "19:30", service_duration_minutes: 60 },
      ]),
    ).toEqual({ startHour: 7, endHour: 21 });
  });

  it("stays within the day", () => {
    expect(
      computeDayWindow([{ time: "23:30", service_duration_minutes: 120 }]),
    ).toEqual({ startHour: 9, endHour: 24 });
  });
});

describe("summarizeTeamDay", () => {
  const team: CalendarMember[] = [
    { id: "e1", name: "Elena" },
    {
      id: "m1",
      name: "Maria",
      dayOffPeriods: [{ start_date: "2026-10-20", end_date: "2026-10-20" }],
    },
  ];
  const bookings = [
    { team_member_id: "e1", time: "09:30:00", status: "confirmed" },
    { team_member_id: "e1", time: "14:00", status: "pending" },
    { team_member_id: "e1", time: "16:00", status: "cancelled" },
    { team_member_id: null, time: "11:00", status: "confirmed" },
    { team_member_id: "gone", time: "12:00", status: "confirmed" },
  ];

  it("counts per practitioner without cancelled bookings", () => {
    const { rows } = summarizeTeamDay(team, bookings, "2026-10-21", null);

    expect(rows.map((r) => [r.member.id, r.count])).toEqual([
      ["e1", 2],
      ["m1", 0],
    ]);
  });

  it("finds the next booking from now, or the first of the day", () => {
    expect(
      summarizeTeamDay(team, bookings, "2026-10-21", 10 * 60).rows[0].nextTime,
    ).toBe("14:00");
    expect(
      summarizeTeamDay(team, bookings, "2026-10-21", null).rows[0].nextTime,
    ).toBe("09:30");
    expect(
      summarizeTeamDay(team, bookings, "2026-10-21", 17 * 60).rows[0].nextTime,
    ).toBeNull();
  });

  it("flags a day off", () => {
    const { rows } = summarizeTeamDay(team, [], "2026-10-20", null);

    expect(rows.find((r) => r.member.id === "m1")?.isOff).toBe(true);
    expect(rows.find((r) => r.member.id === "e1")?.isOff).toBe(false);
  });

  it("counts bookings nobody can serve (unassigned or former member)", () => {
    expect(
      summarizeTeamDay(team, bookings, "2026-10-21", null).unassigned,
    ).toBe(2);
  });
});

"use client";

import { useEffect, useState } from "react";

import { sortMembers, type CalendarMember } from "@/lib/calendar-practitioners";

/** Active practitioners (with their days off) for the admin calendar. */
export function useCalendarTeam() {
  const [members, setMembers] = useState<CalendarMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/team", { cache: "no-store" });

        if (!response.ok) throw new Error("Failed to load team");

        const data = await response.json();

        if (!cancelled) setMembers(sortMembers(data.team ?? []));
      } catch (error) {
        console.error("Error loading team for calendar:", error);
        if (!cancelled) setMembers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { members, loading };
}

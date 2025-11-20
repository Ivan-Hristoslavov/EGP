import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

type NormalizedHours = Record<(typeof DAY_KEYS)[number], {
  isOpen: boolean;
  open: string | null;
  close: string | null;
}>;

function normalizeWorkingHours(rows: any[]): NormalizedHours {
  const fallback: NormalizedHours = DAY_KEYS.reduce((acc, day) => {
    acc[day] = {
      isOpen: false,
      open: null,
      close: null,
    };
    return acc;
  }, {} as NormalizedHours);

  rows.forEach((row) => {
    const dayKey = DAY_KEYS[row.day_of_week] ?? null;
    if (!dayKey) return;

    fallback[dayKey] = {
      isOpen: Boolean(row.is_working_day),
      open: row.start_time,
      close: row.end_time,
    };
  });

  return fallback;
}

// Public GET - Fetch working hours (no authentication required)
export async function GET() {
  try {
    const supabase = createClient();
    
    const { data: workingHours, error } = await supabase
      .from("working_hours")
      .select("*")
      .order("day_of_week");

    if (error) {
      console.error("Error fetching working hours:", error);
      return NextResponse.json(
        { error: "Failed to fetch working hours" },
        { status: 500 }
      );
    }

    const normalized = normalizeWorkingHours(workingHours ?? []);

    return NextResponse.json({ workingHours: workingHours ?? [], normalized });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


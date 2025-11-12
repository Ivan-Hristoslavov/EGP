import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase";

const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

type NormalizedHours = Record<(typeof DAY_KEYS)[number], {
  isOpen: boolean;
  open: string | null;
  close: string | null;
  bufferMinutes: number;
  maxAppointments: number;
}>;

function normalizeWorkingHours(rows: any[]): NormalizedHours {
  const fallback: NormalizedHours = DAY_KEYS.reduce((acc, day) => {
    acc[day] = {
      isOpen: false,
      open: null,
      close: null,
      bufferMinutes: 15,
      maxAppointments: 10,
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
      bufferMinutes: row.buffer_minutes ?? 15,
      maxAppointments: row.max_appointments ?? 10,
    };
  });

  return fallback;
}

async function persistNormalizedHours(hours: NormalizedHours) {
  const payload = {
    key: "business_hours",
    value: hours,
    updated_at: new Date().toISOString(),
  };

  await supabaseAdmin.from("admin_settings").upsert(payload, { onConflict: "key" });
}

// GET - Fetch working hours
export async function GET() {
  try {
    const { data: workingHours, error } = await supabaseAdmin
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

// PUT - Update working hours
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { workingHours } = body;

    if (!workingHours || !Array.isArray(workingHours)) {
      return NextResponse.json(
        { error: "Working hours array is required" },
        { status: 400 }
      );
    }

    // Validate each working hour entry
    for (const hour of workingHours) {
      if (
        typeof hour.day_of_week !== "number" ||
        hour.day_of_week < 0 ||
        hour.day_of_week > 6 ||
        (!hour.start_time && hour.is_working_day !== false) ||
        (!hour.end_time && hour.is_working_day !== false)
      ) {
        return NextResponse.json(
          { error: "Invalid working hour data" },
          { status: 400 }
        );
      }
    }

    const updates = [];

    // Update each working hour
    for (const hour of workingHours) {
      const payload = {
        day_of_week: hour.day_of_week,
        start_time: hour.start_time,
        end_time: hour.end_time,
        is_working_day: hour.is_working_day ?? true,
        buffer_minutes: hour.buffer_minutes ?? 15,
        max_appointments: hour.max_appointments ?? 10,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabaseAdmin
        .from("working_hours")
        .upsert(payload, { onConflict: "day_of_week" })
        .select()
        .single();

      if (error) {
        console.error("Error updating working hour:", error);
        return NextResponse.json(
          { error: `Failed to update working hour for day ${hour.day_of_week}` },
          { status: 500 }
        );
      }

      updates.push(data);
    }

    const normalized = normalizeWorkingHours(updates);
    await persistNormalizedHours(normalized);

    return NextResponse.json({
      success: true,
      workingHours: updates,
      normalized,
      message: "Working hours updated successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

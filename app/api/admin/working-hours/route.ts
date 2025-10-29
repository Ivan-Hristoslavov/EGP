import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase";

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

    return NextResponse.json({ workingHours });
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
        typeof hour.day_of_week !== 'number' ||
        hour.day_of_week < 0 ||
        hour.day_of_week > 6 ||
        !hour.start_time ||
        !hour.end_time
      ) {
        return NextResponse.json(
          { error: "Invalid working hour data" },
          { status: 400 }
        );
      }
    }

    // Update each working hour
    const updates = [];
    for (const hour of workingHours) {
      const { data, error } = await supabaseAdmin
        .from("working_hours")
        .upsert({
          day_of_week: hour.day_of_week,
          start_time: hour.start_time,
          end_time: hour.end_time,
          is_working_day: hour.is_working_day ?? true,
          buffer_minutes: hour.buffer_minutes ?? 15,
          max_appointments: hour.max_appointments ?? 10,
          updated_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error("Error updating working hour:", error);
        return NextResponse.json(
          { error: `Failed to update working hour for day ${hour.day_of_week}` },
          { status: 500 }
        );
      }

      updates.push(data[0]);
    }

    return NextResponse.json({
      success: true,
      workingHours: updates,
      message: "Working hours updated successfully"
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET - Get all day off periods for a team member
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: dayOffPeriods, error } = await supabaseAdmin
      .from("team_day_off_periods")
      .select("*")
      .eq("team_member_id", id)
      .order("start_date", { ascending: true });

    if (error) {
      console.error("Error fetching day off periods:", error);
      return NextResponse.json(
        { error: "Failed to fetch day off periods", dayOffPeriods: [] },
        { status: 500 }
      );
    }

    return NextResponse.json({ dayOffPeriods: dayOffPeriods || [] });
  } catch (error) {
    console.error("Error in day off GET:", error);
    return NextResponse.json(
      { error: "Internal server error", dayOffPeriods: [] },
      { status: 500 }
    );
  }
}

// POST - Create a new day off period
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { start_date, end_date, reason } = body;

    if (!start_date || !end_date) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    // Validate date range
    if (new Date(start_date) > new Date(end_date)) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    const { data: dayOffPeriod, error } = await supabaseAdmin
      .from("team_day_off_periods")
      .insert([
        {
          team_member_id: id,
          start_date,
          end_date,
          reason: reason || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating day off period:", error);
      return NextResponse.json(
        { error: "Failed to create day off period" },
        { status: 500 }
      );
    }

    return NextResponse.json({ dayOffPeriod });
  } catch (error) {
    console.error("Error in day off POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


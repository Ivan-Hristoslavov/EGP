import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// PUT - Update a day off period
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; dayOffId: string }> }
) {
  try {
    const { id, dayOffId } = await params;
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
      .update({
        start_date,
        end_date,
        reason: reason || null,
      })
      .eq("id", dayOffId)
      .eq("team_member_id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating day off period:", error);
      return NextResponse.json(
        { error: "Failed to update day off period" },
        { status: 500 }
      );
    }

    if (!dayOffPeriod) {
      return NextResponse.json(
        { error: "Day off period not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ dayOffPeriod });
  } catch (error) {
    console.error("Error in day off PUT:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a day off period
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; dayOffId: string }> }
) {
  try {
    const { id, dayOffId } = await params;

    const { error } = await supabaseAdmin
      .from("team_day_off_periods")
      .delete()
      .eq("id", dayOffId)
      .eq("team_member_id", id);

    if (error) {
      console.error("Error deleting day off period:", error);
      return NextResponse.json(
        { error: "Failed to delete day off period" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in day off DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


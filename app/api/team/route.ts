import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Public API for booking flow - returns active team members with day-off periods.
 * Used by /book page. Do NOT protect with admin auth.
 */
export async function GET() {
  try {
    const { data: team, error } = await supabaseAdmin
      .from("team")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching team:", error);
      return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
    }

    // Fetch day-off periods for each team member (public data for availability)
    const teamWithDayOff = await Promise.all(
      (team || []).map(async (member) => {
        const { data: dayOffPeriods } = await supabaseAdmin
          .from("team_day_off_periods")
          .select("start_date, end_date, reason")
          .eq("team_member_id", member.id)
          .order("start_date", { ascending: true });
        return { ...member, dayOffPeriods: dayOffPeriods || [] };
      })
    );

    return NextResponse.json({ team: teamWithDayOff });
  } catch (error) {
    console.error("Error in team GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Public read-only endpoint for day-off periods (used by public banner)
export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("day_off_periods")
      .select("*")
      .order("start_date", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/day-off:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

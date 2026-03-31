import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Public read-only endpoint for press page visibility
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("admin_settings")
      .select("value")
      .eq("key", "press_page_enabled")
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching press page setting:", error);
      return NextResponse.json(
        { error: "Failed to fetch press page setting" },
        { status: 500 },
      );
    }

    const isEnabled =
      data?.value === true || data?.value === "true" || data === null;

    return NextResponse.json({ enabled: isEnabled });
  } catch (error) {
    console.error("Error in GET /api/press-settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

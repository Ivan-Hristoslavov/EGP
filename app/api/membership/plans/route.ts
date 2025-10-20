import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { data: plans, error } = await supabase
      .from("membership_plans")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching membership plans:", error);
      return NextResponse.json(
        { error: "Failed to fetch membership plans" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      plans: plans || [],
    });
  } catch (error) {
    console.error("Membership plans error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

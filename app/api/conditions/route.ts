import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const slug = searchParams.get("slug");

    let query = supabase
      .from("conditions")
      .select("*")
      .eq("is_active", true);

    // Filter by category if provided
    if (category) {
      query = query.eq("category", category);
    }

    // Filter by slug if provided (for single condition lookup)
    if (slug) {
      query = query.eq("slug", slug).single();
    } else {
      // Order by display_order if getting all conditions
      query = query.order("display_order", { ascending: true });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching conditions:", error);
      return NextResponse.json(
        { error: "Failed to fetch conditions" },
        { status: 500 }
      );
    }

    return NextResponse.json(slug ? { condition: data } : { conditions: data });
  } catch (error) {
    console.error("Error in conditions GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


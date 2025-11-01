import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const slug = searchParams.get("slug");

    // Handle slug lookup (single condition)
    if (slug) {
      let singleQuery = supabase
        .from("conditions")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      const { data, error } = await singleQuery;

      if (error) {
        console.error("Error fetching condition by slug:", error);
        return NextResponse.json(
          { error: "Failed to fetch condition" },
          { status: 500 }
        );
      }

      return NextResponse.json({ condition: data });
    }

    // Handle multiple conditions
    let query = supabase
      .from("conditions")
      .select("*")
      .eq("is_active", true);

    // Filter by category if provided
    if (category) {
      query = query.eq("category", category);
    }

    // Order by display_order
    query = query.order("display_order", { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching conditions:", error);
      return NextResponse.json(
        { error: "Failed to fetch conditions" },
        { status: 500 }
      );
    }

    return NextResponse.json({ conditions: data });
  } catch (error) {
    console.error("Error in conditions GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


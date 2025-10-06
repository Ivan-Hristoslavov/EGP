import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    
    const { data: areas, error } = await supabase
      .from("admin_areas_cover")
      .select("*")
      .eq("is_active", true)
      .order("order", { ascending: true });

    if (error) {
      console.error("Error fetching areas:", error);
      return NextResponse.json({ error: "Failed to fetch areas" }, { status: 500 });
    }

    // Transform data to match expected format
    const transformedAreas = areas.map(area => ({
      id: area.id,
      name: area.name, // Fixed: use 'name' instead of 'area_name'
      description: area.description,
      postcode: area.postcode,
      response_time: area.response_time,
      is_active: area.is_active,
      order: area.order,
      slug: area.slug,
      created_at: area.created_at,
      updated_at: area.updated_at
    }));

    return NextResponse.json(transformedAreas);
  } catch (error) {
    console.error("Error in areas GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
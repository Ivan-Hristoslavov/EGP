import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    
    // Check if table exists by trying to query it
    const { data: areas, error } = await supabase
      .from("admin_areas_cover")
      .select("*")
      .eq("is_active", true)
      .order("order", { ascending: true });

    // If table doesn't exist or error, return empty array instead of error
    if (error) {
      // Check if it's a table not found error (42P01) or relation doesn't exist
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.log("Areas table not found, returning empty array");
        return NextResponse.json([]);
      }
      console.error("Error fetching areas:", error);
      // Return empty array instead of error to prevent 500s
      return NextResponse.json([]);
    }

    // If no areas found, return empty array
    if (!areas || areas.length === 0) {
      return NextResponse.json([]);
    }

    // Transform data to match expected format
    const transformedAreas = areas.map(area => ({
      id: area.id,
      name: area.name || area.area_name, // Support both field names
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
    // Return empty array instead of error to prevent 500s
    console.log("Error in areas GET (returning empty array):", error);
    return NextResponse.json([]);
  }
} 
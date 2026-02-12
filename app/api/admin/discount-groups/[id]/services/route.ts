import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET - List service IDs that use this discount group */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("services")
      .select("id")
      .eq("discount_group_id", id);

    if (error) {
      console.error("Error fetching discount group services:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const serviceIds = (data ?? []).map((r) => r.id);
    return NextResponse.json({ serviceIds });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** PUT - Set which services use this discount group. Replaces current assignment. */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
    const body = await request.json();
    const { serviceIds } = body;
    const ids: string[] = Array.isArray(serviceIds) ? serviceIds : [];

    // Clear this group from all services that currently have it
    const { error: clearError } = await supabase
      .from("services")
      .update({ discount_group_id: null })
      .eq("discount_group_id", id);

    if (clearError) {
      console.error("Error clearing discount group from services:", clearError);
      return NextResponse.json({ error: clearError.message }, { status: 500 });
    }

    if (ids.length === 0) {
      return NextResponse.json({ success: true, serviceIds: [] });
    }

    // Assign this group to the selected services
    const { error: assignError } = await supabase
      .from("services")
      .update({ discount_group_id: id })
      .in("id", ids);

    if (assignError) {
      console.error("Error assigning discount group to services:", assignError);
      return NextResponse.json({ error: assignError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, serviceIds: ids });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

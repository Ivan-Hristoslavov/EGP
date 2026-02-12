import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("discount_groups")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching discount groups:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ discountGroups: data ?? [] });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { name, discount_percentage, is_active = true } = body;

    if (!name || discount_percentage == null) {
      return NextResponse.json(
        { error: "name and discount_percentage are required" },
        { status: 400 }
      );
    }

    const pct = Number(discount_percentage);
    if (Number.isNaN(pct) || pct < 0 || pct > 100) {
      return NextResponse.json(
        { error: "discount_percentage must be between 0 and 100" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("discount_groups")
      .insert({
        name: String(name).trim(),
        discount_percentage: pct,
        is_active: !!is_active,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating discount group:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ discountGroup: data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

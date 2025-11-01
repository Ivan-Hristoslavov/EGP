import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = createClient();

    const { data: condition, error } = await supabase
      .from("conditions")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !condition) {
      return NextResponse.json(
        { error: "Condition not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ condition });
  } catch (error) {
    console.error("Error in conditions/[slug] GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


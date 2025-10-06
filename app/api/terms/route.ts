import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    
    const { data: terms, error } = await supabase
      .from("terms")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching terms:", error);
      return NextResponse.json({ error: "Failed to fetch terms" }, { status: 500 });
    }

    return NextResponse.json(terms);
  } catch (error) {
    console.error("Error in terms GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // First, try to update existing terms
    const { data: existing, error: fetchError } = await supabase
      .from("terms")
      .select("id")
      .limit(1)
      .single();

    if (existing) {
      // Update existing terms
      const { data: updatedTerms, error: updateError } = await supabase
        .from("terms")
        .update({ content, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating terms:", updateError);
        return NextResponse.json({ error: "Failed to update terms" }, { status: 500 });
      }

      return NextResponse.json(updatedTerms);
    } else {
      // Create new terms
      const { data: newTerms, error: createError } = await supabase
        .from("terms")
        .insert({ content })
        .select()
        .single();

      if (createError) {
        console.error("Error creating terms:", createError);
        return NextResponse.json({ error: "Failed to create terms" }, { status: 500 });
      }

      return NextResponse.json(newTerms);
    }
  } catch (error) {
    console.error("Error in terms PUT:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
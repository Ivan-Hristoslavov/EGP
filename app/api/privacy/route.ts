import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    
    const { data: privacy, error } = await supabase
      .from("privacy_policy")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching privacy policy:", error);
      return NextResponse.json({ error: "Failed to fetch privacy policy" }, { status: 500 });
    }

    return NextResponse.json(privacy);
  } catch (error) {
    console.error("Error in privacy GET:", error);
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

    // First, try to update existing privacy policy
    const { data: existing, error: fetchError } = await supabase
      .from("privacy_policy")
      .select("id")
      .limit(1)
      .single();

    if (existing) {
      // Update existing privacy policy
      const { data: updatedPrivacy, error: updateError } = await supabase
        .from("privacy_policy")
        .update({ content, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating privacy policy:", updateError);
        return NextResponse.json({ error: "Failed to update privacy policy" }, { status: 500 });
      }

      return NextResponse.json(updatedPrivacy);
    } else {
      // Create new privacy policy
      const { data: newPrivacy, error: createError } = await supabase
        .from("privacy_policy")
        .insert({ content })
        .select()
        .single();

      if (createError) {
        console.error("Error creating privacy policy:", createError);
        return NextResponse.json({ error: "Failed to create privacy policy" }, { status: 500 });
      }

      return NextResponse.json(newPrivacy);
    }
  } catch (error) {
    console.error("Error in privacy PUT:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
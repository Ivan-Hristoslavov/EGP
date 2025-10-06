import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { id } = await params;
    
    const { question, answer, category, order, is_active } = body;

    const { data: faqItem, error } = await supabase
      .from("faq")
      .update({
        question,
        answer,
        category,
        order,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating FAQ item:", error);
      return NextResponse.json({ error: "Failed to update FAQ item" }, { status: 500 });
    }

    return NextResponse.json({ faqItem });
  } catch (error) {
    console.error("Error in FAQ PUT:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id } = await params;

    const { error } = await supabase
      .from("faq")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting FAQ item:", error);
      return NextResponse.json({ error: "Failed to delete FAQ item" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in FAQ DELETE:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
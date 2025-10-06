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
    
    const { 
      title, 
      subtitle, 
      table_headers,
      table_rows,
      notes,
      order,
      is_enabled
    } = body;

    const { data: pricingCard, error } = await supabase
      .from("pricing_cards")
      .update({
        title,
        subtitle,
        table_headers,
        table_rows,
        notes,
        order,
        is_enabled,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating pricing card:", error);
      return NextResponse.json({ error: "Failed to update pricing card" }, { status: 500 });
    }

    return NextResponse.json({ pricingCard });
  } catch (error) {
    console.error("Error in pricing card PUT:", error);
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
      .from("pricing_cards")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting pricing card:", error);
      return NextResponse.json({ error: "Failed to delete pricing card" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in pricing card DELETE:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
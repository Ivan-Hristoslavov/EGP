import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// PATCH - Update discount code (toggle active, mark as used)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof body.is_active === "boolean") {
      updateData.is_active = body.is_active;
    }

    if (body.mark_as_used === true) {
      updateData.used_at = new Date().toISOString();
      updateData.is_active = false;
    }

    if (body.mark_as_unused === true) {
      updateData.used_at = null;
      updateData.is_active = true;
    }

    if (body.discount_percentage) {
      updateData.discount_percentage = body.discount_percentage;
    }

    if (body.valid_until) {
      updateData.valid_until = body.valid_until;
    }

    const { data, error } = await supabaseAdmin
      .from("discount_codes")
      .update(updateData)
      .eq("id", id)
      .select("*, customers:customer_id(id, first_name, last_name, email)")
      .single();

    if (error) {
      console.error("Error updating discount code:", error);
      return NextResponse.json({ error: "Failed to update discount code" }, { status: 500 });
    }

    return NextResponse.json({ discountCode: data });
  } catch (error) {
    console.error("Unexpected error updating discount code:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete a discount code
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("discount_codes")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting discount code:", error);
      return NextResponse.json({ error: "Failed to delete discount code" }, { status: 500 });
    }

    return NextResponse.json({ message: "Discount code deleted successfully" });
  } catch (error) {
    console.error("Unexpected error deleting discount code:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PUT - Update team member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
    const body = await request.json();
    
    const { 
      name, 
      email, 
      phone, 
      role, 
      specializations, 
      experience_years, 
      certifications, 
      is_active 
    } = body;

    const { data: teamMember, error } = await supabase
      .from("team")
      .update({
        name,
        email,
        phone: phone || null,
        role,
        specializations: specializations || null,
        experience_years: experience_years || null,
        certifications: certifications || null,
        is_active: is_active !== undefined ? is_active : true
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating team member:", error);
      return NextResponse.json({ error: "Failed to update team member" }, { status: 500 });
    }

    return NextResponse.json({ teamMember });
  } catch (error) {
    console.error("Error in team PUT:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();

    const { error } = await supabase
      .from("team")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting team member:", error);
      return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 });
    }

    return NextResponse.json({ message: "Team member deleted successfully" });
  } catch (error) {
    console.error("Error in team DELETE:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


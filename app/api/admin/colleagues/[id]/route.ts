import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PUT - Update colleague
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { id } = await params;
    
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

    if (!name || !email || !role) {
      return NextResponse.json({ 
        error: "Missing required fields: name, email, role" 
      }, { status: 400 });
    }

    const { data: colleague, error } = await supabase
      .from("colleagues")
      .update({
        name,
        email,
        phone: phone || null,
        role,
        specializations: specializations || null,
        experience_years: experience_years || null,
        certifications: certifications || null,
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating colleague:", error);
      return NextResponse.json({ error: "Failed to update colleague" }, { status: 500 });
    }

    return NextResponse.json({ colleague });
  } catch (error) {
    console.error("Error in colleague PUT:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete colleague
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id } = await params;

    const { error } = await supabase
      .from("colleagues")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting colleague:", error);
      return NextResponse.json({ error: "Failed to delete colleague" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in colleague DELETE:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}




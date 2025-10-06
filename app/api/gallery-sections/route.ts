import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    
    const { data: gallerySections, error } = await supabase
      .from("gallery_sections")
      .select("*")
      .eq("is_active", true)
      .order("order", { ascending: true });

    if (error) {
      console.error("Error fetching gallery sections:", error);
      return NextResponse.json({ error: "Failed to fetch gallery sections" }, { status: 500 });
    }

    return NextResponse.json({ gallerySections });
  } catch (error) {
    console.error("Error in gallery sections GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const { title, description, color, order, is_active } = body;

    const { data: gallerySection, error } = await supabase
      .from("gallery_sections")
      .insert({
        title,
        description,
        color: color || "#3B82F6",
        order: order || 0,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating gallery section:", error);
      return NextResponse.json({ error: "Failed to create gallery section" }, { status: 500 });
    }

    return NextResponse.json({ gallerySection });
  } catch (error) {
    console.error("Error in gallery sections POST:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const { id, title, description, color, order, is_active } = body;

    const { data: gallerySection, error } = await supabase
      .from("gallery_sections")
      .update({
        title,
        description,
        color: color || "#3B82F6",
        order: order || 0,
        is_active: is_active !== false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating gallery section:", error);
      return NextResponse.json({ error: "Failed to update gallery section" }, { status: 500 });
    }

    return NextResponse.json({ gallerySection });
  } catch (error) {
    console.error("Error in gallery sections PUT:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Gallery section ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("gallery_sections")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting gallery section:", error);
      return NextResponse.json({ error: "Failed to delete gallery section" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in gallery sections DELETE:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
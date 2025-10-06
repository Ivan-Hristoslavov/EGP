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
    
    const { name, description, color, order, is_active } = body;

    const { data: gallerySection, error } = await supabase
      .from("gallery_sections")
      .update({
        name,
        description,
        color,
        order,
        is_active,
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
    console.error("Error in gallery section PUT:", error);
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

    // First, check if there are any gallery items in this section
    const { data: galleryItems, error: checkError } = await supabase
      .from("gallery")
      .select("id, image_url")
      .eq("section_id", id);

    if (checkError) {
      console.error("Error checking gallery items:", checkError);
      return NextResponse.json({ error: "Failed to check gallery items" }, { status: 500 });
    }

    console.log(`Found ${galleryItems?.length || 0} gallery items for section ${id}`);

    // Delete associated gallery items first
    if (galleryItems && galleryItems.length > 0) {
      console.log(`Deleting ${galleryItems.length} gallery items for section ${id}`);
      
      // Delete from storage if image_url exists
      for (const item of galleryItems) {
        if (item.image_url) {
          try {
            // Extract filename from URL
            const filename = item.image_url.split('/').pop();
            if (filename) {
              console.log(`Deleting image from storage: ${filename}`);
              const { error: storageError } = await supabase.storage
                .from('gallery')
                .remove([filename]);
              
              if (storageError) {
                console.warn("Failed to delete image from storage:", storageError);
              } else {
                console.log(`Successfully deleted image: ${filename}`);
              }
            }
          } catch (storageError) {
            console.warn("Failed to delete image from storage:", storageError);
          }
        }
      }

      // Delete gallery items from database
      const { error: deleteItemsError } = await supabase
        .from("gallery")
        .delete()
        .eq("section_id", id);

      if (deleteItemsError) {
        console.error("Error deleting gallery items:", deleteItemsError);
        return NextResponse.json({ error: "Failed to delete gallery items" }, { status: 500 });
      }
    }

    // Now delete the gallery section
    const { error } = await supabase
      .from("gallery_sections")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting gallery section:", error);
      return NextResponse.json({ error: "Failed to delete gallery section" }, { status: 500 });
    }

    console.log(`Successfully deleted gallery section: ${id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in gallery section DELETE:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
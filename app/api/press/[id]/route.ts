import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Helper function to extract file path from URL
function extractFilePathFromUrl(url: string): string | null {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === 'storage');
    if (bucketIndex !== -1 && pathParts[bucketIndex + 1] === 'v1' && pathParts[bucketIndex + 2] === 'object' && pathParts[bucketIndex + 3] === 'public') {
      // Extract path after /public/egp/
      const egpIndex = pathParts.findIndex(part => part === 'egp');
      if (egpIndex !== -1) {
        return pathParts.slice(egpIndex + 1).join('/');
      }
    }
    // Fallback: try to extract from pathname directly
    const match = url.match(/\/storage\/v1\/object\/public\/egp\/(.+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// Helper function to delete image from storage
async function deleteImageFromStorage(imageUrl: string | null): Promise<void> {
  if (!imageUrl || !supabase) return;
  
  try {
    const filePath = extractFilePathFromUrl(imageUrl);
    if (!filePath) {
      console.warn('Could not extract file path from URL:', imageUrl);
      return;
    }
    
    const { error } = await supabase.storage
      .from('egp')
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting image from storage:', error);
    } else {
      console.log('Successfully deleted image:', filePath);
    }
  } catch (error) {
    console.error('Error in deleteImageFromStorage:', error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { data: pressItem, error } = await supabaseAdmin
      .from("press")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching press item:", error);
      return NextResponse.json({ error: "Press item not found" }, { status: 404 });
    }

    return NextResponse.json({ pressItem });
  } catch (error) {
    console.error("Error in press GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const { 
      type,
      title,
      organisation,
      publication,
      year,
      date,
      description,
      image_url,
      is_featured,
      display_order
    } = body;

    // Get existing press item to check for old image
    const { data: existingItem } = await supabaseAdmin
      .from("press")
      .select("image_url")
      .eq("id", id)
      .single();

    const updateData: any = {};

    if (type !== undefined) {
      if (!['award', 'press_feature'].includes(type)) {
        return NextResponse.json({ 
          error: "Type must be 'award' or 'press_feature'" 
        }, { status: 400 });
      }
      updateData.type = type;
    }
    if (title !== undefined) updateData.title = title;
    if (organisation !== undefined) updateData.organisation = organisation;
    if (publication !== undefined) updateData.publication = publication;
    if (year !== undefined) updateData.year = year;
    if (date !== undefined) updateData.date = date;
    if (description !== undefined) updateData.description = description;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (is_featured !== undefined) updateData.is_featured = is_featured;
    if (display_order !== undefined) updateData.display_order = display_order;

    const { data: pressItem, error } = await supabaseAdmin
      .from("press")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating press item:", error);
      return NextResponse.json({ error: "Failed to update press item" }, { status: 500 });
    }

    // Delete old image if a new one was uploaded or image was removed
    if (image_url !== undefined && existingItem?.image_url) {
      if (image_url !== existingItem.image_url) {
        // New image uploaded or image removed
        await deleteImageFromStorage(existingItem.image_url);
      }
    }

    return NextResponse.json({ pressItem });
  } catch (error) {
    console.error("Error in press PUT:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get existing press item to delete associated image
    const { data: existingItem } = await supabaseAdmin
      .from("press")
      .select("image_url")
      .eq("id", id)
      .single();

    const { error } = await supabaseAdmin
      .from("press")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting press item:", error);
      return NextResponse.json({ error: "Failed to delete press item" }, { status: 500 });
    }

    // Delete associated image from storage
    if (existingItem?.image_url) {
      await deleteImageFromStorage(existingItem.image_url);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in press DELETE:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}




import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = createClient();
    
    const { data: galleryItems, error } = await supabase
      .from("gallery")
      .select("*")
      .order("order", { ascending: true });

    if (error) {
      console.error("Error fetching gallery items:", error);
      return NextResponse.json({ error: "Failed to fetch gallery items" }, { status: 500 });
    }

    return NextResponse.json({ galleryItems });
  } catch (error) {
    console.error("Error in gallery GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const { 
      title, 
      description, 
      before_image_url,
      after_image_url,
      image_url, // fallback for compatibility
      project_type,
      location,
      completion_date,
      section_id,
      order, 
      is_active,
      is_featured
    } = body;

    // Use before_image_url and after_image_url, or fallback to image_url
    const beforeUrl = before_image_url || image_url;
    const afterUrl = after_image_url || image_url;

    const { data: galleryItem, error } = await supabase
      .from("gallery")
      .insert({
        title,
        description,
        before_image_url: beforeUrl,
        after_image_url: afterUrl,
        project_type,
        location,
        completion_date,
        section_id,
        order: order || 0,
        is_active: is_active !== false,
        is_featured: is_featured || false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating gallery item:", error);
      return NextResponse.json({ error: "Failed to create gallery item" }, { status: 500 });
    }

    return NextResponse.json({ galleryItem });
  } catch (error) {
    console.error("Error in gallery POST:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const { 
      id,
      title, 
      description, 
      before_image_url,
      after_image_url,
      project_type,
      location,
      completion_date,
      section_id,
      order, 
      is_active,
      is_featured
    } = body;

    const { data: galleryItem, error } = await supabase
      .from("gallery")
      .update({
        title,
        description,
        before_image_url,
        after_image_url,
        project_type,
        location,
        completion_date,
        section_id,
        order: order || 0,
        is_active: is_active !== false,
        is_featured: is_featured || false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating gallery item:", error);
      return NextResponse.json({ error: "Failed to update gallery item" }, { status: 500 });
    }

    return NextResponse.json({ galleryItem });
  } catch (error) {
    console.error("Error in gallery PUT:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    // Use service role client for storage operations
    const supabaseService = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Gallery item ID is required" }, { status: 400 });
    }

    // First, get the gallery item to extract image URLs
    const { data: galleryItem, error: fetchError } = await supabase
      .from("gallery")
      .select("before_image_url, after_image_url")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching gallery item:", fetchError);
      return NextResponse.json({ error: "Failed to fetch gallery item" }, { status: 500 });
    }

    // Delete the gallery item from database
    const { error } = await supabase
      .from("gallery")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting gallery item:", error);
      return NextResponse.json({ error: "Failed to delete gallery item" }, { status: 500 });
    }

    // Delete images from Supabase Storage
    const imagesToDelete = [];
    
    if (galleryItem.before_image_url) {
      console.log('Before image URL:', galleryItem.before_image_url);
      // Extract filename from Supabase storage URL
      // URL format: https://[project].supabase.co/storage/v1/object/public/gallery/filename
      const urlParts = galleryItem.before_image_url.split('/');
      console.log('URL parts:', urlParts);
      const filename = urlParts[urlParts.length - 1];
      console.log('Extracted filename:', filename);
      if (filename && filename !== 'gallery' && filename.includes('.')) {
        imagesToDelete.push(filename);
        console.log('Added before image to delete:', filename);
      } else {
        console.log('Skipped before image - invalid filename:', filename);
      }
    }
    
    if (galleryItem.after_image_url) {
      console.log('After image URL:', galleryItem.after_image_url);
      // Extract filename from Supabase storage URL
      const urlParts = galleryItem.after_image_url.split('/');
      console.log('URL parts:', urlParts);
      const filename = urlParts[urlParts.length - 1];
      console.log('Extracted filename:', filename);
      if (filename && filename !== 'gallery' && filename.includes('.')) {
        imagesToDelete.push(filename);
        console.log('Added after image to delete:', filename);
      } else {
        console.log('Skipped after image - invalid filename:', filename);
      }
    }

    console.log('Images to delete:', imagesToDelete);

    // Delete images from storage
    if (imagesToDelete.length > 0) {
      console.log('Attempting to delete images from storage...');
      console.log('Using Supabase client:', {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      });
      
      const { data: deleteResult, error: storageError } = await supabaseService.storage
        .from('gallery')
        .remove(imagesToDelete);

      console.log('Storage deletion result:', { deleteResult, storageError });

      if (storageError) {
        console.error("Error deleting images from storage:", storageError);
        // Don't fail the request if storage deletion fails
        // The database record is already deleted
      } else {
        console.log('Successfully deleted images from storage');
        console.log('Deleted files:', deleteResult);
      }
    } else {
      console.log('No images to delete from storage');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in gallery DELETE:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
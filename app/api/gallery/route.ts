import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

// Helper function to transform image URLs from old 'gallery' bucket to 'egp' bucket
function transformImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  
  // Replace '/gallery/' with '/egp/' in the URL path (handles both http and https)
  if (url.includes('/gallery/')) {
    const transformed = url.replace('/gallery/', '/egp/');
    console.log(`URL transformed: ${url} -> ${transformed}`);
    return transformed;
  }
  
  // Also handle cases where bucket name might be in different positions
  if (url.includes('/storage/v1/object/public/gallery/')) {
    const transformed = url.replace('/storage/v1/object/public/gallery/', '/storage/v1/object/public/egp/');
    console.log(`URL transformed (full path): ${url} -> ${transformed}`);
    return transformed;
  }
  
  return url;
}

export async function GET() {
  try {
    const supabase = createClient();
    
    const { data: galleryItems, error } = await supabase
      .from("gallery")
      .select(`
        *,
        service:services(
          id,
          name,
          category:service_categories(
            id,
            name,
            slug,
            main_tab:main_tabs(
              id,
              name,
              slug
            )
          )
        ),
        category:service_categories(
          id,
          name,
          slug,
          main_tab:main_tabs(
            id,
            name,
            slug
          )
        )
      `)
      .order("order", { ascending: true });

    if (error) {
      console.error("Error fetching gallery items:", error);
      return NextResponse.json({ error: "Failed to fetch gallery items" }, { status: 500 });
    }

    // Transform image URLs to use 'egp' bucket instead of 'gallery'
    const transformedItems = galleryItems?.map(item => {
      const beforeUrl = transformImageUrl(item.before_image_url) || item.before_image_url || '';
      const afterUrl = transformImageUrl(item.after_image_url) || item.after_image_url || '';
      const imageUrl = transformImageUrl(item.image_url) || item.image_url;
      
      // Log URLs for debugging
      if (item.before_image_url || item.after_image_url) {
        console.log(`Gallery item ${item.id} URLs:`, {
          original_before: item.before_image_url,
          transformed_before: beforeUrl,
          original_after: item.after_image_url,
          transformed_after: afterUrl
        });
      }
      
      return {
        ...item,
        before_image_url: beforeUrl,
        after_image_url: afterUrl,
        image_url: imageUrl,
      };
    }) || [];

    return NextResponse.json({ galleryItems: transformedItems });
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
      service_id,
      category_id,
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
        service_id,
        category_id,
        order: order || 0,
        is_active: is_active !== false,
        is_featured: is_featured || false,
      })
      .select(`
        *,
        service:services(
          id,
          name,
          category:service_categories(
            id,
            name,
            slug,
            main_tab:main_tabs(
              id,
              name,
              slug
            )
          )
        ),
        category:service_categories(
          id,
          name,
          slug,
          main_tab:main_tabs(
            id,
            name,
            slug
          )
        )
      `)
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
      service_id,
      category_id,
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
        service_id,
        category_id,
        order: order || 0,
        is_active: is_active !== false,
        is_featured: is_featured || false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(`
        *,
        service:services(
          id,
          name,
          category:service_categories(
            id,
            name,
            slug,
            main_tab:main_tabs(
              id,
              name,
              slug
            )
          )
        ),
        category:service_categories(
          id,
          name,
          slug,
          main_tab:main_tabs(
            id,
            name,
            slug
          )
        )
      `)
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
      // URL format: https://[project].supabase.co/storage/v1/object/public/egp/filename
      const urlParts = galleryItem.before_image_url.split('/');
      console.log('URL parts:', urlParts);
      const filename = urlParts[urlParts.length - 1];
      console.log('Extracted filename:', filename);
      if (filename && filename !== 'egp' && filename.includes('.')) {
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
      if (filename && filename !== 'egp' && filename.includes('.')) {
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
        .from('egp')
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
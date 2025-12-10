import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseStorage = supabaseUrl && supabaseServiceKey 
  ? createSupabaseClient(supabaseUrl, supabaseServiceKey)
  : null;

// Helper function to extract file path from URL
function extractFilePathFromUrl(url: string): string | null {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === 'storage');
    if (bucketIndex !== -1 && pathParts[bucketIndex + 1] === 'v1' && pathParts[bucketIndex + 2] === 'object' && pathParts[bucketIndex + 3] === 'public') {
      const egpIndex = pathParts.findIndex(part => part === 'egp');
      if (egpIndex !== -1) {
        return pathParts.slice(egpIndex + 1).join('/');
      }
    }
    const match = url.match(/\/storage\/v1\/object\/public\/egp\/(.+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// Helper function to delete image from storage
async function deleteImageFromStorage(imageUrl: string | null): Promise<void> {
  if (!imageUrl || !supabaseStorage) return;
  
  try {
    const filePath = extractFilePathFromUrl(imageUrl);
    if (!filePath) {
      console.warn('Could not extract file path from URL:', imageUrl);
      return;
    }
    
    const { error } = await supabaseStorage.storage
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

// PUT - Update team member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
    const body = await request.json();
    
    // Get existing team member to check for old image
    const { data: existingMember } = await supabase
      .from("team")
      .select("image_url")
      .eq("id", id)
      .single();
    
    const { 
      name, 
      email, 
      phone, 
      role, 
      specializations, 
      experience_years, 
      certifications,
      image_url,
      service_ids,
      is_active,
      delete_image
    } = body;

    // Delete old image if new image is uploaded or if delete_image is true
    if (existingMember?.image_url && (image_url !== existingMember.image_url || delete_image)) {
      if (delete_image || image_url !== existingMember.image_url) {
        await deleteImageFromStorage(existingMember.image_url);
      }
    }

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
        image_url: delete_image ? null : (image_url || null),
        service_ids: service_ids && Array.isArray(service_ids) ? service_ids : [],
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

    // Get team member to delete associated image
    const { data: teamMember } = await supabase
      .from("team")
      .select("image_url")
      .eq("id", id)
      .single();

    // Delete associated image from storage
    if (teamMember?.image_url) {
      await deleteImageFromStorage(teamMember.image_url);
    }

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


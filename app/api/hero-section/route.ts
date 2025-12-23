import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    
    // Always get the first record (there should only be one)
    const { data: heroSections, error: listError } = await supabase
      .from("hero_section")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1);

    if (listError) {
      console.error("Error fetching hero section:", listError);
      return NextResponse.json({ error: "Failed to fetch hero section" }, { status: 500 });
    }

    // Return the first record or null if none exists
    const heroSection = heroSections && heroSections.length > 0 ? heroSections[0] : null;
    return NextResponse.json({ heroSection });
  } catch (error) {
    console.error("Error in hero-section GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // POST now works the same as PUT - upsert to ensure only one record
  return PUT(request);
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const { 
      id,
      image_1_url,
      image_2_url,
      image_3_url,
      image_1_position,
      image_2_position,
      image_3_position,
      badge_text,
      badge_icon,
      main_headline,
      sub_headline,
      feature_1_text,
      feature_2_text,
      feature_3_text,
      button_1_text,
      button_1_icon,
      button_1_link,
      button_1_type,
      button_2_text,
      button_2_icon,
      button_2_link,
      button_2_type,
      contact_label,
      phone_number,
      image_resize_enabled,
      image_max_width,
      image_max_height,
      image_quality,
      is_active,
      animation_duration_ms
    } = body;

    // First, check if any record exists
    const { data: existingRecords } = await supabase
      .from("hero_section")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1);

    const existingId = existingRecords && existingRecords.length > 0 ? existingRecords[0].id : null;
    const recordId = id || existingId;

    // If there are multiple records, delete all except the first one
    if (existingRecords && existingRecords.length > 0) {
      const idsToDelete = existingRecords
        .filter((r: { id: string }) => r.id !== recordId)
        .map((r: { id: string }) => r.id);
      
      if (idsToDelete.length > 0) {
        await supabase
          .from("hero_section")
          .delete()
          .in("id", idsToDelete);
      }
    }

    // Upsert: update if exists, create if not
    if (recordId) {
      // Update existing record
      const { data: heroSection, error } = await supabase
        .from("hero_section")
        .update({
          image_1_url,
          image_2_url,
          image_3_url,
          image_1_position: image_1_position || "object-center",
          image_2_position: image_2_position || "object-center",
          image_3_position: image_3_position || "object-center",
          badge_text,
          badge_icon,
          main_headline,
          sub_headline,
          feature_1_text,
          feature_2_text,
          feature_3_text,
          button_1_text,
          button_1_icon,
          button_1_link,
          button_1_type,
          button_2_text,
          button_2_icon,
          button_2_link,
          button_2_type,
          contact_label,
          phone_number,
          image_resize_enabled,
          image_max_width,
          image_max_height,
          image_quality,
          is_active: is_active !== false,
          animation_duration_ms: animation_duration_ms || 6000,
          updated_at: new Date().toISOString(),
        })
        .eq("id", recordId)
        .select()
        .single();

      if (error) {
        console.error("Error updating hero section:", error);
        return NextResponse.json({ error: "Failed to update hero section" }, { status: 500 });
      }

      return NextResponse.json({ heroSection });
    } else {
      // Create new record (only if none exists)
      const { data: heroSection, error } = await supabase
        .from("hero_section")
        .insert({
          image_1_url,
          image_2_url,
          image_3_url,
          image_1_position: image_1_position || "object-center",
          image_2_position: image_2_position || "object-center",
          image_3_position: image_3_position || "object-center",
          badge_text,
          badge_icon,
          main_headline,
          sub_headline,
          feature_1_text,
          feature_2_text,
          feature_3_text,
          button_1_text,
          button_1_icon,
          button_1_link,
          button_1_type,
          button_2_text,
          button_2_icon,
          button_2_link,
          button_2_type,
          contact_label,
          phone_number,
          image_resize_enabled,
          image_max_width,
          image_max_height,
          image_quality,
          is_active: is_active !== false,
          animation_duration_ms: animation_duration_ms || 6000,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating hero section:", error);
        return NextResponse.json({ error: "Failed to create hero section" }, { status: 500 });
      }

      return NextResponse.json({ heroSection });
    }
  } catch (error) {
    console.error("Error in hero-section PUT:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Hero section ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("hero_section")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting hero section:", error);
      return NextResponse.json({ error: "Failed to delete hero section" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in hero-section DELETE:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


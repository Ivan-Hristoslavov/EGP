import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - Fetch VAT settings
export async function GET() {
  try {
    const { data: settings, error } = await supabase
      .from("vat_settings")
      .select("*")
      .single();

    if (error) {
      // If no settings exist, create default ones
      if (error.code === 'PGRST116') {
        const { data: newSettings, error: createError } = await supabase
          .from("vat_settings")
          .insert({
            is_enabled: true,
            vat_rate: 20.00,
            vat_number: null
          })
          .select()
          .single();

        if (createError) {
          console.error("Error creating default VAT settings:", createError);
          return NextResponse.json({ error: "Failed to create VAT settings" }, { status: 500 });
        }

        return NextResponse.json(newSettings);
      }

      console.error("Error fetching VAT settings:", error);
      return NextResponse.json({ error: "Failed to fetch VAT settings" }, { status: 500 });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error in VAT settings GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update VAT settings
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { is_enabled, vat_rate, vat_number } = body;

    // Validate required fields
    if (typeof is_enabled !== 'boolean' || typeof vat_rate !== 'number') {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    // Validate VAT rate range
    if (vat_rate < 0 || vat_rate > 100) {
      return NextResponse.json({ error: "VAT rate must be between 0 and 100" }, { status: 400 });
    }

    // First, try to get existing settings
    const { data: existingSettings } = await supabase
      .from("vat_settings")
      .select("id")
      .single();

    let result;
    
    if (existingSettings) {
      // Update existing settings
      result = await supabase
        .from("vat_settings")
        .update({
          is_enabled,
          vat_rate,
          vat_number: vat_number || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingSettings.id)
        .select()
        .single();
    } else {
      // Create new settings
      result = await supabase
        .from("vat_settings")
        .insert({
          is_enabled,
          vat_rate,
          vat_number: vat_number || null
        })
        .select()
        .single();
    }

    if (result.error) {
      console.error("Error updating VAT settings:", result.error);
      return NextResponse.json({ error: "Failed to update VAT settings" }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in VAT settings PUT:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
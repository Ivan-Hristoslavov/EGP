import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Fetch admin settings
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    let data, error;

    if (key) {
      const result = await supabase
        .from("admin_settings")
        .select("*")
        .eq("key", key)
        .single();

      data = result.data;
      error = result.error;
      
      if (error) {
        console.error("Error fetching admin setting:", error);
        return NextResponse.json(
          { error: "Failed to fetch setting" },
          { status: 500 },
        );
      }

      return NextResponse.json(data.value);
    } else {
      const result = await supabase.from("admin_settings").select("*");

      data = result.data;
      error = result.error;

    if (error) {
      console.error("Error fetching admin settings:", error);
        return NextResponse.json(
          { error: "Failed to fetch settings" },
          { status: 500 },
        );
      }
      // Convert array of settings to object format
      const settingsObject = data?.reduce((acc, setting) => {
        try {
          acc[setting.key] = JSON.parse(setting.value);
        } catch {
          acc[setting.key] = setting.value;
        }
        return acc;
      }, {}) || {};

      return NextResponse.json(settingsObject);
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT - Update admin settings
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    // Update multiple settings
    const updatePromises = Object.entries(body).map(([key, value]) => {
      return supabase
        .from("admin_settings")
        .upsert({ key, value })
        .select();
    });

    const results = await Promise.all(updatePromises);

    // Check for errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error("Error updating admin settings:", errors);
      return NextResponse.json(
        { error: "Failed to update some settings" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Create or update admin setting
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { key, value } = await request.json();

    const { data: setting, error } = await supabase
      .from("admin_settings")
      .upsert({ key, value })
      .select()
      .single();

    if (error) {
      console.error("Error saving admin setting:", error);
      return NextResponse.json(
        { error: "Failed to save setting" },
        { status: 500 },
      );
    }

    return NextResponse.json({ setting });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

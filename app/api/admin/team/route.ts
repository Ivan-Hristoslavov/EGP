import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET - Fetch all team members (public access for booking)
export async function GET() {
  try {
    // Use admin client to bypass RLS for public booking access
    // This allows unauthenticated users to see team members for booking
    const { data: team, error } = await supabaseAdmin
      .from("team")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching team:", error);
      return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
    }

    return NextResponse.json({ team: team || [] });
  } catch (error) {
    console.error("Error in team GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new team member
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const { 
      admin_profile_id,
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

    // If admin_profile_id is not provided, try to get it from admin_profile
    let profileId = admin_profile_id;
    if (!profileId) {
      const { data: profiles } = await supabase
        .from("admin_profile")
        .select("id")
        .limit(1)
        .single();
      
      if (profiles) {
        profileId = profiles.id;
      }
    }

    const { data: teamMember, error } = await supabase
      .from("team")
      .insert({
        admin_profile_id: profileId,
        name,
        email,
        phone: phone || null,
        role,
        specializations: specializations || null,
        experience_years: experience_years || null,
        certifications: certifications || null,
        is_active: is_active !== undefined ? is_active : true
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating team member:", error);
      return NextResponse.json({ error: "Failed to create team member" }, { status: 500 });
    }

    return NextResponse.json({ teamMember });
  } catch (error) {
    console.error("Error in team POST:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


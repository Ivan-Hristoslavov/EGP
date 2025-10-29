import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Fetch all colleagues
export async function GET() {
  try {
    const supabase = createClient();
    
    const { data: colleagues, error } = await supabase
      .from("colleagues")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching colleagues:", error);
      return NextResponse.json({ error: "Failed to fetch colleagues" }, { status: 500 });
    }

    return NextResponse.json({ colleagues });
  } catch (error) {
    console.error("Error in colleagues GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new colleague
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const { 
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

    const { data: colleague, error } = await supabase
      .from("colleagues")
      .insert({
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
      console.error("Error creating colleague:", error);
      return NextResponse.json({ error: "Failed to create colleague" }, { status: 500 });
    }

    return NextResponse.json({ colleague });
  } catch (error) {
    console.error("Error in colleagues POST:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}




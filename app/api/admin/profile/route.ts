import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from "next/server";

// GET - Fetch admin profile
export async function GET() {
  try {
    const supabase = createClient();
    
    const { data: profile, error } = await supabase
      .from('admin_profile')
      .select('*')
      .single();

    if (error) {
      // If no profile exists (PGRST116), return null instead of error
      if (error.code === 'PGRST116') {
        return NextResponse.json(null);
      }
      console.error('Error fetching admin profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    // Parse JSONB fields that might be double-encoded as strings
    if (profile) {
      try {
        if (profile.transport_options && typeof profile.transport_options === 'string') {
          const parsed = JSON.parse(profile.transport_options);
          profile.transport_options = typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
        }
      } catch (e) {
        console.error('Error parsing transport_options:', e);
        profile.transport_options = {};
      }

      try {
        if (profile.nearby_landmarks && typeof profile.nearby_landmarks === 'string') {
          const parsed = JSON.parse(profile.nearby_landmarks);
          profile.nearby_landmarks = Array.isArray(parsed) 
            ? parsed 
            : (typeof parsed === 'string' ? JSON.parse(parsed) : []);
        } else if (!Array.isArray(profile.nearby_landmarks)) {
          profile.nearby_landmarks = [];
        }
      } catch (e) {
        console.error('Error parsing nearby_landmarks:', e);
        profile.nearby_landmarks = [];
      }
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error in profile API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update admin profile
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    // Destructure the required fields from the request body
    const { 
      businessEmail, 
      phone, 
      whatsapp,
      companyName, 
      companyAddress, 
      bankName, 
      accountNumber, 
      sortCode,
      howToFindUs,
      howToReachUs,
      googleMapsAddress,
      transportOptions,
      nearbyLandmarks,
    } = body;

    // First get the current profile to get the ID
    const { data: currentProfile, error: fetchError } = await supabase
      .from("admin_profile")
      .select("id")
      .single();

    if (fetchError) {
      console.error("Error fetching current profile:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch current profile" },
        { status: 500 },
      );
    }

    // Update the profile using the ID
    const updateData: any = {
        phone,
        business_email: businessEmail,
        company_name: companyName,
        company_address: companyAddress,
        updated_at: new Date().toISOString(),
    };

    // Add optional fields that exist in the base schema
    if (bankName !== undefined && bankName !== null) updateData.bank_name = bankName;
    if (accountNumber !== undefined && accountNumber !== null) updateData.account_number = accountNumber;
    if (sortCode !== undefined && sortCode !== null) updateData.sort_code = sortCode;
    
    // Add new fields from find-us migration (only if provided and not empty)
    // These will work after running the migration: 20250212_add_find_us_fields_to_admin_profile.sql
    if (whatsapp !== undefined && whatsapp !== null) updateData.whatsapp = whatsapp;
    if (howToFindUs !== undefined && howToFindUs !== null) updateData.how_to_find_us = howToFindUs;
    if (howToReachUs !== undefined && howToReachUs !== null) updateData.how_to_reach_us = howToReachUs;
    if (googleMapsAddress !== undefined && googleMapsAddress !== null) updateData.google_maps_address = googleMapsAddress;
    // Convert transportOptions to JSON string if it's an object
    if (transportOptions !== undefined && transportOptions !== null) {
      updateData.transport_options = typeof transportOptions === 'string' 
        ? transportOptions 
        : JSON.stringify(transportOptions);
    }
    // Convert nearbyLandmarks to JSON string if it's an array
    if (nearbyLandmarks !== undefined && nearbyLandmarks !== null) {
      updateData.nearby_landmarks = typeof nearbyLandmarks === 'string' 
        ? nearbyLandmarks 
        : JSON.stringify(nearbyLandmarks);
    }

    const { data, error } = await supabase
      .from('admin_profile')
      .update(updateData)
      .eq('id', currentProfile.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating admin profile:", error);

      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 },
      );
    }

    return NextResponse.json({ profile: data });
  } catch (error) {
    console.error("Unexpected error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

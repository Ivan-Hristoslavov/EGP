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
      console.error('Error fetching admin profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
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
      firstName, 
      lastName, 
      businessEmail, 
      phone, 
      whatsapp,
      about, 
      companyName, 
      companyAddress, 
      insuranceProvider, 
      yearsOfExperience,
      specializations,
      certifications,
      responseTime,
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
      name: `${firstName} ${lastName}`,
      phone,
      about,
      business_email: businessEmail,
      company_name: companyName,
      company_address: companyAddress,
      insurance_provider: insuranceProvider,
      updated_at: new Date().toISOString(),
    };

    // Add optional fields that exist in the base schema
    if (bankName !== undefined && bankName !== null) updateData.bank_name = bankName;
    if (accountNumber !== undefined && accountNumber !== null) updateData.account_number = accountNumber;
    if (sortCode !== undefined && sortCode !== null) updateData.sort_code = sortCode;
    
    // Add professional fields (only if provided and not empty - these columns may not exist yet)
    // These will work after running the migration: 20250212_add_missing_admin_profile_fields.sql
    // For now, we skip them to avoid errors if columns don't exist
    // Uncomment after migration is applied:
    // if (yearsOfExperience !== undefined && yearsOfExperience !== null) updateData.years_of_experience = yearsOfExperience;
    // if (specializations !== undefined && specializations !== null) updateData.specializations = specializations;
    // if (certifications !== undefined && certifications !== null) updateData.certifications = certifications;
    // if (responseTime !== undefined && responseTime !== null) updateData.response_time = responseTime;
    
    // Add new fields from find-us migration (only if provided and not empty)
    // These will work after running the migration: 20250212_add_find_us_fields_to_admin_profile.sql
    if (whatsapp !== undefined && whatsapp !== null) updateData.whatsapp = whatsapp;
    if (howToFindUs !== undefined && howToFindUs !== null) updateData.how_to_find_us = howToFindUs;
    if (howToReachUs !== undefined && howToReachUs !== null) updateData.how_to_reach_us = howToReachUs;
    if (googleMapsAddress !== undefined && googleMapsAddress !== null) updateData.google_maps_address = googleMapsAddress;
    if (transportOptions !== undefined && transportOptions !== null) updateData.transport_options = transportOptions;
    if (nearbyLandmarks !== undefined && nearbyLandmarks !== null) updateData.nearby_landmarks = nearbyLandmarks;

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

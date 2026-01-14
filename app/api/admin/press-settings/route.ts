import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Retrieve press page enabled setting
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_settings')
      .select('value')
      .eq('key', 'press_page_enabled')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching press page setting:', error);
      return NextResponse.json(
        { error: 'Failed to fetch press page setting' },
        { status: 500 }
      );
    }

    // Default to true if setting doesn't exist
    const isEnabled = data?.value === true || data?.value === 'true' || data === null;

    return NextResponse.json({ enabled: isEnabled });
  } catch (error) {
    console.error('Error in GET /api/admin/press-settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update press page enabled setting
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { enabled } = body;

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request: enabled must be a boolean' },
        { status: 400 }
      );
    }

    // Upsert the setting
    const { data, error } = await supabaseAdmin
      .from('admin_settings')
      .upsert(
        {
          key: 'press_page_enabled',
          value: enabled,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'key',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error updating press page setting:', error);
      return NextResponse.json(
        { error: 'Failed to update press page setting' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, enabled });
  } catch (error) {
    console.error('Error in PUT /api/admin/press-settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


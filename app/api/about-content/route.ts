import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    let query = supabase
      .from('about_content')
      .select('*')
      .order('order', { ascending: true });

    if (!all) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching about content:', error);
      return NextResponse.json({ error: 'Failed to fetch about content' }, { status: 500 });
    }

    return NextResponse.json({ sections: data || [] });
  } catch (error) {
    console.error('Error in GET /api/about-content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('about_content')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Error creating about content:', error);
      return NextResponse.json({ error: 'Failed to create about content' }, { status: 500 });
    }

    return NextResponse.json({ section: data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/about-content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


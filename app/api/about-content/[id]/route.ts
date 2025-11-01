import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('about_content')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching about content:', error);
      return NextResponse.json({ error: 'Failed to fetch about content' }, { status: 500 });
    }

    return NextResponse.json({ section: data });
  } catch (error) {
    console.error('Error in GET /api/about-content/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('about_content')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating about content:', error);
      return NextResponse.json({ error: 'Failed to update about content' }, { status: 500 });
    }

    return NextResponse.json({ section: data });
  } catch (error) {
    console.error('Error in PUT /api/about-content/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();

    const { error } = await supabase
      .from('about_content')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting about content:', error);
      return NextResponse.json({ error: 'Failed to delete about content' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/about-content/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


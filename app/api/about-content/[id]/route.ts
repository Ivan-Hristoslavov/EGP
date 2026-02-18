import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

function extractFilePathFromUrl(url: string): string | null {
  if (!url) return null;
  try {
    const match = url.match(/\/storage\/v1\/object\/public\/egp\/(.+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

async function deleteImageFromStorage(imageUrl: string | null): Promise<void> {
  if (!imageUrl || !supabaseAdmin) return;
  const filePath = extractFilePathFromUrl(imageUrl);
  if (!filePath) return;
  try {
    const { error } = await supabaseAdmin.storage.from('egp').remove([filePath]);
    if (error) console.error('Error deleting about image from storage:', error);
  } catch (e) {
    console.error('Error in deleteImageFromStorage:', e);
  }
}

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

    if (body.image_url !== undefined) {
      const { data: existing } = await supabase
        .from('about_content')
        .select('image_url')
        .eq('id', id)
        .single();

      const newUrl = body.image_url == null || body.image_url === '' ? null : body.image_url;
      const oldUrl = existing?.image_url ?? null;
      if (oldUrl && (newUrl !== oldUrl || !newUrl)) {
        await deleteImageFromStorage(oldUrl);
      }
    }

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

    const { data: section } = await supabase
      .from('about_content')
      .select('image_url')
      .eq('id', id)
      .single();

    if (section?.image_url) {
      await deleteImageFromStorage(section.image_url);
    }

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


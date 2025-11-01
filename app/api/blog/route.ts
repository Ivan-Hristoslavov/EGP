import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const category = searchParams.get('category');

    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true })
      .order('published_at', { ascending: false });

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Error fetching blog posts:', error);
      return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
    }

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error in blog GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const {
      title,
      slug,
      excerpt,
      content,
      category,
      featured_image_url,
      featured,
      is_published,
      published_at,
      read_time_minutes,
      seo_title,
      seo_description,
      author_name,
      display_order,
    } = body;

    const { data: post, error } = await supabase
      .from('blog_posts')
      .insert([{
        title,
        slug,
        excerpt,
        content,
        category,
        featured_image_url,
        featured: featured || false,
        is_published: is_published || false,
        published_at: published_at || (is_published ? new Date().toISOString() : null),
        read_time_minutes: read_time_minutes || 5,
        seo_title,
        seo_description,
        author_name: author_name || 'EGP Aesthetics Team',
        display_order: display_order || 0,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating blog post:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error in blog POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


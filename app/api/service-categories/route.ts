import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch service categories with their main_tab info
    const { data: categories, error } = await supabase
      .from('service_categories')
      .select(`
        *,
        main_tab:main_tabs!inner(*)
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching service categories:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform the data to flatten the structure
    const transformedCategories = categories?.map((category: any) => ({
      id: category.id,
      main_tab_id: category.main_tab_id,
      slug: category.slug,
      name: category.name,
      description: category.description || null,
      display_order: category.display_order,
      is_active: category.is_active,
      created_at: category.created_at,
      updated_at: category.updated_at,
      // Flatten nested data
      main_tab: {
        id: category.main_tab.id,
        name: category.main_tab.name,
        slug: category.main_tab.slug
      }
    })) || [];

    return NextResponse.json({ categories: transformedCategories });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const body = await request.json();
    const { 
      main_tab_id,
      slug, 
      name, 
      description,
      display_order 
    } = body;

    const { data: category, error } = await supabase
      .from('service_categories')
      .insert([{
        main_tab_id,
        slug,
        name,
        description,
        display_order: display_order || 0
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


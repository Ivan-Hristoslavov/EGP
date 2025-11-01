import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch ALL service categories (including inactive) for admin
    const { data: categories, error } = await supabase
      .from('service_categories')
      .select(`
        *,
        main_tab:main_tabs!inner(*)
      `)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching service categories for admin:', error);
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
      main_tab: category.main_tab ? {
        id: category.main_tab.id,
        name: category.main_tab.name,
        slug: category.main_tab.slug
      } : null
    })) || [];

    return NextResponse.json({ categories: transformedCategories });
  } catch (error) {
    console.error('Unexpected error in admin service categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


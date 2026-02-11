import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch ALL services (including inactive) for admin, with optional discount group
    const { data: services, error } = await supabase
      .from('services')
      .select(`
        *,
        category:service_categories!inner(
          *,
          main_tab:main_tabs!inner(*)
        ),
        discount_group:discount_groups(id, name, discount_percentage, is_active)
      `)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching services for admin:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform the data to flatten the structure
    const transformedServices = services?.map(service => ({
      id: service.id,
      name: service.name,
      slug: service.slug,
      description: service.description,
      details: service.details,
      benefits: service.benefits,
      preparation: service.preparation,
      aftercare: service.aftercare,
      duration: service.duration,
      price: parseFloat(service.price.toString()),
      is_featured: service.is_featured,
      is_active: service.is_active,
      image_url: service.image_url,
      requires_consultation: service.requires_consultation,
      downtime_days: service.downtime_days,
      results_duration_weeks: service.results_duration_weeks,
      display_order: service.display_order,
      discount_group_id: service.discount_group_id ?? null,
      discount_group: service.discount_group ? {
        id: service.discount_group.id,
        name: service.discount_group.name,
        discount_percentage: parseFloat(service.discount_group.discount_percentage?.toString() ?? '0'),
        is_active: service.discount_group.is_active,
      } : null,
      created_at: service.created_at,
      updated_at: service.updated_at,
      // Flatten nested data
      category: {
        id: service.category.id,
        name: service.category.name,
        slug: service.category.slug,
        main_tab_id: service.category.main_tab_id,
        display_order: service.category.display_order || 0
      },
      main_tab: service.category?.main_tab ? {
        id: service.category.main_tab.id,
        name: service.category.main_tab.name,
        slug: service.category.main_tab.slug
      } : null
    })) || [];

    return NextResponse.json({ services: transformedServices });
  } catch (error) {
    console.error('Unexpected error in admin services:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch services with joins to get category and main_tab info
    const { data: services, error } = await supabase
      .from('services')
      .select(`
        *,
        category:service_categories!inner(
          *,
          main_tab:main_tabs!inner(*)
        )
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false }); // Latest added first within same display_order

    if (error) {
      console.error('Error fetching services:', error);
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
      image_url: service.image_url,
      requires_consultation: service.requires_consultation,
      downtime_days: service.downtime_days,
      results_duration_weeks: service.results_duration_weeks,
      display_order: service.display_order,
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
      main_tab: {
        id: service.category.main_tab.id,
        name: service.category.main_tab.name,
        slug: service.category.main_tab.slug
      }
    })) || [];

    return NextResponse.json({ services: transformedServices });
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
      category_id, 
      name, 
      slug, 
      description,
      details,
      benefits,
      preparation,
      aftercare,
      duration, 
      price, 
      display_order, 
      is_featured,
      is_active,
      requires_consultation,
      downtime_days,
      results_duration_weeks,
      image_url
    } = body;

    const { data: service, error } = await supabase
      .from('services')
      .insert([{
        category_id,
        name,
        slug,
        description,
        details,
        benefits,
        preparation,
        aftercare,
        duration,
        price,
        display_order: display_order || 0,
        is_featured: is_featured || false,
        is_active: is_active !== false,
        requires_consultation: requires_consultation || false,
        downtime_days: downtime_days || 0,
        results_duration_weeks,
        image_url
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating service:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ service });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

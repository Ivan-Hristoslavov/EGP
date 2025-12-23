import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = createClient();
    const { slug } = await params;

    const { data: service, error } = await supabase
      .from('services')
      .select(`
        *,
        category:service_categories!inner(
          *,
          main_tab:main_tabs!inner(*)
        )
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Transform the data to flatten the structure
    const transformedService = {
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
    };

    return NextResponse.json({ service: transformedService });
  } catch (error) {
    console.error('Error in service GET by slug:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}





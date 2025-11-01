import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      .update({
        ...(category_id && { category_id }),
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(details !== undefined && { details }),
        ...(benefits !== undefined && { benefits }),
        ...(preparation !== undefined && { preparation }),
        ...(aftercare !== undefined && { aftercare }),
        ...(duration && { duration }),
        ...(price && { price }),
        ...(display_order !== undefined && { display_order }),
        ...(is_featured !== undefined && { is_featured }),
        ...(is_active !== undefined && { is_active }),
        ...(requires_consultation !== undefined && { requires_consultation }),
        ...(downtime_days !== undefined && { downtime_days }),
        ...(results_duration_weeks !== undefined && { results_duration_weeks }),
        ...(image_url !== undefined && { image_url })
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating service:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ service });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting service:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

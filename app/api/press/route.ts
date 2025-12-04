import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const featured = searchParams.get('featured');
    
    let query = supabaseAdmin
      .from("press")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (type) {
      query = query.eq("type", type);
    }

    if (featured === 'true') {
      query = query.eq("is_featured", true);
    }

    const { data: pressItems, error } = await query;

    if (error) {
      console.error("Error fetching press items:", error);
      return NextResponse.json({ error: "Failed to fetch press items" }, { status: 500 });
    }

    return NextResponse.json({ pressItems });
  } catch (error) {
    console.error("Error in press GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { 
      type,
      title,
      organisation,
      publication,
      year,
      date,
      description,
      image_url,
      is_featured,
      display_order
    } = body;

    if (!type || !title) {
      return NextResponse.json({ 
        error: "Missing required fields: type, title" 
      }, { status: 400 });
    }

    if (!['award', 'press_feature'].includes(type)) {
      return NextResponse.json({ 
        error: "Type must be 'award' or 'press_feature'" 
      }, { status: 400 });
    }

    const { data: pressItem, error } = await supabaseAdmin
      .from("press")
      .insert({
        type,
        title,
        organisation: organisation || null,
        publication: publication || null,
        year: year || null,
        date: date || null,
        description: description || null,
        image_url: image_url || null,
        is_featured: is_featured || false,
        display_order: display_order || 0
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating press item:", error);
      return NextResponse.json({ error: "Failed to create press item" }, { status: 500 });
    }

    return NextResponse.json({ pressItem });
  } catch (error) {
    console.error("Error in press POST:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}




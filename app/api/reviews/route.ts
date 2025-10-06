import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const isAdminMode = searchParams.get('all') === '1';
    
    let query = supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    // If not in admin mode, only return approved reviews
    if (!isAdminMode) {
      query = query.eq("is_approved", true);
    }

    const { data: reviews, error } = await query;

    if (error) {
      console.error("Error fetching reviews:", error);
      return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Error in reviews GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const { 
      customer_name, 
      customer_email, 
      rating, 
      title, 
      comment 
    } = body;

    if (!customer_name || !rating || !comment) {
      return NextResponse.json({ 
        error: "Missing required fields: customer_name, rating, comment" 
      }, { status: 400 });
    }

    if (rating < 0 || rating > 6) {
      return NextResponse.json({ 
        error: "Rating must be between 0 and 6" 
      }, { status: 400 });
    }

    const { data: review, error } = await supabase
      .from("reviews")
      .insert({
        customer_name,
        customer_email,
        rating,
        title,
        comment,
        is_approved: false, // Reviews need approval by default
        is_featured: false
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating review:", error);
      return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error("Error in reviews POST:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
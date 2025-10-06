import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    
    const { data: faqItems, error } = await supabase
      .from("faq")
      .select("*")
      .eq("is_active", true)
      .order("order", { ascending: true });

    if (error) {
      console.error("Error fetching FAQ items:", error);
      return NextResponse.json({ error: "Failed to fetch FAQ items" }, { status: 500 });
    }

    return NextResponse.json({ faqItems });
  } catch (error) {
    console.error("Error in FAQ GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const { question, answer, category, order, is_active } = body;

    const { data: faqItem, error } = await supabase
      .from("faq")
      .insert({
        question,
        answer,
        category: category || 'general',
        order: order || 0,
        is_active: is_active !== false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating FAQ item:", error);
      return NextResponse.json({ error: "Failed to create FAQ item" }, { status: 500 });
    }

    return NextResponse.json({ faqItem });
  } catch (error) {
    console.error("Error in FAQ POST:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
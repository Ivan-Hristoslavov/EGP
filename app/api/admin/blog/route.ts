import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const denied = await requireAdmin();

  if (denied) return denied;

  try {
    const supabase = createClient();

    // Admin mode - get all posts including unpublished
    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching blog posts:", error);

      return NextResponse.json(
        { error: "Failed to fetch blog posts" },
        { status: 500 },
      );
    }

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error in admin blog GET:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

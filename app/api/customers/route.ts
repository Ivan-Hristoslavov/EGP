import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase";

// GET - Search customers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("search");

    if (!searchTerm) {
      return NextResponse.json(
        { error: "Search term is required" },
        { status: 400 }
      );
    }

    // Search customers by name, email, or phone
    const { data: customers, error } = await supabaseAdmin
      .from("customers")
      .select("id, first_name, last_name, email, phone, address, postcode, city")
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      .limit(10);

    if (error) {
      console.error("Error searching customers:", error);
      return NextResponse.json(
        { error: "Failed to search customers" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      customers: customers || [],
      total: customers?.length || 0
    });
  } catch (error) {
    console.error("Unexpected error searching customers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
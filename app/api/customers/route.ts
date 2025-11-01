import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase";

// POST - Create new customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, address, postcode, city } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Split name into first_name and last_name
    const nameParts = (name || '').trim().split(' ');
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || '';

    const { data: customer, error } = await supabaseAdmin
      .from("customers")
      .insert([
        {
          first_name,
          last_name,
          email,
          phone: phone || null,
          address: address || null,
          postcode: postcode || null,
          city: city || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating customer:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create customer" },
        { status: 500 }
      );
    }

    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error creating customer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - List or search customers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("customers")
      .select("id, first_name, last_name, email, phone, address, postcode, city, created_at, updated_at", { count: "exact" });

    // If search term provided, filter by it
    if (searchTerm) {
      query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
    }

    // Apply pagination
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: customers, error, count } = await query;

    if (error) {
      console.error("Error fetching customers:", error);
      return NextResponse.json(
        { error: "Failed to fetch customers" },
        { status: 500 }
      );
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      customers: customers || [],
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Unexpected error fetching customers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
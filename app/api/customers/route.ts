import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

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

// GET - List or search customers (admin only)
export async function GET(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;
    const sort = searchParams.get("sort") || "newest";
    const hasDiscountCode = searchParams.get("has_discount_code") || "all";

    let query = supabaseAdmin
      .from("customers")
      .select("id, first_name, last_name, email, phone, address, postcode, city, notes, marketing_emails, created_at, updated_at, discount_codes(id, code, discount_percentage, valid_from, valid_until, used_at, is_active, created_at)", { count: "exact" });

    // Search: name, email, phone
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.trim();
      query = query.or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`);
    }

    // Filter: only customers with at least one discount code
    if (hasDiscountCode === "yes") {
      const { data: idsWithCode } = await supabaseAdmin
        .from("discount_codes")
        .select("customer_id")
        .not("customer_id", "is", null);
      const customerIds = Array.from(new Set((idsWithCode || []).map((r: { customer_id: string }) => r.customer_id)));
      if (customerIds.length === 0) {
        return NextResponse.json({
          customers: [],
          pagination: { page: 1, limit, totalCount: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
        });
      }
      query = query.in("id", customerIds);
    }

    // Sort
    if (sort === "oldest") {
      query = query.order("created_at", { ascending: true });
    } else if (sort === "name_asc") {
      query = query.order("first_name", { ascending: true }).order("last_name", { ascending: true });
    } else if (sort === "name_desc") {
      query = query.order("first_name", { ascending: false }).order("last_name", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

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
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

function supabaseErrorMessage(error: { message?: string; details?: string; hint?: string; code?: string }) {
  const parts = [error.message, error.details, error.hint].filter(
    (p): p is string => typeof p === "string" && p.length > 0
  );
  return parts.length > 0 ? parts.join(" — ") : error.code || "Database error";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params;

    // Validate customer ID format
    if (!customerId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(customerId)) {
      return NextResponse.json({ 
        error: "Invalid customer ID format" 
      }, { status: 400 });
    }

    // Get customer details with discount codes
    const { data: customer, error: customerError } = await supabaseAdmin
      .from("customers")
      .select("*, discount_codes(id, code, discount_percentage, valid_from, valid_until, used_at, is_active, created_at)")
      .eq("id", customerId)
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Get counts of related data
    const { count: bookingsCount } = await supabaseAdmin
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", customerId);

    const { count: paymentsCount } = await supabaseAdmin
      .from("payments")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", customerId);

    const { count: invoicesCount } = await supabaseAdmin
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", customerId);

    // Get sample data for preview
    const { data: sampleBookings } = await supabaseAdmin
      .from("bookings")
      .select("id, date, service, amount, status")
      .eq("customer_id", customerId)
      .limit(5);

    const { data: samplePayments } = await supabaseAdmin
      .from("payments")
      .select("id, date, amount, status")
      .eq("customer_id", customerId)
      .limit(5);

    const { data: sampleInvoices } = await supabaseAdmin
      .from("invoices")
      .select("id, invoice_number, amount, status, created_at")
      .eq("customer_id", customerId)
      .limit(5);

    return NextResponse.json({
      customer,
      dataSummary: {
        bookings: {
          count: bookingsCount || 0,
          sample: sampleBookings || []
        },
        payments: {
          count: paymentsCount || 0,
          sample: samplePayments || []
        },
        invoices: {
          count: invoicesCount || 0,
          sample: sampleInvoices || []
        }
      }
    });
  } catch (error) {
    console.error("Error in GET /api/customers/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id: customerId } = await params;

    if (!customerId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(customerId)) {
      return NextResponse.json({ error: "Invalid customer ID format" }, { status: 400 });
    }

    const body = await request.json();
    const { name, email, phone, address, notes, postcode, city, marketing_emails } = body as Record<
      string,
      unknown
    >;

    const nameStr = typeof name === "string" ? name.trim() : "";
    const nameParts = nameStr.split(/\s+/).filter(Boolean);
    const first_name = nameParts[0] || "";
    const last_name = nameParts.slice(1).join(" ") || "";

    if (!first_name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {
      first_name,
      last_name,
      email: email.trim(),
      phone: typeof phone === "string" ? phone.trim() || null : phone ?? null,
      address: typeof address === "string" ? address.trim() || null : address ?? null,
      notes: notes === "" || notes === null || notes === undefined ? null : String(notes),
    };

    if (postcode !== undefined) {
      updatePayload.postcode = postcode === null || postcode === "" ? null : String(postcode);
    }
    if (city !== undefined) {
      updatePayload.city = city === null || city === "" ? null : String(city);
    }
    if (typeof marketing_emails === "boolean") {
      updatePayload.marketing_emails = marketing_emails;
    }

    const { data, error } = await supabaseAdmin
      .from("customers")
      .update(updatePayload)
      .eq("id", customerId)
      .select()
      .single();

    if (error) {
      console.error("PUT /api/customers/[id] supabase error:", error);
      return NextResponse.json({ error: supabaseErrorMessage(error) }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("PUT /api/customers/[id]:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params;

    // Validate customer ID format
    if (!customerId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(customerId)) {
      return NextResponse.json({ 
        error: "Invalid customer ID format" 
      }, { status: 400 });
    }

    // First check if customer exists and get full details
    const { data: existingCustomer, error: fetchError } = await supabaseAdmin
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();

    if (fetchError || !existingCustomer) {
      return NextResponse.json({ 
        error: "Customer not found" 
      }, { status: 404 });
    }

    // Get counts of related data for confirmation
    const { count: bookingsCount } = await supabaseAdmin
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", customerId);

    const { count: paymentsCount } = await supabaseAdmin
      .from("payments")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", customerId);

    const { count: invoicesCount } = await supabaseAdmin
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", customerId);

    // Delete related data in order (foreign key constraints)
    const { error: discountCodesError } = await supabaseAdmin
      .from("discount_codes")
      .delete()
      .eq("customer_id", customerId);

    if (discountCodesError) {
      console.error("Error deleting discount codes:", discountCodesError);
    }

    const { error: invoicesError } = await supabaseAdmin
      .from("invoices")
      .delete()
      .eq("customer_id", customerId);

    if (invoicesError) {
      console.error("Error deleting invoices:", invoicesError);
      return NextResponse.json({ 
        error: "Failed to delete customer invoices" 
      }, { status: 500 });
    }

    const { error: paymentsError } = await supabaseAdmin
      .from("payments")
      .delete()
      .eq("customer_id", customerId);

    if (paymentsError) {
      console.error("Error deleting payments:", paymentsError);
      return NextResponse.json({ 
        error: "Failed to delete customer payments" 
      }, { status: 500 });
    }

    const { error: bookingsError } = await supabaseAdmin
      .from("bookings")
      .delete()
      .eq("customer_id", customerId);

    if (bookingsError) {
      console.error("Error deleting bookings:", bookingsError);
      return NextResponse.json({ 
        error: "Failed to delete customer bookings" 
      }, { status: 500 });
    }

    // Finally delete the customer
    const { error: customerError } = await supabaseAdmin
      .from("customers")
      .delete()
      .eq("id", customerId);

    if (customerError) {
      console.error("Error deleting customer:", customerError);
      return NextResponse.json({ 
        error: "Failed to delete customer" 
      }, { status: 500 });
    }

    // Return success with detailed information
    return NextResponse.json({ 
      message: "Customer deleted successfully",
      customer: {
        id: customerId,
        name: `${existingCustomer.first_name || ''} ${existingCustomer.last_name || ''}`.trim(),
        first_name: existingCustomer.first_name,
        last_name: existingCustomer.last_name,
        email: existingCustomer.email,
        phone: existingCustomer.phone,
        address: existingCustomer.address,
        customer_type: existingCustomer.customer_type
      },
      deletedData: {
        bookings: bookingsCount || 0,
        payments: paymentsCount || 0,
        invoices: invoicesCount || 0
      }
    });

  } catch (error) {
    console.error("Error in DELETE /api/customers/[id]:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
} 
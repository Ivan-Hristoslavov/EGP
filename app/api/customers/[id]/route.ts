import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id: customerId } = await params;

    // Validate customer ID format
    if (!customerId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(customerId)) {
      return NextResponse.json({ 
        error: "Invalid customer ID format" 
      }, { status: 400 });
    }

    // Get customer details
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Get counts of related data
    const { count: bookingsCount } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", customerId);

    const { count: paymentsCount } = await supabase
      .from("payments")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", customerId);

    const { count: invoicesCount } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", customerId);

    // Get sample data for preview
    const { data: sampleBookings } = await supabase
      .from("bookings")
      .select("id, date, service, amount, status")
      .eq("customer_id", customerId)
      .limit(5);

    const { data: samplePayments } = await supabase
      .from("payments")
      .select("id, date, amount, status")
      .eq("customer_id", customerId)
      .limit(5);

    const { data: sampleInvoices } = await supabase
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
  try {
    const supabase = createClient();
    const { id: customerId } = await params;
    const body = await request.json();

    const { data, error } = await supabase
      .from("customers")
      .update(body)
      .eq("id", customerId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id: customerId } = await params;

    // Validate customer ID format
    if (!customerId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(customerId)) {
      return NextResponse.json({ 
        error: "Invalid customer ID format" 
      }, { status: 400 });
    }

    // First check if customer exists and get full details
    const { data: existingCustomer, error: fetchError } = await supabase
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
    const { count: bookingsCount } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", customerId);

    const { count: paymentsCount } = await supabase
      .from("payments")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", customerId);

    const { count: invoicesCount } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", customerId);

    // Delete related data in order (foreign key constraints)
    const { error: invoicesError } = await supabase
      .from("invoices")
      .delete()
      .eq("customer_id", customerId);

    if (invoicesError) {
      console.error("Error deleting invoices:", invoicesError);
      return NextResponse.json({ 
        error: "Failed to delete customer invoices" 
      }, { status: 500 });
    }

    const { error: paymentsError } = await supabase
      .from("payments")
      .delete()
      .eq("customer_id", customerId);

    if (paymentsError) {
      console.error("Error deleting payments:", paymentsError);
      return NextResponse.json({ 
        error: "Failed to delete customer payments" 
      }, { status: 500 });
    }

    const { error: bookingsError } = await supabase
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
    const { error: customerError } = await supabase
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
        name: existingCustomer.name,
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
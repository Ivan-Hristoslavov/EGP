import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { 
      services,
      selectedDate,
      selectedTime,
      teamMemberId,
      serviceDurationMinutes,
      amount,
      notes
    } = body;

    // Validate required fields
    if (!services || services.length === 0) {
      return NextResponse.json({ error: "Services are required" }, { status: 400 });
    }

    if (!selectedDate || !selectedTime) {
      return NextResponse.json({ error: "Date and time are required" }, { status: 400 });
    }

    // Test customer email - reuse existing or create new
    const testEmail = "test@example.com";
    
    // First, try to find existing test customer
    let customer;
    const { data: existingCustomer, error: findError } = await supabaseAdmin
      .from("customers")
      .select("*")
      .eq("email", testEmail)
      .single();

    if (existingCustomer) {
      // Use existing test customer
      customer = existingCustomer;
    } else {
      // Create new test customer if doesn't exist
      const testCustomer = {
        first_name: "Test",
        last_name: "Customer", 
        email: testEmail,
        phone: "+44 7700 900123",
        address: "Test Address, London, UK",
        password_hash: "test_hash", // Required field
        notes: "Test booking customer"
      };

      const { data: newCustomer, error: customerError } = await supabaseAdmin
        .from("customers")
        .insert(testCustomer)
        .select()
        .single();

      if (customerError) {
        console.error("Error creating test customer:", customerError);
        return NextResponse.json({ 
          error: "Failed to create test customer",
          details: customerError.message 
        }, { status: 500 });
      }
      
      customer = newCustomer;
    }

    // Create booking data
    const bookingData = {
      customer_id: customer.id,
      customer_name: `${customer.first_name} ${customer.last_name}`, // Required field
      customer_email: customer.email,
      customer_phone: customer.phone,
      service: services.map((s: any) => `${s.name} (${s.quantity}x)`).join(", "),
      date: selectedDate,
      time: selectedTime,
      amount: amount,
      address: customer.address || "Test Address, London, UK",
      notes: notes || "Test booking - No payment required",
      team_member_id: teamMemberId || null,
      service_duration_minutes: serviceDurationMinutes || null,
      status: "confirmed", // Set as confirmed since no payment is needed
      payment_status: "test", // Mark as test payment
    };

    // Insert booking using admin client (bypasses RLS)
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) {
      console.error("Error creating test booking:", bookingError);
      return NextResponse.json({ error: "Failed to create test booking" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      bookingId: booking.id,
      message: "Test booking created successfully"
    });

  } catch (error) {
    console.error("Error in test booking API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

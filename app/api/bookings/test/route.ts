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
      customerData,
      customerName: directCustomerName,
      customerEmail: directCustomerEmail,
      customerPhone: directCustomerPhone,
      notes
    } = body;

    // Validate required fields
    if (!services || services.length === 0) {
      return NextResponse.json({ error: "Services are required" }, { status: 400 });
    }

    if (!selectedDate || !selectedTime) {
      return NextResponse.json({ error: "Date and time are required" }, { status: 400 });
    }

    // Use customer data from request (either direct fields or customerData object)
    let customerName = directCustomerName || "Test Customer";
    let customerEmail = directCustomerEmail || "test@example.com";
    let customerPhone = directCustomerPhone || "+44 7700 900123";
    
    // Handle legacy customerData object format
    if (customerData && !directCustomerName) {
      customerName = `${customerData.firstName} ${customerData.lastName}`.trim();
      customerEmail = customerData.email || customerEmail;
      customerPhone = customerData.phone || customerPhone;
    }

    console.log("Test booking with customer data:", { customerName, customerEmail, customerPhone });

    // Create or find customer record
    let customerId: string | null = null;
    
    if (customerEmail && customerEmail !== "test@example.com") {
      // Try to find existing customer by email
      const { data: existingCustomer } = await supabaseAdmin
        .from("customers")
        .select("id")
        .eq("email", customerEmail.toLowerCase())
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        // Parse name into first_name and last_name
        const nameParts = customerName.trim().split(' ');
        const firstName = nameParts[0] || 'Test';
        const lastName = nameParts.slice(1).join(' ') || 'Customer';

        // Create new customer
        const { data: newCustomer, error: customerError } = await supabaseAdmin
          .from("customers")
          .insert({
            first_name: firstName,
            last_name: lastName,
            email: customerEmail.toLowerCase(),
            phone: customerPhone,
            password_hash: `test_booking_${Date.now()}`,
          })
          .select("id")
          .single();

        if (!customerError && newCustomer) {
          customerId = newCustomer.id;
          console.log("Created customer for test booking:", customerId);
        } else {
          console.warn("Could not create customer:", customerError);
        }
      }
    }

    // Create booking data
    const bookingData = {
      customer_id: customerId, // Link to customer if created
      customer_name: customerName, // Required field
      customer_email: customerEmail,
      customer_phone: customerPhone,
      service: services.map((s: any) => `${s.name}${s.quantity > 1 ? ` (x${s.quantity})` : ''}`).join(", "),
      date: selectedDate,
      time: selectedTime,
      amount: amount,
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

    console.log("Test booking created:", booking.id, "Booking Number:", booking.booking_number);

    // Create payment record for test booking (optional - for visibility in admin panel)
    if (customerId && booking.id && amount > 0) {
      const { data: payment, error: paymentError } = await supabaseAdmin
        .from("payments")
        .insert({
          booking_id: booking.id,
          customer_id: customerId,
          amount: amount,
          payment_method: "card",
          payment_status: "test",
          payment_date: new Date().toISOString().split("T")[0],
          reference: `test_${booking.id.slice(-10)}`,
          notes: "Test booking - No actual payment",
        })
        .select()
        .single();

      if (paymentError) {
        console.warn("Could not create payment record for test booking:", paymentError);
      } else {
        console.log("Test payment record created:", payment.id);
      }
    }

    return NextResponse.json({ 
      success: true, 
      bookingId: booking.id,
      bookingNumber: booking.booking_number,
      customerId: customerId,
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

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any;
    
    if (decoded.type !== "customer") {
      return NextResponse.json(
        { error: "Invalid token type" },
        { status: 401 }
      );
    }

    // Get customer data
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", decoded.customerId)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Get customer bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("*")
      .eq("customer_id", customer.id)
      .order("date", { ascending: false })
      .order("time", { ascending: false });

    if (bookingsError) {
      console.error("Bookings fetch error:", bookingsError);
    }

    // Calculate total bookings
    const totalBookings = bookings?.length || 0;

    // Remove password hash from customer data
    const { password_hash, ...customerWithoutPassword } = customer;

    return NextResponse.json({
      success: true,
      customer: {
        ...customerWithoutPassword,
        totalBookings,
        memberSince: customer.created_at,
      },
      bookings: bookings || [],
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}

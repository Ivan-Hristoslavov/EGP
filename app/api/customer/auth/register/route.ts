import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, phone, password } = await request.json();

    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if customer already exists
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existingCustomer) {
      return NextResponse.json(
        { error: "Customer with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create customer
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          email: email.toLowerCase(),
          phone: phone,
          password_hash: passwordHash,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (customerError) {
      console.error("Customer creation error:", customerError);
      return NextResponse.json(
        { error: "Failed to create customer account" },
        { status: 500 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        customerId: customer.id, 
        email: customer.email,
        type: "customer"
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    // Remove password hash from response
    const { password_hash, ...customerWithoutPassword } = customer;

    return NextResponse.json({
      success: true,
      token,
      customer: customerWithoutPassword,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";

import { supabase } from "../../../../lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Get admin profile by email
    const { data: adminProfile, error } = await supabase
      .from("admin_profile")
      .select("email, password")
      .eq("email", email)
      .single();

    // Validate credentials with bcrypt
    if (
      !error &&
      adminProfile &&
      (await bcrypt.compare(password, adminProfile.password))
    ) {
      // Set authentication cookie
      const cookieStore = await cookies();

      cookieStore.set("adminAuth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error("Auth error:", error);

    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}

// Logout endpoint
export async function DELETE() {
  try {
    const cookieStore = await cookies();

    cookieStore.delete("adminAuth");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function PUT(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const { data: adminProfile, error: fetchError } = await supabaseAdmin
      .from("admin_profile")
      .select("id, password")
      .limit(1)
      .maybeSingle();

    if (fetchError || !adminProfile) {
      console.error("Error fetching admin profile:", fetchError);
      return NextResponse.json(
        { error: "Admin profile not found" },
        { status: 404 }
      );
    }

    const isCurrentValid = await bcrypt.compare(
      currentPassword,
      adminProfile.password
    );

    if (!isCurrentValid) {
      return NextResponse.json(
        { error: "Invalid current password" },
        { status: 401 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { error: updateError } = await supabaseAdmin
      .from("admin_profile")
      .update({
        password: hashedPassword,
        updated_at: new Date().toISOString(),
      })
      .eq("id", adminProfile.id);

    if (updateError) {
      console.error("Error updating password:", updateError);
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json(
      { error: "An error occurred while changing password" },
      { status: 500 }
    );
  }
}

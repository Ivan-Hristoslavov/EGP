import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Public GET endpoint for deposit settings.
 * Used by the booking page (no admin auth required).
 * Returns enabled, type, percentage, fixedAmount.
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("admin_settings")
      .select("value")
      .eq("key", "deposit_settings")
      .single();

    if (error) {
      console.error("Error fetching deposit settings:", error);
      return NextResponse.json(
        { enabled: false, type: "percentage", percentage: 50, fixedAmount: null },
        { headers: { "Cache-Control": "no-store, max-age=0" } },
      );
    }

    let value = data?.value;
    if (typeof value === "string") {
      try {
        value = JSON.parse(value);
      } catch {
        value = {};
      }
    }
    const v = value && typeof value === "object" ? value : {};
    const result = {
      enabled: !!v.enabled,
      type: v.type === "fixed" ? "fixed" : "percentage",
      percentage: v.percentage != null ? Number(v.percentage) : 50,
      fixedAmount: v.fixedAmount != null ? Number(v.fixedAmount) : null,
    };
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (err) {
    console.error("Unexpected error in deposit-settings:", err);
    return NextResponse.json(
      { enabled: false, type: "percentage", percentage: 50, fixedAmount: null },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}

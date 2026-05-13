import { supabaseAdmin } from "@/lib/supabase";
import {
  BOOKING_BLACKOUT_RULES_KEY,
  parseBookingBlackoutRules,
  type BookingBlackoutRule,
} from "@/lib/booking-blackout-rules";

export async function fetchBookingBlackoutRulesFromDb(): Promise<
  BookingBlackoutRule[]
> {
  const { data, error } = await supabaseAdmin
    .from("admin_settings")
    .select("value")
    .eq("key", BOOKING_BLACKOUT_RULES_KEY)
    .maybeSingle();

  if (error) {
    console.error("[booking_blackout_rules] load error:", error);

    return [];
  }

  return parseBookingBlackoutRules(data?.value);
}

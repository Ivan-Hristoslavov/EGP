import { supabaseAdmin } from "@/lib/supabase";
import {
  BOOKING_CLOSED_WEEKDAYS_KEY,
  parseBookingClosedWeekdays,
} from "@/lib/booking-closed-weekdays";

export async function fetchBookingClosedWeekdaysFromDb(): Promise<number[]> {
  const { data, error } = await supabaseAdmin
    .from("admin_settings")
    .select("value")
    .eq("key", BOOKING_CLOSED_WEEKDAYS_KEY)
    .maybeSingle();

  if (error) {
    console.error("[booking_closed_weekdays] load error:", error);

    return [];
  }

  return parseBookingClosedWeekdays(data?.value);
}

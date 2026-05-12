/** Minimal booking shape used by admin calendar UI (pills, grids, day list). */

export type AdminCalendarBookingStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "pending"
  | "confirmed";

export interface AdminCalendarBooking {
  id: string;
  customer_name: string;
  service: string;
  date: string;
  time: string;
  status: AdminCalendarBookingStatus;
  payment_status: "pending" | "paid" | "refunded";
  amount: number;
  duration?: number | null;
  customer_phone?: string | null;
}

export interface CalendarStatsStrip {
  total: number;
  completed: number;
  scheduled: number;
  pending: number;
  cancelled: number;
  paid: number;
  totalAmount: number;
}

export function computeStatsFromBookings(
  bookings: AdminCalendarBooking[],
): CalendarStatsStrip {
  return {
    total: bookings.length,
    completed: bookings.filter((b) => b.status === "completed").length,
    scheduled: bookings.filter(
      (b) => b.status === "scheduled" || b.status === "confirmed",
    ).length,
    pending: bookings.filter((b) => b.status === "pending").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    paid: bookings.filter((b) => b.payment_status === "paid").length,
    totalAmount: bookings.reduce((sum, b) => sum + (b.amount || 0), 0),
  };
}

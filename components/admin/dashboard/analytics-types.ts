import type { DailyBookingPoint } from "@/lib/dashboard-analytics";

export type DashboardAnalytics = {
  booking_series_7d: DailyBookingPoint[];
  booking_series_30d: DailyBookingPoint[];
  service_distribution: { name: string; count: number }[];
  utilization: {
    week_booked: number;
    capacity_proxy: number;
    percent: number;
  };
  revenue_prior_month: number;
  revenue_mom_ratio: number | null;
};

export type UpcomingBookingRow = {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  service: string;
  date: string;
  time: string;
  status: string;
  amount?: number;
  customers?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
};

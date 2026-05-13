"use client";

import { Button, Card, CardBody, CardHeader, Chip, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, ScrollShadow, Skeleton, Tooltip } from "@heroui/react";
import type {
  DashboardAnalytics,
  UpcomingBookingRow,
} from "@/components/admin/dashboard/analytics-types";
import type { DailyBookingPoint } from "@/lib/dashboard-analytics";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  DollarSign,
  Clock,
  Star,
  Eye,
  Plus,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  XCircle,
  Trash2,
} from "lucide-react";


import { DashboardBookingActivityChart } from "@/components/admin/dashboard/booking-activity-chart";
import { DashboardBookingDetailModal } from "@/components/admin/dashboard/booking-detail-modal";
import {
  DashboardNextBookingHero,
  DashboardNextBookingHeroSkeleton,
} from "@/components/admin/dashboard/next-booking-hero";
import { DashboardRevenueWidget } from "@/components/admin/dashboard/revenue-widget";
import { DashboardServiceDistributionChart } from "@/components/admin/dashboard/service-distribution-chart";
import { DashboardUtilizationRadial } from "@/components/admin/dashboard/utilization-radial";
import { inputClassNames } from "@/config/design-system";
import { textColors, typography } from "@/config/typography";

interface Booking {
  id: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  service: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "cancelled" | "pending" | "confirmed";
  payment_status: "pending" | "paid" | "refunded";
  amount: number;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface StatCard {
  title: string;
  value: string;
  subtitle?: string;
  change: string;
  changeType: "up" | "down" | "neutral";
  icon: React.ElementType;
  color: "primary" | "success" | "warning" | "danger" | "secondary";
}

const getTodayString = () => new Date().toISOString().split("T")[0];

const emptyAnalytics: DashboardAnalytics = {
  booking_series_7d: [],
  booking_series_30d: [],
  service_distribution: [],
  utilization: { week_booked: 0, capacity_proxy: 48, percent: 0 },
  revenue_prior_month: 0,
  revenue_mom_ratio: null,
};

function shortDay(iso: string) {
  const [, m, d] = iso.split("-");

  return `${m}/${d}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [stats, setStats] = useState({
    today_bookings: 0,
    monthly_revenue: 0,
    active_clients: 0,
    avg_rating: 0,
    avg_rating_count: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [analytics, setAnalytics] =
    useState<DashboardAnalytics>(emptyAnalytics);
  const [upcomingBookings, setUpcomingBookings] = useState<
    UpcomingBookingRow[]
  >([]);

  const loadDashboardData = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard/stats", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();

        setStats({
          today_bookings: data.stats?.today_bookings || 0,
          monthly_revenue: data.stats?.monthly_revenue || 0,
          active_clients: data.stats?.active_clients || 0,
          avg_rating: Number(data.stats?.avg_rating) || 0,
          avg_rating_count: data.stats?.avg_rating_count ?? 0,
        });
        setRecentActivity(data.recentActivity || []);
        setUpcomingBookings(data.upcomingBookings || []);
        if (data.analytics) {
          setAnalytics({
            booking_series_7d: data.analytics.booking_series_7d || [],
            booking_series_30d: data.analytics.booking_series_30d || [],
            service_distribution: data.analytics.service_distribution || [],
            utilization:
              data.analytics.utilization || emptyAnalytics.utilization,
            revenue_prior_month: data.analytics.revenue_prior_month || 0,
            revenue_mom_ratio:
              data.analytics.revenue_mom_ratio === undefined
                ? null
                : data.analytics.revenue_mom_ratio,
          });
        }
      } else {
        console.error("Error loading dashboard stats:", response.statusText);
      }
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    }
  }, []);

  const loadBookings = useCallback(async () => {
    try {
      const from = new Date();

      from.setDate(from.getDate() - 14);
      const to = new Date();

      to.setDate(to.getDate() + 90);
      const dateFrom = from.toISOString().split("T")[0];
      const dateTo = to.toISOString().split("T")[0];
      const response = await fetch(
        `/api/bookings?date_from=${dateFrom}&date_to=${dateTo}&limit=500`,
        { method: "GET", headers: { "Content-Type": "application/json" } },
      );

      if (response.ok) {
        const data = await response.json();

        setBookings(data.bookings || []);
      } else {
        console.error("Error loading bookings:", response.statusText);
        setBookings([]);
      }
    } catch (error) {
      console.error("Error loading bookings:", error);
      setBookings([]);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadDashboardData(), loadBookings()]);
    } finally {
      setLoading(false);
    }
  }, [loadBookings, loadDashboardData]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") loadDashboardData();
    }

    document.addEventListener("visibilitychange", handleVisibility);

    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [loadDashboardData]);

  const deleteBooking = async (booking: Booking) => {
    if (
      !window.confirm(
        `Delete booking for ${booking.customer_name}? This cannot be undone.`,
      )
    )
      return;
    try {
      const response = await fetch(`/api/bookings?id=${booking.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== booking.id));
        loadDashboardData();
      } else {
        console.error("Failed to delete booking");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };

  const getStatusColor = (
    status: string,
  ): "success" | "warning" | "danger" | "default" | "primary" => {
    switch (status) {
      case "scheduled":
      case "completed":
      case "confirmed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "danger";
      case "info":
        return "primary";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
      case "completed":
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      case "info":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const todayBookings = useMemo(
    () => bookings.filter((b) => b.date === selectedDate),
    [bookings, selectedDate],
  );

  const sortedToday = useMemo(
    () => [...todayBookings].sort((a, b) => a.time.localeCompare(b.time)),
    [todayBookings],
  );

  const sparkPoints = useMemo(
    () =>
      (analytics.booking_series_7d as DailyBookingPoint[]).map((p) => ({
        label: shortDay(p.date),
        v: p.bookings,
      })),
    [analytics.booking_series_7d],
  );

  const nextUpcoming = upcomingBookings[0] ?? null;

  const statCards: StatCard[] = [
    {
      title: "Today's bookings",
      value: stats.today_bookings.toString(),
      change: "0%",
      changeType: "neutral",
      icon: Calendar,
      color: "primary",
    },
    {
      title: "Monthly revenue",
      value: `£${stats.monthly_revenue.toFixed(2)}`,
      change: "0%",
      changeType: "neutral",
      icon: DollarSign,
      color: "success",
    },
    {
      title: "Active clients",
      value: stats.active_clients.toString(),
      change: "0%",
      changeType: "neutral",
      icon: Users,
      color: "secondary",
    },
    {
      title: "Avg. rating",
      value: stats.avg_rating.toFixed(1),
      subtitle:
        stats.avg_rating_count === 0
          ? "No approved reviews yet"
          : `Based on ${stats.avg_rating_count} approved review${stats.avg_rating_count === 1 ? "" : "s"}`,
      change: "0%",
      changeType: "neutral",
      icon: Star,
      color: "warning",
    },
  ];

  if (loading) {
    return (
      <div className="w-full space-y-5 sm:space-y-7">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border border-divider shadow-sm">
              <CardBody className="gap-3 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
                <Skeleton className="h-8 w-20 rounded-md sm:w-24" />
                <Skeleton className="h-3 w-full max-w-[8rem] rounded-md" />
                <Skeleton className="h-3 w-24 rounded-md" />
              </CardBody>
            </Card>
          ))}
        </div>
        <DashboardNextBookingHeroSkeleton />
        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3 lg:gap-6">
          <Card className="flex min-h-[22rem] flex-col border border-divider shadow-sm lg:col-span-2">
            <CardHeader className="flex flex-col gap-3 border-b border-divider p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-36 rounded-md" />
                <Skeleton className="h-3 w-48 rounded-md" />
              </div>
              <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
                <Skeleton className="h-10 w-full rounded-lg sm:w-40" />
                <Skeleton className="h-9 w-28 rounded-lg" />
                <Skeleton className="h-9 w-28 rounded-lg" />
              </div>
            </CardHeader>
            <CardBody className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
              <div className="space-y-3">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="flex min-h-[10rem] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-default-200 p-8 dark:border-default-100/25">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-4 w-48 rounded-md" />
                  <Skeleton className="h-3 w-64 max-w-full rounded-md" />
                  <Skeleton className="h-8 w-32 rounded-lg" />
                </Skeleton>
              </div>
              <div className="space-y-3 border-t border-divider pt-6">
                <Skeleton className="h-3 w-28 rounded-full" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            </CardBody>
          </Card>
          <Card className="flex min-h-[22rem] flex-col border border-divider shadow-sm">
            <CardHeader className="border-b border-divider p-4 sm:p-6">
              <Skeleton className="h-6 w-24 rounded-md" />
            </CardHeader>
            <CardBody className="flex flex-1 flex-col gap-3 p-4 sm:p-6">
              <div className="flex flex-1 flex-col items-center justify-center gap-2 py-6">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-4 w-36 rounded-md" />
                <Skeleton className="h-3 w-52 max-w-full rounded-md" />
              </div>
              <Skeleton className="mt-auto h-9 w-full rounded-lg" />
            </CardBody>
          </Card>
        </div>
        <Card className="overflow-hidden border border-divider shadow-sm">
          <CardHeader className="border-b border-divider p-4 sm:p-6">
            <Skeleton className="h-6 w-48 rounded-md" />
            <Skeleton className="mt-2 h-3 w-72 max-w-full rounded-md" />
          </CardHeader>
          <CardBody className="p-4 sm:p-6">
            <Skeleton className="h-[280px] w-full rounded-xl" />
          </CardBody>
        </Card>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card
              key={i}
              className="flex min-h-[20rem] flex-col border border-divider shadow-sm"
            >
              <CardHeader className="border-b border-divider p-4 sm:p-6">
                <Skeleton className="h-5 w-32 rounded-md" />
                <Skeleton className="mt-2 h-3 w-48 rounded-md" />
              </CardHeader>
              <CardBody className="flex flex-1 flex-col justify-between gap-4 p-4 sm:p-6">
                <Skeleton className="h-36 w-full flex-1 rounded-xl" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 sm:space-y-7">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
        initial={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.35 }}
      >
        {statCards.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.title}
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 8 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
            >
              <Card className="border border-divider shadow-sm transition-transform hover:-translate-y-0.5">
                <CardBody className="p-4 sm:p-5">
                  <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
                    <div
                      className={`flex-shrink-0 rounded-lg p-2 sm:p-2.5 ${
                        stat.color === "primary"
                          ? "bg-primary-100 dark:bg-primary-900/20"
                          : stat.color === "success"
                            ? "bg-success-100 dark:bg-success-900/20"
                            : stat.color === "warning"
                              ? "bg-warning-100 dark:bg-warning-900/20"
                              : stat.color === "danger"
                                ? "bg-danger-100 dark:bg-danger-900/20"
                                : "bg-default-100 dark:bg-default-900/20"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 sm:h-6 sm:w-6 ${
                          stat.color === "primary"
                            ? "text-primary-600 dark:text-primary-400"
                            : stat.color === "success"
                              ? "text-success-600 dark:text-success-400"
                              : stat.color === "warning"
                                ? "text-warning-600 dark:text-warning-400"
                                : stat.color === "danger"
                                  ? "text-danger-600 dark:text-danger-400"
                                  : "text-default-600 dark:text-default-400"
                        }`}
                      />
                    </div>
                    {stat.changeType !== "neutral" ? (
                      <Chip
                        className="flex-shrink-0"
                        color={stat.changeType === "up" ? "success" : "danger"}
                        size="sm"
                        variant="flat"
                      >
                        {stat.change}
                      </Chip>
                    ) : null}
                  </div>
                  <h3 className="mb-0.5 truncate text-lg font-bold sm:text-xl">
                    {stat.value}
                  </h3>
                  {stat.subtitle ? (
                    <p className="mb-0.5 line-clamp-2 text-[10px] text-default-400 sm:text-xs">
                      {stat.subtitle}
                    </p>
                  ) : null}
                  <p className="truncate text-[10px] text-default-500 sm:text-xs">
                    {stat.title}
                  </p>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.35, delay: 0.08 }}
      >
        <DashboardNextBookingHero
          booking={nextUpcoming}
          onOpenBookings={() => router.push("/admin/bookings")}
          onOpenCalendar={() => router.push("/admin/calendar")}
        />
      </motion.div>

      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3 lg:gap-6">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex min-h-0 flex-col lg:col-span-2"
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <Card className="flex h-full min-h-0 flex-col border border-divider shadow-sm">
            <CardHeader className="flex flex-col gap-3 border-b border-divider p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:p-6">
              <div className="min-w-0">
                <h2
                  className={`${typography.headingCard} ${textColors.heading}`}
                >
                  Day schedule
                </h2>
                <p className="text-xs text-default-500">
                  {new Date(selectedDate).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                <Input
                  aria-label="Schedule date"
                  classNames={{
                    ...inputClassNames,
                    base: `${inputClassNames.base} w-full sm:w-auto`,
                    input: `${inputClassNames.input} min-w-0 sm:w-40`,
                  }}
                  label="Date"
                  size="sm"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                <Button
                  size="sm"
                  startContent={<Calendar className="h-4 w-4" />}
                  variant="bordered"
                  onPress={() => router.push("/admin/calendar")}
                >
                  Full calendar
                </Button>
                <Button
                  color="primary"
                  size="sm"
                  startContent={<Plus className="h-4 w-4" />}
                  onPress={() => router.push("/admin/bookings")}
                >
                  New booking
                </Button>
              </div>
            </CardHeader>
            <CardBody className="flex min-h-0 flex-1 flex-col space-y-8 p-4 sm:p-6">
              <section aria-labelledby="dash-timeline-heading">
                <h3
                  className="mb-3 text-xs font-semibold uppercase tracking-wide text-default-500"
                  id="dash-timeline-heading"
                >
                  Timeline
                </h3>
                {sortedToday.length === 0 ? (
                  <div className="flex flex-col items-center rounded-xl border border-dashed border-default-200 py-10 text-center dark:border-default-100/25">
                    <motion.div
                      animate={{ scale: [1, 1.04, 1] }}
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Calendar className="mx-auto mb-3 h-12 w-12 text-default-300 sm:h-14 sm:w-14" />
                    </motion.div>
                    <p className="text-sm font-medium text-default-600">
                      Nothing on the schedule
                    </p>
                    <p className="mt-1 max-w-sm text-xs text-default-500">
                      Choose another date in the header or create a booking —
                      this panel stays calm when the day is clear.
                    </p>
                    <Button
                      className="mt-4"
                      color="primary"
                      size="sm"
                      variant="flat"
                      onPress={() => router.push("/admin/bookings")}
                    >
                      Open bookings
                    </Button>
                  </div>
                ) : (
                  <ul className="relative space-y-0 border-l border-default-200 pl-5 dark:border-default-100/25">
                    {sortedToday.map((booking) => (
                      <li key={booking.id} className="relative pb-6 last:pb-0">
                        <span
                          aria-hidden
                          className="absolute -left-[21px] mt-1.5 h-2.5 w-2.5 rounded-full bg-primary-400 ring-4 ring-content1 dark:ring-content1"
                        />
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-default-400">
                              {booking.time}
                            </p>
                            <p className="font-semibold text-default-800 dark:text-default-100">
                              {booking.customer_name}
                            </p>
                            <p className="text-sm text-default-500">
                              {booking.service}
                            </p>
                          </div>
                          <Chip
                            classNames={{ base: "shrink-0" }}
                            color={getStatusColor(booking.status)}
                            size="sm"
                            startContent={getStatusIcon(booking.status)}
                            variant="flat"
                          >
                            {booking.status}
                          </Chip>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <div className="border-t border-divider pt-8">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-default-500">
                  Appointments
                </h3>
                {todayBookings.length === 0 ? (
                  <p className="py-6 text-center text-sm text-default-500">
                    No booking cards for this date — add a booking or pick
                    another day.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {todayBookings.map((booking) => (
                      <Card
                        key={booking.id}
                        isPressable
                        className="border border-divider transition-shadow hover:shadow-md"
                      >
                        <CardBody className="p-3 sm:p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-1 items-center gap-4">
                              <Chip
                                color={getStatusColor(booking.status)}
                                startContent={getStatusIcon(booking.status)}
                                variant="flat"
                              >
                                {booking.status}
                              </Chip>
                              <div className="min-w-0 flex-1">
                                <h4 className="truncate font-semibold">
                                  {booking.customer_name}
                                </h4>
                                <p className="truncate text-sm text-default-500">
                                  {booking.service} • {booking.time}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-semibold">
                                  £{booking.amount}
                                </p>
                                <Chip
                                  color={
                                    booking.payment_status === "paid"
                                      ? "success"
                                      : "warning"
                                  }
                                  size="sm"
                                  variant="flat"
                                >
                                  {booking.payment_status}
                                </Chip>
                              </div>
                              <Dropdown>
                                <DropdownTrigger>
                                  <Button
                                    isIconOnly
                                    aria-label="Booking actions"
                                    className="min-h-[44px] min-w-[44px]"
                                    size="md"
                                    variant="light"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="Booking actions">
                                  <DropdownItem
                                    key="view"
                                    startContent={<Eye className="h-4 w-4" />}
                                    onPress={() => setViewingBooking(booking)}
                                  >
                                    View details
                                  </DropdownItem>
                                  <DropdownItem
                                    key="bookings"
                                    startContent={
                                      <Calendar className="h-4 w-4" />
                                    }
                                    onPress={() =>
                                      router.push("/admin/bookings")
                                    }
                                  >
                                    Go to bookings
                                  </DropdownItem>
                                  <DropdownItem
                                    key="delete"
                                    color="danger"
                                    startContent={
                                      <Trash2 className="h-4 w-4" />
                                    }
                                    onPress={() => deleteBooking(booking)}
                                  >
                                    Delete
                                  </DropdownItem>
                                </DropdownMenu>
                              </Dropdown>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex min-h-0 flex-col lg:col-span-1"
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.35, delay: 0.12 }}
        >
          <Card className="flex h-full min-h-0 flex-col border border-divider shadow-sm">
            <CardHeader className="border-b border-divider p-4 sm:p-6">
              <h2 className={`${typography.headingCard} ${textColors.heading}`}>
                Activity
              </h2>
            </CardHeader>
            <CardBody className="flex min-h-0 flex-1 flex-col p-4 sm:p-6">
              {recentActivity.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
                  <Clock className="mx-auto mb-2 h-10 w-10 text-default-300 sm:h-12 sm:w-12" />
                  <p className="text-sm text-default-500">No recent activity</p>
                  <p className="mt-1 text-xs text-default-400">
                    Staff actions and payments will surface here.
                  </p>
                </div>
              ) : (
                <ScrollShadow
                  hideScrollBar
                  className="min-h-0 flex-1 pr-1 lg:max-h-none"
                >
                  <div className="space-y-3 sm:space-y-4">
                    {recentActivity.map((activity: any) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-2 sm:gap-3"
                      >
                        <Chip
                          color={getStatusColor(activity.status)}
                          size="sm"
                          startContent={getStatusIcon(activity.status)}
                          variant="flat"
                        />
                        <div className="min-w-0 flex-1">
                          <Tooltip
                            closeDelay={0}
                            content={activity.message}
                            delay={400}
                          >
                            <p className="cursor-default truncate text-sm font-medium">
                              {activity.message}
                            </p>
                          </Tooltip>
                          <p className="text-xs text-default-500">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollShadow>
              )}
              <div className="mt-auto w-full shrink-0 pt-4 sm:pt-6">
                <Button
                  className="w-full"
                  size="sm"
                  variant="light"
                  onPress={() => router.push("/admin/bookings")}
                >
                  View all activity
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.35, delay: 0.14 }}
      >
        <DashboardBookingActivityChart
          series30={analytics.booking_series_30d}
          series7={analytics.booking_series_7d}
        />
      </motion.div>

      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3 lg:gap-6">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="min-w-0 flex h-full lg:min-h-[320px]"
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.35, delay: 0.16 }}
        >
          <DashboardRevenueWidget
            monthlyRevenue={stats.monthly_revenue}
            revenueMomRatio={analytics.revenue_mom_ratio}
            sparkPoints={sparkPoints}
          />
        </motion.div>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="min-w-0 flex h-full lg:min-h-[320px]"
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.35, delay: 0.18 }}
        >
          <DashboardUtilizationRadial
            capacityProxy={analytics.utilization.capacity_proxy}
            percent={analytics.utilization.percent}
            weekBooked={analytics.utilization.week_booked}
          />
        </motion.div>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="min-w-0 flex h-full lg:min-h-[320px]"
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.35, delay: 0.2 }}
        >
          <DashboardServiceDistributionChart
            data={analytics.service_distribution}
          />
        </motion.div>
      </div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.35, delay: 0.22 }}
      >
        <Card className="flex h-full flex-col border border-divider shadow-sm">
          <CardHeader className="border-b border-divider p-4 sm:p-6">
            <h2 className={`${typography.headingCard} ${textColors.heading}`}>
              Calendar &amp; hours
            </h2>
            <p className="text-xs text-default-500">
              Month, week, and day views plus closed weekdays and slot
              generation.
            </p>
          </CardHeader>
          <CardBody className="flex flex-1 flex-col justify-between gap-4 p-4 sm:p-6">
            <p className="text-sm text-default-600">
              Configure which weekdays block online booking, edit weekly hours,
              and regenerate slots from the calendar page.
            </p>
            <Button
              color="primary"
              startContent={<Calendar className="h-4 w-4" />}
              variant="flat"
              onPress={() => router.push("/admin/calendar")}
            >
              Open calendar &amp; availability
            </Button>
          </CardBody>
        </Card>
      </motion.div>

      <DashboardBookingDetailModal
        booking={viewingBooking}
        getStatusColor={getStatusColor}
        onClose={() => setViewingBooking(null)}
        onGoBookings={() => router.push("/admin/bookings")}
      />
    </div>
  );
}

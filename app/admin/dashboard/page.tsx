"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Star,
  Eye,
  Plus,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  XCircle,
  X,
  Trash2,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";

interface Booking {
  id: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  service: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "cancelled" | "pending";
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
  change: string;
  changeType: "up" | "down" | "neutral";
  icon: React.ElementType;
  color: "primary" | "success" | "warning" | "danger" | "secondary";
}

// Get today's date in YYYY-MM-DD format
const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

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
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData();
    loadBookings();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard/stats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          today_bookings: data.stats?.today_bookings || 0,
          monthly_revenue: data.stats?.monthly_revenue || 0,
          active_clients: data.stats?.active_clients || 0,
          avg_rating: data.stats?.avg_rating || 0,
        });
        setRecentActivity(data.recentActivity || []);
      } else {
        console.error("Error loading dashboard stats:", response.statusText);
      }
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    }
  };

  const loadBookings = async () => {
    try {
      const response = await fetch("/api/bookings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

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
    } finally {
      setLoading(false);
    }
  };

  const deleteBooking = async (booking: Booking) => {
    if (!window.confirm(`Delete booking for ${booking.customer_name}? This cannot be undone.`)) return;
    try {
      const response = await fetch(`/api/bookings?id=${booking.id}`, { method: "DELETE" });
      if (response.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== booking.id));
      } else {
        console.error("Failed to delete booking");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };

  const getStatusColor = (status: string): "success" | "warning" | "danger" | "default" => {
    switch (status) {
      case "scheduled":
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "danger";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const todayBookings = bookings.filter(
    (booking) => booking.date === selectedDate
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Create stat cards from loaded data
  const statCards: StatCard[] = [
    {
      title: "Today's Bookings",
      value: stats.today_bookings.toString(),
      change: "0%",
      changeType: "neutral",
      icon: Calendar,
      color: "primary",
    },
    {
      title: "Monthly Revenue",
      value: `£${stats.monthly_revenue.toFixed(2)}`,
      change: "0%",
      changeType: "neutral",
      icon: DollarSign,
      color: "success",
    },
    {
      title: "Active Clients",
      value: stats.active_clients.toString(),
      change: "0%",
      changeType: "neutral",
      icon: Users,
      color: "secondary",
    },
 {
      title: "Avg. Rating",
      value: stats.avg_rating.toFixed(1),
      change: "0%",
      changeType: "neutral",
      icon: Star,
      color: "warning",
    },
  ];

  return (
    <div className="w-full space-y-4 sm:space-y-6">
        {/* Stats Cards - compact 2x2 grid for mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
            <Card key={index} className="border border-divider">
              <CardBody className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                  <div className={`p-2 sm:p-2.5 rounded-lg flex-shrink-0 ${
                    stat.color === "primary" ? "bg-primary-100 dark:bg-primary-900/20" :
                    stat.color === "success" ? "bg-success-100 dark:bg-success-900/20" :
                    stat.color === "warning" ? "bg-warning-100 dark:bg-warning-900/20" :
                    stat.color === "danger" ? "bg-danger-100 dark:bg-danger-900/20" :
                    "bg-default-100 dark:bg-default-900/20"
                  }`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${
                      stat.color === "primary" ? "text-primary-600 dark:text-primary-400" :
                      stat.color === "success" ? "text-success-600 dark:text-success-400" :
                      stat.color === "warning" ? "text-warning-600 dark:text-warning-400" :
                      stat.color === "danger" ? "text-danger-600 dark:text-danger-400" :
                      "text-default-600 dark:text-default-400"
                    }`} />
                    </div>
                  {stat.changeType !== "neutral" && (
                    <Chip size="sm" color={stat.changeType === "up" ? "success" : "danger"} variant="flat" className="flex-shrink-0">
                      {stat.change}
                    </Chip>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-0.5 truncate">{stat.value}</h3>
                <p className="text-[10px] sm:text-xs text-default-500 truncate">{stat.title}</p>
              </CardBody>
            </Card>
            );
          })}
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Today's Bookings */}
        <Card className="lg:col-span-2 border border-divider">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 border-b border-divider">
            <h2 className="text-base sm:text-lg font-bold">Today's Bookings</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                size="sm"
                classNames={{
                  input: "w-full min-w-0 sm:w-40",
                }}
                    />
              <Button
                color="primary"
                startContent={<Plus className="w-4 h-4" />}
                size="sm"
                onPress={() => router.push("/admin/bookings")}
              >
                      New Booking
              </Button>
                  </div>
          </CardHeader>
          <CardBody className="p-4 sm:p-6">
                {todayBookings.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-default-300 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">No bookings today</h3>
                <p className="text-sm text-default-500">
                      You have no appointments scheduled for this date.
                    </p>
                  </div>
                ) : (
              <div className="space-y-3">
                    {todayBookings.map((booking) => (
                  <Card key={booking.id} isPressable className="border border-divider hover:shadow-md transition-shadow">
                    <CardBody className="p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <Chip
                            color={getStatusColor(booking.status)}
                            variant="flat"
                            startContent={getStatusIcon(booking.status)}
                          >
                            {booking.status}
                          </Chip>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{booking.customer_name}</h4>
                            <p className="text-sm text-default-500 truncate">
                              {booking.service} • {booking.time}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold">£{booking.amount}</p>
                            <Chip
                              size="sm"
                              color={booking.payment_status === "paid" ? "success" : "warning"}
                              variant="flat"
                            >
                              {booking.payment_status}
                            </Chip>
                          </div>
                          <Dropdown>
                            <DropdownTrigger>
                              <Button
                                isIconOnly
                                variant="light"
                                size="md"
                                className="min-h-[44px] min-w-[44px]"
                                aria-label="Booking actions"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Booking actions">
                              <DropdownItem
                                key="view"
                                startContent={<Eye className="w-4 h-4" />}
                                onPress={() => setViewingBooking(booking)}
                              >
                                View Details
                              </DropdownItem>
                              <DropdownItem
                                key="bookings"
                                startContent={<Calendar className="w-4 h-4" />}
                                onPress={() => router.push("/admin/bookings")}
                              >
                                Go to Bookings
                              </DropdownItem>
                              <DropdownItem
                                key="delete"
                                color="danger"
                                startContent={<Trash2 className="w-4 h-4" />}
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
          </CardBody>
        </Card>

          {/* Recent Activity */}
        <Card className="border border-divider">
          <CardHeader className="p-4 sm:p-6 border-b border-divider">
            <h2 className="text-base sm:text-lg font-bold">Recent Activity</h2>
          </CardHeader>
          <CardBody className="p-4 sm:p-6">
            {recentActivity.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-default-300 mx-auto mb-2 sm:mb-3" />
                <p className="text-sm text-default-500">No recent activity</p>
              </div>
            ) : (
                <div className="space-y-3 sm:space-y-4">
                  {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-2 sm:gap-3">
                    <Chip
                      color={getStatusColor(activity.status)}
                      variant="flat"
                      startContent={getStatusIcon(activity.status)}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.message}</p>
                      <p className="text-xs text-default-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
            <Button
              variant="light"
              className="w-full mt-4 sm:mt-6"
              size="sm"
              onPress={() => router.push("/admin/bookings")}
            >
              View All Activity
            </Button>
          </CardBody>
        </Card>
        </div>

        {/* Quick Actions */}
      <Card className="border border-divider">
        <CardHeader className="p-4 sm:p-6 border-b border-divider">
          <h2 className="text-base sm:text-lg font-bold">Quick Actions</h2>
        </CardHeader>
        <CardBody className="p-4 sm:p-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Button
              className="h-auto p-3 sm:p-4 justify-start min-h-[44px]"
              variant="flat"
              color="primary"
              startContent={<Plus className="w-5 h-5" />}
              onPress={() => router.push("/admin/bookings")}
            >
                  <div className="text-left">
                <h3 className="font-semibold">New Booking</h3>
                <p className="text-xs text-default-500">Add appointment</p>
                  </div>
            </Button>

            <Button
              className="h-auto p-3 sm:p-4 justify-start min-h-[44px]"
              variant="flat"
              color="secondary"
              startContent={<Users className="w-5 h-5" />}
              onPress={() => router.push("/admin/customers")}
            >
                  <div className="text-left">
                <h3 className="font-semibold">Manage Clients</h3>
                <p className="text-xs text-default-500">View all clients</p>
                  </div>
            </Button>

            <Button
              className="h-auto p-3 sm:p-4 justify-start min-h-[44px]"
              variant="flat"
              color="success"
              startContent={<DollarSign className="w-5 h-5" />}
              onPress={() => router.push("/admin/payments")}
            >
                  <div className="text-left">
                <h3 className="font-semibold">View Payments</h3>
                <p className="text-xs text-default-500">Financial overview</p>
                  </div>
            </Button>

            <Button
              className="h-auto p-3 sm:p-4 justify-start min-h-[44px]"
              variant="flat"
              color="secondary"
              startContent={<Calendar className="w-5 h-5" />}
              onPress={() => router.push("/admin/calendar")}
            >
                  <div className="text-left">
                <h3 className="font-semibold">Calendar View</h3>
                <p className="text-xs text-default-500">Full calendar</p>
              </div>
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Booking Detail Modal */}
      {viewingBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setViewingBooking(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-divider w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">Booking Details</h3>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={() => setViewingBooking(null)}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-default-500 uppercase tracking-wide mb-1">Customer</p>
                <p className="font-medium">{viewingBooking.customer_name}</p>
                {viewingBooking.customer_email && (
                  <p className="text-sm text-default-500">{viewingBooking.customer_email}</p>
                )}
                {viewingBooking.customer_phone && (
                  <p className="text-sm text-default-500">{viewingBooking.customer_phone}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-default-500 uppercase tracking-wide mb-1">Service</p>
                <p className="font-medium">{viewingBooking.service}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-default-500 uppercase tracking-wide mb-1">Date</p>
                  <p>{new Date(viewingBooking.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-default-500 uppercase tracking-wide mb-1">Time</p>
                  <p>{viewingBooking.time}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-default-500 uppercase tracking-wide mb-1">Status</p>
                  <Chip color={getStatusColor(viewingBooking.status)} variant="flat" size="sm">
                    {viewingBooking.status}
                  </Chip>
                </div>
                <div>
                  <p className="text-xs font-medium text-default-500 uppercase tracking-wide mb-1">Payment</p>
                  <Chip
                    color={viewingBooking.payment_status === "paid" ? "success" : "warning"}
                    variant="flat"
                    size="sm"
                  >
                    {viewingBooking.payment_status}
                  </Chip>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-default-500 uppercase tracking-wide mb-1">Amount</p>
                <p className="font-semibold">£{viewingBooking.amount}</p>
              </div>
              {viewingBooking.notes && (
                <div>
                  <p className="text-xs font-medium text-default-500 uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-sm">{viewingBooking.notes}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <Button
                variant="flat"
                color="primary"
                className="flex-1"
                onPress={() => { setViewingBooking(null); router.push("/admin/bookings"); }}
              >
                Go to Bookings
              </Button>
              <Button
                variant="light"
                onPress={() => setViewingBooking(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

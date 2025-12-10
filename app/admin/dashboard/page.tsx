"use client";

import { useState, useEffect } from "react";
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
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";

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

// Empty stats - will be populated from database
const statCards: StatCard[] = [
  {
    title: "Today's Bookings",
    value: "0",
    change: "0%",
    changeType: "neutral",
    icon: Calendar,
    color: "primary",
  },
  {
    title: "Monthly Revenue",
    value: "£0",
    change: "0%",
    changeType: "neutral",
    icon: DollarSign,
    color: "success",
  },
  {
    title: "Active Clients",
    value: "0",
    change: "0%",
    changeType: "neutral",
    icon: Users,
    color: "secondary",
  },
  {
    title: "Avg. Rating",
    value: "0.0",
    change: "0%",
    changeType: "neutral",
    icon: Star,
    color: "warning",
  },
];

// Empty activity - will be populated from database
const recentActivity: any[] = [];

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Load bookings on component mount
  useEffect(() => {
    loadBookings();
  }, []);

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

  return (
    <div className="w-full space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border border-divider">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${
                    stat.color === "primary" ? "bg-primary-100 dark:bg-primary-900/20" :
                    stat.color === "success" ? "bg-success-100 dark:bg-success-900/20" :
                    stat.color === "warning" ? "bg-warning-100 dark:bg-warning-900/20" :
                    stat.color === "danger" ? "bg-danger-100 dark:bg-danger-900/20" :
                    "bg-default-100 dark:bg-default-900/20"
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      stat.color === "primary" ? "text-primary-600 dark:text-primary-400" :
                      stat.color === "success" ? "text-success-600 dark:text-success-400" :
                      stat.color === "warning" ? "text-warning-600 dark:text-warning-400" :
                      stat.color === "danger" ? "text-danger-600 dark:text-danger-400" :
                      "text-default-600 dark:text-default-400"
                    }`} />
                  </div>
                  {stat.changeType !== "neutral" && (
                    <Chip
                      size="sm"
                      color={stat.changeType === "up" ? "success" : "danger"}
                      variant="flat"
                      startContent={
                        stat.changeType === "up" ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )
                      }
                    >
                      {stat.change}
                    </Chip>
                  )}
                </div>
                <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                <p className="text-sm text-default-500">{stat.title}</p>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Bookings */}
        <Card className="lg:col-span-2 border border-divider">
          <CardHeader className="flex items-center justify-between p-6 border-b border-divider">
            <h2 className="text-xl font-bold">Today's Bookings</h2>
            <div className="flex items-center gap-3">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                size="sm"
                classNames={{
                  input: "w-40",
                }}
              />
              <Button
                color="primary"
                startContent={<Plus className="w-4 h-4" />}
                size="sm"
              >
                New Booking
              </Button>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            {todayBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-default-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookings today</h3>
                <p className="text-sm text-default-500">
                  You have no appointments scheduled for this date.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayBookings.map((booking) => (
                  <Card key={booking.id} isPressable className="border border-divider hover:shadow-md transition-shadow">
                    <CardBody className="p-4">
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
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
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
          <CardHeader className="p-6 border-b border-divider">
            <h2 className="text-xl font-bold">Recent Activity</h2>
          </CardHeader>
          <CardBody className="p-6">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-default-300 mx-auto mb-3" />
                <p className="text-sm text-default-500">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
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
              className="w-full mt-6"
              size="sm"
            >
              View All Activity
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border border-divider">
        <CardHeader className="p-6 border-b border-divider">
          <h2 className="text-xl font-bold">Quick Actions</h2>
        </CardHeader>
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              className="h-auto p-4 justify-start"
              variant="flat"
              color="primary"
              startContent={<Plus className="w-5 h-5" />}
            >
              <div className="text-left">
                <h3 className="font-semibold">New Booking</h3>
                <p className="text-xs text-default-500">Add appointment</p>
              </div>
            </Button>

            <Button
              className="h-auto p-4 justify-start"
              variant="flat"
              color="secondary"
              startContent={<Users className="w-5 h-5" />}
            >
              <div className="text-left">
                <h3 className="font-semibold">Manage Clients</h3>
                <p className="text-xs text-default-500">View all clients</p>
              </div>
            </Button>

            <Button
              className="h-auto p-4 justify-start"
              variant="flat"
              color="success"
              startContent={<DollarSign className="w-5 h-5" />}
            >
              <div className="text-left">
                <h3 className="font-semibold">View Reports</h3>
                <p className="text-xs text-default-500">Financial overview</p>
              </div>
            </Button>

            <Button
              className="h-auto p-4 justify-start"
              variant="flat"
              color="secondary"
              startContent={<Calendar className="w-5 h-5" />}
            >
              <div className="text-left">
                <h3 className="font-semibold">Calendar View</h3>
                <p className="text-xs text-default-500">Full calendar</p>
              </div>
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

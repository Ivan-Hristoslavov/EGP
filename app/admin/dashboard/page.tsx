"use client";

import { useState, useEffect } from "react";
import { AdminProfileData } from "@/components/AdminProfileData";

type DashboardStats = {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalRevenue: number;
  weeklyRevenue: number;
  totalCustomers: number;
  pendingPayments: number;
  // Previous week stats for comparison
  previousWeekBookings: number;
  previousWeekRevenue: number;
  previousWeekCustomers: number;
  previousWeekPendingBookings: number;
};

type RecentActivity = {
  id: string;
  type: "booking" | "payment" | "customer";
  message: string;
  time: string;
  status: "success" | "warning" | "info";
};

// Empty data - will be loaded from Supabase
const mockStats: DashboardStats = {
  totalBookings: 0,
  pendingBookings: 0,
  completedBookings: 0,
  totalRevenue: 0,
  weeklyRevenue: 0,
  totalCustomers: 0,
  pendingPayments: 0,
  previousWeekBookings: 0,
  previousWeekRevenue: 0,
  previousWeekCustomers: 0,
  previousWeekPendingBookings: 0,
};

const mockRecentActivity: RecentActivity[] = [];

const upcomingBookings = [];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [recentActivity, setRecentActivity] =
    useState<RecentActivity[]>(mockRecentActivity);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [allActivity, setAllActivity] = useState<RecentActivity[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard/stats");

      if (response.ok) {
        const data = await response.json();
        // Ensure all stats properties exist with default values
        const safeStats = {
          totalBookings: data.stats?.total_bookings || 0,
          pendingBookings: data.stats?.pending_bookings || 0,
          completedBookings: data.stats?.completed_bookings || 0,
          totalRevenue: data.stats?.total_revenue || 0,
          weeklyRevenue: data.stats?.weekly_revenue || 0,
          totalCustomers: data.stats?.total_customers || 0,
          pendingPayments: data.stats?.pending_payments || 0,
          previousWeekBookings: data.stats?.previous_week_bookings || 0,
          previousWeekRevenue: data.stats?.previous_week_revenue || 0,
          previousWeekCustomers: data.stats?.previous_week_customers || 0,
          previousWeekPendingBookings: data.stats?.previous_week_pending_bookings || 0,
        };

        setStats(safeStats);
        setRecentActivity(data.recentActivity || []);
        setUpcomingBookings(data.upcomingBookings || []);
      } else {
        console.error("Failed to load dashboard data");
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllActivity = async () => {
    try {
      setModalLoading(true);
      const response = await fetch("/api/dashboard/stats?allActivity=true");
      
      if (response.ok) {
        const data = await response.json();
        setAllActivity(data.allActivity || data.recentActivity || []);
      } else {
        console.error("Failed to load all activity");
      }
    } catch (error) {
      console.error("Error loading all activity:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const loadAllBookings = async () => {
    try {
      setModalLoading(true);
      const response = await fetch("/api/bookings");
      
      if (response.ok) {
        const data = await response.json();
        setAllBookings(data.bookings || []);
      } else {
        console.error("Failed to load all bookings");
      }
    } catch (error) {
      console.error("Error loading all bookings:", error);
    } finally {
      setModalLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    change,
    icon,
    color,
  }: {
    title: string;
    value: string | number;
    change?: string;
    icon: React.ReactNode;
    color: string;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300 truncate">{title}</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2 transition-colors duration-300">{value}</p>
          {change && (
            <p
              className={`text-xs sm:text-sm mt-1 sm:mt-2 ${
                change.startsWith("+") 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-red-600 dark:text-red-400"
              } transition-colors duration-300`}
            >
              {change} from last week
            </p>
          )}
        </div>
        <div className={`p-2 sm:p-3 rounded-full ${color} transition-colors duration-300 mt-2 sm:mt-0 self-end sm:self-auto`}>{icon}</div>
      </div>
    </div>
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "booking":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "payment":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        );
      case "customer":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getTypeColor = (type: string, message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // New bookings - blue
    if (lowerMessage.includes('new booking') || lowerMessage.includes('booking created')) {
      return "border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20";
    }
    
    // Booking status changes - orange
    if (lowerMessage.includes('status changed') || lowerMessage.includes('booking updated') || lowerMessage.includes('confirmed') || lowerMessage.includes('cancelled')) {
      return "border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20";
    }
    
    // Payments - green
    if (lowerMessage.includes('payment') || lowerMessage.includes('paid') || lowerMessage.includes('received')) {
      return "border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20";
    }
    
    // New customers - purple
    if (lowerMessage.includes('new customer') || lowerMessage.includes('customer registered')) {
      return "border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20";
    }
    
    // Default fallback based on type
    switch (type) {
      case "booking":
        return "border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20";
      case "payment":
        return "border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20";
      case "customer":
        return "border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20";
      default:
        return "border-l-4 border-gray-500 bg-gray-50 dark:bg-gray-700/50";
    }
  };

  const getStatusColor = (status: string, message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // New bookings - blue gradient
    if (lowerMessage.includes('new booking') || lowerMessage.includes('booking created')) {
      return "text-white bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg";
    }
    
    // Booking status changes - orange gradient
    if (lowerMessage.includes('status changed') || lowerMessage.includes('booking updated') || lowerMessage.includes('confirmed') || lowerMessage.includes('cancelled')) {
      return "text-white bg-gradient-to-r from-orange-500 to-red-500 shadow-lg";
    }
    
    // Payments - green gradient
    if (lowerMessage.includes('payment') || lowerMessage.includes('paid') || lowerMessage.includes('received')) {
      return "text-white bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg";
    }
    
    // New customers - purple gradient
    if (lowerMessage.includes('new customer') || lowerMessage.includes('customer registered')) {
      return "text-white bg-gradient-to-r from-purple-500 to-violet-600 shadow-lg";
    }
    
    // Default fallback based on status
    switch (status) {
      case "success":
        return "text-white bg-gradient-to-r from-green-500 to-green-600 shadow-lg";
      case "warning":
        return "text-white bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg";
      case "info":
        return "text-white bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg";
      case "error":
        return "text-white bg-gradient-to-r from-red-500 to-red-600 shadow-lg";
      default:
        return "text-gray-700 dark:text-gray-300 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600";
    }
  };

  const getStatusBadge = (status: string, message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // New bookings - blue badge
    if (lowerMessage.includes('new booking') || lowerMessage.includes('booking created')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 transition-colors duration-300">
          New Booking
        </span>
      );
    }
    
    // Booking status changes - orange badge
    if (lowerMessage.includes('status changed') || lowerMessage.includes('booking updated') || lowerMessage.includes('confirmed') || lowerMessage.includes('cancelled')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800 transition-colors duration-300">
          Status Updated
        </span>
      );
    }
    
    // Payments - green badge
    if (lowerMessage.includes('payment') || lowerMessage.includes('paid') || lowerMessage.includes('received')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800 transition-colors duration-300">
          Payment
        </span>
      );
    }
    
    // New customers - purple badge
    if (lowerMessage.includes('new customer') || lowerMessage.includes('customer registered')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800 transition-colors duration-300">
          New Customer
        </span>
      );
    }
    
    // Default fallback based on status
    const statusConfig = {
      success: {
        text: "Success",
        color: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800"
      },
      warning: {
        text: "Warning", 
        color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
      },
      info: {
        text: "Info",
        color: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800"
      },
      error: {
        text: "Error",
        color: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.info;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color} transition-colors duration-300`}>
        {config.text}
      </span>
    );
  };

  const getBookingStatusColor = (status: string, date: string) => {
    const bookingDate = new Date(date);
    const today = new Date();
    const isPast = bookingDate < today;
    
    switch (status) {
      case "completed":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800";
      case "confirmed":
        return isPast 
          ? "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-800"
          : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "pending":
        return isPast
          ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
          : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-800";
    }
  };

  const getBookingStatusText = (status: string, date: string) => {
    const bookingDate = new Date(date);
    const today = new Date();
    const isPast = bookingDate < today;
    
    switch (status) {
      case "completed":
        return "Completed";
      case "confirmed":
        return isPast ? "Past" : "Confirmed";
      case "pending":
        return isPast ? "Overdue" : "Pending";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const calculateChange = (current: number, previous: number): string => {
    if (previous === 0) {
      return current > 0 ? "+100%" : "0%";
    }
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? "+" : "";
    return `${sign}${Math.round(change)}%`;
  };

  const handleOpenActivityModal = () => {
    setShowActivityModal(true);
    loadAllActivity();
  };

  const handleOpenBookingsModal = () => {
    setShowBookingsModal(true);
    loadAllBookings();
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
            Welcome back, <AdminProfileData type="name" fallback="Plamen" />! Here's what's happening today.
          </p>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
          💡 Dashboard Tips
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>• Check your daily bookings and update their status regularly</li>
            <li>• Monitor pending payments and send reminders if needed</li>
          </ul>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>• Review recent activity to stay updated on business progress</li>
            <li>• Use quick action buttons for common tasks</li>
          </ul>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          change={calculateChange(stats.totalBookings, stats.previousWeekBookings)}
          color="bg-blue-100 text-blue-600"
          icon={
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          }
          title="Total Bookings"
          value={stats.totalBookings || 0}
        />
        <StatCard
          change={calculateChange(stats.pendingBookings, stats.previousWeekPendingBookings)}
          color="bg-yellow-100 text-yellow-600"
          icon={
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          }
          title="Pending Bookings"
          value={stats.pendingBookings || 0}
        />
        <StatCard
          change={calculateChange(stats.totalRevenue, stats.previousWeekRevenue)}
          color="bg-green-100 text-green-600"
          icon={
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          }
          title="Total Revenue"
          value={`£${(stats.totalRevenue || 0).toLocaleString()}`}
        />
        <StatCard
          change={calculateChange(stats.totalCustomers, stats.previousWeekCustomers)}
          color="bg-purple-100 text-purple-600"
          icon={
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          }
          title="Total Customers"
          value={stats.totalCustomers || 0}
        />
      </div>

      {/* Main Content Grid - Mobile Stack, Desktop Side by Side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        {/* Recent Activity */}
        <div className="flex flex-col">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex-1 flex flex-col transition-colors duration-300">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                Recent Activity
              </h2>
            </div>
            <div className="p-4 sm:p-6 flex-1 flex flex-col">
              <div className="space-y-3 sm:space-y-4 flex-1">
                {loading ? (
                  <div className="animate-pulse space-y-3 sm:space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-3 sm:space-x-4">
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors duration-300" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-300" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 transition-colors duration-300" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <svg
                      className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500 transition-colors duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
                      No recent activity
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      New activity will appear here.
                    </p>
                  </div>
                ) : (
                  recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className={`flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg hover:shadow-md transition-all duration-300 ${getTypeColor(activity.type, activity.message)}`}
                    >
                      <div
                        className={`p-2 sm:p-3 rounded-xl ${getStatusColor(activity.status, activity.message)} transition-all duration-300 shadow-sm hover:shadow-md flex-shrink-0`}
                      >
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-300 truncate">
                            {activity.message}
                          </p>
                          <div className="flex-shrink-0">
                            {getStatusBadge(activity.status, activity.message)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 sm:mt-6">
                <button 
                  onClick={handleOpenActivityModal}
                  className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-300"
                >
                  View all activity
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="flex flex-col">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex-1 flex flex-col transition-colors duration-300">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                Upcoming Bookings
              </h2>
            </div>
            <div className="p-4 sm:p-6 flex-1 flex flex-col">
              <div className="space-y-3 sm:space-y-4 flex-1">
                {loading ? (
                  <div className="animate-pulse space-y-3 sm:space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start space-x-3 sm:space-x-4">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-300" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-300" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 transition-colors duration-300" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : upcomingBookings.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <svg
                      className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500 transition-colors duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
                      No upcoming bookings
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      New bookings will appear here.
                    </p>
                  </div>
                ) : (
                  upcomingBookings.map((booking: any) => (
                    <div
                      key={booking.id}
                      className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg hover:shadow-md transition-all duration-300 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                          <svg
                            className="w-5 h-5 sm:w-6 sm:h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-300 truncate">
                            {booking.customer_name}
                          </p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors duration-300 flex-shrink-0 ${
                              booking.status === "confirmed"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800"
                                : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                            }`}
                          >
                            {booking.status === "confirmed" ? "Confirmed" : "Pending"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300 truncate">
                          {booking.service}
                        </p>
                        <div className="flex items-center space-x-2">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            {new Date(booking.date).toLocaleDateString()} at {booking.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 sm:mt-6">
                <button 
                  onClick={handleOpenBookingsModal}
                  className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-300"
                >
                  View all bookings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Activity</h2>
              <button
                onClick={() => setShowActivityModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {modalLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse flex items-start space-x-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : allActivity.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No activity found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No activity records available.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className={`flex items-start space-x-4 p-4 rounded-lg hover:shadow-md transition-all duration-300 ${getTypeColor(activity.type, activity.message)}`}
                    >
                      <div
                        className={`p-3 rounded-xl ${getStatusColor(activity.status, activity.message)} transition-all duration-300 shadow-sm hover:shadow-md`}
                      >
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                            {activity.message}
                          </p>
                          {getStatusBadge(activity.status, activity.message)}
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* All Bookings Modal */}
      {showBookingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Bookings</h2>
              <button
                onClick={() => setShowBookingsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {modalLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse flex items-start space-x-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                      </div>
                      <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : allBookings.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No bookings found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No booking records available.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allBookings.map((booking: any) => (
                    <div
                      key={booking.id}
                      className="flex items-start space-x-4 p-4 rounded-lg hover:shadow-md transition-all duration-300 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                            {booking.customer_name}
                          </p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors duration-300 ${getBookingStatusColor(booking.status, booking.date)}`}
                          >
                            {getBookingStatusText(booking.status, booking.date)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                          {booking.service}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                              {new Date(booking.date).toLocaleDateString()} at {booking.time}
                            </p>
                          </div>
                          {booking.phone && (
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                {booking.phone}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

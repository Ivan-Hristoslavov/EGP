"use client";

import { useState, useEffect } from "react";
import { format, startOfWeek, addDays, isSameDay, parseISO } from "date-fns";

type Booking = {
  id: string;
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
};

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [view, setView] = useState<"week" | "day">("week");
  const [multiSlotBookings, setMultiSlotBookings] = useState<Booking[] | null>(
    null
  );
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const weekStart = startOfWeek(parseISO(selectedDate), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Load bookings from Supabase
  useEffect(() => {
    loadBookings();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadBookings, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/bookings");

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();

      setBookings(data.bookings || []);
    } catch (err) {
      console.error("Error loading bookings:", err);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const getBookingsForDate = (date: Date) => {
    let filteredBookings = bookings.filter((booking) =>
      isSameDay(parseISO(booking.date), date)
    );

    if (statusFilter !== "all") {
      filteredBookings = filteredBookings.filter(
        (booking) => booking.status === statusFilter
      );
    }

    return filteredBookings;
  };

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-300";
      case "completed":
        return "bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 dark:bg-red-800/50 text-red-800 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  const getPaymentStatusColor = (status: Booking["payment_status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-300";
      case "refunded":
        return "bg-red-100 dark:bg-red-800/50 text-red-800 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await loadBookings(); // Reload bookings
        setSelectedBooking(null);
      } else {
        throw new Error("Failed to update booking status");
      }
    } catch (err) {
      console.error("Error updating booking status:", err);
      setError("Failed to update booking status");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-primary-light" />
          <span className="ml-2 text-gray-600 dark:text-gray-300 transition-colors duration-300">Loading calendar...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 transition-colors duration-300">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400 dark:text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300 transition-colors duration-300">
                Error loading calendar
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-400 transition-colors duration-300">{error}</p>
              <button
                className="mt-2 text-sm text-red-800 dark:text-red-300 hover:text-red-900 dark:hover:text-red-200 underline transition-colors duration-300"
                onClick={loadBookings}
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Calendar</h1>
          <div className="flex space-x-2">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                view === "week"
                  ? "bg-primary text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              }`}
              onClick={() => setView("week")}
            >
              Week
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                view === "day"
                  ? "bg-primary text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              }`}
              onClick={() => setView("day")}
            >
              Day
            </button>
          </div>
        </div>
        
        {/* Mobile-friendly controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-300"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Bookings ({bookings.length})</option>
            <option value="pending">
              Pending ({bookings.filter((b) => b.status === "pending").length})
            </option>
            <option value="scheduled">
              Scheduled ({bookings.filter((b) => b.status === "scheduled").length})
            </option>
            <option value="completed">
              Completed ({bookings.filter((b) => b.status === "completed").length})
            </option>
            <option value="cancelled">
              Cancelled ({bookings.filter((b) => b.status === "cancelled").length})
            </option>
          </select>
          
          {/* Legend - Hidden on mobile, shown on larger screens */}
          <div className="hidden lg:flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-100 dark:bg-yellow-800/50 rounded border border-yellow-200 dark:border-yellow-700" />
              <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Pending</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-100 dark:bg-blue-800/50 rounded border border-blue-200 dark:border-blue-700" />
              <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Scheduled</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-100 dark:bg-green-800/50 rounded border border-green-200 dark:border-green-700" />
              <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-100 dark:bg-red-800/50 rounded border border-red-200 dark:border-red-700" />
              <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Cancelled</span>
            </div>
          </div>
        </div>
        
        {/* Navigation Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-4">
          <div className="flex items-center space-x-2">
            <button
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-300"
              onClick={() =>
                setSelectedDate(
                  format(addDays(parseISO(selectedDate), -7), "yyyy-MM-dd")
                )
              }
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
            </button>
            <span className="text-sm sm:text-lg font-medium text-gray-900 dark:text-white transition-colors duration-300">
              {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
            </span>
            <button
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-300"
              onClick={() =>
                setSelectedDate(
                  format(addDays(parseISO(selectedDate), 7), "yyyy-MM-dd")
                )
              }
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              className="px-3 py-2 text-sm font-medium text-primary dark:text-primary-light border border-primary dark:border-primary-light rounded-lg hover:bg-primary hover:text-white dark:hover:bg-primary-light/20 transition-colors duration-300"
              onClick={() => setSelectedDate(format(new Date(), "yyyy-MM-dd"))}
            >
              Today
            </button>
            <button
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 transition-colors duration-300"
              disabled={loading}
              title="Refresh calendar"
              onClick={loadBookings}
            >
              <svg
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow transition-colors duration-300 overflow-hidden">
        {/* Mobile Legend */}
        <div className="lg:hidden p-4 border-b dark:border-gray-700">
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-100 dark:bg-yellow-800/50 rounded border border-yellow-200 dark:border-yellow-700" />
              <span className="text-gray-600 dark:text-gray-300">Pending</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-100 dark:bg-blue-800/50 rounded border border-blue-200 dark:border-blue-700" />
              <span className="text-gray-600 dark:text-gray-300">Scheduled</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-100 dark:bg-green-800/50 rounded border border-green-200 dark:border-green-700" />
              <span className="text-gray-600 dark:text-gray-300">Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-100 dark:bg-red-800/50 rounded border border-red-200 dark:border-red-700" />
              <span className="text-gray-600 dark:text-gray-300">Cancelled</span>
            </div>
          </div>
        </div>
        
        {/* Calendar header with better mobile handling */}
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-8 border-b dark:border-gray-700 transition-colors duration-300">
              <div className="p-2 sm:p-4 border-r dark:border-gray-700 transition-colors duration-300 w-16 sm:w-auto" />
              {weekDays.map((day) => (
                <div
                  key={day.toString()}
                  className={`p-2 sm:p-4 text-center border-r dark:border-gray-700 transition-colors duration-300 ${
                    isSameDay(day, new Date()) ? "bg-primary/5 dark:bg-primary/20" : ""
                  }`}
                >
                  <div className="font-medium dark:text-white transition-colors duration-300 text-xs sm:text-sm">
                    {format(day, "EEE")}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    {format(day, "MMM d")}
                  </div>
                </div>
              ))}
            </div>

            {/* Time slots with better mobile handling */}
            {Array.from({ length: 11 }, (_, i) => i + 8).map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b dark:border-gray-700 last:border-b-0 transition-colors duration-300">
                <div className="p-2 sm:p-4 border-r dark:border-gray-700 text-xs sm:text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300 w-16 sm:w-auto">
                  {format(new Date().setHours(hour, 0), "HH:00")}
                </div>
                {weekDays.map((day) => {
                  const bookings = getBookingsForDate(day).filter(
                    (booking) => parseInt(booking.time.split(":")[0]) === hour
                  );

                  return (
                    <div
                      key={day.toString()}
                      className="p-1 sm:p-2 border-r dark:border-gray-700 min-h-[80px] sm:min-h-[120px] relative transition-colors duration-300"
                    >
                      {bookings.length > 0 && (
                        <div className="space-y-1">
                          {/* Show first booking */}
                          <button
                            key={bookings[0].id}
                            className={`w-full p-1 sm:p-2 text-left rounded-lg transition-all duration-300 transform hover:scale-105 ${
                              bookings[0].status === "completed"
                                ? "bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 border border-green-200 dark:border-green-800"
                                : bookings[0].status === "cancelled"
                                  ? "bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800"
                                  : bookings[0].status === "pending"
                                    ? "bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800"
                                    : "bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800"
                            }`}
                            onClick={() => setSelectedBooking(bookings[0])}
                          >
                            <div className="text-xs sm:text-sm font-medium dark:text-white transition-colors duration-300 truncate">
                              {bookings[0].customer_name}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-300 transition-colors duration-300 truncate">
                              {bookings[0].service}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-300 transition-colors duration-300">
                              {bookings[0].time}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className={`px-1 py-0.5 rounded text-xs ${getStatusColor(bookings[0].status)}`}>
                                {bookings[0].status}
                              </span>
                              <span className={`px-1 py-0.5 rounded text-xs ${getPaymentStatusColor(bookings[0].payment_status)}`}>
                                {bookings[0].payment_status}
                              </span>
                            </div>
                          </button>
                          
                          {/* Show additional bookings indicator */}
                          {bookings.length > 1 && (
                            <button
                              className="w-full p-1 text-xs text-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-colors duration-300 text-gray-700 dark:text-gray-300 font-medium"
                              onClick={() => setMultiSlotBookings(bookings)}
                            >
                              +{bookings.length - 1} more
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full transition-colors duration-300">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Booking Details</h2>
                <button
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 transition-colors duration-300"
                  onClick={() => setSelectedBooking(null)}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                    Customer
                  </label>
                  <div className="mt-1 text-gray-900 dark:text-white transition-colors duration-300">
                    {selectedBooking.customer_name}
                  </div>
                  {selectedBooking.customer_email && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                      {selectedBooking.customer_email}
                    </div>
                  )}
                  {selectedBooking.customer_phone && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                      {selectedBooking.customer_phone}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                    Service
                  </label>
                  <div className="mt-1 text-gray-900 dark:text-white transition-colors duration-300">
                    {selectedBooking.service}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Date
                    </label>
                    <div className="mt-1 text-gray-900 dark:text-white transition-colors duration-300">
                      {format(parseISO(selectedBooking.date), "MMM dd, yyyy")}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Time
                    </label>
                    <div className="mt-1 text-gray-900 dark:text-white transition-colors duration-300">
                      {selectedBooking.time}
                    </div>
                  </div>
                </div>
                {selectedBooking.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Address
                    </label>
                    <div className="mt-1 text-gray-900 dark:text-white transition-colors duration-300">
                      {selectedBooking.address}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Status
                    </label>
                    <div className="mt-1">
                      <select
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-300"
                        value={selectedBooking.status}
                        onChange={(e) =>
                          updateBookingStatus(
                            selectedBooking.id,
                            e.target.value
                          )
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Payment
                    </label>
                    <div className="mt-1">
                      <span
                        className={`px-2 py-1 rounded text-sm ${getPaymentStatusColor(selectedBooking.payment_status)}`}
                      >
                        {selectedBooking.payment_status}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                    Amount
                  </label>
                  <div className="mt-1 text-gray-900 dark:text-white transition-colors duration-300">
                    £{selectedBooking.amount.toFixed(2)}
                  </div>
                </div>
                {selectedBooking.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Notes
                    </label>
                    <div className="mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded text-sm transition-colors duration-300">
                      {selectedBooking.notes}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-300"
                  onClick={() => setSelectedBooking(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multi-booking Modal */}
      {multiSlotBookings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full transition-colors duration-300">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Bookings for this slot</h2>
                <button
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 transition-colors duration-300"
                  onClick={() => setMultiSlotBookings(null)}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                {multiSlotBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border dark:border-gray-700 rounded p-3 mb-2 bg-gray-50 dark:bg-gray-700 transition-colors duration-300"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white transition-colors duration-300">
                          {booking.customer_name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 transition-colors duration-300">
                          {booking.service}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 transition-colors duration-300">
                          {booking.time}
                        </div>
                        <div className="flex space-x-1 mt-1">
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs ${getStatusColor(booking.status)}`}
                          >
                            {booking.status}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs ${getPaymentStatusColor(booking.payment_status)}`}
                          >
                            {booking.payment_status}
                          </span>
                        </div>
                      </div>
                      <button
                        className="ml-2 px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark transition-colors duration-300"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setMultiSlotBookings(null);
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-300"
                  onClick={() => setMultiSlotBookings(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

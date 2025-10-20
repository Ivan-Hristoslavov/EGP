"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";

import { supabase } from "../../../lib/supabase";
import { useToast, ToastMessages } from "../../../components/Toast";
import { ConfirmationModal } from "../../../components/ConfirmationModal";
import Pagination from "@/components/Pagination";
import Tooltip from "@/components/Tooltip";

type Booking = {
  id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  service: string;
  date: string;
  time: string;
  status: "paid" | "cancelled";
  payment_status: "pending" | "paid" | "refunded";
  amount: number;
  address?: string;
  notes?: string;
};

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getDate = (daysOffset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

// Dummy bookings data
const DUMMY_BOOKINGS: Booking[] = [
  {
    id: "booking-1",
    customer_name: "Sarah Johnson",
    customer_email: "sarah.j@example.com",
    customer_phone: "+44 7700 123456",
    service: "Baby Botox",
    date: getTodayDate(),
    time: "10:00",
    status: "paid",
    payment_status: "paid",
    amount: 199,
    address: "123 High Street, London, UK",
    notes: "First time client, consultation completed"
  },
  {
    id: "booking-2",
    customer_name: "Emma Williams",
    customer_email: "emma.w@example.com",
    customer_phone: "+44 7700 234567",
    service: "Lip Enhancement",
    date: getTodayDate(),
    time: "12:30",
    status: "paid",
    payment_status: "paid",
    amount: 290,
    address: "45 Park Lane, Manchester, UK"
  },
  {
    id: "booking-3",
    customer_name: "Lisa Brown",
    customer_email: "lisa.b@example.com",
    customer_phone: "+44 7700 345678",
    service: "Profhilo Treatment",
    date: getTodayDate(),
    time: "14:00",
    status: "paid",
    payment_status: "paid",
    amount: 390,
    address: "78 Queen's Road, Birmingham, UK",
    notes: "Regular client, second session"
  },
  {
    id: "booking-4",
    customer_name: "Rachel Green",
    customer_email: "rachel@bella-aesthetics.example.com",
    customer_phone: "+44 7700 456789",
    service: "Skin Consultation",
    date: getDate(1),
    time: "10:30",
    status: "cancelled",
    payment_status: "refunded",
    amount: 75,
    address: "92 King Street, Edinburgh, UK",
    notes: "Client cancelled - refunded"
  },
  {
    id: "booking-5",
    customer_name: "Jessica Taylor",
    customer_email: "jessica.t@example.com",
    customer_phone: "+44 7700 567890",
    service: "Anti-wrinkle Treatment",
    date: getDate(1),
    time: "14:30",
    status: "paid",
    payment_status: "paid",
    amount: 220,
    address: "15 Bridge Road, Bristol, UK"
  },
  {
    id: "booking-6",
    customer_name: "Maria Garcia",
    customer_email: "maria.g@example.com",
    customer_phone: "+44 7700 678901",
    service: "Fat Freezing",
    date: getDate(2),
    time: "09:00",
    status: "paid",
    payment_status: "paid",
    amount: 200,
    address: "67 Market Street, Liverpool, UK",
    notes: "2 hour session completed"
  },
  {
    id: "booking-7",
    customer_name: "Jennifer Davis",
    customer_email: "jennifer.d@example.com",
    customer_phone: "+44 7700 789012",
    service: "Dermal Fillers",
    date: getDate(-3),
    time: "11:30",
    status: "cancelled",
    payment_status: "refunded",
    amount: 320,
    address: "34 Church Lane, Leeds, UK",
    notes: "Client requested cancellation"
  },
  {
    id: "booking-8",
    customer_name: "Amanda Wilson",
    customer_email: "amanda@elite-beauty.example.com",
    customer_phone: "+44 7700 890123",
    service: "Botox Treatment",
    date: getDate(-5),
    time: "10:00",
    status: "paid",
    payment_status: "paid",
    amount: 250,
    address: "89 Station Road, Glasgow, UK"
  },
  {
    id: "booking-9",
    customer_name: "Sophie Anderson",
    customer_email: "sophie.a@example.com",
    customer_phone: "+44 7700 901234",
    service: "Lip Enhancement",
    date: getDate(-7),
    time: "15:00",
    status: "paid",
    payment_status: "paid",
    amount: 290,
    address: "12 Mill Street, Cardiff, UK"
  },
  {
    id: "booking-10",
    customer_name: "Olivia Thompson",
    customer_email: "olivia.t@example.com",
    customer_phone: "+44 7700 012345",
    service: "Profhilo Treatment",
    date: getDate(-10),
    time: "11:00",
    status: "paid",
    payment_status: "paid",
    amount: 390,
    address: "56 Green Lane, Newcastle, UK",
    notes: "Second session completed successfully"
  }
];

export default function BookingsPage() {
  const { showSuccess, showError } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("bookings-view-mode") as "table" | "cards") || "cards";
    }
    return "cards";
  });
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [showEditBookingModal, setShowEditBookingModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [filters, setFilters] = useState({
    status: "all",
    paymentStatus: "all",
    dateRange: "all",
    search: "",
  });
  const [newBooking, setNewBooking] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    service: "",
    date: "",
    time: "",
    amount: "",
    address: "",
    notes: "",
  });
  const [editBooking, setEditBooking] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    service: "",
    date: "",
    time: "",
    amount: "",
    address: "",
    notes: "",
  });
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [bookingToComplete, setBookingToComplete] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(10);

  // Load bookings from Supabase
  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings?page=${page}&limit=${limit}`);

      if (response.ok) {
        const data = await response.json();
        const fetchedBookings = data.bookings || [];
        
        // Use dummy data if no real bookings exist
        if (fetchedBookings.length === 0) {
          console.log("No bookings found, using dummy data");
          setBookings(DUMMY_BOOKINGS);
          setTotalPages(1);
          setTotalCount(DUMMY_BOOKINGS.length);
          setCurrentPage(1);
        } else {
          setBookings(fetchedBookings);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotalCount(data.pagination?.totalCount || 0);
          setCurrentPage(data.pagination?.page || 1);
        }
      } else {
        console.error("Error loading bookings:", response.status);
        // Use dummy data on error
        console.log("API error, using dummy data");
        setBookings(DUMMY_BOOKINGS);
        setTotalPages(1);
        setTotalCount(DUMMY_BOOKINGS.length);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error:", error);
      // Use dummy data on error
      console.log("Exception occurred, using dummy data");
      setBookings(DUMMY_BOOKINGS);
      setTotalPages(1);
      setTotalCount(DUMMY_BOOKINGS.length);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    await loadBookings(page);
  };

  const handleViewModeChange = (mode: "table" | "cards") => {
    setViewMode(mode);
    localStorage.setItem("bookings-view-mode", mode);
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase.from("bookings").insert([
        {
          customer_name: newBooking.customerName,
          customer_email: newBooking.customerEmail || null,
          customer_phone: newBooking.customerPhone || null,
          service: newBooking.service,
          date: newBooking.date,
          time: newBooking.time,
          amount: parseFloat(newBooking.amount),
          address: newBooking.address || null,
          notes: newBooking.notes || null,
          status: "pending",
          payment_status: "pending",
        },
      ]);

      if (error) {
        console.error("Error creating booking:", error);
        showError("Booking Error", "Failed to create booking. Please try again.");
      } else {
        // Reload bookings
        loadBookings();
        setShowNewBookingModal(false);
        setNewBooking({
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          service: "",
          date: "",
          time: "",
          amount: "",
          address: "",
          notes: "",
        });
        showSuccess("Booking Created", "New booking has been successfully created.");
      }
    } catch (error) {
      console.error("Error:", error);
      showError("Booking Error", "Failed to create booking. Please try again.");
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setEditBooking({
      customerName: booking.customer_name,
      customerEmail: booking.customer_email || "",
      customerPhone: booking.customer_phone || "",
      service: booking.service,
      date: booking.date,
      time: booking.time,
      amount: booking.amount.toString(),
      address: booking.address || "",
      notes: booking.notes || "",
    });
    setShowEditBookingModal(true);
  };

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          customer_name: editBooking.customerName,
          customer_email: editBooking.customerEmail || null,
          customer_phone: editBooking.customerPhone || null,
          service: editBooking.service,
          date: editBooking.date,
          time: editBooking.time,
          amount: parseFloat(editBooking.amount),
          address: editBooking.address || null,
          notes: editBooking.notes || null,
        })
        .eq("id", editingBooking.id);

      if (error) {
        console.error("Error updating booking:", error);
        showError("Booking Error", "Failed to update booking. Please try again.");
      } else {
        // Reload bookings
        loadBookings();
        setShowEditBookingModal(false);
        setEditingBooking(null);
        setEditBooking({
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          service: "",
          date: "",
          time: "",
          amount: "",
          address: "",
          notes: "",
        });
        showSuccess("Booking Updated", "The booking has been updated successfully.");
      }
    } catch (error) {
      console.error("Error:", error);
      showError("Booking Error", "Failed to update booking. Please try again.");
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    setShowCompleteModal(true);
    setBookingToComplete(bookingId);
  };

  const confirmCompleteBooking = async () => {
    if (!bookingToComplete) return;

    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          status: "completed",
          payment_status: "paid"
        })
        .eq("id", bookingToComplete);

      if (error) {
        console.error("Error completing booking:", error);
        showError("Booking Error", "Failed to complete booking. Please try again.");
      } else {
        loadBookings(); // Reload bookings
        setSelectedBooking(null); // Close modal
        setShowCompleteModal(false);
        setBookingToComplete(null);
        showSuccess("Booking Completed", "Booking has been marked as completed successfully.");
      }
    } catch (error) {
      console.error("Error:", error);
      showError("Booking Error", "Failed to complete booking. Please try again.");
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    setShowDeleteModal(true);
    setBookingToDelete(bookingId);
  };

  const confirmDeleteBooking = async () => {
    if (!bookingToDelete) return;

    try {
      const { error } = await supabase.from("bookings").delete().eq("id", bookingToDelete);

      if (error) {
        console.error("Error deleting booking:", error);
        showError("Booking Error", "Failed to delete booking. Please try again.");
      } else {
        loadBookings(); // Reload bookings
        setSelectedBooking(null); // Close modal
        setShowDeleteModal(false);
        setBookingToDelete(null);
        showSuccess("Booking Deleted", "The booking has been deleted successfully.");
      }
    } catch (error) {
      console.error("Error:", error);
      showError("Booking Error", "Failed to delete booking. Please try again.");
    }
  };

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "paid":
        return "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-md";
      case "cancelled":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-md";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    }
  };

  const getStatusIcon = (status: Booking["status"]) => {
    switch (status) {
      case "paid":
        return (
          <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case "cancelled":
        return (
          <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusText = (status: Booking["status"]) => {
    switch (status) {
      case "paid":
        return "Paid";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (status: Booking["payment_status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
      case "refunded":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus =
      filters.status === "all" || booking.status === filters.status;
    const matchesPayment =
      filters.paymentStatus === "all" ||
      booking.payment_status === filters.paymentStatus;
    const matchesSearch =
      booking.customer_name
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      booking.service.toLowerCase().includes(filters.search.toLowerCase()) ||
      (booking.customer_email &&
        booking.customer_email
          .toLowerCase()
          .includes(filters.search.toLowerCase()));

    return matchesStatus && matchesPayment && matchesSearch;
  });

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <div
      className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
      onClick={() => setSelectedBooking(booking)}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-100/20 via-pink-50/10 to-purple-100/20 dark:from-rose-900/10 dark:via-purple-900/5 dark:to-pink-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-500/10 to-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">
                  {booking.customer_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                booking.status === "paid" ? "bg-green-500" : "bg-red-500"
              }`}></div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {booking.customer_name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{booking.service}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`flex items-center px-3 py-1.5 text-xs font-bold rounded-xl ${getStatusColor(booking.status)}`}>
              {getStatusIcon(booking.status)}
              {getStatusText(booking.status)}
            </span>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              £{booking.amount}
            </span>
          </div>
        </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
          <svg
            className="w-4 h-4 mr-2"
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
          {format(parseISO(booking.date), "MMM d, yyyy")} at {booking.time}
        </div>
        {booking.customer_phone && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            {booking.customer_phone}
          </div>
        )}
        {booking.address && (
          <div className="flex items-start text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
            <svg
              className="w-4 h-4 mr-2 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
              <path
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            <span className="flex-1">{booking.address}</span>
          </div>
        )}
      </div>

        <div className="flex items-center justify-between pt-4 border-t border-rose-100/50 dark:border-gray-700/50">
          {booking.notes && (
            <div className="flex-1 mr-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 italic line-clamp-1">
                {booking.notes}
              </p>
            </div>
          )}
          <div className="flex gap-2">
            {booking.customer_phone && (
              <Tooltip content="Call Customer">
                <button 
                  className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-110 transition-all duration-200"
                  onClick={e => {
                    e.stopPropagation();
                    window.open(`tel:${booking.customer_phone}`, '_self');
                  }}
                  aria-label="Call Customer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
              </Tooltip>
            )}
            <Tooltip content="Edit Booking">
              <button
                className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:scale-110 transition-all duration-200"
                onClick={e => {
                  e.stopPropagation();
                  handleEditBooking(booking);
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </button>
            </Tooltip>
            <Tooltip content="Delete Booking">
              <button 
                className="p-2.5 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg hover:scale-110 transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteBooking(booking.id);
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-pink-50/50 to-purple-50/50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Luxury Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-pink-600 rounded-3xl shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
          
          <div className="relative px-8 py-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 font-playfair">
                  Bookings Management
                </h1>
                <p className="text-white/90 text-lg">
                  Manage and track all your customer appointments
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex bg-white/20 backdrop-blur-sm rounded-xl p-1.5 border border-white/30">
                  <button
                    className={`flex items-center px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                      viewMode === "cards"
                        ? "bg-white text-blue-600 shadow-lg"
                        : "text-white hover:bg-white/20"
                    }`}
                    onClick={() => handleViewModeChange("cards")}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
                    </svg>
                    Cards
                  </button>
                  <button
                    className={`flex items-center px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                      viewMode === "table"
                        ? "bg-white text-blue-600 shadow-lg"
                        : "text-white hover:bg-white/20"
                    }`}
                    onClick={() => handleViewModeChange("table")}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18m-9 8h9m-9 4h9m-9-8h9" />
                    </svg>
                    Table
                  </button>
                </div>
                <button
                  className="flex items-center px-6 py-2.5 text-sm font-semibold text-blue-600 bg-white rounded-xl hover:bg-white/90 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                  onClick={() => setShowNewBookingModal(true)}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Booking
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
          💡 Booking Management Tips
        </h4>
        <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li>• Always confirm bookings within 24 hours</li>
          <li>• Use the notes field for important customer requests</li>
          <li>• Update booking status immediately after completion</li>
          <li>• Check for conflicts before accepting new bookings</li>
        </ul>
      </div>

      {/* Modern Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 p-6 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg mb-3 inline-block">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{bookings.length}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Bookings</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 p-6 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg mb-3 inline-block">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{bookings.filter((b) => b.status === "paid").length}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Paid</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 p-6 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg mb-3 inline-block">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{bookings.filter((b) => b.status === "cancelled").length}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Cancelled</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 p-6 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg mb-3 inline-block">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              £{bookings.filter((b) => b.status === "paid").reduce((sum, b) => sum + b.amount, 0)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Revenue</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
              Payment Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
              value={filters.paymentStatus}
              onChange={(e) =>
                setFilters({ ...filters, paymentStatus: e.target.value })
              }
            >
              <option value="all">All Payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
              Date Range
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
              value={filters.dateRange}
              onChange={(e) =>
                setFilters({ ...filters, dateRange: e.target.value })
              }
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
              Search
            </label>
            <div className="relative">
              <input
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                placeholder="Search bookings..."
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
              <svg
                className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500 transition-colors duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 transition-colors duration-300" />
          <span className="ml-3 text-gray-600 dark:text-gray-400 transition-colors duration-300">Loading bookings...</span>
        </div>
      ) : (
        <>
          {/* Bookings Display */}
          {viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
                  <thead className="bg-gray-50 dark:bg-gray-700 transition-colors duration-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
                    {filteredBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-300"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
                              {booking.customer_name}
                            </div>
                            {booking.customer_email && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                {booking.customer_email}
                              </div>
                            )}
                            {booking.customer_phone && (
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300 mt-1">
                                <a
                                  href={`tel:${booking.customer_phone}`}
                                  className="flex items-center hover:text-blue-600 dark:hover:text-blue-400"
                                  onClick={e => e.stopPropagation()}
                                  title="Call customer"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  <span className="sr-only">Call</span>
                                  {booking.customer_phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate transition-colors duration-300">
                            {booking.service}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white transition-colors duration-300">
                            {format(parseISO(booking.date), "MMM d, yyyy")}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            {booking.time}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(booking.status)} transition-colors duration-300`}
                          >
                            {getStatusIcon(booking.status)}
                            {getStatusText(booking.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full border ${getPaymentStatusColor(booking.payment_status)} transition-colors duration-300`}
                          >
                            {booking.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
                          £{booking.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {booking.customer_phone && (
                              <Tooltip content="Call Customer">
                            <button 
                                  className="p-2 bg-green-600 dark:bg-green-500 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-300"
                                  onClick={e => {
                                    e.stopPropagation();
                                    window.open(`tel:${booking.customer_phone}`, '_self');
                                  }}
                                  aria-label="Call Customer"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                </button>
                              </Tooltip>
                            )}
                            <Tooltip content="Edit Booking">
                              <button
                                className="p-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
                                onClick={e => {
                                e.stopPropagation();
                                handleEditBooking(booking);
                              }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                                </svg>
                            </button>
                            </Tooltip>
                            <Tooltip content="Delete Booking">
                            <button 
                                className="p-2 bg-red-600 dark:bg-red-500 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors duration-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBooking(booking.id);
                              }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                                </svg>
                            </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filteredBookings.length === 0 && !loading && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 transition-colors duration-300"
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
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
                No bookings found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                {bookings.length === 0
                  ? "Get started by creating your first booking."
                  : "Try adjusting your search or filter criteria."}
              </p>
              {bookings.length === 0 && (
                <button
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
                  onClick={() => setShowNewBookingModal(true)}
                >
                  Create First Booking
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        limit={limit}
        onPageChange={handlePageChange}
        className="mt-8"
      />

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-80 transition-opacity duration-300"
              onClick={() => setSelectedBooking(null)}
            />

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full transition-colors duration-300">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 transition-colors duration-300">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-300">
                    Booking Details
                  </h3>
                  <button
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
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
                    <h4 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">
                      {selectedBooking.customer_name}
                    </h4>
                    {selectedBooking.customer_email && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                        {selectedBooking.customer_email}
                      </p>
                    )}
                    {selectedBooking.customer_phone && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                        {selectedBooking.customer_phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Service</p>
                    <p className="text-sm text-gray-900 dark:text-white transition-colors duration-300">
                      {selectedBooking.service}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Date & Time
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white transition-colors duration-300">
                      {format(
                        parseISO(selectedBooking.date),
                        "EEEE, MMMM d, yyyy"
                      )}{" "}
                      at {selectedBooking.time}
                    </p>
                  </div>

                  {selectedBooking.address && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                        Address
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white transition-colors duration-300">
                        {selectedBooking.address}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                        Status
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedBooking.status)}`}
                      >
                        {getStatusIcon(selectedBooking.status)}
                        {getStatusText(selectedBooking.status)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                        Payment
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getPaymentStatusColor(selectedBooking.payment_status)}`}
                      >
                        {selectedBooking.payment_status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Amount</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-300">
                      £{selectedBooking.amount}
                    </p>
                  </div>

                  {selectedBooking.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Notes</p>
                      <p className="text-sm text-gray-900 dark:text-white transition-colors duration-300">
                        {selectedBooking.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-6 py-4 flex gap-3">
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
                  type="button"
                  onClick={() => handleEditBooking(selectedBooking)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                  Edit Booking
                </button>
                <button
                  className="px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Booking Modal */}
      {showNewBookingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowNewBookingModal(false)}
            />

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateBooking}>
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 transition-colors duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-300">
                      Create New Booking
                    </h3>
                    <button
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
                      type="button"
                      onClick={() => setShowNewBookingModal(false)}
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                        Customer Name *
                      </label>
                      <input
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                        type="text"
                        value={newBooking.customerName}
                        onChange={(e) =>
                          setNewBooking((prev) => ({
                            ...prev,
                            customerName: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                          type="email"
                          value={newBooking.customerEmail}
                          onChange={(e) =>
                            setNewBooking((prev) => ({
                              ...prev,
                              customerEmail: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Phone
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                          type="tel"
                          value={newBooking.customerPhone}
                          onChange={(e) =>
                            setNewBooking((prev) => ({
                              ...prev,
                              customerPhone: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Service *
                      </label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                        value={newBooking.service}
                        onChange={(e) =>
                          setNewBooking((prev) => ({
                            ...prev,
                            service: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select a service</option>
                        <option value="Botox Treatment">Botox Treatment</option>
                        <option value="Dermal Fillers">Dermal Fillers</option>
                        <option value="Skin Treatments">Skin Treatments</option>
                        <option value="Consultation">Consultation</option>
                        <option value="Facial Aesthetics">Facial Aesthetics</option>
                        <option value="Body Contouring">Body Contouring</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Date *
                        </label>
                        <input
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                          type="date"
                          value={newBooking.date}
                          onChange={(e) =>
                            setNewBooking((prev) => ({
                              ...prev,
                              date: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Time *
                        </label>
                        <input
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                          type="time"
                          value={newBooking.time}
                          onChange={(e) =>
                            setNewBooking((prev) => ({
                              ...prev,
                              time: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Amount (£) *
                      </label>
                      <input
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newBooking.amount}
                        onChange={(e) =>
                          setNewBooking((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Address
                      </label>
                      <input
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                        type="text"
                        value={newBooking.address}
                        onChange={(e) =>
                          setNewBooking((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notes
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                        rows={3}
                        value={newBooking.notes}
                        onChange={(e) =>
                          setNewBooking((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse transition-colors duration-300">
                  <button
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 dark:bg-blue-500 text-base font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-300"
                    type="submit"
                  >
                    Create Booking
                  </button>
                  <button
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-300"
                    type="button"
                    onClick={() => setShowNewBookingModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {showEditBookingModal && editingBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowEditBookingModal(false)}
            />

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleUpdateBooking}>
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 transition-colors duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-300">
                      Edit Booking
                    </h3>
                    <button
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
                      type="button"
                      onClick={() => setShowEditBookingModal(false)}
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                        Customer Name *
                      </label>
                      <input
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                        type="text"
                        value={editBooking.customerName}
                        onChange={(e) =>
                          setEditBooking((prev) => ({
                            ...prev,
                            customerName: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                          type="email"
                          value={editBooking.customerEmail}
                          onChange={(e) =>
                            setEditBooking((prev) => ({
                              ...prev,
                              customerEmail: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Phone
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                          type="tel"
                          value={editBooking.customerPhone}
                          onChange={(e) =>
                            setEditBooking((prev) => ({
                              ...prev,
                              customerPhone: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Service *
                      </label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                        value={editBooking.service}
                        onChange={(e) =>
                          setEditBooking((prev) => ({
                            ...prev,
                            service: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select a service</option>
                        <option value="Botox Treatment">Botox Treatment</option>
                        <option value="Dermal Fillers">Dermal Fillers</option>
                        <option value="Skin Treatments">Skin Treatments</option>
                        <option value="Consultation">Consultation</option>
                        <option value="Facial Aesthetics">Facial Aesthetics</option>
                        <option value="Body Contouring">Body Contouring</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Date *
                        </label>
                        <input
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                          type="date"
                          value={editBooking.date}
                          onChange={(e) =>
                            setEditBooking((prev) => ({
                              ...prev,
                              date: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Time *
                        </label>
                        <input
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                          type="time"
                          value={editBooking.time}
                          onChange={(e) =>
                            setEditBooking((prev) => ({
                              ...prev,
                              time: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Amount (£) *
                      </label>
                      <input
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                        type="number"
                        step="0.01"
                        min="0"
                        value={editBooking.amount}
                        onChange={(e) =>
                          setEditBooking((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Address
                      </label>
                      <input
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                        type="text"
                        value={editBooking.address}
                        onChange={(e) =>
                          setEditBooking((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notes
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                        rows={3}
                        value={editBooking.notes}
                        onChange={(e) =>
                          setEditBooking((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse transition-colors duration-300">
                  <button
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 dark:bg-blue-500 text-base font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-300"
                    type="submit"
                  >
                    Update Booking
                  </button>
                  <button
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-300"
                    type="button"
                    onClick={() => setShowEditBookingModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Complete Booking Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowCompleteModal(false)}
            />

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 transition-colors duration-300">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-300">
                    Confirm Completion
                  </h3>
                  <button
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
                    type="button"
                    onClick={() => setShowCompleteModal(false)}
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
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
                        Mark Booking as Completed
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        Are you sure you want to mark this booking as completed? This will also mark the payment as paid.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse transition-colors duration-300">
                <button
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 dark:bg-green-500 text-base font-medium text-white hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-300"
                  type="button"
                  onClick={confirmCompleteBooking}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Complete Booking
                </button>
                <button
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-300"
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Booking Modal */}
      {showDeleteModal && bookingToDelete && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDeleteBooking}
          title="Confirm Deletion"
          message={`Are you sure you want to delete this booking? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
      </div>
    </div>
  );
}

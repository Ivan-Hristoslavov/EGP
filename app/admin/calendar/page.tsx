"use client";

import type { CalendarStatsStrip } from "@/components/admin/calendar/calendar-types";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
} from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  useDisclosure,
} from "@heroui/react";
import { Chip, Input, Select, SelectItem, Spinner, Textarea } from "@heroui/react";

import { CalendarToolbar } from "./calendar-toolbar";

import { AdminDayOffManager } from "@/components/AdminDayOffManager";
import { useToast } from "@/components/Toast";
import WorkingHoursManager, {
  type WorkingHoursManagerHandle,
} from "@/components/admin/WorkingHoursManager";
import { isDayOffFeatureEnabled } from "@/config/feature-flags";
import { CalendarDayPanel } from "@/components/admin/calendar/calendar-day-panel";
import { CalendarMonthGrid } from "@/components/admin/calendar/calendar-month-grid";
import { CalendarMoveBookingModal } from "@/components/admin/calendar/calendar-move-booking-modal";
import { CalendarPageSkeleton } from "@/components/admin/calendar/calendar-page-skeleton";
import { CalendarStatsChips } from "@/components/admin/calendar/calendar-stats-chips";
import { CalendarViewHeader } from "@/components/admin/calendar/calendar-view-header";
import { CalendarWeekGrid } from "@/components/admin/calendar/calendar-week-grid";
import { typography, textColors } from "@/config/typography";

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
  duration?: number | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const getCurrentToday = () => {
  const today = new Date();

  return today.toISOString().split("T")[0];
};

// Helper function to format time to HH:MM
const formatTime = (timeString: string) => {
  if (!timeString) return "N/A";
  // If time is already in HH:MM format, return as is
  if (timeString.match(/^\d{2}:\d{2}$/)) {
    return timeString;
  }
  // If time is in HH:MM:SS format, remove seconds
  if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
    return timeString.substring(0, 5);
  }
  // For other formats, try to parse and format
  try {
    const [hours, minutes] = timeString.split(":");

    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  } catch {
    return timeString;
  }
};

const getCurrentTomorrow = () => {
  const tomorrow = new Date();

  tomorrow.setDate(tomorrow.getDate() + 1);

  return tomorrow.toISOString().split("T")[0];
};

// Empty bookings array - will be populated from database
const dummyBookings: Booking[] = [];

// Helper functions for week view
const getWeekDays = (date: Date) => {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday

  startOfWeek.setDate(diff);

  const days = [];

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);

    day.setDate(startOfWeek.getDate() + i);
    days.push(day);
  }

  return days;
};

const getWeekRange = (date: Date) => {
  const weekDays = getWeekDays(date);
  const start = weekDays[0];
  const end = weekDays[6];

  if (start.getMonth() === end.getMonth()) {
    return `${start.toLocaleDateString("en-US", { month: "long", year: "numeric" })} - Week of ${start.getDate()}-${end.getDate()}`;
  } else {
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  }
};

const getTimeSlots = () => {
  const slots = [];

  for (let hour = 8; hour < 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

      slots.push(time);
    }
  }

  return slots;
};

const isToday = (date: Date) => {
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

function statsFromBookingsForStrip(bookings: Booking[]): CalendarStatsStrip {
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

export default function CalendarPage() {
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(getCurrentToday());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showSchedulePanel, setShowSchedulePanel] = useState(false);
  const scheduleHoursRef = useRef<WorkingHoursManagerHandle>(null);
  const [schedulePanelHoursLoading, setSchedulePanelHoursLoading] =
    useState(true);
  const [schedulePanelAction, setSchedulePanelAction] = useState<
    "save" | "generate" | null
  >(null);
  const pendingScheduleScrollRef = useRef<"weekly" | "closures" | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);

  // State for booking details modal
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] =
    useState<Booking | null>(null);

  // State for status change modal
  const {
    isOpen: isStatusModalOpen,
    onOpen: onStatusModalOpen,
    onClose: onStatusModalClose,
  } = useDisclosure();
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // State for expanded day view
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [expandedDayBookings, setExpandedDayBookings] = useState<Booking[]>([]);

  // Move booking modal state (simplified drag and drop)
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [bookingToMove, setBookingToMove] = useState<Booking | null>(null);
  const [moveTargetDate, setMoveTargetDate] = useState<string>("");
  const [moveAvailableSlots, setMoveAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [customTime, setCustomTime] = useState<string>("");
  const [useCustomTime, setUseCustomTime] = useState(false);

  // Simple drag state
  const [draggedBooking, setDraggedBooking] = useState<Booking | null>(null);

  // Edit modal form state
  const [editFormData, setEditFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    service: "",
    date: "",
    time: "",
    amount: "",
    payment_method: "card" as "cash" | "card" | "cash_and_card",
    cash_amount: "",
    card_amount: "",
    payment_type: "full" as "full" | "deposit",
    deposit_amount: "",
    status: "pending",
    payment_status: "pending",
    address: "",
    notes: "",
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editAvailableSlots, setEditAvailableSlots] = useState<string[]>([]);
  const [loadingEditSlots, setLoadingEditSlots] = useState(false);

  // New booking form state
  const [newBookingForm, setNewBookingForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    service: "",
    date: getCurrentToday(),
    time: "",
    amount: "",
    payment_method: "card" as "cash" | "card" | "cash_and_card",
    cash_amount: "",
    card_amount: "",
    payment_type: "full" as "full" | "deposit",
    deposit_amount: "",
    status: "pending",
    payment_status: "pending",
    address: "",
    notes: "",
  });
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);
  const [newBookingAvailableSlots, setNewBookingAvailableSlots] = useState<
    string[]
  >([]);
  const [loadingNewBookingSlots, setLoadingNewBookingSlots] = useState(false);

  // Load bookings on component mount - load all bookings once
  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    if (searchParams.get("schedule") === "closures") {
      pendingScheduleScrollRef.current = isDayOffFeatureEnabled
        ? "closures"
        : "weekly";
      setShowSchedulePanel(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!showSchedulePanel) return;
    const target = pendingScheduleScrollRef.current;

    pendingScheduleScrollRef.current = null;
    if (!target) return;
    const id =
      target === "closures"
        ? "schedule-closed-periods"
        : "schedule-weekly-hours";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  }, [showSchedulePanel]);

  useEffect(() => {
    if (showSchedulePanel) {
      setSchedulePanelHoursLoading(true);
    }
  }, [showSchedulePanel]);

  const handleSchedulePanelSave = useCallback(async () => {
    setSchedulePanelAction("save");
    try {
      await scheduleHoursRef.current?.saveSchedule();
    } finally {
      setSchedulePanelAction(null);
    }
  }, []);

  const handleSchedulePanelGenerateSlots = useCallback(async () => {
    setSchedulePanelAction("generate");
    try {
      await scheduleHoursRef.current?.generateSlots();
    } finally {
      setSchedulePanelAction(null);
    }
  }, []);

  // Fetch time slots when target date changes in move modal
  useEffect(() => {
    if (moveTargetDate) {
      fetchTimeSlotsForDate(moveTargetDate);
    }
  }, [moveTargetDate]);

  // Fetch time slots when date changes in new booking form
  useEffect(() => {
    if (newBookingForm.date && showAddModal) {
      fetchNewBookingTimeSlots(newBookingForm.date);
    }
  }, [newBookingForm.date, showAddModal]);

  // Populate edit form when editing booking
  useEffect(() => {
    if (editingBooking) {
      const eb = editingBooking as any;

      setEditFormData({
        customer_name: editingBooking.customer_name || "",
        customer_email: editingBooking.customer_email || "",
        customer_phone: editingBooking.customer_phone || "",
        service: editingBooking.service || "",
        date: editingBooking.date || "",
        time: editingBooking.time || "",
        amount: (eb.total_amount ?? editingBooking.amount)?.toString() || "",
        payment_method: eb.payment_method || "card",
        cash_amount: eb.cash_amount?.toString() || "",
        card_amount: eb.card_amount?.toString() || "",
        payment_type: eb.payment_type || "full",
        deposit_amount: eb.amount_paid?.toString() || "",
        status: editingBooking.status || "pending",
        payment_status: editingBooking.payment_status || "pending",
        address: editingBooking.address || "",
        notes: editingBooking.notes || "",
      });

      // Fetch available time slots for the booking's date
      if (editingBooking.date) {
        fetchEditTimeSlots(editingBooking.date);
      }
    }
  }, [editingBooking]);

  // Fetch available time slots for edit modal
  const fetchEditTimeSlots = async (dateStr: string) => {
    setLoadingEditSlots(true);
    try {
      const response = await fetch(`/api/admin/time-slots?date=${dateStr}`);
      const data = await response.json();

      if (data.success && data.slots) {
        const slots = data.slots.map((slot: any) => slot.start_time).sort();

        setEditAvailableSlots(slots);
      } else {
        setEditAvailableSlots([]);
      }
    } catch (error) {
      console.error("Error fetching time slots for edit:", error);
      setEditAvailableSlots([]);
    } finally {
      setLoadingEditSlots(false);
    }
  };

  // Fetch available time slots for new booking form
  const fetchNewBookingTimeSlots = async (dateStr: string) => {
    setLoadingNewBookingSlots(true);
    try {
      const response = await fetch(`/api/admin/time-slots?date=${dateStr}`);
      const data = await response.json();

      if (data.success && data.slots) {
        const slots = data.slots.map((slot: any) => slot.start_time).sort();

        setNewBookingAvailableSlots(slots);
      } else {
        setNewBookingAvailableSlots([]);
      }
    } catch (error) {
      console.error("Error fetching time slots for new booking:", error);
      setNewBookingAvailableSlots([]);
    } finally {
      setLoadingNewBookingSlots(false);
    }
  };

  const loadBookings = async () => {
    try {
      setLoading(true);

      // Load all bookings without filters - we'll filter on the frontend
      const response = await fetch("/api/bookings?page=1&limit=1000", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Normalize booking dates to ensure consistent format (YYYY-MM-DD)
        // Some databases return dates with time or timezone info, we need just the date part
        const normalizedBookings = (data.bookings || []).map(
          (booking: Booking) => ({
            ...booking,
            date: booking.date ? booking.date.split("T")[0] : booking.date,
          }),
        );

        setBookings(normalizedBookings);
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

  const getStatusColor = (
    status: string,
  ): "success" | "warning" | "danger" | "default" | "primary" => {
    switch (status) {
      case "completed":
      case "confirmed":
        return "success";
      case "scheduled":
        return "primary";
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
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "scheduled":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getPaymentStatusColor = (
    status: string,
  ): "success" | "warning" | "danger" | "default" => {
    switch (status) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "refunded":
        return "danger";
      default:
        return "default";
    }
  };

  // Get bookings for the selected date in day view
  const getBookingsForSelectedDate = () => {
    return bookings.filter((booking) => {
      // Filter by selected date - normalize booking dates (remove time if present)
      const bookingDate = booking.date ? booking.date.split("T")[0] : "";
      const matchesDate = bookingDate === selectedDate;

      // Apply search filter
      const matchesSearch =
        !searchTerm ||
        booking.customer_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.customer_email &&
          booking.customer_email
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

      // Apply status filter
      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;

      return matchesDate && matchesSearch && matchesStatus;
    });
  };

  const filteredBookings = getBookingsForSelectedDate();

  // Calculate statistics for month view
  const monthStats = useMemo(() => {
    const monthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const monthEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );
    const monthStartStr = monthStart.toISOString().split("T")[0];
    const monthEndStr = monthEnd.toISOString().split("T")[0];

    const monthBookings = bookings.filter((booking) => {
      const bookingDate = booking.date ? booking.date.split("T")[0] : "";

      return bookingDate >= monthStartStr && bookingDate <= monthEndStr;
    });

    return {
      total: monthBookings.length,
      completed: monthBookings.filter((b) => b.status === "completed").length,
      scheduled: monthBookings.filter(
        (b) => b.status === "scheduled" || b.status === "confirmed",
      ).length,
      pending: monthBookings.filter((b) => b.status === "pending").length,
      cancelled: monthBookings.filter((b) => b.status === "cancelled").length,
      paid: monthBookings.filter((b) => b.payment_status === "paid").length,
      totalAmount: monthBookings.reduce((sum, b) => sum + (b.amount || 0), 0),
    };
  }, [currentDate, bookings]);

  // Calculate statistics for week view
  const weekStats = useMemo(() => {
    const weekDays = getWeekDays(currentDate);
    const weekStart = weekDays[0];
    const weekEnd = weekDays[6];
    const weekStartStr = weekStart.toISOString().split("T")[0];
    const weekEndStr = weekEnd.toISOString().split("T")[0];

    const weekBookings = bookings.filter((booking) => {
      const bookingDate = booking.date ? booking.date.split("T")[0] : "";

      return bookingDate >= weekStartStr && bookingDate <= weekEndStr;
    });

    return {
      total: weekBookings.length,
      completed: weekBookings.filter((b) => b.status === "completed").length,
      scheduled: weekBookings.filter(
        (b) => b.status === "scheduled" || b.status === "confirmed",
      ).length,
      pending: weekBookings.filter((b) => b.status === "pending").length,
      cancelled: weekBookings.filter((b) => b.status === "cancelled").length,
      paid: weekBookings.filter((b) => b.payment_status === "paid").length,
      totalAmount: weekBookings.reduce((sum, b) => sum + (b.amount || 0), 0),
    };
  }, [currentDate, bookings]);

  // Function to handle clicking on a day in the month view
  const handleDayClick = (day: number) => {
    if (day) {
      const clickedDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day,
      );
      const dateStr = clickedDate.toISOString().split("T")[0];

      setSelectedDate(dateStr); // Set selectedDate to YYYY-MM-DD
      // Switch to day view when clicking on a day
      setView("day");
    }
  };

  // Function to handle clicking on an individual booking
  const handleBookingClick = (booking: Booking) => {
    setSelectedBookingDetails(booking);
    setShowBookingDetailsModal(true);
  };

  // Function to open status change modal
  const handleOpenStatusModal = (booking: Booking) => {
    setSelectedBookingDetails(booking);
    setSelectedStatus(booking.status);
    onStatusModalOpen();
  };

  // Function to handle status change confirmation
  const handleStatusChangeConfirm = () => {
    if (!selectedBookingDetails || !selectedStatus) return;

    handleStatusChange(selectedBookingDetails.id, selectedStatus);
    onStatusModalClose();
    setSelectedStatus("");
  };

  const handleExpandDay = (date: number, month: number, year: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
    const dayBookings = getBookingsForDate(date, month, year);

    setExpandedDay(dateStr);
    setExpandedDayBookings(dayBookings);
  };

  const handleCloseExpandedDay = () => {
    setExpandedDay(null);
    setExpandedDayBookings([]);
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      console.log("Updating booking:", bookingId, "to status:", newStatus);
      console.log("Booking ID type:", typeof bookingId);
      console.log("Booking ID length:", bookingId.length);

      // Update local state immediately for better UX
      setBookings(
        bookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: newStatus as any }
            : booking,
        ),
      );

      // Update expanded day bookings if it's open
      if (expandedDayBookings.length > 0) {
        setExpandedDayBookings(
          expandedDayBookings.map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: newStatus as any }
              : booking,
          ),
        );
      }

      // Update selected booking details if it's open
      if (selectedBookingDetails && selectedBookingDetails.id === bookingId) {
        setSelectedBookingDetails((prev) =>
          prev ? { ...prev, status: newStatus as any } : null,
        );
      }

      // Update booking status via API
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries()),
      );

      if (response.ok) {
        const result = await response.json();

        console.log("Update successful:", result);
      } else {
        const errorText = await response.text();

        console.error("Update failed - Status:", response.status);
        console.error("Update failed - Response:", errorText);

        // Revert the local state change if API call failed
        setBookings(
          bookings.map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: booking.status } // Keep original status
              : booking,
          ),
        );

        if (expandedDayBookings.length > 0) {
          setExpandedDayBookings(
            expandedDayBookings.map((booking) =>
              booking.id === bookingId
                ? { ...booking, status: booking.status } // Keep original status
                : booking,
            ),
          );
        }

        if (selectedBookingDetails && selectedBookingDetails.id === bookingId) {
          setSelectedBookingDetails((prev) =>
            prev ? { ...prev, status: prev.status } : null,
          );
        }

        alert(`Failed to update booking status. Error: ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert("Network error occurred while updating booking status");
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBookings(bookings.filter((booking) => booking.id !== bookingId));
        setShowDeleteModal(false);
        setBookingToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };

  // Drag and drop functions
  // Open move modal with selected booking
  const handleMoveBookingClick = (booking: Booking) => {
    setBookingToMove(booking);
    setShowMoveModal(true);
    setMoveTargetDate("");
    setMoveAvailableSlots([]);
    setCustomTime("");
    setUseCustomTime(false);
  };

  // Simple drag handlers
  const handleDragStart = (e: React.DragEvent, booking: Booking) => {
    setDraggedBooking(booking);
    e.dataTransfer.effectAllowed = "move";
    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Reset visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
    setDraggedBooking(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetDay: number) => {
    e.preventDefault();
    if (!draggedBooking) return;

    // Create target date
    const targetDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      targetDay,
    );
    const targetDateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}-${String(targetDate.getDate()).padStart(2, "0")}`;

    // Check if dropping on same day
    if (draggedBooking.date === targetDateStr) {
      setDraggedBooking(null);

      return;
    }

    // Open move modal with pre-selected date
    setBookingToMove(draggedBooking);
    setMoveTargetDate(targetDateStr);
    setShowMoveModal(true);
    setDraggedBooking(null);
  };

  // Fetch available time slots for selected date
  const fetchTimeSlotsForDate = async (dateStr: string) => {
    setLoadingSlots(true);
    try {
      const response = await fetch(`/api/admin/time-slots?date=${dateStr}`);
      const data = await response.json();

      if (data.success && data.slots) {
        const slots = data.slots.map((slot: any) => slot.start_time).sort();

        setMoveAvailableSlots(slots);
      } else {
        setMoveAvailableSlots([]);
      }
    } catch (error) {
      console.error("Error fetching time slots:", error);
      setMoveAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Handle move booking to new date and time
  const handleMoveBooking = async (targetTime?: string) => {
    if (!bookingToMove || !moveTargetDate) return;

    // Use custom time if enabled, otherwise use the provided targetTime
    const finalTime = useCustomTime ? customTime : targetTime;

    if (!finalTime) return;

    try {
      const moveResponse = await fetch(
        `/api/bookings/${bookingToMove.id}/move`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newDate: moveTargetDate, newTime: finalTime }),
        },
      );

      const moveData = await moveResponse.json();

      if (moveData.success) {
        // Update bookings in state
        setBookings(
          bookings.map((booking) =>
            booking.id === bookingToMove.id
              ? { ...booking, date: moveTargetDate, time: finalTime }
              : booking,
          ),
        );

        // Update expanded day bookings if open
        if (expandedDayBookings.length > 0) {
          setExpandedDayBookings(
            expandedDayBookings.map((booking) =>
              booking.id === bookingToMove.id
                ? { ...booking, date: moveTargetDate, time: finalTime }
                : booking,
            ),
          );
        }

        const targetDate = new Date(moveTargetDate);

        showSuccess(
          "Booking Moved",
          `Booking moved to ${targetDate.toLocaleDateString()} at ${formatTime(finalTime)}`,
        );

        // Close modal and reset
        setShowMoveModal(false);
        setBookingToMove(null);
        setMoveTargetDate("");
        setMoveAvailableSlots([]);
        setCustomTime("");
        setUseCustomTime(false);
      } else {
        showError("Move Failed", `Failed to move booking: ${moveData.error}`);
      }
    } catch (error) {
      console.error("Error moving booking:", error);
      showError("Move Error", "Error moving booking");
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async () => {
    if (!editingBooking) return;

    setIsSubmittingEdit(true);

    try {
      const totalAmount = parseFloat(editFormData.amount) || 0;
      const isDeposit = editFormData.payment_type === "deposit";
      const depositAmount = isDeposit
        ? parseFloat(editFormData.deposit_amount) || 0
        : totalAmount;

      const response = await fetch(`/api/bookings?id=${editingBooking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editFormData,
          amount: isDeposit ? depositAmount : totalAmount,
          total_amount: totalAmount,
          amount_paid: depositAmount,
          remaining_amount: isDeposit
            ? Math.max(0, totalAmount - depositAmount)
            : 0,
          payment_type: editFormData.payment_type,
          payment_method: editFormData.payment_method,
          cash_amount:
            editFormData.payment_method === "cash_and_card"
              ? parseFloat(editFormData.cash_amount) || 0
              : undefined,
          card_amount:
            editFormData.payment_method === "cash_and_card"
              ? parseFloat(editFormData.card_amount) || 0
              : undefined,
        }),
      });

      if (response.ok) {
        const updatedBooking = await response.json();

        // Update bookings in state
        setBookings(
          bookings.map((booking) =>
            booking.id === editingBooking.id ? updatedBooking : booking,
          ),
        );

        // Update expanded day bookings if open
        if (expandedDayBookings.length > 0) {
          setExpandedDayBookings(
            expandedDayBookings.map((booking) =>
              booking.id === editingBooking.id ? updatedBooking : booking,
            ),
          );
        }

        // Update selected booking details if it's open
        if (selectedBookingDetails?.id === editingBooking.id) {
          setSelectedBookingDetails(updatedBooking);
        }

        showSuccess("Booking Updated", "Booking has been successfully updated");

        // Close modal and reset
        setShowEditModal(false);
        setEditingBooking(null);
      } else {
        const errorData = await response.json();

        showError(
          "Update Failed",
          errorData.error || "Failed to update booking",
        );
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      showError("Update Error", "Error updating booking");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handle edit form input changes
  const handleEditInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle date change in edit form - fetch new time slots
  const handleEditDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setEditFormData((prev) => ({
      ...prev,
      date: value,
      time: "", // Clear time when date changes
    }));

    // Fetch available time slots for the new date
    if (value) {
      fetchEditTimeSlots(value);
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);

    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);

    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const handleTimeSlotClick = (day: Date, timeSlot: string) => {
    const dateStr = day.toISOString().split("T")[0];

    setSelectedDate(dateStr);
    setNewBookingForm((prev) => ({ ...prev, date: dateStr, time: timeSlot }));
    setShowAddModal(true);
  };

  // Handle new booking form input changes
  const handleNewBookingInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setNewBookingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle date change in new booking form - fetch new time slots
  const handleNewBookingDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { value } = e.target;

    setNewBookingForm((prev) => ({
      ...prev,
      date: value,
      time: "", // Clear time when date changes
    }));

    // Fetch available time slots for the new date
    if (value) {
      fetchNewBookingTimeSlots(value);
    }
  };

  // Handle new booking form submission
  const handleNewBookingSubmit = async () => {
    if (
      !newBookingForm.customer_name ||
      !newBookingForm.service ||
      !newBookingForm.date ||
      !newBookingForm.time ||
      !newBookingForm.amount
    ) {
      showError("Validation Error", "Please fill in all required fields");

      return;
    }

    setIsSubmittingNew(true);

    try {
      const totalAmount = parseFloat(newBookingForm.amount) || 0;
      const isDeposit = newBookingForm.payment_type === "deposit";
      const depositAmount = isDeposit
        ? parseFloat(newBookingForm.deposit_amount) || 0
        : totalAmount;

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: newBookingForm.customer_name,
          customer_email: newBookingForm.customer_email || null,
          customer_phone: newBookingForm.customer_phone || null,
          service: newBookingForm.service,
          date: newBookingForm.date,
          time: newBookingForm.time,
          amount: isDeposit ? depositAmount : totalAmount,
          total_amount: totalAmount,
          amount_paid: depositAmount,
          remaining_amount: isDeposit
            ? Math.max(0, totalAmount - depositAmount)
            : 0,
          payment_type: newBookingForm.payment_type,
          payment_method: newBookingForm.payment_method,
          cash_amount:
            newBookingForm.payment_method === "cash_and_card"
              ? parseFloat(newBookingForm.cash_amount) || 0
              : undefined,
          card_amount:
            newBookingForm.payment_method === "cash_and_card"
              ? parseFloat(newBookingForm.card_amount) || 0
              : undefined,
          status: newBookingForm.status,
          payment_status: newBookingForm.payment_status,
          address: newBookingForm.address || null,
          notes: newBookingForm.notes || null,
        }),
      });

      if (response.ok) {
        const newBooking = await response.json();

        setBookings([...bookings, newBooking]);
        showSuccess(
          "Booking Created",
          "New booking has been successfully created",
        );

        setNewBookingForm({
          customer_name: "",
          customer_email: "",
          customer_phone: "",
          service: "",
          date: getCurrentToday(),
          time: "",
          amount: "",
          payment_method: "card",
          cash_amount: "",
          card_amount: "",
          payment_type: "full",
          deposit_amount: "",
          status: "pending",
          payment_status: "pending",
          address: "",
          notes: "",
        });
        setShowAddModal(false);
      } else {
        const errorData = await response.json();

        showError(
          "Creation Failed",
          errorData.error || errorData.message || "Failed to create booking",
        );
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      showError("Creation Error", "Error creating booking");
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getBookingsForDate = (date: number, month: number, year: number) => {
    if (!date) return [];
    // Construct the date string in YYYY-MM-DD format
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;

    // Filter bookings and apply client-side filters
    // Normalize booking dates (remove time if present, handle different formats)
    let filteredBookings = bookings.filter((booking) => {
      const bookingDate = booking.date ? booking.date.split("T")[0] : "";

      return bookingDate === dateStr;
    });

    // Apply search filter
    if (searchTerm) {
      filteredBookings = filteredBookings.filter(
        (booking) =>
          booking.customer_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (booking.customer_email &&
            booking.customer_email
              .toLowerCase()
              .includes(searchTerm.toLowerCase())),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filteredBookings = filteredBookings.filter(
        (booking) => booking.status === statusFilter,
      );
    }

    return filteredBookings;
  };

  if (loading) {
    return <CalendarPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Button
          startContent={<Clock className="h-4 w-4" />}
          variant="bordered"
          onPress={() => {
            pendingScheduleScrollRef.current = "weekly";
            setShowSchedulePanel(true);
          }}
        >
          {isDayOffFeatureEnabled ? "Hours & closures" : "Working hours"}
        </Button>
        <Button
          className="h-10 shrink-0 font-semibold sm:h-11 sm:min-w-[10.5rem]"
          color="primary"
          size="sm"
          startContent={<Plus className="h-4 w-4" />}
          variant="flat"
          onPress={() => {
            setShowAddModal(true);
            setNewBookingForm((prev) => ({ ...prev, date: selectedDate }));
            if (selectedDate) {
              fetchNewBookingTimeSlots(selectedDate);
            }
          }}
        >
          New booking
        </Button>
      </div>

      <CalendarToolbar
        searchTerm={searchTerm}
        selectedDate={selectedDate}
        statusFilter={statusFilter}
        view={view}
        onSearchTermChange={setSearchTerm}
        onSelectedDateChange={(value) => {
          setSelectedDate(value);
          if (view !== "day") {
            setView("day");
          }
        }}
        onStatusFilterChange={setStatusFilter}
        onViewChange={setView}
      />

      {/* Calendar View */}
      {view === "month" && (
        <div className="overflow-hidden rounded-xl border border-default-200/90 bg-content1 shadow-sm shadow-black/5 ring-1 ring-black/5 dark:border-default-100/20 dark:shadow-black/20 dark:ring-white/10">
          <CalendarViewHeader
            nextAriaLabel="Next month"
            prevAriaLabel="Previous month"
            statsSlot={<CalendarStatsChips stats={monthStats} />}
            title={currentDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
            todayLabel="Today"
            onNext={() => navigateDate("next")}
            onPrev={() => navigateDate("prev")}
            onToday={() => setCurrentDate(new Date())}
          />
          <CalendarMonthGrid
            currentDate={currentDate}
            days={getDaysInMonth(currentDate)}
            draggedBookingId={draggedBooking?.id ?? null}
            formatTime={formatTime}
            getBookingsForDate={getBookingsForDate}
            selectedDate={selectedDate}
            onBookingClick={(b) => handleBookingClick(b as Booking)}
            onDayClick={handleDayClick}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragStart={(e, b) => handleDragStart(e, b as Booking)}
            onDrop={handleDrop}
            onExpandDay={handleExpandDay}
          />
        </div>
      )}

      {/* Week View */}
      {view === "week" && (
        <div className="overflow-hidden rounded-xl border border-default-200/90 bg-content1 shadow-sm shadow-black/5 ring-1 ring-black/5 dark:border-default-100/20 dark:shadow-black/20 dark:ring-white/10">
          <CalendarViewHeader
            nextAriaLabel="Next week"
            prevAriaLabel="Previous week"
            statsSlot={<CalendarStatsChips stats={weekStats} />}
            title={getWeekRange(currentDate)}
            todayLabel="This week"
            onNext={() => navigateWeek("next")}
            onPrev={() => navigateWeek("prev")}
            onToday={() => setCurrentDate(new Date())}
          />
          <CalendarWeekGrid
            formatTime={formatTime}
            getBookingsForDate={getBookingsForDate}
            selectedDate={selectedDate}
            weekDays={getWeekDays(currentDate)}
            onBookingClick={(b) => handleBookingClick(b as Booking)}
            onSelectDayGoToDayView={(dayDateStr) => {
              setSelectedDate(dayDateStr);
              setView("day");
            }}
            onTimeSlotActivate={(day, timeSlot) => {
              handleTimeSlotClick(day, timeSlot);
            }}
          />
        </div>
      )}

      {/* Day View */}
      {view === "day" && (
        <div className="overflow-hidden rounded-xl border border-default-200/90 bg-content1 shadow-sm shadow-black/5 ring-1 ring-black/5 dark:border-default-100/20 dark:shadow-black/20 dark:ring-white/10">
          <CalendarViewHeader
            nextAriaLabel="Next day"
            prevAriaLabel="Previous day"
            statsSlot={
              filteredBookings.length > 0 ? (
                <CalendarStatsChips
                  stats={statsFromBookingsForStrip(filteredBookings)}
                />
              ) : null
            }
            title={new Date(selectedDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            todayLabel="Today"
            onNext={() => {
              const current = new Date(selectedDate);

              current.setDate(current.getDate() + 1);
              setSelectedDate(current.toISOString().split("T")[0]);
            }}
            onPrev={() => {
              const current = new Date(selectedDate);

              current.setDate(current.getDate() - 1);
              setSelectedDate(current.toISOString().split("T")[0]);
            }}
            onToday={() => setSelectedDate(getCurrentToday())}
          />
          <CalendarDayPanel
            filteredBookings={filteredBookings}
            formatTime={formatTime}
            onBookingClick={(b) => handleBookingClick(b as Booking)}
            onCreateBooking={() => {
              setShowAddModal(true);
              setNewBookingForm((prev) => ({ ...prev, date: selectedDate }));
              if (selectedDate) {
                fetchNewBookingTimeSlots(selectedDate);
              }
            }}
          />
        </div>
      )}

      <Modal
        classNames={{
          wrapper:
            "items-stretch justify-stretch p-0 sm:items-stretch sm:justify-end",
          base: "m-0 h-[100dvh] max-h-[100dvh] w-full max-w-full rounded-none sm:ml-auto sm:max-w-2xl sm:rounded-l-xl sm:rounded-r-none",
          body: "overflow-y-auto py-0",
        }}
        isOpen={showSchedulePanel}
        scrollBehavior="inside"
        size="full"
        onClose={() => setShowSchedulePanel(false)}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex-shrink-0 flex-col gap-1 border-b border-divider py-3">
                <h2 className="text-lg font-bold sm:text-xl">
                  Schedule
                  {isDayOffFeatureEnabled ? " & closures" : ""}
                </h2>
                <p className="text-xs font-normal text-default-500 sm:text-sm">
                  {isDayOffFeatureEnabled
                    ? "Weekly hours, booking blackouts, and closed periods. Use Save and Generate slots in the footer."
                    : "Default working hours and booking rules for each weekday. Footer actions save and refresh slots."}
                </p>
              </ModalHeader>
              <ModalBody className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-3 pb-4 pt-2 sm:px-4">
                <section
                  aria-labelledby="schedule-weekly-hours-heading"
                  className="scroll-mt-4"
                  id="schedule-weekly-hours"
                >
                  <div className="mb-3">
                    <h3
                      className={`${typography.headingSmall} ${textColors.heading}`}
                      id="schedule-weekly-hours-heading"
                    >
                      Weekly hours
                    </h3>
                    <p className={`mt-1 text-sm ${textColors.muted}`}>
                      Default working hours and booking rules for each weekday.
                    </p>
                  </div>
                  <WorkingHoursManager
                    ref={scheduleHoursRef}
                    embedded
                    hideEmbeddedToolbar
                    onEmbeddedLoadingChange={setSchedulePanelHoursLoading}
                  />
                </section>
                {isDayOffFeatureEnabled ? (
                  <>
                    <Divider />
                    <section
                      aria-labelledby="schedule-closed-periods-heading"
                      className="scroll-mt-4"
                      id="schedule-closed-periods"
                    >
                      <div className="mb-3">
                        <h3
                          className={`${typography.headingSmall} ${textColors.heading}`}
                          id="schedule-closed-periods-heading"
                        >
                          Closed periods
                        </h3>
                        <p className={`mt-1 text-sm ${textColors.muted}`}>
                          Holidays and blackout ranges when bookings are not
                          accepted.
                        </p>
                      </div>
                      <AdminDayOffManager embedded />
                    </section>
                  </>
                ) : null}
              </ModalBody>
              <ModalFooter className="flex-shrink-0 flex-col gap-3 border-t border-divider px-3 py-3 sm:px-4">
                <p className="max-w-full text-xs leading-relaxed text-default-500 sm:max-w-xl">
                  <span className="font-semibold text-foreground">
                    Generate slots
                  </span>{" "}
                  rebuilds stored bookable times for about the next{" "}
                  <strong>30 days</strong> from today, using the weekly hours and
                  blackouts you have <strong>already saved</strong>.{" "}
                  <span className="italic">
                    Example: shorten Thursday to 17:00 close, tap{" "}
                    <strong>Save</strong>, then <strong>Generate slots</strong> —
                    new Thursday slots end at 17:00.
                  </span>
                </p>
                <p className="text-[11px] leading-snug text-default-400">
                  <strong>Save</strong> stores weekly hours, closed weekdays, and
                  scheduled blackouts. Closed periods below still save from their own
                  add/edit form.
                </p>
                <div className="flex w-full flex-wrap items-center justify-between gap-2 border-t border-divider pt-3 sm:border-t-0 sm:pt-0">
                  <Button variant="light" onPress={onClose}>
                    Close
                  </Button>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button
                      className="font-semibold"
                      isDisabled={
                        schedulePanelHoursLoading ||
                        schedulePanelAction !== null
                      }
                      isLoading={schedulePanelAction === "generate"}
                      size="sm"
                      startContent={<CalendarIcon className="h-4 w-4" />}
                      variant="bordered"
                      onPress={handleSchedulePanelGenerateSlots}
                    >
                      Generate slots
                    </Button>
                    <Button
                      className="bg-emerald-600 font-semibold text-white shadow-sm hover:bg-emerald-700 data-[pressed=true]:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                      color="default"
                      isDisabled={
                        schedulePanelHoursLoading ||
                        schedulePanelAction !== null
                      }
                      isLoading={schedulePanelAction === "save"}
                      size="sm"
                      startContent={<Save className="h-4 w-4" />}
                      variant="solid"
                      onPress={handleSchedulePanelSave}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* New Booking Modal */}
      <Modal
        isOpen={showAddModal}
        scrollBehavior="inside"
        size="3xl"
        onClose={() => {
          setShowAddModal(false);
          setNewBookingForm({
            customer_name: "",
            customer_email: "",
            customer_phone: "",
            service: "",
            date: getCurrentToday(),
            time: "",
            amount: "",
            status: "pending",
            payment_status: "pending",
            address: "",
            notes: "",
            payment_method: "card" as "cash" | "card" | "cash_and_card",
            cash_amount: "",
            card_amount: "",
            payment_type: "full" as "full" | "deposit",
            deposit_amount: "",
          });
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                    <Plus className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">
                      New Booking
                    </h2>
                    <p className="text-sm font-normal text-default-500">
                      Create a new appointment booking
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-6">
                  {/* Customer Information */}
                  <Card className="border border-divider">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        <h3 className="text-lg font-semibold">
                          Customer Information
                        </h3>
                      </div>
                    </CardHeader>
                    <CardBody className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          isRequired
                          label="Customer Name"
                          name="customer_name"
                          placeholder="Enter customer name"
                          value={newBookingForm.customer_name}
                          onChange={handleNewBookingInputChange}
                        />
                        <Input
                          label="Email"
                          name="customer_email"
                          placeholder="Enter email address"
                          type="email"
                          value={newBookingForm.customer_email}
                          onChange={handleNewBookingInputChange}
                        />
                        <Input
                          label="Phone"
                          name="customer_phone"
                          placeholder="Enter phone number"
                          type="tel"
                          value={newBookingForm.customer_phone}
                          onChange={handleNewBookingInputChange}
                        />
                        <Input
                          isRequired
                          label="Service"
                          name="service"
                          placeholder="Enter service name"
                          value={newBookingForm.service}
                          onChange={handleNewBookingInputChange}
                        />
                      </div>
                    </CardBody>
                  </Card>

                  {/* Schedule Information */}
                  <Card className="border border-divider">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-success-600 dark:text-success-400" />
                        <h3 className="text-lg font-semibold">
                          Schedule Information
                        </h3>
                      </div>
                    </CardHeader>
                    <CardBody className="pt-0">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          isRequired
                          label="Date"
                          min={getCurrentToday()}
                          name="date"
                          type="date"
                          value={newBookingForm.date}
                          onChange={handleNewBookingDateChange}
                        />
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Time *
                          </label>
                          {loadingNewBookingSlots ? (
                            <div className="relative">
                              <Select
                                isDisabled
                                placeholder="Loading available times..."
                              >
                                <SelectItem key="loading">
                                  Loading...
                                </SelectItem>
                              </Select>
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Spinner size="sm" />
                              </div>
                            </div>
                          ) : newBookingAvailableSlots.length > 0 ? (
                            <Select
                              isRequired
                              label="Select Time"
                              name="time"
                              selectedKeys={
                                newBookingForm.time ? [newBookingForm.time] : []
                              }
                              onSelectionChange={(keys) => {
                                const selectedTime = Array.from(
                                  keys,
                                )[0] as string;

                                setNewBookingForm((prev) => ({
                                  ...prev,
                                  time: selectedTime || "",
                                }));
                              }}
                            >
                              {newBookingAvailableSlots.map((timeSlot) => (
                                <SelectItem key={timeSlot}>
                                  {formatTime(timeSlot)}
                                </SelectItem>
                              ))}
                            </Select>
                          ) : (
                            <div className="px-3 py-2 border border-divider rounded-lg bg-default-50 text-default-500 text-sm">
                              No available time slots for this date
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-default-500 bg-default-50 dark:bg-default-100 p-2 rounded">
                        💡 Change date to see available time slots for that day.
                        Time will be cleared when date changes.
                      </div>
                    </CardBody>
                  </Card>

                  {/* Payment & Status */}
                  <Card className="border border-divider">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-warning-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            £
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold">
                          Payment & Status
                        </h3>
                      </div>
                    </CardHeader>
                    <CardBody className="pt-0 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          isRequired
                          label="Total Amount (£)"
                          min="0"
                          name="amount"
                          placeholder="0.00"
                          step="0.01"
                          type="number"
                          value={newBookingForm.amount}
                          onChange={(e) => {
                            handleNewBookingInputChange(e);
                            if (
                              newBookingForm.payment_method === "cash_and_card"
                            ) {
                              setNewBookingForm((prev) => ({
                                ...prev,
                                amount: e.target.value,
                                cash_amount: "",
                                card_amount: "",
                              }));
                            }
                          }}
                        />
                        <Select
                          label="Payment Method"
                          selectedKeys={[newBookingForm.payment_method]}
                          onSelectionChange={(keys) => {
                            const selected = Array.from(keys)[0] as string;

                            setNewBookingForm((prev) => ({
                              ...prev,
                              payment_method: selected as
                                | "cash"
                                | "card"
                                | "cash_and_card",
                              cash_amount: "",
                              card_amount: "",
                            }));
                          }}
                        >
                          <SelectItem key="card">Card</SelectItem>
                          <SelectItem key="cash">Cash</SelectItem>
                          <SelectItem key="cash_and_card">
                            Cash + Card
                          </SelectItem>
                        </Select>
                      </div>

                      {newBookingForm.payment_method === "cash_and_card" && (
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Cash Amount (£)"
                            max={newBookingForm.amount || undefined}
                            min="0"
                            placeholder="0.00"
                            step="0.01"
                            type="number"
                            value={newBookingForm.cash_amount}
                            onChange={(e) => {
                              const cashVal = e.target.value;
                              const total =
                                parseFloat(newBookingForm.amount) || 0;
                              const cashNum = parseFloat(cashVal) || 0;
                              const cardNum = Math.max(
                                0,
                                Math.round((total - cashNum) * 100) / 100,
                              );

                              setNewBookingForm((prev) => ({
                                ...prev,
                                cash_amount: cashVal,
                                card_amount:
                                  cashNum > 0 && total > 0
                                    ? cardNum.toFixed(2)
                                    : "",
                              }));
                            }}
                          />
                          <Input
                            label="Card Amount (£)"
                            max={newBookingForm.amount || undefined}
                            min="0"
                            placeholder="0.00"
                            step="0.01"
                            type="number"
                            value={newBookingForm.card_amount}
                            onChange={(e) => {
                              const cardVal = e.target.value;
                              const total =
                                parseFloat(newBookingForm.amount) || 0;
                              const cardNum = parseFloat(cardVal) || 0;
                              const cashNum = Math.max(
                                0,
                                Math.round((total - cardNum) * 100) / 100,
                              );

                              setNewBookingForm((prev) => ({
                                ...prev,
                                card_amount: cardVal,
                                cash_amount:
                                  cardNum > 0 && total > 0
                                    ? cashNum.toFixed(2)
                                    : "",
                              }));
                            }}
                          />
                        </div>
                      )}

                      {/* Deposit toggle */}
                      <div className="flex items-center gap-3 p-3 bg-default-50 rounded-lg border border-divider">
                        <input
                          checked={newBookingForm.payment_type === "deposit"}
                          className="w-4 h-4 text-primary rounded border-default-300 focus:ring-primary"
                          id="new-deposit-toggle"
                          type="checkbox"
                          onChange={(e) => {
                            setNewBookingForm((prev) => ({
                              ...prev,
                              payment_type: e.target.checked
                                ? "deposit"
                                : "full",
                              deposit_amount: "",
                            }));
                          }}
                        />
                        <label
                          className="text-sm font-medium text-foreground cursor-pointer"
                          htmlFor="new-deposit-toggle"
                        >
                          Deposit payment (partial payment now, rest later)
                        </label>
                      </div>

                      {newBookingForm.payment_type === "deposit" && (
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            isRequired
                            label="Deposit Amount (£)"
                            max={newBookingForm.amount || undefined}
                            min="0"
                            placeholder="0.00"
                            step="0.01"
                            type="number"
                            value={newBookingForm.deposit_amount}
                            onChange={(e) =>
                              setNewBookingForm((prev) => ({
                                ...prev,
                                deposit_amount: e.target.value,
                              }))
                            }
                          />
                          <div className="flex items-center px-3 text-sm text-default-500">
                            Remaining: £
                            {Math.max(
                              0,
                              (parseFloat(newBookingForm.amount) || 0) -
                                (parseFloat(newBookingForm.deposit_amount) ||
                                  0),
                            ).toFixed(2)}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <Select
                          label="Status"
                          selectedKeys={[newBookingForm.status]}
                          onSelectionChange={(keys) => {
                            const selectedStatus = Array.from(
                              keys,
                            )[0] as string;

                            setNewBookingForm((prev) => ({
                              ...prev,
                              status: selectedStatus || "pending",
                            }));
                          }}
                        >
                          <SelectItem key="pending">Pending</SelectItem>
                          <SelectItem key="scheduled">Scheduled</SelectItem>
                          <SelectItem key="confirmed">Confirmed</SelectItem>
                          <SelectItem key="completed">Completed</SelectItem>
                        </Select>
                        <Select
                          label="Payment Status"
                          selectedKeys={[newBookingForm.payment_status]}
                          onSelectionChange={(keys) => {
                            const selectedPaymentStatus = Array.from(
                              keys,
                            )[0] as string;

                            setNewBookingForm((prev) => ({
                              ...prev,
                              payment_status:
                                selectedPaymentStatus || "pending",
                            }));
                          }}
                        >
                          <SelectItem key="pending">Pending</SelectItem>
                          <SelectItem key="paid">Paid</SelectItem>
                          <SelectItem key="refunded">Refunded</SelectItem>
                        </Select>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Service Details */}
                  <Card className="border border-divider">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                        <h3 className="text-lg font-semibold">
                          Service Details
                        </h3>
                      </div>
                    </CardHeader>
                    <CardBody className="pt-0 space-y-4">
                      <Textarea
                        label="Address"
                        name="address"
                        placeholder="Enter service address (optional)"
                        rows={3}
                        value={newBookingForm.address}
                        onChange={handleNewBookingInputChange}
                      />
                      <Textarea
                        label="Notes"
                        name="notes"
                        placeholder="Enter any additional notes (optional)"
                        rows={3}
                        value={newBookingForm.notes}
                        onChange={handleNewBookingInputChange}
                      />
                    </CardBody>
                  </Card>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  disabled={isSubmittingNew}
                  isLoading={isSubmittingNew}
                  onPress={handleNewBookingSubmit}
                >
                  {isSubmittingNew ? "Creating..." : "Create Booking"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Booking Details Modal */}
      <Modal
        isOpen={showBookingDetailsModal}
        scrollBehavior="inside"
        size="3xl"
        onClose={() => setShowBookingDetailsModal(false)}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                      <CalendarIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold">
                        Booking Details
                      </h2>
                      <p className="text-sm text-default-500">
                        {selectedBookingDetails &&
                          new Date(
                            selectedBookingDetails.date,
                          ).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                      </p>
                    </div>
                  </div>
                  {selectedBookingDetails && (
                    <div className="flex items-center gap-2">
                      <Chip
                        color={getStatusColor(selectedBookingDetails.status)}
                        startContent={getStatusIcon(
                          selectedBookingDetails.status,
                        )}
                        variant="flat"
                      >
                        {selectedBookingDetails.status}
                      </Chip>
                      <Chip
                        color={getPaymentStatusColor(
                          selectedBookingDetails.payment_status,
                        )}
                        startContent={
                          selectedBookingDetails.payment_status === "paid" ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : selectedBookingDetails.payment_status ===
                            "pending" ? (
                            <Clock className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )
                        }
                        variant="flat"
                      >
                        Payment: {selectedBookingDetails.payment_status}
                      </Chip>
                    </div>
                  )}
                </div>
              </ModalHeader>

              <ModalBody>
                {selectedBookingDetails && (
                  <div className="space-y-6">
                    {/* Customer & Service Info */}
                    <Card className="border border-divider">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                          <h3 className="text-lg font-semibold">
                            Customer & Service
                          </h3>
                        </div>
                      </CardHeader>
                      <CardBody className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-default-500 mb-1">
                              Customer Name
                            </label>
                            <p className="font-semibold text-lg">
                              {selectedBookingDetails.customer_name}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-default-500 mb-1">
                              Service
                            </label>
                            <p className="font-medium">
                              {selectedBookingDetails.service}
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Date & Time Info */}
                    <Card className="border border-divider">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-success-600 dark:text-success-400" />
                          <h3 className="text-lg font-semibold">Schedule</h3>
                        </div>
                      </CardHeader>
                      <CardBody className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-default-500 mb-1">
                              Date
                            </label>
                            <p className="font-medium">
                              {new Date(
                                selectedBookingDetails.date,
                              ).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-default-500 mb-1">
                              Time
                            </label>
                            <p className="font-medium">
                              {formatTime(selectedBookingDetails.time)}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-default-500 mb-1">
                              Duration
                            </label>
                            <p className="font-medium">
                              {selectedBookingDetails.duration || "N/A"} min
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Financial Info */}
                    <Card className="border border-divider bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-warning-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              £
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold">Financial</h3>
                        </div>
                      </CardHeader>
                      <CardBody className="pt-0">
                        <div>
                          <label className="block text-sm font-medium text-default-500 mb-1">
                            Amount
                          </label>
                          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-warning-600 dark:text-warning-400">
                            £{selectedBookingDetails.amount.toFixed(2)}
                          </p>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Contact Information */}
                    {(selectedBookingDetails.customer_email ||
                      selectedBookingDetails.customer_phone) && (
                      <Card className="border border-divider">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <Phone className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            <h3 className="text-lg font-semibold">
                              Contact Information
                            </h3>
                          </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                          <div className="space-y-4">
                            {selectedBookingDetails.customer_email && (
                              <div className="flex items-center justify-between p-3 bg-default-50 dark:bg-default-100 rounded-lg border border-divider">
                                <div className="flex items-center gap-3">
                                  <Mail className="w-5 h-5 text-default-500" />
                                  <span className="font-medium">
                                    {selectedBookingDetails.customer_email}
                                  </span>
                                </div>
                                <Button
                                  isIconOnly
                                  as="a"
                                  color="primary"
                                  href={`mailto:${selectedBookingDetails.customer_email}`}
                                  title="Send Email"
                                  variant="light"
                                >
                                  <Mail className="w-5 h-5" />
                                </Button>
                              </div>
                            )}
                            {selectedBookingDetails.customer_phone && (
                              <div className="flex items-center justify-between p-3 bg-default-50 dark:bg-default-100 rounded-lg border border-divider">
                                <div className="flex items-center gap-3">
                                  <Phone className="w-5 h-5 text-default-500" />
                                  <span className="font-medium">
                                    {selectedBookingDetails.customer_phone}
                                  </span>
                                </div>
                                <Button
                                  isIconOnly
                                  as="a"
                                  color="success"
                                  href={`tel:${selectedBookingDetails.customer_phone}`}
                                  title="Call Customer"
                                  variant="light"
                                >
                                  <Phone className="w-5 h-5" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardBody>
                      </Card>
                    )}

                    {/* Address */}
                    {selectedBookingDetails.address && (
                      <Card className="border border-divider">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-danger-600 dark:text-danger-400" />
                            <h3 className="text-lg font-semibold">Address</h3>
                          </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                          <p>{selectedBookingDetails.address}</p>
                        </CardBody>
                      </Card>
                    )}

                    {/* Notes */}
                    {selectedBookingDetails.notes && (
                      <Card className="border border-divider">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <Edit className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                            <h3 className="text-lg font-semibold">Notes</h3>
                          </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                          <p className="bg-default-50 dark:bg-default-100 p-4 rounded-lg border border-divider whitespace-pre-wrap">
                            {selectedBookingDetails.notes}
                          </p>
                        </CardBody>
                      </Card>
                    )}

                    <Divider />

                    {/* Metadata */}
                    <div className="flex justify-between items-center text-sm text-default-500">
                      <span>
                        Created:{" "}
                        {new Date(
                          selectedBookingDetails.created_at,
                        ).toLocaleDateString("en-GB", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>
                        Updated:{" "}
                        {new Date(
                          selectedBookingDetails.updated_at,
                        ).toLocaleDateString("en-GB", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </ModalBody>

              <ModalFooter>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {selectedBookingDetails && (
                      <Button
                        color="warning"
                        variant="flat"
                        onPress={() => {
                          handleOpenStatusModal(selectedBookingDetails);
                        }}
                      >
                        Change Status
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="light" onPress={onClose}>
                      Close
                    </Button>
                    {selectedBookingDetails &&
                      selectedBookingDetails.status !== "cancelled" && (
                        <Button
                          color="primary"
                          onPress={() => {
                            setEditingBooking(selectedBookingDetails);
                            setShowEditModal(true);
                            onClose();
                          }}
                        >
                          Edit Booking
                        </Button>
                      )}
                  </div>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Expanded Day View Modal */}
      {expandedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-[70] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <CalendarIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
                      {new Date(expandedDay).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h2>
                    <p className="text-blue-100 text-lg">
                      {expandedDayBookings.length} booking
                      {expandedDayBookings.length !== 1 ? "s" : ""} scheduled
                    </p>
                  </div>
                </div>
                <button
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                  onClick={handleCloseExpandedDay}
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
              {expandedDayBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Bookings
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    No bookings scheduled for this day.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {expandedDayBookings
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((booking, index) => (
                      <div
                        key={booking.id}
                        className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300"
                      >
                        {/* Header Section - Time, Client Info, Status */}
                        <div className="flex items-center gap-6 mb-6">
                          {/* Time Badge */}
                          <div className="flex-shrink-0">
                            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white px-4 py-3 rounded-xl font-bold text-lg min-w-[80px] text-center">
                              {formatTime(booking.time)}
                            </div>
                          </div>

                          {/* Client & Service Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                              {booking.customer_name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">
                              {booking.service}
                            </p>
                          </div>

                          {/* Status Badges */}
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
                                booking.status === "completed"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                                  : booking.status === "confirmed"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                    : booking.status === "scheduled"
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                      : booking.status === "pending"
                                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                        : "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
                              }`}
                            >
                              {getStatusIcon(booking.status)}
                              {booking.status}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
                                booking.payment_status === "paid"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                                  : booking.payment_status === "pending"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                    : "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
                              }`}
                            >
                              {booking.payment_status === "paid" ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : booking.payment_status === "pending" ? (
                                <Clock className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              {booking.payment_status}
                            </span>
                          </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                          {/* Service Details */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4" />
                              Service
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Clock className="w-4 h-4" />
                                <span>{booking.duration || "N/A"} minutes</span>
                              </div>
                              {booking.address && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <MapPin className="w-4 h-4" />
                                  <span className="truncate">
                                    {booking.address}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Contact Information */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              Contact
                            </h4>
                            <div className="space-y-2">
                              {booking.customer_phone && (
                                <a
                                  className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm"
                                  href={`tel:${booking.customer_phone}`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Phone className="w-4 h-4 text-green-600" />
                                  <span className="text-green-700 dark:text-green-300">
                                    {booking.customer_phone}
                                  </span>
                                </a>
                              )}
                              {booking.customer_email && (
                                <a
                                  className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm"
                                  href={`mailto:${booking.customer_email}`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Mail className="w-4 h-4 text-blue-600" />
                                  <span className="text-blue-700 dark:text-blue-300 truncate">
                                    {booking.customer_email}
                                  </span>
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Payment Information */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide flex items-center gap-2">
                              <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  £
                                </span>
                              </div>
                              Payment
                            </h4>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                              <p
                                className={`text-2xl font-bold ${
                                  booking.payment_status === "paid"
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : booking.payment_status === "pending"
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-rose-600 dark:text-rose-400"
                                }`}
                              >
                                £{booking.amount}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {booking.payment_status === "paid"
                                  ? "Payment completed"
                                  : booking.payment_status === "pending"
                                    ? "Payment pending"
                                    : "Payment issue"}
                              </p>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Quick Actions
                            </h4>
                            <div className="space-y-2">
                              {booking.status !== "completed" && (
                                <button
                                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(booking.id, "completed");
                                  }}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Mark Completed
                                </button>
                              )}
                              {booking.status === "completed" && (
                                <button
                                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(booking.id, "scheduled");
                                  }}
                                >
                                  <Clock className="w-4 h-4" />
                                  Mark Scheduled
                                </button>
                              )}
                              <button
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveBookingClick(booking);
                                }}
                              >
                                <CalendarIcon className="w-4 h-4" />
                                Move Booking
                              </button>
                              <button
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBookingClick(booking);
                                }}
                              >
                                <CalendarIcon className="w-4 h-4" />
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-8 py-4 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click on any booking to view full details
                </p>
                <button
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                  onClick={handleCloseExpandedDay}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CalendarMoveBookingModal
        booking={bookingToMove}
        customTime={customTime}
        formatTime={formatTime}
        isOpen={showMoveModal}
        loadingSlots={loadingSlots}
        minSelectableDate={getCurrentToday()}
        moveAvailableSlots={moveAvailableSlots}
        moveTargetDate={moveTargetDate}
        useCustomTime={useCustomTime}
        onClose={() => setShowMoveModal(false)}
        onCustomTimeChange={setCustomTime}
        onMove={handleMoveBooking}
        onMoveTargetDateChange={setMoveTargetDate}
        onUseCustomTimeChange={setUseCustomTime}
      />

      {/* Edit Booking Modal */}
      <Modal
        isOpen={showEditModal}
        scrollBehavior="inside"
        size="3xl"
        onClose={() => setShowEditModal(false)}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Edit Booking</h2>
                {editingBooking && (
                  <p className="text-sm font-normal text-default-500">
                    Editing: {editingBooking.customer_name} -{" "}
                    {editingBooking.service}
                  </p>
                )}
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              {/* Current Booking Info */}
              {editingBooking && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Current Booking Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Date:
                      </span>
                      <span className="ml-2 font-medium">
                        {new Date(editingBooking.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Time:
                      </span>
                      <span className="ml-2 font-medium">
                        {formatTime(editingBooking.time)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Customer:
                      </span>
                      <span className="ml-2 font-medium">
                        {editingBooking.customer_name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Service:
                      </span>
                      <span className="ml-2 font-medium">
                        {editingBooking.service}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Customer Information */}
                <Card className="border border-divider">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      <h3 className="text-lg font-semibold">
                        Customer Information
                      </h3>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        isRequired
                        label="Customer Name"
                        name="customer_name"
                        placeholder="Enter customer name"
                        value={editFormData.customer_name}
                        onChange={handleEditInputChange}
                      />
                      <Input
                        label="Email"
                        name="customer_email"
                        placeholder="Enter email address"
                        type="email"
                        value={editFormData.customer_email}
                        onChange={handleEditInputChange}
                      />
                      <Input
                        label="Phone"
                        name="customer_phone"
                        placeholder="Enter phone number"
                        type="tel"
                        value={editFormData.customer_phone}
                        onChange={handleEditInputChange}
                      />
                      <Input
                        isRequired
                        label="Service"
                        name="service"
                        placeholder="Enter service name"
                        value={editFormData.service}
                        onChange={handleEditInputChange}
                      />
                    </div>
                  </CardBody>
                </Card>

                {/* Schedule Information */}
                <Card className="border border-divider">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-success-600 dark:text-success-400" />
                      <h3 className="text-lg font-semibold">
                        Schedule Information
                      </h3>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        isRequired
                        label="Date"
                        min={getCurrentToday()}
                        name="date"
                        type="date"
                        value={editFormData.date}
                        onChange={handleEditDateChange}
                      />
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Time *
                        </label>
                        {loadingEditSlots ? (
                          <div className="relative">
                            <Select
                              isDisabled
                              placeholder="Loading available times..."
                            >
                              <SelectItem key="loading">Loading...</SelectItem>
                            </Select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Spinner size="sm" />
                            </div>
                          </div>
                        ) : editAvailableSlots.length > 0 ? (
                          <Select
                            isRequired
                            label="Select Time"
                            name="time"
                            selectedKeys={
                              editFormData.time ? [editFormData.time] : []
                            }
                            onSelectionChange={(keys) => {
                              const selectedTime = Array.from(
                                keys,
                              )[0] as string;

                              setEditFormData((prev) => ({
                                ...prev,
                                time: selectedTime || "",
                              }));
                            }}
                          >
                            {editAvailableSlots.map((timeSlot) => (
                              <SelectItem key={timeSlot}>{timeSlot}</SelectItem>
                            ))}
                          </Select>
                        ) : (
                          <div className="px-3 py-2 border border-divider rounded-lg bg-default-50 text-default-500 text-sm">
                            No available time slots for this date
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-default-500 bg-default-50 dark:bg-default-100 p-2 rounded">
                      💡 Change date to see available time slots for that day.
                      Time will be cleared when date changes.
                    </div>
                  </CardBody>
                </Card>

                {/* Payment & Status */}
                <Card className="border border-divider">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-warning-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">£</span>
                      </div>
                      <h3 className="text-lg font-semibold">
                        Payment & Status
                      </h3>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        isRequired
                        label="Total Amount (£)"
                        min="0"
                        name="amount"
                        placeholder="0.00"
                        step="0.01"
                        type="number"
                        value={editFormData.amount}
                        onChange={(e) => {
                          handleEditInputChange(e);
                          if (editFormData.payment_method === "cash_and_card") {
                            setEditFormData((prev) => ({
                              ...prev,
                              amount: e.target.value,
                              cash_amount: "",
                              card_amount: "",
                            }));
                          }
                        }}
                      />
                      <Select
                        label="Payment Method"
                        selectedKeys={[editFormData.payment_method]}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] as string;

                          setEditFormData((prev) => ({
                            ...prev,
                            payment_method: selected as
                              | "cash"
                              | "card"
                              | "cash_and_card",
                            cash_amount: "",
                            card_amount: "",
                          }));
                        }}
                      >
                        <SelectItem key="card">Card</SelectItem>
                        <SelectItem key="cash">Cash</SelectItem>
                        <SelectItem key="cash_and_card">Cash + Card</SelectItem>
                      </Select>
                    </div>

                    {editFormData.payment_method === "cash_and_card" && (
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Cash Amount (£)"
                          max={editFormData.amount || undefined}
                          min="0"
                          placeholder="0.00"
                          step="0.01"
                          type="number"
                          value={editFormData.cash_amount}
                          onChange={(e) => {
                            const cashVal = e.target.value;
                            const total = parseFloat(editFormData.amount) || 0;
                            const cashNum = parseFloat(cashVal) || 0;
                            const cardNum = Math.max(
                              0,
                              Math.round((total - cashNum) * 100) / 100,
                            );

                            setEditFormData((prev) => ({
                              ...prev,
                              cash_amount: cashVal,
                              card_amount:
                                cashNum > 0 && total > 0
                                  ? cardNum.toFixed(2)
                                  : "",
                            }));
                          }}
                        />
                        <Input
                          label="Card Amount (£)"
                          max={editFormData.amount || undefined}
                          min="0"
                          placeholder="0.00"
                          step="0.01"
                          type="number"
                          value={editFormData.card_amount}
                          onChange={(e) => {
                            const cardVal = e.target.value;
                            const total = parseFloat(editFormData.amount) || 0;
                            const cardNum = parseFloat(cardVal) || 0;
                            const cashNum = Math.max(
                              0,
                              Math.round((total - cardNum) * 100) / 100,
                            );

                            setEditFormData((prev) => ({
                              ...prev,
                              card_amount: cardVal,
                              cash_amount:
                                cardNum > 0 && total > 0
                                  ? cashNum.toFixed(2)
                                  : "",
                            }));
                          }}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-3 bg-default-50 rounded-lg border border-divider">
                      <input
                        checked={editFormData.payment_type === "deposit"}
                        className="w-4 h-4 text-primary rounded border-default-300 focus:ring-primary"
                        id="edit-deposit-toggle"
                        type="checkbox"
                        onChange={(e) => {
                          setEditFormData((prev) => ({
                            ...prev,
                            payment_type: e.target.checked ? "deposit" : "full",
                            deposit_amount: "",
                          }));
                        }}
                      />
                      <label
                        className="text-sm font-medium text-foreground cursor-pointer"
                        htmlFor="edit-deposit-toggle"
                      >
                        Deposit payment (partial payment now, rest later)
                      </label>
                    </div>

                    {editFormData.payment_type === "deposit" && (
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          isRequired
                          label="Deposit Amount (£)"
                          max={editFormData.amount || undefined}
                          min="0"
                          placeholder="0.00"
                          step="0.01"
                          type="number"
                          value={editFormData.deposit_amount}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              deposit_amount: e.target.value,
                            }))
                          }
                        />
                        <div className="flex items-center px-3 text-sm text-default-500">
                          Remaining: £
                          {Math.max(
                            0,
                            (parseFloat(editFormData.amount) || 0) -
                              (parseFloat(editFormData.deposit_amount) || 0),
                          ).toFixed(2)}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        label="Status"
                        selectedKeys={[editFormData.status]}
                        onSelectionChange={(keys) => {
                          const selectedStatus = Array.from(keys)[0] as string;

                          setEditFormData((prev) => ({
                            ...prev,
                            status: selectedStatus || "pending",
                          }));
                        }}
                      >
                        <SelectItem key="pending">Pending</SelectItem>
                        <SelectItem key="scheduled">Scheduled</SelectItem>
                        <SelectItem key="confirmed">Confirmed</SelectItem>
                        <SelectItem key="completed">Completed</SelectItem>
                        <SelectItem key="cancelled">Cancelled</SelectItem>
                      </Select>
                      <Select
                        label="Payment Status"
                        selectedKeys={[editFormData.payment_status]}
                        onSelectionChange={(keys) => {
                          const selectedPaymentStatus = Array.from(
                            keys,
                          )[0] as string;

                          setEditFormData((prev) => ({
                            ...prev,
                            payment_status: selectedPaymentStatus || "pending",
                          }));
                        }}
                      >
                        <SelectItem key="pending">Pending</SelectItem>
                        <SelectItem key="paid">Paid</SelectItem>
                        <SelectItem key="refunded">Refunded</SelectItem>
                      </Select>
                    </div>
                  </CardBody>
                </Card>

                {/* Service Details */}
                <Card className="border border-divider">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                      <h3 className="text-lg font-semibold">Service Details</h3>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0 space-y-4">
                    <Textarea
                      label="Address"
                      name="address"
                      placeholder="Enter service address (optional)"
                      rows={3}
                      value={editFormData.address}
                      onChange={handleEditInputChange}
                    />
                    <Textarea
                      label="Notes"
                      name="notes"
                      placeholder="Enter any additional notes (optional)"
                      rows={3}
                      value={editFormData.notes}
                      onChange={handleEditInputChange}
                    />
                  </CardBody>
                </Card>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button
              color="primary"
              disabled={isSubmittingEdit}
              isLoading={isSubmittingEdit}
              onPress={handleEditSubmit}
            >
              {isSubmittingEdit ? "Updating..." : "Update Booking"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Change Status Modal */}
      <Modal
        backdrop="blur"
        isOpen={isStatusModalOpen}
        onClose={onStatusModalClose}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold">Change Booking Status</h2>
                {selectedBookingDetails && (
                  <p className="text-sm text-default-500">
                    Booking: {selectedBookingDetails.customer_name} -{" "}
                    {selectedBookingDetails.service}
                  </p>
                )}
              </ModalHeader>
              <ModalBody>
                <Select
                  className="w-full"
                  label="Select Status"
                  placeholder="Choose a status"
                  selectedKeys={selectedStatus ? [selectedStatus] : []}
                  onSelectionChange={(keys) => {
                    const newStatus = Array.from(keys)[0] as string;

                    setSelectedStatus(newStatus || "");
                  }}
                >
                  <SelectItem key="pending">Pending</SelectItem>
                  <SelectItem key="scheduled">Scheduled</SelectItem>
                  <SelectItem key="confirmed">Confirmed</SelectItem>
                  <SelectItem key="completed">Completed</SelectItem>
                  <SelectItem key="cancelled">Cancelled</SelectItem>
                </Select>
                {selectedStatus === "cancelled" &&
                  selectedBookingDetails?.status !== "cancelled" && (
                    <div className="mt-2 p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
                      <p className="text-sm text-danger-700 dark:text-danger-300">
                        ⚠️ Warning: Cancelling this booking cannot be undone.
                      </p>
                    </div>
                  )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isDisabled={
                    !selectedStatus ||
                    selectedStatus === selectedBookingDetails?.status
                  }
                  onPress={handleStatusChangeConfirm}
                >
                  OK
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

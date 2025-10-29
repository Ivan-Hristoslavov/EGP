"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, User, Phone, Mail, MapPin, Filter, Search, Edit, Trash2, Eye, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Card, CardBody, CardHeader, Divider, Badge } from "@heroui/react";
import { useToast } from "@/components/Toast";

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
  return today.toISOString().split('T')[0];
};

// Helper function to format time to HH:MM
const formatTime = (timeString: string) => {
  if (!timeString) return 'N/A';
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
    const [hours, minutes] = timeString.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  } catch {
    return timeString;
  }
};

const getCurrentTomorrow = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
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
    return `${start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - Week of ${start.getDate()}-${end.getDate()}`;
  } else {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }
};

const getTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour < 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(time);
    }
  }
  return slots;
};

const isToday = (date: Date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

export default function CalendarPage() {
  const { showSuccess, showError } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(getCurrentToday());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  
  // State for booking details modal
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<Booking | null>(null);
  
  // State for expanded day view
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [expandedDayBookings, setExpandedDayBookings] = useState<Booking[]>([]);
  
  // Move booking modal state (simplified drag and drop)
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [bookingToMove, setBookingToMove] = useState<Booking | null>(null);
  const [moveTargetDate, setMoveTargetDate] = useState<string>('');
  const [moveAvailableSlots, setMoveAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [customTime, setCustomTime] = useState<string>('');
  const [useCustomTime, setUseCustomTime] = useState(false);
  
  // Simple drag state
  const [draggedBooking, setDraggedBooking] = useState<Booking | null>(null);
  
  // Edit modal form state
  const [editFormData, setEditFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    service: '',
    date: '',
    time: '',
    amount: '',
    status: 'pending',
    payment_status: 'pending',
    address: '',
    notes: ''
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editAvailableSlots, setEditAvailableSlots] = useState<string[]>([]);
  const [loadingEditSlots, setLoadingEditSlots] = useState(false);

  // Load bookings on component mount - load all bookings once
  useEffect(() => {
    loadBookings();
  }, []);

  // Fetch time slots when target date changes in move modal
  useEffect(() => {
    if (moveTargetDate) {
      fetchTimeSlotsForDate(moveTargetDate);
    }
  }, [moveTargetDate]);

  // Populate edit form when editing booking
  useEffect(() => {
    if (editingBooking) {
      setEditFormData({
        customer_name: editingBooking.customer_name || '',
        customer_email: editingBooking.customer_email || '',
        customer_phone: editingBooking.customer_phone || '',
        service: editingBooking.service || '',
        date: editingBooking.date || '',
        time: editingBooking.time || '',
        amount: editingBooking.amount?.toString() || '',
        status: editingBooking.status || 'pending',
        payment_status: editingBooking.payment_status || 'pending',
        address: editingBooking.address || '',
        notes: editingBooking.notes || ''
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
      console.error('Error fetching time slots for edit:', error);
      setEditAvailableSlots([]);
    } finally {
      setLoadingEditSlots(false);
    }
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      
      // Load all bookings without filters - we'll filter on the frontend
      const response = await fetch('/api/bookings?page=1&limit=1000', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      } else {
        console.error('Error loading bookings:', response.statusText);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30';
      case 'scheduled':
        return 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30';
      case 'pending':
        return 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30';
      case 'cancelled':
        return 'text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-900/30';
      default:
        return 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'scheduled':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30';
      case 'pending':
        return 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30';
      case 'refunded':
        return 'text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-900/30';
      default:
        return 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800';
    }
  };

  // Get bookings for the selected date in day view
  const getBookingsForSelectedDate = () => {
    return bookings.filter(booking => {
      // Filter by selected date
      const matchesDate = booking.date === selectedDate;
      
      // Apply search filter
      const matchesSearch = !searchTerm || 
        booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.customer_email && booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Apply status filter
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      
      return matchesDate && matchesSearch && matchesStatus;
    });
  };

  const filteredBookings = getBookingsForSelectedDate();

  // Function to handle clicking on a day in the month view
  const handleDayClick = (day: number) => {
    if (day) {
      const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      setSelectedDate(clickedDate.toISOString().split('T')[0]); // Set selectedDate to YYYY-MM-DD
    }
  };

  // Function to handle clicking on an individual booking
  const handleBookingClick = (booking: Booking) => {
    setSelectedBookingDetails(booking);
    setShowBookingDetailsModal(true);
  };

  const handleExpandDay = (date: number, month: number, year: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
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
      console.log('Updating booking:', bookingId, 'to status:', newStatus);
      console.log('Booking ID type:', typeof bookingId);
      console.log('Booking ID length:', bookingId.length);
      
      // Update local state immediately for better UX
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus as any }
          : booking
      ));
      
      // Update expanded day bookings if it's open
      if (expandedDayBookings.length > 0) {
        setExpandedDayBookings(expandedDayBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus as any }
            : booking
        ));
      }
      
      // Update selected booking details if it's open
      if (selectedBookingDetails && selectedBookingDetails.id === bookingId) {
        setSelectedBookingDetails(prev => prev ? { ...prev, status: newStatus as any } : null);
      }
      
      // Update booking status via API
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const result = await response.json();
        console.log('Update successful:', result);
      } else {
        const errorText = await response.text();
        console.error('Update failed - Status:', response.status);
        console.error('Update failed - Response:', errorText);
        
        // Revert the local state change if API call failed
        setBookings(bookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: booking.status } // Keep original status
            : booking
        ));
        
        if (expandedDayBookings.length > 0) {
          setExpandedDayBookings(expandedDayBookings.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: booking.status } // Keep original status
              : booking
          ));
        }
        
        if (selectedBookingDetails && selectedBookingDetails.id === bookingId) {
          setSelectedBookingDetails(prev => prev ? { ...prev, status: prev.status } : null);
        }
        
        alert(`Failed to update booking status. Error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Network error occurred while updating booking status');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBookings(bookings.filter(booking => booking.id !== bookingId));
        setShowDeleteModal(false);
        setBookingToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  // Drag and drop functions
  // Open move modal with selected booking
  const handleMoveBookingClick = (booking: Booking) => {
    setBookingToMove(booking);
    setShowMoveModal(true);
    setMoveTargetDate('');
    setMoveAvailableSlots([]);
    setCustomTime('');
    setUseCustomTime(false);
  };

  // Simple drag handlers
  const handleDragStart = (e: React.DragEvent, booking: Booking) => {
    setDraggedBooking(booking);
    e.dataTransfer.effectAllowed = 'move';
    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Reset visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedBooking(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetDay: number) => {
    e.preventDefault();
    if (!draggedBooking) return;

    // Create target date
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), targetDay);
    const targetDateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;

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
      console.error('Error fetching time slots:', error);
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
      const moveResponse = await fetch(`/api/bookings/${bookingToMove.id}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newDate: moveTargetDate, newTime: finalTime }),
      });

      const moveData = await moveResponse.json();

      if (moveData.success) {
        // Update bookings in state
        setBookings(bookings.map(booking => 
          booking.id === bookingToMove.id 
            ? { ...booking, date: moveTargetDate, time: finalTime }
            : booking
        ));
        
        // Update expanded day bookings if open
        if (expandedDayBookings.length > 0) {
          setExpandedDayBookings(expandedDayBookings.map(booking => 
            booking.id === bookingToMove.id 
              ? { ...booking, date: moveTargetDate, time: finalTime }
              : booking
          ));
        }
        
        const targetDate = new Date(moveTargetDate);
        showSuccess(
          'Booking Moved',
          `Booking moved to ${targetDate.toLocaleDateString()} at ${formatTime(finalTime)}`
        );
        
        // Close modal and reset
        setShowMoveModal(false);
        setBookingToMove(null);
        setMoveTargetDate('');
        setMoveAvailableSlots([]);
        setCustomTime('');
        setUseCustomTime(false);
      } else {
        showError(
          'Move Failed',
          `Failed to move booking: ${moveData.error}`
        );
      }
    } catch (error) {
      console.error('Error moving booking:', error);
      showError(
        'Move Error',
        'Error moving booking'
      );
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async () => {
    if (!editingBooking) return;

    setIsSubmittingEdit(true);

    try {
      const response = await fetch(`/api/bookings?id=${editingBooking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editFormData,
          amount: parseFloat(editFormData.amount)
        }),
      });

      if (response.ok) {
        const updatedBooking = await response.json();
        
        // Update bookings in state
        setBookings(bookings.map(booking => 
          booking.id === editingBooking.id ? updatedBooking : booking
        ));
        
        // Update expanded day bookings if open
        if (expandedDayBookings.length > 0) {
          setExpandedDayBookings(expandedDayBookings.map(booking => 
            booking.id === editingBooking.id ? updatedBooking : booking
          ));
        }
        
        // Update selected booking details if it's open
        if (selectedBookingDetails?.id === editingBooking.id) {
          setSelectedBookingDetails(updatedBooking);
        }
        
        showSuccess('Booking Updated', 'Booking has been successfully updated');
        
        // Close modal and reset
        setShowEditModal(false);
        setEditingBooking(null);
      } else {
        const errorData = await response.json();
        showError('Update Failed', errorData.error || 'Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      showError('Update Error', 'Error updating booking');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handle edit form input changes
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle date change in edit form - fetch new time slots
  const handleEditDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      date: value,
      time: '' // Clear time when date changes
    }));
    
    // Fetch available time slots for the new date
    if (value) {
      fetchEditTimeSlots(value);
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
      if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
      } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const handleTimeSlotClick = (day: Date, timeSlot: string) => {
    const dateStr = day.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setShowAddModal(true);
    // You could also pre-populate the time field in the add modal
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
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    
    // Filter bookings and apply client-side filters
    let filteredBookings = bookings.filter(booking => booking.date === dateStr);
    
    // Apply search filter
    if (searchTerm) {
      filteredBookings = filteredBookings.filter(booking => 
        booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.customer_email && booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filteredBookings = filteredBookings.filter(booking => booking.status === statusFilter);
    }
    
    return filteredBookings;
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
                  <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your appointments and bookings</p>
                  </div>
                      <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Booking
                      </button>
                    </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                      <input
                        type="text"
              placeholder="Search bookings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                    
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          
          <div className="flex gap-2">
                      <button
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded-lg ${
                view === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Month
                      </button>
                      <button
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded-lg ${
                view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Week
                      </button>
                      <button
              onClick={() => setView('day')}
              className={`px-4 py-2 rounded-lg ${
                view === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Day
                    </button>
                    </div>
                  </div>
      </div>

      {/* Calendar View */}
      {view === 'month' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateDate('prev')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Today
              </button>
              <button
                onClick={() => navigateDate('next')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
                </div>
              </div>

              {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                      {day}
                    </div>
                  ))}

                {/* Calendar days */}
            {getDaysInMonth(currentDate).map((day, index) => {
              const dayBookings = day ? getBookingsForDate(day, currentDate.getMonth(), currentDate.getFullYear()) : [];
              const isToday = day && new Date().getDate() === day && 
                             new Date().getMonth() === currentDate.getMonth() && 
                             new Date().getFullYear() === currentDate.getFullYear();
              
              return (
                <div
                      key={index}
                  className={`min-h-[120px] p-2 border-b border-r dark:border-gray-700 transition-colors relative ${
                    isToday ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'
                  } hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer`}
                  onClick={() => day && handleDayClick(day)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => day && handleDrop(e, day)}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-1 ${
                        isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                      }`}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayBookings.slice(0, 3).map(booking => (
                          <div
                            key={booking.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, booking)}
                            onDragEnd={handleDragEnd}
                            className={`text-xs p-1 rounded truncate cursor-move transition-all duration-200 hover:scale-105 ${
                              booking.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                              booking.status === 'scheduled' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                              booking.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                              'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                            } ${draggedBooking?.id === booking.id ? 'opacity-50' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent day click from firing
                              handleBookingClick(booking);
                            }}
                            title={`${formatTime(booking.time)} - ${booking.customer_name} (${booking.service}) - £${booking.amount} - Drag to move`}
                          >
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(booking.time)}
                            </div>
                            <div className="truncate font-medium">{booking.customer_name}</div>
                            <div className="truncate text-xs opacity-75">{booking.service}</div>
                          </div>
                        ))}
                        {dayBookings.length > 3 && (
                          <div 
                            className="text-xs text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors duration-200 py-1 text-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExpandDay(day, currentDate.getMonth(), currentDate.getFullYear());
                            }}
                            title={`Click to see all ${dayBookings.length} bookings for this day`}
                          >
                            +{dayBookings.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {view === 'week' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden">
          {/* Week Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getWeekRange(currentDate)}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateWeek('prev')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                This Week
              </button>
              <button
                onClick={() => navigateWeek('next')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Week Grid */}
          <div className="grid grid-cols-8">
            {/* Time column header */}
            <div className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              Time
            </div>
            
            {/* Day headers */}
            {getWeekDays(currentDate).map(day => (
              <div key={day.toISOString()} className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <div className="font-semibold">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className={`text-xs mt-1 ${
                  isToday(day) ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {day.getDate()}
                </div>
              </div>
            ))}

            {/* Time slots */}
            {getTimeSlots().map(timeSlot => (
              <React.Fragment key={timeSlot}>
                {/* Time label */}
                <div className="p-2 text-xs text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-center">
                  {timeSlot}
                </div>
                
                {/* Day columns */}
                {getWeekDays(currentDate).map(day => {
                  const dayBookings = getBookingsForDate(day.getDate(), day.getMonth(), day.getFullYear())
                    .filter(booking => booking.time === timeSlot);
                  
                  return (
                    <div
                      key={`${day.toISOString()}-${timeSlot}`}
                      className="min-h-[60px] p-1 border-b border-r dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative"
                      onClick={() => handleTimeSlotClick(day, timeSlot)}
                    >
                      {dayBookings.map(booking => (
                        <div
                          key={booking.id}
                          className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded p-1 mb-1 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookingClick(booking);
                          }}
                        >
                          <div className="text-xs font-medium text-blue-900 dark:text-blue-100 truncate">
                            {booking.customer_name}
                          </div>
                          <div className="text-xs text-blue-700 dark:text-blue-300 truncate">
                            {booking.service}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Day View */}
      {view === 'day' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
          <div className="p-4 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                year: 'numeric', 
                    month: 'long', 
                day: 'numeric' 
              })}
            </h2>
          </div>
          
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No bookings for this date</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Create a new booking to get started.</p>
                <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Booking
                </button>
                </div>
          ) : (
            <div className="p-4 space-y-4">
              {filteredBookings.map(booking => (
                <div 
                  key={booking.id} 
                  className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-800 cursor-pointer"
                  onClick={() => handleBookingClick(booking)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-lg font-medium text-gray-900 dark:text-white">{formatTime(booking.time)}</div>
                        <div>
                        <div className="font-medium text-gray-900 dark:text-white">{booking.customer_name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{booking.service}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {booking.customer_phone || 'N/A'}
                            </div>
                      </div>
                          </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </span>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-white">£{booking.amount}</div>
                        {booking.duration && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">{booking.duration}min</div>
                        )}
              </div>
                    </div>
              </div>
                    </div>
                  ))}
                        </div>
                )}
                </div>
      )}

      {/* Booking Details Modal */}
      <Modal 
        isOpen={showBookingDetailsModal} 
        onClose={() => setShowBookingDetailsModal(false)}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          base: "bg-white dark:bg-gray-800",
          header: "border-b border-gray-200 dark:border-gray-700",
          body: "py-6",
          footer: "border-t border-gray-200 dark:border-gray-700"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Booking Details</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedBookingDetails && new Date(selectedBookingDetails.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  {selectedBookingDetails && (
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
                        selectedBookingDetails.status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                        selectedBookingDetails.status === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        selectedBookingDetails.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        selectedBookingDetails.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                        'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
                      }`}>
                        {getStatusIcon(selectedBookingDetails.status)}
                        {selectedBookingDetails.status}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
                        selectedBookingDetails.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                        selectedBookingDetails.payment_status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                        'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
                      }`}>
                        {selectedBookingDetails.payment_status === 'paid' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : selectedBookingDetails.payment_status === 'pending' ? (
                          <Clock className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        Payment: {selectedBookingDetails.payment_status}
                      </span>
                    </div>
                  )}
                </div>
              </ModalHeader>
              
              <ModalBody>
                {selectedBookingDetails && (
                  <div className="space-y-6">
                    {/* Customer & Service Info */}
                    <Card className="bg-gray-50 dark:bg-gray-700/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customer & Service</h3>
                        </div>
                      </CardHeader>
                      <CardBody className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Customer Name</label>
                            <p className="text-gray-900 dark:text-white font-semibold text-lg">{selectedBookingDetails.customer_name}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Service</label>
                            <p className="text-gray-900 dark:text-white font-medium">{selectedBookingDetails.service}</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Date & Time Info */}
                    <Card className="bg-gray-50 dark:bg-gray-700/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule</h3>
                        </div>
                      </CardHeader>
                      <CardBody className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Date</label>
                            <p className="text-gray-900 dark:text-white font-medium">
                              {new Date(selectedBookingDetails.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Time</label>
                            <p className="text-gray-900 dark:text-white font-medium">{formatTime(selectedBookingDetails.time)}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Duration</label>
                            <p className="text-gray-900 dark:text-white font-medium">{selectedBookingDetails.duration || 'N/A'} min</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Financial Info */}
                    <Card className="bg-gray-50 dark:bg-gray-700/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">£</span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Financial</h3>
                        </div>
                      </CardHeader>
                      <CardBody className="pt-0">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Amount</label>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">£{selectedBookingDetails.amount}</p>
                        </div>
                      </CardBody>
                    </Card>


                    {/* Contact Information */}
                    {(selectedBookingDetails.customer_email || selectedBookingDetails.customer_phone) && (
                      <Card className="bg-gray-50 dark:bg-gray-700/50">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <Phone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h3>
                          </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                          <div className="space-y-4">
                            {selectedBookingDetails.customer_email && (
                              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                <div className="flex items-center gap-3">
                                  <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                  <span className="text-gray-900 dark:text-white font-medium">
                                    {selectedBookingDetails.customer_email}
                                  </span>
                                </div>
                                <a 
                                  href={`mailto:${selectedBookingDetails.customer_email}`}
                                  className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-200"
                                  title="Send Email"
                                >
                                  <Mail className="w-5 h-5" />
                                </a>
                              </div>
                            )}
                            {selectedBookingDetails.customer_phone && (
                              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                <div className="flex items-center gap-3">
                                  <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                  <span className="text-gray-900 dark:text-white font-medium">
                                    {selectedBookingDetails.customer_phone}
                                  </span>
                                </div>
                                <a 
                                  href={`tel:${selectedBookingDetails.customer_phone}`}
                                  className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors duration-200"
                                  title="Call Customer"
                                >
                                  <Phone className="w-5 h-5" />
                                </a>
                              </div>
                            )}
                          </div>
                        </CardBody>
                      </Card>
                    )}

                    {/* Address */}
                    {selectedBookingDetails.address && (
                      <Card className="bg-gray-50 dark:bg-gray-700/50">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-red-600 dark:text-red-400" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Address</h3>
                          </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                          <p className="text-gray-900 dark:text-white">{selectedBookingDetails.address}</p>
                        </CardBody>
                      </Card>
                    )}

                    {/* Notes */}
                    {selectedBookingDetails.notes && (
                      <Card className="bg-gray-50 dark:bg-gray-700/50">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <Edit className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notes</h3>
                          </div>
                        </CardHeader>
                        <CardBody className="pt-0">
                          <p className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                            {selectedBookingDetails.notes}
                          </p>
                        </CardBody>
                      </Card>
                    )}

                    <Divider />

                    {/* Metadata */}
                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                      <span>Created: {new Date(selectedBookingDetails.created_at).toLocaleDateString()}</span>
                      <span>Updated: {new Date(selectedBookingDetails.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </ModalBody>
              
              <ModalFooter>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {selectedBookingDetails && selectedBookingDetails.status !== 'completed' && (
                      <Button 
                        color="success" 
                        variant="solid"
                        onPress={() => {
                          // Handle completing the booking
                          handleStatusChange(selectedBookingDetails.id, 'completed');
                          onClose();
                        }}
                        className="font-medium bg-emerald-600 hover:bg-emerald-700 text-white"
                        startContent={<CheckCircle className="w-4 h-4" />}
                      >
                        Mark as Completed
                      </Button>
                    )}
                    {selectedBookingDetails && selectedBookingDetails.status === 'completed' && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-700 dark:text-emerald-300 font-medium">Booking Completed</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      color="primary" 
                      variant="light" 
                      onPress={onClose}
                      className="font-medium"
                    >
                      Close
                    </Button>
                    <Button 
                      color="primary" 
                      onPress={() => {
                        setEditingBooking(selectedBookingDetails);
                        setShowEditModal(true);
                        onClose();
                      }}
                      className="font-medium"
                    >
                      Edit Booking
                    </Button>
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
                    <h2 className="text-3xl font-bold">
                      {new Date(expandedDay).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h2>
                    <p className="text-blue-100 text-lg">
                      {expandedDayBookings.length} booking{expandedDayBookings.length !== 1 ? 's' : ''} scheduled
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseExpandedDay}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
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
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Bookings</h3>
                  <p className="text-gray-600 dark:text-gray-400">No bookings scheduled for this day.</p>
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
                          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
                            booking.status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                            booking.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                            booking.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                            'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
                          }`}>
                            {getStatusIcon(booking.status)}
                            {booking.status}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
                            booking.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                            booking.payment_status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                            'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
                          }`}>
                            {booking.payment_status === 'paid' ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : booking.payment_status === 'pending' ? (
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
                              <span>{booking.duration || 'N/A'} minutes</span>
                            </div>
                            {booking.address && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <MapPin className="w-4 h-4" />
                                <span className="truncate">{booking.address}</span>
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
                                href={`tel:${booking.customer_phone}`}
                                className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Phone className="w-4 h-4 text-green-600" />
                                <span className="text-green-700 dark:text-green-300">{booking.customer_phone}</span>
                              </a>
                            )}
                            {booking.customer_email && (
                              <a 
                                href={`mailto:${booking.customer_email}`}
                                className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Mail className="w-4 h-4 text-blue-600" />
                                <span className="text-blue-700 dark:text-blue-300 truncate">{booking.customer_email}</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Payment Information */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">£</span>
                            </div>
                            Payment
                          </h4>
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                            <p className={`text-2xl font-bold ${
                              booking.payment_status === 'paid' ? 'text-emerald-600 dark:text-emerald-400' :
                              booking.payment_status === 'pending' ? 'text-amber-600 dark:text-amber-400' :
                              'text-rose-600 dark:text-rose-400'
                            }`}>
                              £{booking.amount}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {booking.payment_status === 'paid' ? 'Payment completed' : 
                               booking.payment_status === 'pending' ? 'Payment pending' : 
                               'Payment issue'}
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
                            {booking.status !== 'completed' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(booking.id, 'completed');
                                }}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Mark Completed
                              </button>
                            )}
                            {booking.status === 'completed' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(booking.id, 'scheduled');
                                }}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
                              >
                                <Clock className="w-4 h-4" />
                                Mark Scheduled
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveBookingClick(booking);
                              }}
                              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
                            >
                              <CalendarIcon className="w-4 h-4" />
                              Move Booking
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBookingClick(booking);
                              }}
                              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
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
                  onClick={handleCloseExpandedDay}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Move Booking Modal */}
      <Modal isOpen={showMoveModal} onClose={() => setShowMoveModal(false)} size="2xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Move Booking</span>
            </div>
            {bookingToMove && (
              <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
                Moving: {bookingToMove.customer_name} - {bookingToMove.service}
              </p>
            )}
          </ModalHeader>
          <ModalBody>
            {bookingToMove && (
              <div className="space-y-6">
                {/* Current booking info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Current Booking</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Date:</span>
                      <span className="ml-2 font-medium">{new Date(bookingToMove.date).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Time:</span>
                      <span className="ml-2 font-medium">{formatTime(bookingToMove.time)}</span>
                    </div>
                  </div>
                </div>

                {/* Date picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select New Date
                  </label>
                  <input
                    type="date"
                    value={moveTargetDate}
                    onChange={(e) => setMoveTargetDate(e.target.value)}
                    min={getCurrentToday()}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Time Selection */}
                {moveTargetDate && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Select New Time
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="useCustomTime"
                          checked={useCustomTime}
                          onChange={(e) => setUseCustomTime(e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor="useCustomTime" className="text-sm text-gray-600 dark:text-gray-400">
                          Use custom time
                        </label>
                      </div>
                    </div>

                    {useCustomTime ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Custom Time
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="time"
                            value={customTime}
                            onChange={(e) => setCustomTime(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                          />
                          <button
                            onClick={() => handleMoveBooking()}
                            disabled={!customTime}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                          >
                            Move
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {loadingSlots ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading available slots...</span>
                          </div>
                        ) : moveAvailableSlots.length > 0 ? (
                          <div className="space-y-3">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Available time slots for {new Date(moveTargetDate).toLocaleDateString()}:
                            </div>
                            <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border">
                              {moveAvailableSlots.map((timeSlot) => (
                                <button
                                  key={timeSlot}
                                  onClick={() => handleMoveBooking(timeSlot)}
                                  className="px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors font-medium text-sm border border-green-200 dark:border-green-800"
                                >
                                  {formatTime(timeSlot)}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-lg border">
                            <div className="text-lg mb-2">📅</div>
                            <div className="font-medium">No available time slots</div>
                            <div className="text-sm">for {new Date(moveTargetDate).toLocaleDateString()}</div>
                            <div className="text-xs mt-2 text-gray-400">
                              Try selecting a different date or use custom time
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              color="default" 
              variant="light" 
              onPress={() => setShowMoveModal(false)}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Booking Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} size="2xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Edit Booking</span>
            </div>
            {editingBooking && (
              <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
                Editing: {editingBooking.customer_name} - {editingBooking.service}
              </p>
            )}
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
                      <span className="text-gray-600 dark:text-gray-400">Date:</span>
                      <span className="ml-2 font-medium">{new Date(editingBooking.date).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Time:</span>
                      <span className="ml-2 font-medium">{formatTime(editingBooking.time)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Customer:</span>
                      <span className="ml-2 font-medium">{editingBooking.customer_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Service:</span>
                      <span className="ml-2 font-medium">{editingBooking.service}</span>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        name="customer_name"
                        value={editFormData.customer_name}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="customer_email"
                        value={editFormData.customer_email}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="customer_phone"
                        value={editFormData.customer_phone}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Service *
                      </label>
                      <input
                        type="text"
                        name="service"
                        value={editFormData.service}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Date and Time - Locked */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Schedule Information
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                      Editable
                    </span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date *
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={editFormData.date}
                        onChange={handleEditDateChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Time *
                      </label>
                      {loadingEditSlots ? (
                        <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">Loading available times...</span>
                        </div>
                      ) : editAvailableSlots.length > 0 ? (
                        <select
                          name="time"
                          value={editFormData.time}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        >
                          <option value="">Select available time</option>
                          {editAvailableSlots.map((timeSlot) => (
                            <option key={timeSlot} value={timeSlot}>
                              {formatTime(timeSlot)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                          No available time slots for this date
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                    💡 Change date to see available time slots for that day. Time will be cleared when date changes.
                  </div>
                </div>

                {/* Amount and Status */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Payment & Status
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Amount (£) *
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={editFormData.amount}
                        onChange={handleEditInputChange}
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={editFormData.status}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Payment Status
                      </label>
                      <select
                        name="payment_status"
                        value={editFormData.payment_status}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    Service Details
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={editFormData.address}
                      onChange={handleEditInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter service address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={editFormData.notes}
                      onChange={handleEditInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter any additional notes"
                    />
                  </div>
                </div>
              </form>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              color="default" 
              variant="light" 
              onPress={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleEditSubmit}
              isLoading={isSubmittingEdit}
              disabled={isSubmittingEdit}
            >
              {isSubmittingEdit ? 'Updating...' : 'Update Booking'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

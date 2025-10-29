"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Calendar, Clock, User, Phone, Mail, MapPin, Filter, Search, Edit, Trash2, Eye, CheckCircle, XCircle, AlertCircle } from "lucide-react";

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

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  payment_status: "pending" | "paid" | "refunded";
  amount: number;
  address?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getDate = (daysOffset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

// Empty bookings array - will be populated from database

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    service: '',
    date: '',
    time: '',
    amount: '',
    address: '',
    notes: '',
    status: 'pending',
    payment_status: 'pending'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Customer lookup state
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [customerSearchResults, setCustomerSearchResults] = useState<any[]>([]);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(10);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId) {
        const target = event.target as Element;
        // Don't close if clicking on dropdown content
        if (!target.closest('.dropdown-content')) {
          setOpenDropdownId(null);
        }
      }
      
      // Close customer search dropdown
      if (showCustomerSearch) {
        const target = event.target as Element;
        if (!target.closest('.customer-search-container')) {
          setShowCustomerSearch(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId, showCustomerSearch]);

  const loadBookings = useCallback(async () => {
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
        const allBookings = data.bookings || [];
        
        
        setBookings(allBookings);
        } else {
        console.error('Failed to fetch bookings');
        setBookings([]);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []); // Remove all dependencies since we only load once

  // Load bookings on component mount
  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30';
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

  const getAmountColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-emerald-700 dark:text-emerald-300';
      case 'pending':
        return 'text-amber-700 dark:text-amber-300';
      case 'refunded':
        return 'text-rose-700 dark:text-rose-300';
      default:
        return 'text-slate-600 dark:text-slate-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Client-side filtering
  const allFilteredBookings = bookings.filter(booking => {
    // Search filter
    const matchesSearch = !searchTerm || 
      booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.customer_email && booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    // Date filter
    let matchesDate = true;
    if (dateFilter && dateFilter !== 'all') {
      const today = new Date();
      const bookingDate = new Date(booking.date);
      
      switch (dateFilter) {
        case 'today':
          matchesDate = bookingDate.toDateString() === today.toDateString();
          break;
        case 'tomorrow':
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          matchesDate = bookingDate.toDateString() === tomorrow.toDateString();
          break;
        case 'this_week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          matchesDate = bookingDate >= weekStart && bookingDate <= weekEnd;
          break;
        case 'next_week':
          const nextWeekStart = new Date(today);
          nextWeekStart.setDate(today.getDate() - today.getDay() + 7);
          const nextWeekEnd = new Date(nextWeekStart);
          nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
          matchesDate = bookingDate >= nextWeekStart && bookingDate <= nextWeekEnd;
          break;
        case 'this_month':
          matchesDate = bookingDate.getMonth() === today.getMonth() && 
                       bookingDate.getFullYear() === today.getFullYear();
          break;
        case 'next_month':
          const nextMonth = new Date(today);
          nextMonth.setMonth(today.getMonth() + 1);
          matchesDate = bookingDate.getMonth() === nextMonth.getMonth() && 
                       bookingDate.getFullYear() === nextMonth.getFullYear();
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate pagination for filtered results
  const totalFilteredCount = allFilteredBookings.length;
  const totalFilteredPages = Math.ceil(totalFilteredCount / limit);
  
  // Get current page of filtered results
  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;
  const filteredBookings = allFilteredBookings.slice(startIndex, endIndex);

  // Update pagination state when filters change
  useEffect(() => {
    setTotalCount(totalFilteredCount);
    setTotalPages(totalFilteredPages);
    // Reset to page 1 when filters change
    if (currentPage > totalFilteredPages && totalFilteredPages > 0) {
      setCurrentPage(1);
    }
  }, [totalFilteredCount, totalFilteredPages, currentPage]);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      // Update booking status via API
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state
        setBookings(bookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus as any }
            : booking
        ));
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings?id=${bookingId}`, {
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

  // Phone and Email functions
  const handleCallCustomer = (phoneNumber: string) => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self');
    }
  };

  const handleEmailCustomer = (email: string) => {
    if (email) {
      window.open(`mailto:${email}`, '_self');
    }
  };

  // Customer lookup functions
  const searchCustomers = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setCustomerSearchResults([]);
      return;
    }

    setIsSearchingCustomers(true);
    try {
      const response = await fetch(`/api/customers?search=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        setCustomerSearchResults(data.customers || []);
      }
    } catch (error) {
      console.error('Error searching customers:', error);
      setCustomerSearchResults([]);
    } finally {
      setIsSearchingCustomers(false);
    }
  };

  const handleCustomerSelect = (customer: any) => {
    setFormData(prev => ({
      ...prev,
      customer_name: customer.first_name + ' ' + customer.last_name,
      customer_email: customer.email || '',
      customer_phone: customer.phone || '',
      address: customer.address || ''
    }));
    setShowCustomerSearch(false);
    setCustomerSearchTerm('');
    setCustomerSearchResults([]);
  };

  // Form handling functions
  const resetForm = () => {
    setFormData({
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      service: '',
      date: '',
      time: '',
      amount: '',
      address: '',
      notes: '',
      status: 'pending',
      payment_status: 'pending'
    });
    setFormErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.customer_name.trim()) {
      errors.customer_name = 'Customer name is required';
    }

    if (!formData.service.trim()) {
      errors.service = 'Service is required';
    }

    if (!formData.date) {
      errors.date = 'Date is required';
    }

    if (!formData.time) {
      errors.time = 'Time is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Valid amount is required';
    }

    if (formData.customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      errors.customer_email = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingBooking ? `/api/bookings?id=${editingBooking.id}` : '/api/bookings';
      const method = editingBooking ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Refresh bookings list
        await loadBookings();
        
        // Close modal and reset form
        setShowAddModal(false);
        setShowEditModal(false);
        setEditingBooking(null);
        resetForm();
      } else {
        const errorData = await response.json();
        console.error('Error saving booking:', errorData);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error('Error saving booking:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load form data when editing
  useEffect(() => {
    if (editingBooking) {
      setFormData({
        customer_name: editingBooking.customer_name || '',
        customer_email: editingBooking.customer_email || '',
        customer_phone: editingBooking.customer_phone || '',
        service: editingBooking.service || '',
        date: editingBooking.date || '',
        time: editingBooking.time || '',
        amount: editingBooking.amount?.toString() || '',
        address: editingBooking.address || '',
        notes: editingBooking.notes || '',
        status: editingBooking.status || 'pending',
        payment_status: editingBooking.payment_status || 'pending'
      });
    } else {
      resetForm();
    }
  }, [editingBooking]);

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bookings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage customer appointments and bookings</p>
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
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
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
          
            <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Dates</option>
              <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="this_week">This Week</option>
            <option value="next_week">Next Week</option>
            </select>
          
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No bookings found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by creating your first booking.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Booking
            </button>
        </div>
      ) : (
              <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Customer
                      </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Service
                      </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date & Time
                      </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Payment
                      </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Amount
                      </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex flex-col items-center">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{booking.customer_name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          {booking.customer_email ? (
                            <button
                              onClick={() => handleEmailCustomer(booking.customer_email)}
                              className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              title="Send email"
                            >
                              <Mail className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                {booking.customer_email}
                            </button>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-gray-400" />
                              No email
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          {booking.customer_phone ? (
                            <button
                              onClick={() => handleCallCustomer(booking.customer_phone)}
                              className="flex items-center gap-1 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                  title="Call customer"
                                >
                              <Phone className="w-3 h-3 text-green-600 dark:text-green-400" />
                                  {booking.customer_phone}
                            </button>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-gray-400" />
                              No phone
                            </span>
                            )}
                          </div>
                          </div>
                        </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900 dark:text-white">{booking.service}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center">
                      <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(booking.date).toLocaleDateString()}
                          </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                            {formatTime(booking.time)}
                          </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                        {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.payment_status)}`}>
                            {booking.payment_status}
                          </span>
                        </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <span className={`font-semibold ${getAmountColor(booking.payment_status)}`}>
                          £{booking.amount}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="relative inline-block text-left">
                        <div>
                            <button 
                            type="button"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={() => setOpenDropdownId(openDropdownId === booking.id ? null : booking.id)}
                          >
                            <span className="sr-only">Open options</span>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                  </svg>
                                </button>
                        </div>
                        {openDropdownId === booking.id && (
                          <div className="dropdown-content absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setShowViewModal(true);
                                  setOpenDropdownId(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Eye className="w-4 h-4 mr-3" />
                                View Details
                            </button>
                            <button 
                                onClick={() => {
                                  setEditingBooking(booking);
                                  setShowEditModal(true);
                                  setOpenDropdownId(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Edit className="w-4 h-4 mr-3" />
                                Edit Booking
                            </button>
                              <button
                                onClick={() => {
                                  setBookingToDelete(booking);
                                  setShowDeleteModal(true);
                                  setOpenDropdownId(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Trash2 className="w-4 h-4 mr-3" />
                                Delete Booking
                              </button>
                            </div>
                          </div>
                        )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalCount)} of {totalCount} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded-md text-sm ${
                  currentPage === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {page}
                </button>
            ))}
                  <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              Next
                  </button>
                </div>
                    </div>
                  )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && bookingToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full mr-3">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Booking</h3>
                    </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete the booking for <strong className="text-gray-900 dark:text-white">{bookingToDelete.customer_name}</strong>? 
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setBookingToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteBooking(bookingToDelete.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Booking Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingBooking ? 'Edit Booking' : 'Add New Booking'}
                    </h3>
                    <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setEditingBooking(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="w-6 h-6" />
                    </button>
                  </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {editingBooking ? 'Update the booking details below.' : 'Fill in the booking details below.'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                    <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Customer Name *
                      </label>
                    <div className="relative customer-search-container">
                      <input
                        type="text"
                        id="customer_name"
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={(e) => {
                          handleInputChange(e);
                          setCustomerSearchTerm(e.target.value);
                          if (e.target.value.length > 2) {
                            searchCustomers(e.target.value);
                            setShowCustomerSearch(true);
                          } else {
                            setShowCustomerSearch(false);
                            setCustomerSearchResults([]);
                          }
                        }}
                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          formErrors.customer_name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter customer name or search..."
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomerSearch(!showCustomerSearch);
                          if (!showCustomerSearch && formData.customer_name.length > 2) {
                            searchCustomers(formData.customer_name);
                          }
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Search customers"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                      
                      {/* Customer Search Results */}
                      {showCustomerSearch && (customerSearchResults.length > 0 || isSearchingCustomers) && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {isSearchingCustomers ? (
                            <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                              <span className="ml-2">Searching...</span>
                            </div>
                          ) : customerSearchResults.length > 0 ? (
                            customerSearchResults.map((customer) => (
                              <button
                                key={customer.id}
                                type="button"
                                onClick={() => handleCustomerSelect(customer)}
                                className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                              >
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {customer.first_name} {customer.last_name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {customer.email} • {customer.phone}
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="p-3 text-gray-500 dark:text-gray-400 text-center">
                              No customers found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {formErrors.customer_name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.customer_name}</p>
                    )}
                    </div>

                      <div>
                    <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                      id="customer_email"
                      name="customer_email"
                      value={formData.customer_email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        formErrors.customer_email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter email address"
                    />
                    {formErrors.customer_email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.customer_email}</p>
                    )}
                      </div>

                      <div>
                    <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                      id="customer_phone"
                      name="customer_phone"
                      value={formData.customer_phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter phone number"
                    />
                    </div>

                    <div>
                    <label htmlFor="service" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Service *
                      </label>
                    <input
                      type="text"
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        formErrors.service ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter service name"
                    />
                    {formErrors.service && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.service}</p>
                    )}
                  </div>
                    </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Date *
                        </label>
                        <input
                          type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        formErrors.date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.date && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.date}</p>
                    )}
                      </div>

                      <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Time *
                        </label>
                        <input
                          type="time"
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        formErrors.time ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.time && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.time}</p>
                    )}
                      </div>
                    </div>

                {/* Amount and Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Amount (£) *
                      </label>
                      <input
                        type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                        step="0.01"
                        min="0"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        formErrors.amount ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                    {formErrors.amount && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.amount}</p>
                    )}
                    </div>

                    <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="payment_status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Payment Status
                    </label>
                    <select
                      id="payment_status"
                      name="payment_status"
                      value={formData.payment_status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Address
                      </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter service address"
                      />
                    </div>

                {/* Notes */}
                    <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes
                      </label>
                      <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                        rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter any additional notes"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setEditingBooking(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Saving...' : (editingBooking ? 'Update Booking' : 'Create Booking')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Booking Modal */}
      {showViewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Booking Details</h3>
                    <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedBooking(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer Name</label>
                  <p className="text-gray-900 dark:text-white">{selectedBooking.customer_name}</p>
                    </div>
                      <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <p className="text-gray-900 dark:text-white">{selectedBooking.customer_email}</p>
                      </div>
                      <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                  <p className="text-gray-900 dark:text-white">{selectedBooking.customer_phone}</p>
                      </div>
                    <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Service</label>
                  <p className="text-gray-900 dark:text-white">{selectedBooking.service}</p>
                    </div>
                      <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date & Time</label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(selectedBooking.date).toLocaleDateString()} at {formatTime(selectedBooking.time)}
                  </p>
                      </div>
                      <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                    {getStatusIcon(selectedBooking.status)}
                    {selectedBooking.status}
                  </span>
                      </div>
                    <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Status</label>
                  <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedBooking.payment_status)}`}>
                    {selectedBooking.payment_status}
                  </span>
                    </div>
                    <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                  <p className={`font-semibold ${getAmountColor(selectedBooking.payment_status)}`}>£{selectedBooking.amount}</p>
                    </div>
                {selectedBooking.address && (
                    <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                    <p className="text-gray-900 dark:text-white">{selectedBooking.address}</p>
        </div>
      )}
                {selectedBooking.notes && (
                    <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                    <p className="text-gray-900 dark:text-white">{selectedBooking.notes}</p>
                    </div>
                )}
                  </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedBooking(null);
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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

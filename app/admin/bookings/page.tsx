"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Calendar, Clock, User, Phone, Mail, MapPin, Filter, Search, Edit, Trash2, Eye, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Textarea } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";

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
  payment_type?: "full" | "deposit";
  total_amount?: number;
  amount_paid?: number;
  remaining_amount?: number;
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
    payment_method: 'card' as 'cash' | 'card' | 'cash_and_card',
    cash_amount: '',
    card_amount: '',
    payment_type: 'full' as 'full' | 'deposit',
    deposit_amount: '',
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

  // Services for dropdown (with price for amount prefill)
  const [services, setServices] = useState<{ id: string; name: string; price: number; discounted_price?: number | null }[]>([]);

  // Payments for selected booking (view modal breakdown: cash vs card)
  const [bookingPayments, setBookingPayments] = useState<{ payment_method: string; amount: number }[]>([]);
  
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

  // Load services when add/edit modal is open (for dropdown and price)
  useEffect(() => {
    if (showAddModal || showEditModal) {
      fetch('/api/services')
        .then((res) => res.ok ? res.json() : { services: [] })
        .then((data) => {
          const list = (data.services || []).map((s: { id: string; name: string; price: number; discounted_price?: number | null }) => ({
            id: s.id,
            name: s.name,
            price: typeof s.price === 'number' ? s.price : parseFloat(String(s.price)) || 0,
            discounted_price: s.discounted_price != null ? (typeof s.discounted_price === 'number' ? s.discounted_price : parseFloat(String(s.discounted_price))) : null,
          }));
          setServices(list);
        })
        .catch(() => setServices([]));
    }
  }, [showAddModal, showEditModal]);

  const getStatusColor = (status: string): "success" | "warning" | "danger" | "default" | "primary" => {
    switch (status) {
      case 'completed':
      case 'confirmed':
        return 'success';
      case 'scheduled':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status: string): "success" | "warning" | "danger" | "default" => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'refunded':
        return 'danger';
      default:
        return 'default';
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
      payment_method: 'card',
      cash_amount: '',
      card_amount: '',
      payment_type: 'full',
      deposit_amount: '',
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

    // Validate split amounts for cash+card
    if (formData.payment_method === 'cash_and_card') {
      const total = parseFloat(formData.amount) || 0;
      const cashAmt = parseFloat(formData.cash_amount) || 0;
      const cardAmt = parseFloat(formData.card_amount) || 0;
      if (cashAmt <= 0) {
        errors.cash_amount = 'Cash amount is required';
      }
      if (cardAmt <= 0) {
        errors.card_amount = 'Card amount is required';
      }
      if (cashAmt > 0 && cardAmt > 0 && Math.abs(cashAmt + cardAmt - total) > 0.01) {
        errors.cash_amount = `Cash + Card must equal £${total.toFixed(2)}`;
      }
    }

    if (formData.customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      errors.customer_email = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingBooking ? `/api/bookings?id=${editingBooking.id}` : '/api/bookings';
      const method = editingBooking ? 'PUT' : 'POST';

      const totalAmount = parseFloat(formData.amount) || 0;
      const isDeposit = formData.payment_type === 'deposit';
      const depositAmount = isDeposit ? (parseFloat(formData.deposit_amount) || 0) : totalAmount;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: isDeposit ? depositAmount : totalAmount,
          total_amount: totalAmount,
          amount_paid: depositAmount,
          remaining_amount: isDeposit ? Math.max(0, totalAmount - depositAmount) : 0,
          payment_type: formData.payment_type,
          payment_method: formData.payment_method,
        }),
      });

      if (response.ok) {
        const bookingResult = await response.json();
        const createdBooking = bookingResult.booking;

        // Create payment record(s) only for new bookings (not edits)
        if (!editingBooking && createdBooking) {
          const paymentDate = new Date().toISOString().split('T')[0];
          const paymentStatus = formData.payment_status === 'paid' ? 'paid' : 'pending';

          try {
            if (formData.payment_method === 'cash_and_card') {
              // Create two payment records: one for cash, one for card
              const cashAmt = parseFloat(formData.cash_amount) || 0;
              const cardAmt = parseFloat(formData.card_amount) || 0;

              await Promise.all([
                fetch('/api/payments', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    booking_id: createdBooking.id,
                    customer_id: createdBooking.customer_id || null,
                    amount: cashAmt,
                    payment_method: 'cash',
                    payment_status: paymentStatus,
                    payment_date: paymentDate,
                    notes: `Cash portion of split payment for ${formData.service}`,
                  }),
                }),
                fetch('/api/payments', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    booking_id: createdBooking.id,
                    customer_id: createdBooking.customer_id || null,
                    amount: cardAmt,
                    payment_method: 'card',
                    payment_status: paymentStatus,
                    payment_date: paymentDate,
                    notes: `Card portion of split payment for ${formData.service}`,
                  }),
                }),
              ]);
            } else {
              // Single payment record (cash or card)
              await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  booking_id: createdBooking.id,
                  customer_id: createdBooking.customer_id || null,
                  amount: parseFloat(formData.amount),
                  payment_method: formData.payment_method,
                  payment_status: paymentStatus,
                  payment_date: paymentDate,
                  notes: `Payment for ${formData.service}`,
                }),
              });
            }
          } catch (paymentError) {
            console.error('Error creating payment record:', paymentError);
            // Don't fail booking creation if payment record fails
          }
        }

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
      const eb = editingBooking as any;
      setFormData({
        customer_name: editingBooking.customer_name || '',
        customer_email: editingBooking.customer_email || '',
        customer_phone: editingBooking.customer_phone || '',
        service: editingBooking.service || '',
        date: editingBooking.date || '',
        time: editingBooking.time || '',
        amount: (eb.total_amount ?? editingBooking.amount)?.toString() || '',
        payment_method: eb.payment_method || 'card',
        cash_amount: '',
        card_amount: '',
        payment_type: eb.payment_type || 'full',
        deposit_amount: eb.amount_paid?.toString() || '',
        address: editingBooking.address || '',
        notes: editingBooking.notes || '',
        status: editingBooking.status || 'pending',
        payment_status: editingBooking.payment_status || 'pending'
      });
    } else {
      resetForm();
    }
  }, [editingBooking]);

  // Load payment breakdown (cash / card) when viewing a booking
  useEffect(() => {
    if (!showViewModal || !selectedBooking?.id) {
      setBookingPayments([]);
      return;
    }
    fetch(`/api/payments?booking_id=${selectedBooking.id}`)
      .then((res) => (res.ok ? res.json() : { payments: [] }))
      .then((data) => {
        const list = (data.payments || []).map((p: { payment_method: string; amount: number }) => ({
          payment_method: p.payment_method,
          amount: typeof p.amount === "number" ? p.amount : parseFloat(String(p.amount)) || 0,
        }));
        setBookingPayments(list);
      })
      .catch(() => setBookingPayments([]));
  }, [showViewModal, selectedBooking?.id]);

  if (loading) {
        return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
    </div>
  );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex justify-end items-center">
        <Button
          color="primary"
          startContent={<Plus className="w-4 h-4" />}
          onPress={() => setShowAddModal(true)}
        >
                  New Booking
        </Button>
        </div>

      {/* Filters */}
      <Card className="border border-divider">
        <CardBody className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<Search className="w-4 h-4 text-default-400" />}
              isClearable
            />
            <Select
              label="Status"
              placeholder="All Status"
              selectedKeys={statusFilter !== "all" ? [statusFilter] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setStatusFilter(selected || "all");
              }}
          >
              <SelectItem key="all">All Status</SelectItem>
              <SelectItem key="pending">Pending</SelectItem>
              <SelectItem key="scheduled">Scheduled</SelectItem>
              <SelectItem key="completed">Completed</SelectItem>
              <SelectItem key="cancelled">Cancelled</SelectItem>
            </Select>
            <Select
              label="Date"
              placeholder="All Dates"
              selectedKeys={dateFilter !== "all" ? [dateFilter] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setDateFilter(selected || "all");
              }}
          >
              <SelectItem key="all">All Dates</SelectItem>
              <SelectItem key="today">Today</SelectItem>
              <SelectItem key="tomorrow">Tomorrow</SelectItem>
              <SelectItem key="this_week">This Week</SelectItem>
              <SelectItem key="next_week">Next Week</SelectItem>
            </Select>
            <Button
              variant="bordered"
              startContent={<Filter className="w-4 h-4" />}
            >
            More Filters
            </Button>
        </div>
        </CardBody>
      </Card>

      {/* Bookings Table */}
      <Card className="border border-divider">
        <CardBody className="p-0">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-default-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
              <p className="text-default-500 mb-4">Get started by creating your first booking.</p>
              <Button
                color="primary"
                startContent={<Plus className="w-4 h-4" />}
                onPress={() => setShowAddModal(true)}
            >
              Create Booking
              </Button>
        </div>
      ) : (
              <div className="w-full">
            <table className="w-full table-fixed">
              <thead className="bg-default-100 border-b border-divider">
                <tr>
                  <th className="w-[22%] px-2 py-3 text-center text-xs font-semibold text-default-600 uppercase tracking-wider">Customer</th>
                  <th className="w-[18%] px-2 py-3 text-center text-xs font-semibold text-default-600 uppercase tracking-wider">Service</th>
                  <th className="w-[14%] px-2 py-3 text-center text-xs font-semibold text-default-600 uppercase tracking-wider">Date & Time</th>
                  <th className="w-[12%] px-2 py-3 text-center text-xs font-semibold text-default-600 uppercase tracking-wider">Status</th>
                  <th className="w-[12%] px-2 py-3 text-center text-xs font-semibold text-default-600 uppercase tracking-wider">Payment</th>
                  <th className="w-[12%] px-2 py-3 text-center text-xs font-semibold text-default-600 uppercase tracking-wider">Amount</th>
                  <th className="w-[10%] px-2 py-3 text-center text-xs font-semibold text-default-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-default-50 transition-colors">
                    <td className="px-2 py-3 text-center">
                      <div className="flex flex-col items-center min-w-0">
                        <div className="text-sm font-medium text-foreground truncate w-full">{booking.customer_name}</div>
                        <div className="text-xs text-default-500 truncate w-full text-center">
                          {booking.customer_email ? (
                            <button
                              onClick={() => handleEmailCustomer(booking.customer_email)}
                              className="inline-flex items-center gap-1 hover:text-primary transition-colors max-w-full"
                              title={booking.customer_email}
                            >
                              <Mail className="w-3 h-3 flex-shrink-0 text-primary" />
                              <span className="truncate">{booking.customer_email}</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-default-400">
                              <Mail className="w-3 h-3 flex-shrink-0" /> N/A
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-default-500 truncate w-full text-center">
                          {booking.customer_phone ? (
                            <button
                              onClick={() => handleCallCustomer(booking.customer_phone)}
                              className="inline-flex items-center gap-1 hover:text-success transition-colors max-w-full"
                              title={booking.customer_phone}
                            >
                              <Phone className="w-3 h-3 flex-shrink-0 text-success" />
                              <span className="truncate">{booking.customer_phone}</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-default-400">
                              <Phone className="w-3 h-3 flex-shrink-0" /> N/A
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <div className="text-sm text-foreground truncate cursor-help" title={booking.service}>
                        {booking.service}
                      </div>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <div className="text-sm text-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span className="whitespace-nowrap">{new Date(booking.date).toLocaleDateString()}</span>
                        </div>
                        <div className="text-xs text-default-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          {formatTime(booking.time)}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <Chip
                        color={getStatusColor(booking.status)}
                        variant="flat"
                        startContent={getStatusIcon(booking.status)}
                        size="sm"
                      >
                        {booking.status}
                      </Chip>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <Chip
                        color={getPaymentStatusColor(booking.payment_status)}
                        variant="flat"
                        size="sm"
                      >
                        {booking.payment_status}
                      </Chip>
                    </td>
                    <td className="px-2 py-3 text-center text-sm">
                      <span className={`font-semibold ${
                        booking.payment_status === 'paid' ? 'text-success' :
                        booking.payment_status === 'pending' ? 'text-warning' :
                        'text-danger'
                      }`}>
                        {booking.payment_type === 'deposit' && (booking.amount_paid != null || booking.remaining_amount != null) ? (
                          <>£{(booking.amount_paid ?? booking.amount).toFixed(2)}<br/><span className="text-xs font-normal">£{(booking.remaining_amount ?? 0).toFixed(2)} due</span></>
                        ) : (
                          <>£{booking.amount}</>
                        )}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly variant="light" size="sm">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Booking actions">
                          <DropdownItem
                            key="view"
                            startContent={<Eye className="w-4 h-4" />}
                            onPress={() => {
                              setSelectedBooking(booking);
                              setShowViewModal(true);
                            }}
                          >
                            View Details
                          </DropdownItem>
                          <DropdownItem
                            key="edit"
                            startContent={<Edit className="w-4 h-4" />}
                            onPress={() => {
                              setEditingBooking(booking);
                              setShowEditModal(true);
                            }}
                          >
                            Edit Booking
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            color="danger"
                            startContent={<Trash2 className="w-4 h-4" />}
                            onPress={() => {
                              setBookingToDelete(booking);
                              setShowDeleteModal(true);
                            }}
                          >
                            Delete Booking
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </CardBody>
      </Card>

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
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
                    setShowDeleteModal(false);
                    setBookingToDelete(null);
                  }}
        size="md"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-3">
                <div className="p-2 bg-danger-100 dark:bg-danger-900/30 rounded-full">
                  <Trash2 className="w-6 h-6 text-danger-600 dark:text-danger-400" />
                </div>
                <h3 className="text-lg font-semibold">Delete Booking</h3>
              </ModalHeader>
              <ModalBody>
                <p className="text-default-600">
                  Are you sure you want to delete the booking for <strong>{bookingToDelete?.customer_name}</strong>? 
                  This action cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={() => {
                    if (bookingToDelete) {
                      handleDeleteBooking(bookingToDelete.id);
                      onClose();
                    }
                  }}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Add/Edit Booking Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setEditingBooking(null);
          resetForm();
        }}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-xl font-bold">
                  {editingBooking ? 'Edit Booking' : 'Add New Booking'}
                </h3>
              </ModalHeader>
              <ModalBody>
                <form onSubmit={handleSubmit} className="space-y-4">
                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 relative customer-search-container">
                    <Input
                      name="customer_name"
                      label="Customer Name"
                      placeholder="Enter customer name or search..."
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
                      isRequired
                      isClearable
                      errorMessage={formErrors.customer_name}
                      isInvalid={!!formErrors.customer_name}
                      startContent={<Search className="w-4 h-4 text-default-400" />}
                    />
                      {/* Customer Search Results */}
                      {showCustomerSearch && (customerSearchResults.length > 0 || isSearchingCustomers) && (
                      <Card className="absolute z-[9999] w-full mt-1 max-h-60 overflow-y-auto shadow-lg border border-default-200 bg-content1">
                        <CardBody className="p-0 bg-content1">
                          {isSearchingCustomers ? (
                            <div className="p-3 text-center">
                              <Spinner size="sm" />
                              <span className="ml-2 text-sm">Searching...</span>
                            </div>
                          ) : customerSearchResults.length > 0 ? (
                            customerSearchResults.map((customer) => (
                              <Button
                                key={customer.id}
                                variant="light"
                                className="w-full justify-start"
                                onPress={() => handleCustomerSelect(customer)}
                              >
                                <div className="text-left">
                                  <div className="font-medium">
                                  {customer.first_name} {customer.last_name}
                                </div>
                                  <div className="text-xs text-default-500">
                                  {customer.email} • {customer.phone}
                                </div>
                                </div>
                              </Button>
                            ))
                          ) : (
                            <div className="p-3 text-center text-default-500 text-sm">
                              No customers found
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    )}
                    </div>

                  <Input
                      name="customer_email"
                          type="email"
                    label="Email"
                    placeholder="customer@email.com"
                      value={formData.customer_email}
                      onChange={handleInputChange}
                    isClearable
                    errorMessage={formErrors.customer_email}
                    isInvalid={!!formErrors.customer_email}
                  />

                  <Input
                      name="customer_phone"
                          type="tel"
                    label="Phone"
                    placeholder="07944 24 20 79"
                      value={formData.customer_phone}
                      onChange={handleInputChange}
                    isClearable
                  />

                  <Select
                    name="service"
                    label="Service"
                    placeholder="Select a service"
                    selectedKeys={formData.service ? [formData.service] : []}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      if (!selected) {
                        setFormData((prev) => ({ ...prev, service: '', amount: '' }));
                        return;
                      }
                      const svc = services.find((s) => s.name === selected);
                      const displayAmount = svc
                        ? (svc.discounted_price != null && svc.discounted_price > 0 ? svc.discounted_price : svc.price).toFixed(2)
                        : '';
                      setFormData((prev) => ({
                        ...prev,
                        service: selected,
                        amount: displayAmount,
                      }));
                    }}
                    isRequired
                    errorMessage={formErrors.service}
                    isInvalid={!!formErrors.service}
                  >
                    <>
                      {services.map((svc) => (
                        <SelectItem key={svc.name} textValue={svc.name}>
                          {svc.name} — £{(svc.discounted_price != null && svc.discounted_price > 0 ? svc.discounted_price : svc.price).toFixed(2)}
                        </SelectItem>
                      ))}
                    </>
                  </Select>
                    </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                      name="date"
                          type="date"
                    label="Date"
                      value={formData.date}
                      onChange={handleInputChange}
                    isRequired
                    errorMessage={formErrors.date}
                    isInvalid={!!formErrors.date}
                  />

                  <Input
                      name="time"
                          type="time"
                    label="Time"
                      value={formData.time}
                      onChange={handleInputChange}
                    isRequired
                    errorMessage={formErrors.time}
                    isInvalid={!!formErrors.time}
                  />
                    </div>

                {/* Amount, Payment Method and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                      name="amount"
                        type="number"
                    label="Amount (£)"
                    placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => {
                        handleInputChange(e);
                        // If cash+card, reset split when total changes
                        if (formData.payment_method === 'cash_and_card') {
                          setFormData((prev) => ({ ...prev, amount: e.target.value, cash_amount: '', card_amount: '' }));
                        }
                      }}
                        step="0.01"
                        min="0"
                    isRequired
                    errorMessage={formErrors.amount}
                    isInvalid={!!formErrors.amount}
                  />

                  <Select
                    label="Payment Method"
                    selectedKeys={[formData.payment_method]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setFormData((prev) => ({
                        ...prev,
                        payment_method: selected as 'cash' | 'card' | 'cash_and_card',
                        cash_amount: '',
                        card_amount: '',
                      }));
                    }}
                  >
                    <>
                      <SelectItem key="card">Card</SelectItem>
                      <SelectItem key="cash">Cash</SelectItem>
                      <SelectItem key="cash_and_card">Cash + Card</SelectItem>
                    </>
                  </Select>
                </div>

                {/* Split amounts for Cash + Card */}
                {formData.payment_method === 'cash_and_card' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      name="cash_amount"
                      type="number"
                      label="Cash Amount (£)"
                      placeholder="0.00"
                      value={formData.cash_amount}
                      onChange={(e) => {
                        const cashVal = e.target.value;
                        const total = parseFloat(formData.amount) || 0;
                        const cashNum = parseFloat(cashVal) || 0;
                        const cardNum = Math.max(0, Math.round((total - cashNum) * 100) / 100);
                        setFormData((prev) => ({
                          ...prev,
                          cash_amount: cashVal,
                          card_amount: cashNum > 0 && total > 0 ? cardNum.toFixed(2) : '',
                        }));
                      }}
                      step="0.01"
                      min="0"
                      max={formData.amount || undefined}
                      isRequired
                      errorMessage={formErrors.cash_amount}
                      isInvalid={!!formErrors.cash_amount}
                    />
                    <Input
                      name="card_amount"
                      type="number"
                      label="Card Amount (£)"
                      placeholder="0.00"
                      value={formData.card_amount}
                      onChange={(e) => {
                        const cardVal = e.target.value;
                        const total = parseFloat(formData.amount) || 0;
                        const cardNum = parseFloat(cardVal) || 0;
                        const cashNum = Math.max(0, Math.round((total - cardNum) * 100) / 100);
                        setFormData((prev) => ({
                          ...prev,
                          card_amount: cardVal,
                          cash_amount: cardNum > 0 && total > 0 ? cashNum.toFixed(2) : '',
                        }));
                      }}
                      step="0.01"
                      min="0"
                      max={formData.amount || undefined}
                      isRequired
                      errorMessage={formErrors.card_amount}
                      isInvalid={!!formErrors.card_amount}
                    />
                  </div>
                )}

                {/* Deposit toggle */}
                <div className="flex items-center gap-3 p-3 bg-default-50 rounded-lg border border-divider">
                  <input
                    type="checkbox"
                    id="booking-deposit-toggle"
                    checked={formData.payment_type === 'deposit'}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        payment_type: e.target.checked ? 'deposit' : 'full',
                        deposit_amount: '',
                      }));
                    }}
                    className="w-4 h-4 text-primary rounded border-default-300 focus:ring-primary"
                  />
                  <label htmlFor="booking-deposit-toggle" className="text-sm font-medium text-foreground cursor-pointer">
                    Deposit payment (partial payment now, rest later)
                  </label>
                </div>

                {formData.payment_type === 'deposit' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Deposit Amount (£)"
                      type="number"
                      value={formData.deposit_amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, deposit_amount: e.target.value }))}
                      step="0.01" min="0" max={formData.amount || undefined}
                      placeholder="0.00"
                      isRequired
                    />
                    <div className="flex items-center px-3 text-sm text-default-500">
                      Remaining: £{(Math.max(0, (parseFloat(formData.amount) || 0) - (parseFloat(formData.deposit_amount) || 0))).toFixed(2)}
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Status"
                    selectedKeys={[formData.status]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      handleInputChange({ target: { name: 'status', value: selected } } as any);
                    }}
                    >
                    <>
                      <SelectItem key="pending">Pending</SelectItem>
                      <SelectItem key="scheduled">Scheduled</SelectItem>
                      <SelectItem key="completed">Completed</SelectItem>
                      <SelectItem key="cancelled">Cancelled</SelectItem>
                    </>
                  </Select>

                  <Select
                    label="Payment Status"
                    selectedKeys={[formData.payment_status]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      handleInputChange({ target: { name: 'payment_status', value: selected } } as any);
                    }}
                    >
                    <>
                      <SelectItem key="pending">Pending</SelectItem>
                      <SelectItem key="paid">Paid</SelectItem>
                      <SelectItem key="refunded">Refunded</SelectItem>
                    </>
                  </Select>
                </div>

                {/* Address */}
                <Textarea
                  name="address"
                  label="Address"
                  placeholder="Enter service address"
                    value={formData.address}
                    onChange={handleInputChange}
                  minRows={3}
                      />

                {/* Notes */}
                <Textarea
                  name="notes"
                  label="Notes"
                  placeholder="Enter any additional notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                  minRows={3}
                />
              </form>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="light"
                  onPress={() => {
                    onClose();
                      resetForm();
                    }}
                  >
                    Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    handleSubmit();
                  }}
                  isLoading={isSubmitting}
                >
                  {editingBooking ? 'Update Booking' : 'Create Booking'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* View Booking Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
                    setShowViewModal(false);
                    setSelectedBooking(null);
                  }}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-xl font-bold">Booking Details</h3>
              </ModalHeader>
              <ModalBody>
                {selectedBooking && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-default-500">Customer Name</label>
                      <p className="text-base font-semibold">{selectedBooking.customer_name}</p>
                    </div>
                      <div>
                      <label className="text-sm font-medium text-default-500">Email</label>
                      <p className="text-base">{selectedBooking.customer_email || 'N/A'}</p>
                      </div>
                      <div>
                      <label className="text-sm font-medium text-default-500">Phone</label>
                      <p className="text-base">{selectedBooking.customer_phone || 'N/A'}</p>
                      </div>
                    <div>
                      <label className="text-sm font-medium text-default-500">Service</label>
                      <p className="text-base font-semibold">{selectedBooking.service}</p>
                    </div>
                      <div>
                      <label className="text-sm font-medium text-default-500">Date & Time</label>
                      <p className="text-base">
                    {new Date(selectedBooking.date).toLocaleDateString()} at {formatTime(selectedBooking.time)}
                  </p>
                      </div>
                      <div>
                      <label className="text-sm font-medium text-default-500 mb-2 block">Status</label>
                      <Chip
                        color={getStatusColor(selectedBooking.status)}
                        variant="flat"
                        startContent={getStatusIcon(selectedBooking.status)}
                      >
                    {selectedBooking.status}
                      </Chip>
                      </div>
                    <div>
                      <label className="text-sm font-medium text-default-500 mb-2 block">Payment Status</label>
                      <Chip
                        color={getPaymentStatusColor(selectedBooking.payment_status)}
                        variant="flat"
                      >
                    {selectedBooking.payment_status}
                      </Chip>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-default-500 mb-2 block">Amount</label>
                      {selectedBooking.payment_type === 'deposit' && (selectedBooking.amount_paid != null || selectedBooking.remaining_amount != null) ? (
                        <div className="space-y-1">
                          <p className={`text-xl font-bold ${
                            selectedBooking.payment_status === 'paid' ? 'text-success' :
                            selectedBooking.payment_status === 'pending' ? 'text-warning' :
                            'text-danger'
                          }`}>
                            £{(selectedBooking.amount_paid ?? selectedBooking.amount).toFixed(2)} deposit paid
                          </p>
                          <p className="text-base text-default-600">£{(selectedBooking.remaining_amount ?? 0).toFixed(2)} due on arrival</p>
                        </div>
                      ) : (
                        <>
                          <p className={`text-2xl font-bold ${
                            selectedBooking.payment_status === 'paid' ? 'text-success' :
                            selectedBooking.payment_status === 'pending' ? 'text-warning' :
                            'text-danger'
                          }`}>
                            £{typeof selectedBooking.amount === 'number' ? selectedBooking.amount.toFixed(2) : selectedBooking.amount}
                          </p>
                          {bookingPayments.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-3 text-sm text-default-600">
                              {bookingPayments.some((p) => p.payment_method === 'cash') && (
                                <span>Cash: £{bookingPayments.filter((p) => p.payment_method === 'cash').reduce((s, p) => s + p.amount, 0).toFixed(2)}</span>
                              )}
                              {bookingPayments.some((p) => p.payment_method === 'card') && (
                                <span>Card: £{bookingPayments.filter((p) => p.payment_method === 'card').reduce((s, p) => s + p.amount, 0).toFixed(2)}</span>
                              )}
                              {bookingPayments.filter((p) => p.payment_method !== 'cash' && p.payment_method !== 'card').length > 0 &&
                                bookingPayments
                                  .filter((p) => p.payment_method !== 'cash' && p.payment_method !== 'card')
                                  .map((p) => (
                                    <span key={p.payment_method}>{p.payment_method.replace('_', ' ')}: £{p.amount.toFixed(2)}</span>
                                  ))
                              }
                            </div>
                          )}
                        </>
                      )}
                    </div>
                {selectedBooking.address && (
                    <div>
                        <label className="text-sm font-medium text-default-500">Address</label>
                        <p className="text-base">{selectedBooking.address}</p>
        </div>
      )}
                {selectedBooking.notes && (
                    <div>
                        <label className="text-sm font-medium text-default-500">Notes</label>
                        <p className="text-base">{selectedBooking.notes}</p>
                    </div>
                )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
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
              <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-default-100 border-b border-divider">
                    <tr>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-default-600 uppercase tracking-wider">
                        Customer
                      </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-default-600 uppercase tracking-wider">
                        Service
                      </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-default-600 uppercase tracking-wider">
                        Date & Time
                      </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-default-600 uppercase tracking-wider">
                        Status
                      </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-default-600 uppercase tracking-wider">
                        Payment
                      </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-default-600 uppercase tracking-wider">
                        Amount
                      </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-default-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
              <tbody className="divide-y divide-divider">
                    {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-default-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex flex-col items-center">
                        <div className="text-sm font-medium text-foreground">{booking.customer_name}</div>
                        <div className="text-sm text-default-500 flex items-center gap-1">
                          {booking.customer_email ? (
                            <button
                              onClick={() => handleEmailCustomer(booking.customer_email)}
                              className="flex items-center gap-1 hover:text-primary transition-colors"
                              title="Send email"
                            >
                              <Mail className="w-3 h-3 text-primary" />
                                {booking.customer_email}
                            </button>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-default-400" />
                              No email
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-default-500 flex items-center gap-1">
                          {booking.customer_phone ? (
                            <button
                              onClick={() => handleCallCustomer(booking.customer_phone)}
                              className="flex items-center gap-1 hover:text-success transition-colors"
                                  title="Call customer"
                                >
                              <Phone className="w-3 h-3 text-success" />
                                  {booking.customer_phone}
                            </button>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-default-400" />
                              No phone
                            </span>
                            )}
                          </div>
                          </div>
                        </td>
                    <td className="px-6 py-4 text-center">
                      <div 
                        className="text-sm text-foreground max-w-xs mx-auto truncate cursor-help" 
                        title={booking.service}
                      >
                        {booking.service}
                      </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center">
                      <div className="text-sm text-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(booking.date).toLocaleDateString()}
                          </div>
                      <div className="text-sm text-default-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                            {formatTime(booking.time)}
                          </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Chip
                            color={getStatusColor(booking.status)}
                            variant="flat"
                            startContent={getStatusIcon(booking.status)}
                            size="sm"
                          >
                        {booking.status}
                          </Chip>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Chip
                            color={getPaymentStatusColor(booking.payment_status)}
                            variant="flat"
                            size="sm"
                          >
                            {booking.payment_status}
                          </Chip>
                        </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <span className={`font-semibold ${
                            booking.payment_status === 'paid' ? 'text-success' :
                            booking.payment_status === 'pending' ? 'text-warning' :
                            'text-danger'
                          }`}>
                          £{booking.amount}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <Dropdown>
                            <DropdownTrigger>
                              <Button
                                isIconOnly
                                variant="light"
                                size="sm"
                              >
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
                      <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto">
                        <CardBody className="p-0">
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
                          type="tel"
                    label="Phone"
                    placeholder="+44 7700 900123"
                      value={formData.customer_phone}
                      onChange={handleInputChange}
                    isClearable
                  />

                  <Input
                    label="Service"
                    placeholder="Enter service name"
                      value={formData.service}
                      onChange={handleInputChange}
                    isRequired
                    isClearable
                    errorMessage={formErrors.service}
                    isInvalid={!!formErrors.service}
                  />
                    </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                          type="date"
                    label="Date"
                      value={formData.date}
                      onChange={handleInputChange}
                    isRequired
                    errorMessage={formErrors.date}
                    isInvalid={!!formErrors.date}
                  />

                  <Input
                          type="time"
                    label="Time"
                      value={formData.time}
                      onChange={handleInputChange}
                    isRequired
                    errorMessage={formErrors.time}
                    isInvalid={!!formErrors.time}
                  />
                    </div>

                {/* Amount and Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                        type="number"
                    label="Amount (£)"
                    placeholder="0.00"
                      value={formData.amount}
                      onChange={handleInputChange}
                        step="0.01"
                        min="0"
                    isRequired
                    errorMessage={formErrors.amount}
                    isInvalid={!!formErrors.amount}
                  />

                  <Select
                    label="Status"
                    selectedKeys={[formData.status]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      handleInputChange({ target: { name: 'status', value: selected } } as any);
                    }}
                    >
                    <SelectItem key="pending">Pending</SelectItem>
                    <SelectItem key="scheduled">Scheduled</SelectItem>
                    <SelectItem key="completed">Completed</SelectItem>
                    <SelectItem key="cancelled">Cancelled</SelectItem>
                  </Select>

                  <Select
                    label="Payment Status"
                    selectedKeys={[formData.payment_status]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      handleInputChange({ target: { name: 'payment_status', value: selected } } as any);
                    }}
                    >
                    <SelectItem key="pending">Pending</SelectItem>
                    <SelectItem key="paid">Paid</SelectItem>
                    <SelectItem key="refunded">Refunded</SelectItem>
                  </Select>
                </div>

                {/* Address */}
                <Textarea
                  label="Address"
                  placeholder="Enter service address"
                    value={formData.address}
                    onChange={handleInputChange}
                  minRows={3}
                      />

                {/* Notes */}
                <Textarea
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
                      <label className="text-sm font-medium text-default-500">Amount</label>
                      <p className={`text-2xl font-bold ${
                        selectedBooking.payment_status === 'paid' ? 'text-success' :
                        selectedBooking.payment_status === 'pending' ? 'text-warning' :
                        'text-danger'
                      }`}>
                        £{selectedBooking.amount}
                      </p>
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

"use client";

import { useState, useEffect } from "react";
import { Plus, Filter, Search, Edit, Trash2, Eye, CheckCircle, XCircle, AlertCircle, Calendar, User, CreditCard, Banknote, Building2 } from "lucide-react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Spinner } from "@heroui/spinner";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";

interface Payment {
  id: string;
  booking_id: string | null;
  customer_id: string | null;
  amount: number;
  payment_method: "cash" | "card" | "bank_transfer" | "cheque";
  payment_status: "pending" | "paid" | "refunded" | "failed";
  payment_date: string;
  reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customers?: {
    name: string;
    email: string;
  };
  bookings?: {
    service: string;
    date: string;
    customer_name: string;
    booking_number: string | null;
  };
}

const getDate = (daysOffset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

const DUMMY_SERVICES = [
  "Baby Botox",
  "Lip Enhancement",
  "Profhilo Treatment",
  "Anti-wrinkle Treatment",
  "Skin Consultation",
  "Fat Freezing",
  "Dermal Fillers",
  "Skin Rejuvenation",
  "Laser Hair Removal",
  "Chemical Peel",
  "Microneedling",
  "Hydrafacial",
  "Botox Treatment",
  "Deep Cleansing Facial",
  "Brightening Treatment",
  "Detox Treatment"
];

// Empty payments array - will be populated from database
const DUMMY_PAYMENTS: Payment[] = [];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(10);

  // Debounce search term to avoid blinking (only for UI filtering, not API calls)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load payments on component mount or when filters change (but NOT on search - that's client-side only)
  useEffect(() => {
    loadPayments();
  }, [currentPage, statusFilter, methodFilter, dateFilter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      
      // Fetch payments from API with pagination
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });
      
      const response = await fetch(`/api/payments?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const fetchedPayments = data.payments || [];
        
        console.log('Payments loaded:', fetchedPayments.length, fetchedPayments);
        
        setPayments(fetchedPayments);
        setTotalCount(data.pagination?.totalCount || fetchedPayments.length);
        setTotalPages(data.pagination?.totalPages || Math.ceil(fetchedPayments.length / limit));
      } else {
        const errorText = await response.text();
        console.error('Error loading payments:', response.status, errorText);
        setPayments([]);
        setTotalCount(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      // Fallback to dummy data
      setPayments(DUMMY_PAYMENTS);
      setTotalCount(DUMMY_PAYMENTS.length);
      setTotalPages(Math.ceil(DUMMY_PAYMENTS.length / limit));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): "success" | "warning" | "danger" | "default" => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'refunded':
      case 'failed':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'refunded':
        return <XCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="w-4 h-4" />;
      case 'bank_transfer':
        return <Building2 className="w-4 h-4" />;
      case 'cash':
        return <Banknote className="w-4 h-4" />;
      case 'cheque':
        return <CreditCard className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const customerName = payment.customers?.name || payment.bookings?.customer_name || 'Unknown Customer';
    const customerEmail = payment.customers?.email || '';
    const serviceName = payment.bookings?.service || 'Manual Payment';
    
    const matchesSearch = customerName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                         serviceName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                         payment.reference?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                         customerEmail.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                         payment.bookings?.booking_number?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.payment_status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.payment_method === methodFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const paymentDate = new Date(payment.payment_date);
      const today = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = paymentDate.toDateString() === today.toDateString();
          break;
        case 'this_week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          matchesDate = paymentDate >= weekStart && paymentDate <= weekEnd;
          break;
        case 'this_month':
          matchesDate = paymentDate.getMonth() === today.getMonth() && 
                       paymentDate.getFullYear() === today.getFullYear();
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesMethod && matchesDate;
  });

  const handleStatusChange = async (paymentId: string, newStatus: string) => {
    try {
      // Update payment status via API
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payment_status: newStatus }),
      });

      if (response.ok) {
        // Update local state
        setPayments(payments.map(payment => 
          payment.id === paymentId 
            ? { ...payment, payment_status: newStatus as any }
            : payment
        ));
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPayments(payments.filter(payment => payment.id !== paymentId));
        setShowDeleteModal(false);
        setPaymentToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  const getTotalAmount = () => {
    return filteredPayments.reduce((total, payment) => {
      if (payment.payment_status === 'paid') {
        return total + payment.amount;
      }
      return total;
    }, 0);
  };

  const getPendingAmount = () => {
    return filteredPayments.reduce((total, payment) => {
      if (payment.payment_status === 'pending') {
        return total + payment.amount;
      }
      return total;
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-divider">
          <CardBody className="p-6">
          <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-default-500">Total Received</p>
                <p className="text-2xl font-bold text-success">£{getTotalAmount().toFixed(2)}</p>
              </div>
              <div className="p-3 bg-success-100 dark:bg-success-900/20 rounded-full">
                <CheckCircle className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="border border-divider">
          <CardBody className="p-6">
          <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-default-500">Pending Payments</p>
                <p className="text-2xl font-bold text-warning">£{getPendingAmount().toFixed(2)}</p>
              </div>
              <div className="p-3 bg-warning-100 dark:bg-warning-900/20 rounded-full">
                <AlertCircle className="w-6 h-6 text-warning-600 dark:text-warning-400" />
            </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="border border-divider">
          <CardBody className="p-6">
          <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-default-500">Total Transactions</p>
                <p className="text-2xl font-bold text-primary">{filteredPayments.length}</p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-full">
                <CreditCard className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border border-divider">
        <CardBody className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              type="text"
              placeholder="Search payments..."
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
              <SelectItem key="paid">Paid</SelectItem>
              <SelectItem key="pending">Pending</SelectItem>
              <SelectItem key="refunded">Refunded</SelectItem>
              <SelectItem key="failed">Failed</SelectItem>
            </Select>
            <Select
              label="Method"
              placeholder="All Methods"
              selectedKeys={methodFilter !== "all" ? [methodFilter] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setMethodFilter(selected || "all");
              }}
          >
              <SelectItem key="all">All Methods</SelectItem>
              <SelectItem key="card">Card</SelectItem>
              <SelectItem key="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem key="cash">Cash</SelectItem>
              <SelectItem key="cheque">Cheque</SelectItem>
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
              <SelectItem key="this_week">This Week</SelectItem>
              <SelectItem key="this_month">This Month</SelectItem>
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

      {/* Payments Table */}
      <Card className="border border-divider">
        <CardBody className="p-0">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-default-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No payments found</h3>
              <p className="text-default-500 mb-4">Get started by recording your first payment.</p>
              <Button
                color="primary"
                startContent={<Plus className="w-4 h-4" />}
                onPress={() => setShowAddModal(true)}
            >
              Record Payment
              </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-default-100 border-b border-divider">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
                    Booking Number
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-default-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-default-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {payment.customers?.name || payment.bookings?.customer_name || 'Unknown Customer'}
                        </div>
                        <div className="text-sm text-default-500">
                          {payment.customers?.email || 'No email'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        {payment.bookings?.service || 'Manual Payment'}
                      </div>
                      {payment.bookings?.date && (
                        <div className="text-sm text-default-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(payment.bookings.date).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      £{payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getMethodIcon(payment.payment_method)}
                        <span className="text-sm text-foreground capitalize">
                          {payment.payment_method.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Chip
                        color={getStatusColor(payment.payment_status)}
                        variant="flat"
                        startContent={getStatusIcon(payment.payment_status)}
                        size="sm"
                      >
                        {payment.payment_status}
                      </Chip>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-default-500">
                      {payment.bookings?.booking_number || payment.reference || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          isIconOnly
                          variant="light"
                          size="sm"
                          onPress={() => setSelectedPayment(payment)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          isIconOnly
                          color="primary"
                          variant="light"
                          size="sm"
                          onPress={() => {
                            setEditingPayment(payment);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          isIconOnly
                          color="danger"
                          variant="light"
                          size="sm"
                          onPress={() => {
                            setPaymentToDelete(payment);
                            setShowDeleteModal(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded-md text-sm ${
                  currentPage === page
                    ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
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
          setPaymentToDelete(null);
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
                <h3 className="text-lg font-semibold">Delete Payment</h3>
              </ModalHeader>
              <ModalBody>
                <p className="text-default-600">
                  Are you sure you want to delete the payment of <strong>£{paymentToDelete?.amount.toFixed(2)}</strong> for <strong>{paymentToDelete?.customers?.name || 'Unknown Customer'}</strong>? 
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
                    if (paymentToDelete) {
                      handleDeletePayment(paymentToDelete.id);
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

      {/* Add/Edit Payment Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          setEditingPayment(null);
        }}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-xl font-bold">
                  {editingPayment ? 'Edit Payment' : 'Add New Payment'}
                </h3>
              </ModalHeader>
              <ModalBody>
                <p className="text-default-500 mb-4">
                {editingPayment ? 'Update the payment details below.' : 'Fill in the payment details below.'}
              </p>
              <div className="text-center py-8">
                  <p className="text-default-500">Payment form will be implemented here</p>
                </div>
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

      {/* View Payment Modal */}
      <Modal
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-xl font-bold">Payment Details</h3>
              </ModalHeader>
              <ModalBody>
      {selectedPayment && (
              <div className="space-y-4">
                <div>
                      <label className="text-sm font-medium text-default-500">Customer</label>
                      <p className="text-base font-semibold">{selectedPayment.customers?.name || 'Unknown Customer'}</p>
                      <p className="text-sm text-default-500">{selectedPayment.customers?.email || 'No email'}</p>
                </div>
                <div>
                      <label className="text-sm font-medium text-default-500">Service</label>
                      <p className="text-base font-semibold">{selectedPayment.bookings?.service || 'Manual Payment'}</p>
                  {selectedPayment.bookings?.date && (
                        <p className="text-sm text-default-500">
                      {new Date(selectedPayment.bookings.date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div>
                      <label className="text-sm font-medium text-default-500">Amount</label>
                      <p className="text-2xl font-bold text-success">£{selectedPayment.amount.toFixed(2)}</p>
                </div>
                <div>
                      <label className="text-sm font-medium text-default-500 mb-2 block">Payment Method</label>
                  <div className="flex items-center gap-2">
                    {getMethodIcon(selectedPayment.payment_method)}
                        <span className="text-base capitalize">
                      {selectedPayment.payment_method.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div>
                      <label className="text-sm font-medium text-default-500 mb-2 block">Status</label>
                      <Chip
                        color={getStatusColor(selectedPayment.payment_status)}
                        variant="flat"
                        startContent={getStatusIcon(selectedPayment.payment_status)}
                      >
                    {selectedPayment.payment_status}
                      </Chip>
                </div>
                <div>
                      <label className="text-sm font-medium text-default-500">Payment Date</label>
                      <p className="text-base">{new Date(selectedPayment.payment_date).toLocaleDateString()}</p>
                </div>
                {(selectedPayment.bookings?.booking_number || selectedPayment.reference) && (
                      <div>
                        <label className="text-sm font-medium text-default-500">Booking Number</label>
                        <p className="text-base font-semibold">{selectedPayment.bookings?.booking_number || selectedPayment.reference}</p>
                      </div>
                    )}
                {selectedPayment.reference && selectedPayment.reference.startsWith('pi_') && (
                      <div>
                        <label className="text-sm font-medium text-default-500">Payment Reference</label>
                        <p className="text-base text-xs text-default-400">{selectedPayment.reference}</p>
                      </div>
                    )}
                {selectedPayment.notes && (
                  <div>
                        <label className="text-sm font-medium text-default-500">Notes</label>
                        <p className="text-base">{selectedPayment.notes}</p>
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

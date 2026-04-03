"use client";

import { useState, useEffect } from "react";
import { Plus, Filter, Search, Edit, Trash2, Eye, CheckCircle, XCircle, AlertCircle, Calendar, User, Phone, CreditCard, Banknote, Building2, Save, Table2, Grid3x3 } from "lucide-react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Spinner } from "@heroui/spinner";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Checkbox } from "@heroui/checkbox";
import { useToast } from "@/components/Toast";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { formLayout } from "@/config/design-system";

interface Payment {
  id: string;
  booking_id: string | null;
  customer_id: string | null;
  amount: number;
  payment_type?: "full" | "deposit";
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
    payment_type?: "full" | "deposit";
    remaining_amount?: number;
    total_amount?: number;
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

type DepositSettings = {
  enabled: boolean;
  type: "percentage" | "fixed";
  percentage: number | null;
  fixedAmount: number | null;
};

const defaultDepositSettings: DepositSettings = {
  enabled: false,
  type: "percentage",
  percentage: 50,
  fixedAmount: null,
};

export default function PaymentsPage() {
  const { showSuccess, showError } = useToast();
  const isMdOrLarger = useMediaQuery();
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
  
  // Deposit options (for booking flow)
  const [depositSettings, setDepositSettings] = useState<DepositSettings>(defaultDepositSettings);
  const [isSavingDeposit, setIsSavingDeposit] = useState(false);
  
  // View mode: cards (default) or table
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  
  // Add/Edit Payment form
  const [paymentFormData, setPaymentFormData] = useState({
    customer_id: "",
    booking_id: "",
    amount: "",
    payment_type: "full" as "full" | "deposit",
    payment_method: "card" as "cash" | "card" | "bank_transfer" | "cheque",
    payment_status: "paid" as "pending" | "paid" | "refunded" | "failed",
    payment_date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [paymentFormErrors, setPaymentFormErrors] = useState<Record<string, string>>({});
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [customersForPayment, setCustomersForPayment] = useState<{ id: string; first_name: string; last_name: string; email: string; phone?: string }[]>([]);
  const [bookingsForPayment, setBookingsForPayment] = useState<{ id: string; customer_id: string | null; customer_email: string; service: string; date: string }[]>([]);
  
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

  // Load deposit settings
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/settings?key=deposit_settings");
        if (!res.ok || cancelled) return;
        const value = await res.json();
        if (value && typeof value === "object" && !cancelled) {
          setDepositSettings({
            enabled: !!value.enabled,
            type: value.type === "fixed" ? "fixed" : "percentage",
            percentage: value.percentage != null ? Number(value.percentage) : 50,
            fixedAmount: value.fixedAmount != null ? Number(value.fixedAmount) : null,
          });
        }
      } catch {
        // keep defaults
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Load payments on component mount or when filters change (but NOT on search - that's client-side only)
  useEffect(() => {
    loadPayments();
  }, [currentPage, statusFilter, methodFilter, dateFilter]);

  // Load customers and bookings when Add/Edit modal opens
  useEffect(() => {
    if (!showAddModal && !showEditModal) return;
    let cancelled = false;
    (async () => {
      try {
        const [custRes, bookRes] = await Promise.all([
          fetch("/api/customers?limit=1000"),
          fetch("/api/bookings?page=1&limit=1000"),
        ]);
        if (cancelled) return;
        if (custRes.ok) {
          const d = await custRes.json();
          setCustomersForPayment(d.customers || []);
        }
        if (bookRes.ok) {
          const d = await bookRes.json();
          const list = Array.isArray(d.bookings) ? d.bookings : d;
          setBookingsForPayment(list);
        }
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, [showAddModal, showEditModal]);

  // Populate form when editing
  useEffect(() => {
    if (editingPayment) {
      setPaymentFormData({
        customer_id: editingPayment.customer_id || "",
        booking_id: editingPayment.booking_id || "",
        amount: String(editingPayment.amount),
        payment_type: (editingPayment.payment_type as "full" | "deposit") || "full",
        payment_method: editingPayment.payment_method,
        payment_status: editingPayment.payment_status,
        payment_date: editingPayment.payment_date?.split("T")[0] || new Date().toISOString().split("T")[0],
        notes: editingPayment.notes || "",
      });
    } else if (showAddModal) {
      setPaymentFormData({
        customer_id: "",
        booking_id: "",
        amount: "",
        payment_type: "full",
        payment_method: "card",
        payment_status: "paid",
        payment_date: new Date().toISOString().split("T")[0],
        notes: "",
      });
    }
    if (!showAddModal && !showEditModal) {
      setPaymentFormErrors({});
    }
  }, [editingPayment, showAddModal, showEditModal]);

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

  /** Card / row border accent by payment_status */
  const getPaymentStatusBorderClass = (status: string) => {
    switch (status) {
      case "paid":
        return "border-2 border-emerald-500/75 dark:border-emerald-400/65";
      case "pending":
        return "border-2 border-amber-500/75 dark:border-amber-400/65";
      case "refunded":
        return "border-2 border-sky-500/75 dark:border-sky-400/65";
      case "failed":
        return "border-2 border-red-500/75 dark:border-red-400/65";
      default:
        return "border border-divider";
    }
  };

  const getPaymentStatusRowAccentClass = (status: string) => {
    switch (status) {
      case "paid":
        return "border-l-[3px] border-l-emerald-500 dark:border-l-emerald-400";
      case "pending":
        return "border-l-[3px] border-l-amber-500 dark:border-l-amber-400";
      case "refunded":
        return "border-l-[3px] border-l-sky-500 dark:border-l-sky-400";
      case "failed":
        return "border-l-[3px] border-l-red-500 dark:border-l-red-400";
      default:
        return "border-l-[3px] border-l-zinc-400 dark:border-l-zinc-500";
    }
  };

  /** Very subtle inner background gradient by status (cards + table rows) */
  const getPaymentStatusGradientClass = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-transparent dark:from-emerald-400/[0.07]";
      case "pending":
        return "bg-gradient-to-br from-amber-500/[0.06] via-transparent to-transparent dark:from-amber-400/[0.07]";
      case "refunded":
        return "bg-gradient-to-br from-sky-500/[0.06] via-transparent to-transparent dark:from-sky-400/[0.07]";
      case "failed":
        return "bg-gradient-to-br from-red-500/[0.06] via-transparent to-transparent dark:from-red-400/[0.07]";
      default:
        return "";
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

  const handleDepositSettingsChange = (updates: Partial<DepositSettings>) => {
    setDepositSettings(prev => ({ ...prev, ...updates }));
  };

  const handleSaveDepositSettings = async () => {
    setIsSavingDeposit(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deposit_settings: {
            enabled: depositSettings.enabled,
            type: depositSettings.type,
            percentage: depositSettings.percentage,
            fixedAmount: depositSettings.fixedAmount,
          },
        }),
      });
      if (res.ok) {
        showSuccess("Success", "Deposit settings saved.");
      } else {
        showError("Error", "Failed to save deposit settings.");
      }
    } catch {
      showError("Error", "Failed to save deposit settings.");
    } finally {
      setIsSavingDeposit(false);
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

  const resetPaymentForm = () => {
    setPaymentFormData({
      customer_id: "",
      booking_id: "",
      amount: "",
      payment_type: "full",
      payment_method: "card",
      payment_status: "paid",
      payment_date: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setPaymentFormErrors({});
  };

  const validatePaymentForm = () => {
    const err: Record<string, string> = {};
    if (!paymentFormData.amount || parseFloat(paymentFormData.amount) <= 0) {
      err.amount = "Amount is required";
    }
    if (!paymentFormData.payment_date) {
      err.payment_date = "Payment date is required";
    }
    setPaymentFormErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleAddPayment = async () => {
    if (!validatePaymentForm()) return;
    setIsSavingPayment(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: paymentFormData.booking_id || null,
          customer_id: paymentFormData.customer_id || null,
          amount: parseFloat(paymentFormData.amount),
          payment_type: paymentFormData.payment_type,
          payment_method: paymentFormData.payment_method,
          payment_status: paymentFormData.payment_status,
          payment_date: paymentFormData.payment_date,
          notes: paymentFormData.notes || null,
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        resetPaymentForm();
        await loadPayments();
        showSuccess("Success", "Payment recorded.");
      } else {
        const j = await res.json().catch(() => ({}));
        showError("Error", j.error || "Failed to record payment.");
      }
    } catch {
      showError("Error", "Failed to record payment.");
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleUpdatePayment = async () => {
    if (!editingPayment || !validatePaymentForm()) return;
    setIsSavingPayment(true);
    try {
      const res = await fetch(`/api/payments/${editingPayment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: paymentFormData.booking_id || null,
          customer_id: paymentFormData.customer_id || null,
          amount: parseFloat(paymentFormData.amount),
          payment_type: paymentFormData.payment_type,
          payment_method: paymentFormData.payment_method,
          payment_status: paymentFormData.payment_status,
          payment_date: paymentFormData.payment_date,
          notes: paymentFormData.notes || null,
        }),
      });
      if (res.ok) {
        setShowEditModal(false);
        setEditingPayment(null);
        resetPaymentForm();
        await loadPayments();
        showSuccess("Success", "Payment updated.");
      } else {
        const j = await res.json().catch(() => ({}));
        showError("Error", j.error || "Failed to update payment.");
      }
    } catch {
      showError("Error", "Failed to update payment.");
    } finally {
      setIsSavingPayment(false);
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
    <div className="w-full max-w-full min-w-0 overflow-hidden space-y-6">
      {/* Header with view toggle (desktop only) and Record Payment */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="hidden md:flex bg-default-100 rounded-lg p-1">
          <Button
            size="sm"
            variant={viewMode === "table" ? "solid" : "light"}
            color={viewMode === "table" ? "primary" : "default"}
            startContent={<Table2 className="w-4 h-4" />}
            onPress={() => setViewMode("table")}
            className="min-w-0 min-h-[44px]"
          >
            Table
          </Button>
          <Button
            size="sm"
            variant={viewMode === "cards" ? "solid" : "light"}
            color={viewMode === "cards" ? "primary" : "default"}
            startContent={<Grid3x3 className="w-4 h-4" />}
            onPress={() => setViewMode("cards")}
            className="min-w-0 min-h-[44px]"
          >
            Cards
          </Button>
        </div>
        <Button
          color="primary"
          startContent={<Plus className="w-4 h-4" />}
          onPress={() => setShowAddModal(true)}
          className="min-h-[44px]"
        >
          Record Payment
        </Button>
      </div>

      {/* Deposit options — single compact row (wraps only on very narrow screens) */}
      <Card className="border border-divider">
        <CardBody className="p-2 sm:p-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 sm:gap-x-3">
            <h3 className="text-xs font-semibold text-foreground shrink-0">Deposit options</h3>
            <Checkbox
              isSelected={depositSettings.enabled}
              onValueChange={(v) => handleDepositSettingsChange({ enabled: v })}
              size="sm"
              classNames={{ base: "shrink-0 max-w-none", label: "text-xs whitespace-nowrap" }}
            >
              Allow deposit only (rest on arrival)
            </Checkbox>
            {depositSettings.enabled && (
              <>
                <div className="flex items-center gap-2 shrink-0">
                  <label className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                    <input
                      type="radio"
                      name="depositType"
                      checked={depositSettings.type === "percentage"}
                      onChange={() => handleDepositSettingsChange({ type: "percentage" })}
                      className="rounded-full w-3.5 h-3.5 shrink-0"
                    />
                    <span className="text-xs">%</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="depositType"
                      checked={depositSettings.type === "fixed"}
                      onChange={() => handleDepositSettingsChange({ type: "fixed" })}
                      className="rounded-full w-3.5 h-3.5 shrink-0"
                    />
                    <span className="text-xs whitespace-nowrap">£ Fixed</span>
                  </label>
                </div>
                {depositSettings.type === "percentage" ? (
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={String(depositSettings.percentage ?? "")}
                    onChange={(e) =>
                      handleDepositSettingsChange({ percentage: e.target.value ? Number(e.target.value) : null })
                    }
                    placeholder="50"
                    endContent="%"
                    size="sm"
                    classNames={{ inputWrapper: "min-h-8 h-8", input: "text-xs" }}
                    className="w-[4.5rem] min-w-0 shrink"
                  />
                ) : (
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={String(depositSettings.fixedAmount ?? "")}
                    onChange={(e) =>
                      handleDepositSettingsChange({ fixedAmount: e.target.value ? Number(e.target.value) : null })
                    }
                    placeholder="100"
                    startContent={<span className="text-default-500 text-xs">£</span>}
                    size="sm"
                    classNames={{ inputWrapper: "min-h-8 h-8", input: "text-xs" }}
                    className="w-[5.5rem] min-w-0 shrink"
                  />
                )}
              </>
            )}
            <Button
              color="primary"
              variant="flat"
              size="sm"
              onPress={handleSaveDepositSettings}
              isLoading={isSavingDeposit}
              startContent={!isSavingDeposit && <Save className="w-3 h-3" />}
              className="min-h-8 h-8 px-2.5 text-xs shrink-0 ml-auto"
            >
              {isSavingDeposit ? "Saving..." : "Save deposit settings"}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Summary Cards - compact for mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border border-divider bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardBody className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-default-500">Total Received</p>
                <p className="text-lg sm:text-xl font-bold text-emerald-700 dark:text-emerald-400">£{getTotalAmount().toFixed(2)}</p>
              </div>
              <div className="p-2 sm:p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="border border-divider bg-amber-50/50 dark:bg-amber-950/20">
          <CardBody className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-default-500">Pending</p>
                <p className="text-lg sm:text-xl font-bold text-amber-700 dark:text-amber-400">£{getPendingAmount().toFixed(2)}</p>
              </div>
              <div className="p-2 sm:p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-full flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="border border-divider bg-[#464C45]/5 dark:bg-[#464C45]/20">
          <CardBody className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-default-500">Transactions</p>
                <p className="text-lg sm:text-xl font-bold text-[#464C45] dark:text-egp-beige">{filteredPayments.length}</p>
              </div>
              <div className="p-2 sm:p-2.5 bg-[#464C45]/10 dark:bg-[#464C45]/30 rounded-full flex-shrink-0">
                <CreditCard className="w-5 h-5 text-[#464C45] dark:text-egp-beige" />
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

      {/* Payments */}
      <Card className="border border-divider min-w-0 overflow-hidden">
        <CardBody className="p-0 min-w-0">
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
          <>
            {/* Card view - always on mobile, or when cards selected on desktop */}
            <div
              className={
                (isMdOrLarger ? viewMode === "cards" : true)
                  ? "p-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3"
                  : "hidden"
              }
            >
              {filteredPayments.map((payment) => (
                <Card
                  key={payment.id}
                  className={`shadow-sm overflow-visible h-full flex flex-col min-h-0 rounded-xl ${getPaymentStatusBorderClass(payment.payment_status)}`}
                >
                  <CardBody
                    className={`p-3 flex flex-col flex-1 gap-2 min-h-0 ${getPaymentStatusGradientClass(payment.payment_status)}`}
                  >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-foreground truncate leading-tight">
                        {payment.customers?.name || payment.bookings?.customer_name || "Unknown Customer"}
                      </h4>
                      {payment.customers?.email && (
                        <p className="text-xs text-default-500 truncate mt-0.5">{payment.customers.email}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <Button isIconOnly variant="light" size="sm" className="min-w-8 min-h-8" onPress={() => setSelectedPayment(payment)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button isIconOnly color="primary" variant="light" size="sm" className="min-w-8 min-h-8" onPress={() => { setEditingPayment(payment); setShowEditModal(true); }}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button isIconOnly color="danger" variant="light" size="sm" className="min-w-8 min-h-8" onPress={() => { setPaymentToDelete(payment); setShowDeleteModal(true); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-foreground line-clamp-2 leading-snug min-h-[2rem]">
                    {payment.bookings?.service || "Manual Payment"}
                  </p>
                  <div className="pt-2 border-t border-divider space-y-1.5 shrink-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                      <span className="font-semibold text-foreground tabular-nums">£{payment.amount.toFixed(2)}</span>
                      {payment.payment_type === "deposit" && (
                        <Chip size="sm" variant="flat" color="secondary" className="h-5 text-[10px]">
                          Deposit
                        </Chip>
                      )}
                      <span className="inline-flex items-center gap-0.5 text-default-600">
                        {getMethodIcon(payment.payment_method)}
                        <span className="capitalize">{payment.payment_method.replace("_", " ")}</span>
                      </span>
                      <Chip
                        color={getStatusColor(payment.payment_status)}
                        variant="flat"
                        size="sm"
                        className="h-5 text-[10px]"
                        startContent={getStatusIcon(payment.payment_status)}
                      >
                        {payment.payment_status}
                      </Chip>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-[11px] text-default-500">
                      <span>
                        {new Date(payment.payment_date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      {(payment.bookings?.booking_number || payment.reference) && (
                        <span
                          className="truncate max-w-[55%] text-right font-mono"
                          title={payment.bookings?.booking_number || payment.reference || ""}
                        >
                          #{payment.bookings?.booking_number || payment.reference}
                        </span>
                      )}
                    </div>
                  </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Table view - desktop only when table selected */}
            <div className={isMdOrLarger && viewMode === "table" ? "min-w-0 overflow-x-auto -mx-px" : "hidden"}>
            <table className="w-full table-fixed min-w-[640px]" style={{ tableLayout: 'fixed' }}>
              <thead className="bg-default-100 border-b border-divider">
                <tr>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-default-600 uppercase tracking-wider w-[14%] min-w-0">
                    Customer
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-default-600 uppercase tracking-wider w-[14%] min-w-0">
                    Service
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-default-600 uppercase tracking-wider w-[8%] min-w-0">
                    Amount
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-default-600 uppercase tracking-wider w-[11%] min-w-0">
                    Method
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-default-600 uppercase tracking-wider w-[9%] min-w-0">
                    Status
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-default-600 uppercase tracking-wider w-[9%] min-w-0">
                    Date
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-default-600 uppercase tracking-wider w-[10%] min-w-0">
                    Booking #
                  </th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-default-600 uppercase tracking-wider w-[12%] min-w-0">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className={`hover:bg-default-50 transition-colors border-b border-divider ${getPaymentStatusRowAccentClass(payment.payment_status)} ${getPaymentStatusGradientClass(payment.payment_status)}`}
                  >
                    <td className="px-3 py-2.5 min-w-0">
                      <div className="min-w-0 overflow-hidden">
                        <div className="text-sm font-medium text-foreground truncate" title={payment.customers?.name || payment.bookings?.customer_name || 'Unknown Customer'}>
                          {payment.customers?.name || payment.bookings?.customer_name || 'Unknown Customer'}
                        </div>
                        <div className="text-xs text-default-500 truncate" title={payment.customers?.email || 'No email'}>
                          {payment.customers?.email || 'No email'}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 min-w-0">
                      <div className="min-w-0 overflow-hidden">
                        <div className="text-sm text-foreground truncate" title={payment.bookings?.service || 'Manual Payment'}>
                          {payment.bookings?.service || 'Manual Payment'}
                        </div>
                        {payment.bookings?.date && (
                          <div className="text-xs text-default-500 flex items-center gap-1 truncate">
                            <Calendar className="w-3 h-3 shrink-0" />
                            {new Date(payment.bookings.date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 min-w-0">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-sm font-medium text-foreground">£{payment.amount.toFixed(2)}</span>
                        {payment.payment_type === 'deposit' && (
                          <Chip size="sm" variant="flat" color="secondary" className="w-fit">Deposit</Chip>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {getMethodIcon(payment.payment_method)}
                        <span className="text-sm text-foreground capitalize truncate">
                          {payment.payment_method.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 min-w-0">
                      <Chip
                        color={getStatusColor(payment.payment_status)}
                        variant="flat"
                        startContent={getStatusIcon(payment.payment_status)}
                        size="sm"
                        className="max-w-full"
                      >
                        <span className="truncate">{payment.payment_status}</span>
                      </Chip>
                    </td>
                    <td className="px-3 py-2.5 min-w-0 text-sm text-foreground">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2.5 min-w-0">
                      <div className="text-sm text-default-500 truncate" title={payment.bookings?.booking_number || payment.reference || '-'}>
                        {payment.bookings?.booking_number || payment.reference || '-'}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 min-w-0 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          isIconOnly
                          variant="light"
                          size="md"
                          className="min-h-[44px] min-w-[44px]"
                          onPress={() => setSelectedPayment(payment)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          isIconOnly
                          color="primary"
                          variant="light"
                          size="md"
                          className="min-h-[44px] min-w-[44px]"
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
                          size="md"
                          className="min-h-[44px] min-w-[44px]"
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
          </>
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
          resetPaymentForm();
        }}
        size="2xl"
        scrollBehavior="inside"
        classNames={{ base: "max-w-[95vw] sm:max-w-2xl mx-2" }}
        isDismissable={!isSavingPayment}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-0">
                <h3 className="text-lg sm:text-xl font-bold">
                  {editingPayment ? "Edit Payment" : "Record Payment"}
                </h3>
              </ModalHeader>
              <ModalBody className={formLayout.modalBody}>
                <div className={formLayout.sectionGap}>
                  <div className={formLayout.gridFields}>
                    <Select
                      label="Customer (optional)"
                      placeholder="Select customer"
                      selectedKeys={paymentFormData.customer_id ? [paymentFormData.customer_id] : []}
                      onSelectionChange={(keys) => {
                        const id = Array.from(keys)[0] as string;
                        setPaymentFormData((prev) => ({
                          ...prev,
                          customer_id: id || "",
                          booking_id: "",
                        }));
                        setPaymentFormErrors((e) => ({ ...e, customer_id: "" }));
                      }}
                      isDisabled={isSavingPayment}
                    >
                      {customersForPayment.map((c) => (
                        <SelectItem key={c.id} textValue={`${c.first_name} ${c.last_name}`}>
                          <div>
                            <div className="font-medium">{c.first_name} {c.last_name}</div>
                            <div className="text-xs text-default-500">{c.email} {c.phone ? `• ${c.phone}` : ""}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                    {paymentFormData.customer_id && (() => {
                      const c = customersForPayment.find((x) => x.id === paymentFormData.customer_id);
                      if (!c) return null;
                      return (
                        <div className="md:col-span-2 flex items-center gap-4 p-3 rounded-lg bg-default-100 dark:bg-default-50">
                          <User className="w-5 h-5 text-default-500 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-foreground">{c.first_name} {c.last_name}</div>
                            <div className="text-sm text-default-500 flex flex-wrap gap-x-4 gap-y-0">
                              {c.email && <span>{c.email}</span>}
                              {c.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{c.phone}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    <Select
                      label="Booking (optional)"
                      placeholder="Select booking"
                      selectedKeys={paymentFormData.booking_id ? [paymentFormData.booking_id] : []}
                      onSelectionChange={(keys) => {
                        const id = Array.from(keys)[0] as string;
                        setPaymentFormData((prev) => ({ ...prev, booking_id: id || "" }));
                        setPaymentFormErrors((e) => ({ ...e, booking_id: "" }));
                      }}
                      isDisabled={isSavingPayment}
                    >
                      {(paymentFormData.customer_id
                        ? bookingsForPayment.filter(
                            (b) =>
                              b.customer_id === paymentFormData.customer_id ||
                              b.customer_email ===
                                customersForPayment.find((c) => c.id === paymentFormData.customer_id)?.email
                          )
                        : bookingsForPayment
                      ).map((b) => (
                        <SelectItem key={b.id} textValue={b.service}>
                          {b.service} — {new Date(b.date).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </Select>
                    <Input
                      label="Amount (£)"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={paymentFormData.amount}
                      onValueChange={(v) => {
                        setPaymentFormData((prev) => ({ ...prev, amount: v }));
                        setPaymentFormErrors((e) => ({ ...e, amount: "" }));
                      }}
                      isInvalid={!!paymentFormErrors.amount}
                      errorMessage={paymentFormErrors.amount}
                      isDisabled={isSavingPayment}
                      isRequired
                    />
                    <Select
                      label="Payment Method"
                      selectedKeys={[paymentFormData.payment_method]}
                      onSelectionChange={(keys) => {
                        const v = Array.from(keys)[0] as string;
                        setPaymentFormData((prev) => ({
                          ...prev,
                          payment_method: v as "cash" | "card" | "bank_transfer" | "cheque",
                        }));
                      }}
                      isDisabled={isSavingPayment}
                    >
                      <SelectItem key="card">Card</SelectItem>
                      <SelectItem key="cash">Cash</SelectItem>
                      <SelectItem key="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem key="cheque">Cheque</SelectItem>
                    </Select>
                    <Input
                      label="Payment Date"
                      type="date"
                      value={paymentFormData.payment_date}
                      onValueChange={(v) => {
                        setPaymentFormData((prev) => ({ ...prev, payment_date: v }));
                        setPaymentFormErrors((e) => ({ ...e, payment_date: "" }));
                      }}
                      isInvalid={!!paymentFormErrors.payment_date}
                      errorMessage={paymentFormErrors.payment_date}
                      isDisabled={isSavingPayment}
                      isRequired
                    />
                    <Select
                      label="Status"
                      selectedKeys={[paymentFormData.payment_status]}
                      onSelectionChange={(keys) => {
                        const v = Array.from(keys)[0] as string;
                        setPaymentFormData((prev) => ({
                          ...prev,
                          payment_status: v as "pending" | "paid" | "refunded" | "failed",
                        }));
                      }}
                      isDisabled={isSavingPayment}
                    >
                      <SelectItem key="pending">Pending</SelectItem>
                      <SelectItem key="paid">Paid</SelectItem>
                      <SelectItem key="refunded">Refunded</SelectItem>
                      <SelectItem key="failed">Failed</SelectItem>
                    </Select>
                    <Select
                      label="Payment Type"
                      selectedKeys={[paymentFormData.payment_type]}
                      onSelectionChange={(keys) => {
                        const v = Array.from(keys)[0] as string;
                        setPaymentFormData((prev) => ({
                          ...prev,
                          payment_type: v as "full" | "deposit",
                        }));
                      }}
                      isDisabled={isSavingPayment}
                    >
                      <SelectItem key="full">Full payment</SelectItem>
                      <SelectItem key="deposit">Deposit only</SelectItem>
                    </Select>
                  </div>
                  <Input
                    label="Notes (optional)"
                    placeholder="Internal notes"
                    value={paymentFormData.notes}
                    onValueChange={(v) => setPaymentFormData((prev) => ({ ...prev, notes: v }))}
                    isDisabled={isSavingPayment}
                  />
                </div>
              </ModalBody>
              <ModalFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-4 gap-2 flex-col-reverse sm:flex-row">
                <Button variant="light" onPress={onClose} isDisabled={isSavingPayment}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={editingPayment ? handleUpdatePayment : handleAddPayment}
                  isLoading={isSavingPayment}
                  isDisabled={isSavingPayment}
                >
                  {editingPayment ? "Update Payment" : "Record Payment"}
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
                      <p className="text-xl sm:text-2xl font-bold text-success">£{selectedPayment.amount.toFixed(2)}</p>
                      {selectedPayment.payment_type === 'deposit' && (
                        <p className="text-sm text-default-500 mt-1">Deposit payment</p>
                      )}
                      {selectedPayment.payment_type === 'deposit' && selectedPayment.bookings?.remaining_amount != null && selectedPayment.bookings.remaining_amount > 0 && (
                        <p className="text-sm text-warning mt-1">£{Number(selectedPayment.bookings.remaining_amount).toFixed(2)} due on arrival</p>
                      )}
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
                        <p className="text-sm text-default-400">{selectedPayment.reference}</p>
                      </div>
                    )}
                {(selectedPayment.reference?.startsWith('plink_') || (selectedPayment.notes && /https?:\/\//.test(selectedPayment.notes))) && (
                      <div>
                        <label className="text-sm font-medium text-default-500 mb-2 block">Payment Link</label>
                        {(() => {
                          const urlMatch = selectedPayment.notes?.match(/URL:\s*(https?:\/\/[^\s|]+)/);
                          const paymentUrl = urlMatch ? urlMatch[1].trim() : null;
                          return paymentUrl ? (
                            <a
                              href={paymentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline break-all text-sm"
                            >
                              {paymentUrl}
                            </a>
                          ) : (
                            <p className="text-sm text-default-400">Stripe payment link (ID: {selectedPayment.reference})</p>
                          );
                        })()}
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

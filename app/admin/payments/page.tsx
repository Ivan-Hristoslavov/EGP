"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useToast } from "@/components/Toast";
import Pagination from "@/components/Pagination";

type Payment = {
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
  };
};

type Customer = {
  id: string;
  name: string;
  email: string;
  address: string;
};

type Booking = {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email?: string;
  service: string;
  date: string;
  time: string;
  amount: number;
  status: string;
  payment_status: string;
};

// Get date helper
const getDate = (daysOffset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

// Dummy services data
const DUMMY_SERVICES = [
  "Botox Treatment",
  "Dermal Fillers",
  "Lip Enhancement",
  "Baby Botox",
  "Profhilo Treatment",
  "Anti-wrinkle Treatment",
  "Fat Freezing",
  "Skin Consultation",
  "Facial Aesthetics",
  "Body Contouring",
  "Skin Treatments",
  "Consultation",
  "Chemical Peels",
  "Microneedling",
  "Laser Hair Removal",
  "CoolSculpting",
  "Hyaluronic Acid Fillers",
  "Thread Lifts",
  "PRP Treatment",
  "HydraFacial",
  "Dermaplaning",
  "Microdermabrasion",
  "LED Light Therapy",
  "Radio Frequency Treatment",
  "Ultrasound Therapy",
  "Cryotherapy",
  "Vitamin Injections",
  "Skin Tightening",
  "Acne Treatment",
  "Pigmentation Treatment",
  "Scar Reduction",
  "Wrinkle Relaxation",
  "Jawline Contouring",
  "Cheek Enhancement",
  "Non-surgical Nose Job",
  "Eyebrow Lamination",
  "Eyelash Extensions",
  "Brow Microblading",
  "Lip Tattooing",
  "Skin Rejuvenation",
  "Anti-aging Facial",
  "Deep Cleansing Facial",
  "Brightening Treatment",
  "Detox Treatment"
];

// Dummy payments data
const DUMMY_PAYMENTS: Payment[] = [
  {
    id: "payment-1",
    booking_id: "booking-1",
    customer_id: "dummy-1",
    amount: 199,
    payment_method: "card",
    payment_status: "paid",
    payment_date: getDate(0),
    reference: "PAY-2025-001",
    notes: "Baby Botox treatment - paid via Stripe",
    created_at: getDate(0),
    updated_at: getDate(0),
    customers: {
      name: "Sarah Johnson",
      email: "sarah.j@example.com"
    },
    bookings: {
      service: "Baby Botox",
      date: getDate(0),
      customer_name: "Sarah Johnson"
    }
  },
  {
    id: "payment-2",
    booking_id: "booking-2",
    customer_id: "dummy-2",
    amount: 290,
    payment_method: "card",
    payment_status: "paid",
    payment_date: getDate(0),
    reference: "PAY-2025-002",
    notes: "Lip Enhancement - online payment",
    created_at: getDate(0),
    updated_at: getDate(0),
    customers: {
      name: "Emma Williams",
      email: "emma.w@example.com"
    },
    bookings: {
      service: "Lip Enhancement",
      date: getDate(0),
      customer_name: "Emma Williams"
    }
  },
  {
    id: "payment-3",
    booking_id: "booking-3",
    customer_id: "dummy-3",
    amount: 390,
    payment_method: "bank_transfer",
    payment_status: "paid",
    payment_date: getDate(-1),
    reference: "BANK-2025-003",
    notes: "Profhilo Treatment - bank transfer",
    created_at: getDate(-1),
    updated_at: getDate(-1),
    customers: {
      name: "Lisa Brown",
      email: "lisa.b@example.com"
    },
    bookings: {
      service: "Profhilo Treatment",
      date: getDate(-1),
      customer_name: "Lisa Brown"
    }
  },
  {
    id: "payment-4",
    booking_id: "booking-4",
    customer_id: "dummy-4",
    amount: 75,
    payment_method: "card",
    payment_status: "refunded",
    payment_date: getDate(-2),
    reference: "REFUND-2025-004",
    notes: "Consultation cancelled - refunded",
    created_at: getDate(-2),
    updated_at: getDate(-2),
    customers: {
      name: "Rachel Green",
      email: "rachel@example.com"
    },
    bookings: {
      service: "Skin Consultation",
      date: getDate(-2),
      customer_name: "Rachel Green"
    }
  },
  {
    id: "payment-5",
    booking_id: "booking-5",
    customer_id: "dummy-5",
    amount: 220,
    payment_method: "cash",
    payment_status: "paid",
    payment_date: getDate(-3),
    reference: "CASH-2025-005",
    notes: "Anti-wrinkle Treatment - cash payment",
    created_at: getDate(-3),
    updated_at: getDate(-3),
    customers: {
      name: "Jessica Taylor",
      email: "jessica.t@example.com"
    },
    bookings: {
      service: "Anti-wrinkle Treatment",
      date: getDate(-3),
      customer_name: "Jessica Taylor"
    }
  },
  {
    id: "payment-6",
    booking_id: "booking-6",
    customer_id: "dummy-6",
    amount: 200,
    payment_method: "card",
    payment_status: "paid",
    payment_date: getDate(-5),
    reference: "PAY-2025-006",
    notes: "Fat Freezing - Stripe payment",
    created_at: getDate(-5),
    updated_at: getDate(-5),
    customers: {
      name: "Maria Garcia",
      email: "maria.g@example.com"
    },
    bookings: {
      service: "Fat Freezing",
      date: getDate(-5),
      customer_name: "Maria Garcia"
    }
  },
  {
    id: "payment-7",
    booking_id: "booking-7",
    customer_id: "dummy-7",
    amount: 320,
    payment_method: "card",
    payment_status: "refunded",
    payment_date: getDate(-7),
    reference: "REFUND-2025-007",
    notes: "Dermal Fillers - client cancelled, refunded",
    created_at: getDate(-7),
    updated_at: getDate(-7),
    customers: {
      name: "Jennifer Davis",
      email: "jennifer.d@example.com"
    },
    bookings: {
      service: "Dermal Fillers",
      date: getDate(-7),
      customer_name: "Jennifer Davis"
    }
  },
  {
    id: "payment-8",
    booking_id: "booking-8",
    customer_id: "dummy-8",
    amount: 250,
    payment_method: "bank_transfer",
    payment_status: "paid",
    payment_date: getDate(-10),
    reference: "BANK-2025-008",
    notes: "Botox Treatment - corporate payment",
    created_at: getDate(-10),
    updated_at: getDate(-10),
    customers: {
      name: "Amanda Wilson",
      email: "amanda@elite-beauty.example.com"
    },
    bookings: {
      service: "Botox Treatment",
      date: getDate(-10),
      customer_name: "Amanda Wilson"
    }
  },
  {
    id: "payment-9",
    booking_id: null,
    customer_id: "dummy-1",
    amount: 150,
    payment_method: "card",
    payment_status: "pending",
    payment_date: getDate(0),
    reference: "PENDING-2025-009",
    notes: "Deposit payment - pending confirmation",
    created_at: getDate(0),
    updated_at: getDate(0),
    customers: {
      name: "Sarah Johnson",
      email: "sarah.j@example.com"
    }
  },
  {
    id: "payment-10",
    booking_id: null,
    customer_id: "dummy-3",
    amount: 100,
    payment_method: "cash",
    payment_status: "paid",
    payment_date: getDate(-1),
    reference: "CASH-2025-010",
    notes: "Deposit for upcoming treatment",
    created_at: getDate(-1),
    updated_at: getDate(-1),
    customers: {
      name: "Lisa Brown",
      email: "lisa.b@example.com"
    }
  }
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const { showSuccess, showError } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "cards">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("payments-view-mode") as "table" | "cards") || "table";
    }
    return "table";
  });
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
  const [showEmailLinkModal, setShowEmailLinkModal] = useState(false);
  const [paymentActionType, setPaymentActionType] = useState<"record" | "link" | "email">("record");
  const [showEditModal, setShowEditModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState<string | null>(
    null
  );
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(10);

  const [filters, setFilters] = useState({
    status: "all",
    paymentMethod: "all",
    search: "",
  });

  const [newPayment, setNewPayment] = useState({
    customer_id: "",
    booking_id: "",
    service: "",
    amount: "",
    payment_method: "cash" as const,
    payment_date: format(new Date(), "yyyy-MM-dd"),
    reference: "",
    notes: "",
  });

  const [editPayment, setEditPayment] = useState({
    id: "",
    customer_id: "",
    booking_id: "",
    service: "",
    amount: "",
    payment_method: "cash" as "cash" | "card" | "bank_transfer" | "cheque",
    payment_date: "",
    reference: "",
    notes: "",
    payment_status: "pending" as "pending" | "paid" | "refunded" | "failed",
  });

  const [paymentLink, setPaymentLink] = useState({
    customer_id: "",
    booking_id: "",
    amount: "",
    description: "",
    currency: "gbp",
  });

  const [emailLink, setEmailLink] = useState({
    customer_id: "",
    booking_id: "",
    amount: "",
    description: "",
    currency: "gbp",
  });

  const [formError, setFormError] = useState("");
  const [paymentLinkResult, setPaymentLinkResult] = useState<any>(null);
  const [showPaymentLinkResult, setShowPaymentLinkResult] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [deletingPayment, setDeletingPayment] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (page: number = 1) => {
    try {
      setLoading(true);
      const [paymentsRes, customersRes, bookingsRes] = await Promise.all([
        fetch(`/api/payments?page=${page}&limit=${limit}`),
        fetch("/api/customers"),
        fetch("/api/bookings"),
      ]);

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        const fetchedPayments = paymentsData.payments || [];
        
        // Use dummy data if no real payments exist
        if (fetchedPayments.length === 0) {
          console.log("No payments found, using dummy data");
          setPayments(DUMMY_PAYMENTS);
          setTotalPages(1);
          setTotalCount(DUMMY_PAYMENTS.length);
          setCurrentPage(1);
        } else {
          setPayments(fetchedPayments);
        setTotalPages(paymentsData.pagination?.totalPages || 1);
        setTotalCount(paymentsData.pagination?.totalCount || 0);
        setCurrentPage(paymentsData.pagination?.page || 1);
        }
      } else {
        console.log("API error, using dummy payments data");
        setPayments(DUMMY_PAYMENTS);
        setTotalPages(1);
        setTotalCount(DUMMY_PAYMENTS.length);
        setCurrentPage(1);
      }

      if (customersRes.ok) {
        const customersData = await customersRes.json();
        console.log("Customers API response:", customersData);
        const customersArray = customersData.customers || [];
        console.log("Customers array:", customersArray);
        setCustomers(customersArray);
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        console.log("Bookings API response:", bookingsData);
        const bookingsArray = bookingsData.bookings || [];
        console.log("Bookings array:", bookingsArray);
        setBookings(bookingsArray);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      // Use dummy data on error
      console.log("Exception occurred, using dummy payments data");
      setPayments(DUMMY_PAYMENTS);
      setTotalPages(1);
      setTotalCount(DUMMY_PAYMENTS.length);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    await loadData(page);
  };

  const handleViewModeChange = (mode: "table" | "cards") => {
    setViewMode(mode);
    localStorage.setItem("payments-view-mode", mode);
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!newPayment.customer_id || !newPayment.amount) {
      setFormError("Please fill in all required fields.");
      return;
    }

    try {
      let response;
      
      if (paymentActionType === "record") {
        // Regular payment recording
        response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newPayment,
          amount: parseFloat(newPayment.amount),
        }),
      });
      } else if (paymentActionType === "link") {
        // Create payment link
        response = await fetch("/api/payments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "create_payment_link",
            customer_id: newPayment.customer_id,
            booking_id: newPayment.booking_id,
            amount: parseFloat(newPayment.amount),
            payment_date: newPayment.payment_date,
            reference: newPayment.reference,
            notes: newPayment.notes,
          }),
        });
      } else if (paymentActionType === "email") {
        // Create payment link and send email
        response = await fetch("/api/payments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "create_and_send_payment_link",
            customer_id: newPayment.customer_id,
            booking_id: newPayment.booking_id,
            amount: parseFloat(newPayment.amount),
            payment_date: newPayment.payment_date,
            reference: newPayment.reference,
            notes: newPayment.notes,
          }),
        });
      }

      if (response && response.ok) {
        await loadData();
        setShowCreateModal(false);
        setNewPayment({
          customer_id: "",
          booking_id: "",
          service: "",
          amount: "",
          payment_method: "cash",
          payment_date: format(new Date(), "yyyy-MM-dd"),
          reference: "",
          notes: "",
        });
        
        // Show success message based on action type
        if (paymentActionType === "record") {
          showSuccess("Payment Recorded", "Payment has been successfully recorded.");
        } else if (paymentActionType === "link") {
          showSuccess("Payment Link Created", "Payment link has been created successfully.");
      } else {
          showSuccess("Payment Link Sent", "Payment link has been created and sent to customer.");
        }
      } else {
        const error = await response?.json();
        setFormError(error?.error || "Failed to process payment");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      setFormError("Failed to process payment");
    }
  };

  const handleCreatePaymentLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!paymentLink.customer_id || !paymentLink.amount) {
      setFormError("Please fill in all required fields");
      return;
    }

    try {
      setProcessingPayment("creating");

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "create_payment_link",
          ...paymentLink,
          amount: parseFloat(paymentLink.amount),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setShowPaymentLinkModal(false);
        setPaymentLink({
          customer_id: "",
          booking_id: "",
          amount: "",
          description: "",
          currency: "gbp",
        });

        // Copy link to clipboard
        if (result.payment_link_url) {
          await navigator.clipboard.writeText(result.payment_link_url);
        }

        // Show success modal
        setPaymentLinkResult(result);
        setShowPaymentLinkResult(true);

        // Reload payments
        loadData();
      } else {
        const error = await response.json();
        setFormError(error.error || "Failed to create payment link");
      }
    } catch (error) {
      console.error("Error creating payment link:", error);
      setFormError("An unexpected error occurred");
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleCreateAndSendEmailLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!emailLink.customer_id || !emailLink.amount) {
      setFormError("Please fill in all required fields");
      return;
    }

    try {
      setProcessingPayment("creating_email");

      const response = await fetch("/api/payments/create-and-send-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...emailLink,
          amount: parseFloat(emailLink.amount),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setShowEmailLinkModal(false);
        setEmailLink({
          customer_id: "",
          booking_id: "",
          amount: "",
          description: "",
          currency: "gbp",
        });

        // Show success message
        const selectedCustomer = customers.find(
          (c) => c.id === emailLink.customer_id
        );
        showSuccess(
          "Payment Link Created & Sent",
          `Payment link for £${emailLink.amount} created and sent to ${selectedCustomer?.email || "customer"}`
        );

        // Reload payments to show the new pending payment
        loadData();
      } else {
        const error = await response.json();
        setFormError(
          error.error || "Failed to create payment link and send email"
        );
        showError(
          "Creation Failed",
          error.error || "Failed to create payment link and send email"
        );
      }
    } catch (error) {
      console.error("Error creating payment link and sending email:", error);
      setFormError("An unexpected error occurred");
      showError(
        "Network Error",
        "Network error while creating payment link and sending email"
      );
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleEditPayment = (payment: Payment) => {
    setEditPayment({
      id: payment.id,
      customer_id: payment.customer_id || "",
      booking_id: payment.booking_id || "",
      service: payment.bookings?.service || "",
      amount: payment.amount.toString(),
      payment_method: payment.payment_method,
      payment_date: payment.payment_date,
      reference: payment.reference || "",
      notes: payment.notes || "",
      payment_status: payment.payment_status,
    });
    setShowEditModal(true);
  };

  const handleDeletePayment = (payment: Payment) => {
    setPaymentToDelete(payment);
    setShowDeleteModal(true);
  };

  const confirmDeletePayment = async () => {
    if (!paymentToDelete) return;

    setDeletingPayment(true);
    try {
      const response = await fetch(`/api/payments/${paymentToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove payment from state
        setPayments(payments.filter((p) => p.id !== paymentToDelete.id));
        setShowDeleteModal(false);
        setPaymentToDelete(null);
      } else {
        const error = await response.json();
        setFormError(error.error || "Failed to delete payment");
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      setFormError("Failed to delete payment");
    } finally {
      setDeletingPayment(false);
    }
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!editPayment.customer_id || !editPayment.amount) {
      setFormError("Please fill in all required fields.");
      return;
    }

    try {
      const response = await fetch(`/api/payments/${editPayment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editPayment,
          amount: parseFloat(editPayment.amount),
        }),
      });

      if (response.ok) {
        await loadData();
        setShowEditModal(false);
        setEditPayment({
          id: "",
          customer_id: "",
          booking_id: "",
          service: "",
          amount: "",
          payment_method: "cash",
          payment_date: "",
          reference: "",
          notes: "",
          payment_status: "pending",
        });
      } else {
        const error = await response.json();
        setFormError(error.error || "Failed to update payment");
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      setFormError("Failed to update payment");
    }
  };

  const canEditPayment = (status: Payment["payment_status"]) => {
    // Allow editing of pending and failed payments
    return status === "pending" || status === "failed";
  };

  const isPaymentLink = (payment: Payment) => {
    // Check if payment is a Stripe Payment Link
    return (
      payment.notes?.includes("Stripe Payment Link") ||
      payment.reference?.startsWith("plink_") ||
      payment.notes?.includes("Payment Link")
    );
  };

  const getPaymentLinkUrl = (payment: Payment) => {
    // Check if URL is stored in notes first (this is the correct URL from Stripe)
    if (payment.notes?.includes("URL: ")) {
      const urlMatch = payment.notes.match(/URL: (https:\/\/[^\s]+)/);
      return urlMatch ? urlMatch[1] : null;
    }
    
    // For older payment links without URL in notes, we can't reconstruct the URL
    // because Stripe payment links have unique URLs that can't be reconstructed from just the ID
    return null;
  };

  const handleCopyPaymentLink = async (payment: Payment) => {
    const paymentLinkUrl = getPaymentLinkUrl(payment);
    if (paymentLinkUrl) {
      try {
        await navigator.clipboard.writeText(paymentLinkUrl);
        showSuccess(
          "Payment Link Copied",
          `Payment link for £${payment.amount} copied to clipboard`
        );
      } catch (error) {
        console.error("Failed to copy payment link:", error);
        showError("Copy Failed", "Failed to copy payment link to clipboard");
      }
    }
  };

  const handleSendPaymentLinkEmail = async (payment: Payment) => {
    const paymentLinkUrl = getPaymentLinkUrl(payment);
    if (!paymentLinkUrl || !payment.customers?.email) {
      showError("Send Failed", "Missing payment link URL or customer email");
      return;
    }

    try {
      const response = await fetch("/api/payments/send-link-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_id: payment.id,
          customer_email: payment.customers.email,
          customer_name: payment.customers.name || payment.customers.email,
          payment_link_url: paymentLinkUrl,
          amount: payment.amount,
        }),
      });

      if (response.ok) {
        showSuccess(
          "Payment Link Sent",
          `Payment link for £${payment.amount} sent to ${payment.customers.email}`
        );
      } else {
        const errorData = await response.json();
        showError(
          "Send Failed",
          errorData.error || "Failed to send payment link email"
        );
      }
    } catch (error) {
      console.error("Error sending payment link email:", error);
      showError(
        "Send Failed",
        "Network error while sending payment link email"
      );
    }
  };

  const truncateReference = (
    reference: string | null,
    maxLength: number = 20
  ) => {
    if (!reference) return "-";
    return reference.length > maxLength
      ? `${reference.substring(0, maxLength)}...`
      : reference;
  };

  const getStatusColor = (status: Payment["payment_status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200";
      case "failed":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200";
      case "refunded":
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200";
    }
  };

  const getPaymentMethodIcon = (method: Payment["payment_method"]) => {
    switch (method) {
      case "cash":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        );
      case "card":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        );
      case "bank_transfer":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        );
      case "cheque":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        );
    }
  };

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    const matchesStatus =
      filters.status === "all" || payment.payment_status === filters.status;
    const matchesMethod =
      filters.paymentMethod === "all" ||
      payment.payment_method === filters.paymentMethod;
    const matchesSearch =
      (payment.customers?.name || "")
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      (payment.reference || "")
        .toLowerCase()
        .includes(filters.search.toLowerCase());

    return matchesStatus && matchesMethod && matchesSearch;
  });

  // Calculate financial summary
  const financialSummary = {
    totalRevenue: payments
      .filter((p) => p.payment_status === "paid")
      .reduce((sum, p) => sum + p.amount, 0),
    pendingPayments: payments
      .filter((p) => p.payment_status === "pending")
      .reduce((sum, p) => sum + p.amount, 0),
    totalPayments: payments.length,
    averageTransaction:
      payments.length > 0
        ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length
        : 0,
  };

  // Filter bookings for selected customer
  const filteredBookings = newPayment.customer_id && Array.isArray(bookings)
    ? bookings.filter((b) => {
        // Try to match by customer_id first
        if (b.customer_id === newPayment.customer_id) return true;
        // If customer_id is null, match by both email AND name
        if (!b.customer_id && b.customer_email) {
          const selectedCustomer = customers.find(
            (c) => c.id === newPayment.customer_id
          );
          return (
            selectedCustomer &&
            b.customer_email === selectedCustomer.email &&
            b.customer_name === selectedCustomer.name
          );
        }
        return false;
      })
    : [];

  const filteredBookingsForLink = paymentLink.customer_id && Array.isArray(bookings)
    ? bookings.filter((b) => {
        // Try to match by customer_id first
        if (b.customer_id === paymentLink.customer_id) return true;
        // If customer_id is null, match by both email AND name
        if (!b.customer_id && b.customer_email) {
          const selectedCustomer = customers.find(
            (c) => c.id === paymentLink.customer_id
          );
          return (
            selectedCustomer &&
            b.customer_email === selectedCustomer.email &&
            b.customer_name === selectedCustomer.name
          );
        }
        return false;
      })
    : [];

  const filteredBookingsForEmail = emailLink.customer_id && Array.isArray(bookings)
    ? bookings.filter((b) => {
        // Try to match by customer_id first
        if (b.customer_id === emailLink.customer_id) return true;
        // If customer_id is null, match by both email AND name
        if (!b.customer_id && b.customer_email) {
          const selectedCustomer = customers.find(
            (c) => c.id === emailLink.customer_id
          );
          return (
            selectedCustomer &&
            b.customer_email === selectedCustomer.email &&
            b.customer_name === selectedCustomer.name
          );
        }
        return false;
      })
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-light" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-pink-50/50 to-purple-50/50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Compact Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 rounded-2xl shadow-lg">
          <div className="absolute inset-0 bg-black/5"></div>
          
          <div className="relative px-6 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  Payments Management
            </h1>
                <p className="text-white/90 text-sm">
                  Track and manage payment transactions
            </p>
          </div>
              
              <div className="flex items-center gap-3">
            {/* View Toggle */}
                <div className="flex bg-white/20 backdrop-blur-sm rounded-lg p-1 border border-white/30">
              <button
                    className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  viewMode === "table"
                        ? "bg-white text-green-600 shadow-sm"
                        : "text-white hover:bg-white/20"
                }`}
                onClick={() => handleViewModeChange("table")}
              >
                    <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18m-9 8h9m-9 4h9m-9-8h9" />
                </svg>
                Table
              </button>
              <button
                    className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  viewMode === "cards"
                        ? "bg-white text-green-600 shadow-sm"
                        : "text-white hover:bg-white/20"
                }`}
                onClick={() => handleViewModeChange("cards")}
              >
                    <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
                </svg>
                Cards
              </button>
            </div>
                
                {/* Unified Action Button */}
            <button
                  className="flex items-center px-4 py-1.5 text-xs font-medium text-green-600 bg-white rounded-lg hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={() => {
                    setPaymentActionType("record");
                    setShowCreateModal(true);
                  }}
                >
                  <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
                  <span className="hidden sm:inline">Add Payment</span>
                  <span className="sm:hidden">Add</span>
            </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg mb-3 inline-block">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{payments.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Payments</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg mb-3 inline-block">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{payments.filter(p => p.payment_status === "paid").length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Paid</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg mb-3 inline-block">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{payments.filter(p => p.payment_status === "pending").length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg mb-3 inline-block">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                £{payments.filter(p => p.payment_status === "paid").reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                >
                  <option value="all">All</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="refunded">Refunded</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                  Payment Method
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                  value={filters.paymentMethod}
                  onChange={(e) =>
                    setFilters({ ...filters, paymentMethod: e.target.value })
                  }
                >
                  <option value="all">All</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
            </div>
            <div className="flex-1 md:max-w-sm">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                Search
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                  placeholder="Search by reference or customer..."
                  type="text"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
                <svg
                  className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 dark:text-gray-500 transition-colors duration-300"
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

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                  £{financialSummary.totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full transition-colors duration-300">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400 transition-colors duration-300"
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
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  Pending Payments
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                  £{financialSummary.pendingPayments.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full transition-colors duration-300">
                <svg
                  className="w-6 h-6 text-yellow-600 dark:text-yellow-400 transition-colors duration-300"
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
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  Total Payments
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                  {financialSummary.totalPayments}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full transition-colors duration-300">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400 transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  Average Transaction
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                  £{financialSummary.averageTransaction.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full transition-colors duration-300">
                <svg
                  className="w-6 h-6 text-purple-600 dark:text-purple-400 transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Display */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400" />
            <span className="ml-3 text-gray-600 dark:text-gray-400 transition-colors duration-300">
              Loading payments...
            </span>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 transition-colors duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
              No payments found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
              Get started by recording a new payment.
            </p>
            <div className="mt-6">
              <button
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
                onClick={() => setShowCreateModal(true)}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                Record Payment
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Table View */}
            {viewMode === "table" && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {payment.customers?.name || "Unknown Customer"}
                          </div>
                          {payment.customers?.email && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {payment.customers.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        £{payment.amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <span className="mr-2">
                            {getPaymentMethodIcon(payment.payment_method)}
                          </span>
                          <span className="capitalize">
                            {payment.payment_method.replace("_", " ")}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            payment.payment_status === "paid" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                            payment.payment_status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                            payment.payment_status === "refunded" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" :
                            "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          }`}
                        >
                            {payment.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(payment.payment_date), "dd MMM yyyy")}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            className="inline-flex items-center justify-center w-7 h-7 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors duration-200"
                            onClick={() => setSelectedPayment(payment)}
                            title="View Details"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>

                          {canEditPayment(payment.payment_status) && (
                            <button
                              className="inline-flex items-center justify-center w-7 h-7 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-md transition-colors duration-200"
                              onClick={() => handleEditPayment(payment)}
                              title="Edit Payment"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}
                          <button
                            className="inline-flex items-center justify-center w-7 h-7 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors duration-200"
                            onClick={() => handleDeletePayment(payment)}
                            title="Delete Payment"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}

            {/* Cards View */}
            {viewMode === "cards" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPayments.map((payment) => (
                  <div key={payment.id} className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
                    {/* Animated Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-100/20 via-emerald-50/10 to-teal-100/20 dark:from-green-900/10 dark:via-emerald-900/5 dark:to-teal-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                    
                    <div className="relative z-10">
                      {/* Header with Customer Avatar */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative">
                          <div className="w-14 h-14 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">
                              {(payment.customers?.name || "?").charAt(0).toUpperCase()}
                          </span>
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 ${
                            payment.payment_status === "paid" ? "bg-green-500" : 
                            payment.payment_status === "pending" ? "bg-yellow-500" : "bg-red-500"
                          }`}></div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                            {payment.customers?.name || "Unknown Customer"}
                          </h3>
                          {payment.customers?.email && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {payment.customers.email}
                            </p>
                          )}
                        </div>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold shadow-md ${
                          payment.payment_status === "paid" ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" :
                          payment.payment_status === "pending" ? "bg-gradient-to-r from-yellow-500 to-orange-600 text-white" :
                          payment.payment_status === "refunded" ? "bg-gradient-to-r from-red-500 to-red-600 text-white" :
                          "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}>
                            {payment.payment_status.toUpperCase()}
                          </span>
                        </div>

                      {/* Amount & Payment Method */}
                      <div className="flex items-center justify-between mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-800/10 rounded-xl">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Amount</p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            £{payment.amount.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(payment.payment_method)}
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                          {payment.payment_method.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    {/* Payment Details */}
                      <div className="space-y-2 mb-4">
                      {payment.reference && (
                          <div className="flex items-center gap-2 text-sm">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                            </svg>
                            <span className="text-gray-600 dark:text-gray-400">Ref:</span>
                            <span className="text-gray-900 dark:text-white font-mono text-xs">
                            {truncateReference(payment.reference)}
                          </span>
                        </div>
                      )}
                        <div className="flex items-center gap-2 text-sm">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-gray-600 dark:text-gray-400">Date:</span>
                          <span className="text-gray-900 dark:text-white font-semibold">
                          {format(new Date(payment.payment_date), "dd MMM yyyy")}
                        </span>
                      </div>
                      {payment.bookings && (
                          <div className="flex items-center gap-2 text-sm">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span className="text-gray-600 dark:text-gray-400">Service:</span>
                            <span className="text-gray-900 dark:text-white font-semibold truncate flex-1">
                            {payment.bookings.service}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                      <button
                          className="flex-1 p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold"
                        onClick={() => setSelectedPayment(payment)}
                      >
                          <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>

                      {canEditPayment(payment.payment_status) && (
                        <button
                            className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
                          onClick={() => handleEditPayment(payment)}
                            title="Edit Payment"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}

                      <button
                          className="p-2.5 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
                        onClick={() => handleDeletePayment(payment)}
                          title="Delete Payment"
                      >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
          </>
        )}
      </div>

      {/* Create Payment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75"
              onClick={() => setShowCreateModal(false)}
            />
            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-gray-800 rounded-2xl shadow-2xl sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full transition-colors duration-300">
              {/* Modern Header */}
              <div className="relative bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 p-6">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      Add Payment
                    </h3>
                    <p className="text-white/90 text-sm">
                      {paymentActionType === "record" ? "Record a new payment transaction" :
                       paymentActionType === "link" ? "Create a payment link for customer" :
                       "Create and send payment link via email"}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="px-6 py-6 bg-white dark:bg-gray-800 transition-colors duration-300">
                
                {/* Modern Action Type Tabs */}
                <div className="mb-8">
                  <div className="flex bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-2 border border-green-200 dark:border-green-800">
                    <button
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                        paymentActionType === "record"
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                          : "text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800/30"
                      }`}
                      onClick={() => setPaymentActionType("record")}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="hidden sm:inline">Record Payment</span>
                      <span className="sm:hidden">Record</span>
                    </button>
                    <button
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                        paymentActionType === "link"
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                          : "text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800/30"
                      }`}
                      onClick={() => setPaymentActionType("link")}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span className="hidden sm:inline">Payment Link</span>
                      <span className="sm:hidden">Link</span>
                    </button>
                    <button
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                        paymentActionType === "email"
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                          : "text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800/30"
                      }`}
                      onClick={() => setPaymentActionType("email")}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="hidden sm:inline">Email Link</span>
                      <span className="sm:hidden">Email</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Customer Selection */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 transition-colors duration-300">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Customer *
                      </span>
                    </label>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:border-green-300 dark:hover:border-green-500"
                      value={newPayment.customer_id}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          customer_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Select a customer</option>
                      {Array.isArray(customers) && customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}{" "}
                          {customer.email ? `(${customer.email})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Service field - only for record payment */}
                  {paymentActionType === "record" && (
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 transition-colors duration-300">
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                          Service *
                        </span>
                      </label>
                      <select
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:border-green-300 dark:hover:border-green-500"
                        value={newPayment.service}
                        onChange={(e) =>
                          setNewPayment({
                            ...newPayment,
                            service: e.target.value,
                          })
                        }
                      >
                        <option value="">Select a service</option>
                        {DUMMY_SERVICES.map((service) => (
                          <option key={service} value={service}>
                            {service}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {/* Booking Selection */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 transition-colors duration-300">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      Booking (Optional)
                      </span>
                    </label>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:border-green-300 dark:hover:border-green-500"
                      value={newPayment.booking_id}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          booking_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Select a booking</option>
                      {Array.isArray(filteredBookings) && filteredBookings.map((booking) => (
                        <option key={booking.id} value={booking.id}>
                          {booking.customer_name}{" "}
                          {booking.customer_email
                            ? `(${booking.customer_email})`
                            : ""}{" "}
                          - {booking.service} -{" "}
                          {format(new Date(booking.date), "dd MMM yyyy")}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Amount Field */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 transition-colors duration-300">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        {paymentActionType === "record" ? "Amount" : "Payment Amount"} *
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <span className="text-green-600 font-semibold text-lg">
                          £
                        </span>
                      </div>
                      <input
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:border-green-300 dark:hover:border-green-500 text-lg font-medium"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={newPayment.amount}
                        onChange={(e) =>
                          setNewPayment({
                            ...newPayment,
                            amount: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  {/* Payment Method - only for record payment */}
                  {paymentActionType === "record" && (
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 transition-colors duration-300">
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          Payment Method *
                        </span>
                    </label>
                    <select
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:border-green-300 dark:hover:border-green-500"
                      value={newPayment.payment_method}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          payment_method: e.target.value as any,
                        })
                      }
                    >
                        <option value="cash">💵 Cash</option>
                        <option value="card">💳 Card</option>
                        <option value="bank_transfer">🏦 Bank Transfer</option>
                        <option value="cheque">📄 Cheque</option>
                    </select>
                  </div>
                  )}
                  {/* Payment Date */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 transition-colors duration-300">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      Payment Date
                      </span>
                    </label>
                    <input
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:border-green-300 dark:hover:border-green-500"
                      type="date"
                      value={newPayment.payment_date}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          payment_date: e.target.value,
                        })
                      }
                    />
                  </div>
                  {/* Reference */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 transition-colors duration-300">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      Reference (Optional)
                      </span>
                    </label>
                    <input
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:border-green-300 dark:hover:border-green-500"
                      type="text"
                      value={newPayment.reference}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          reference: e.target.value,
                        })
                      }
                      placeholder="Transaction reference or invoice number"
                    />
                  </div>
                  {/* Notes */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 transition-colors duration-300">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      Notes (Optional)
                      </span>
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:border-green-300 dark:hover:border-green-500 resize-none"
                      rows={3}
                      value={newPayment.notes}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Additional notes or comments"
                    />
                  </div>
                  {formError && (
                    <div className="p-4 mt-4 text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded-lg transition-colors duration-300">
                      {formError}
                    </div>
                  )}
                </div>
              </div>
              {/* Modern Footer */}
              <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-t border-gray-200 dark:border-gray-600">
                <div className="flex gap-3">
                <button
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  onClick={handleCreatePayment}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {paymentActionType === "record" ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      ) : paymentActionType === "link" ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      )}
                    </svg>
                    {paymentActionType === "record" ? "Record Payment" : 
                     paymentActionType === "link" ? "Create Payment Link" : 
                     "Send Payment Link"}
                </button>
                <button
                    className="px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Link Modal - REMOVED - Now using unified modal */}
      {false && showPaymentLinkModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75"
              onClick={() => setShowPaymentLinkModal(false)}
            />
            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full transition-colors duration-300">
              <div className="px-4 pt-5 pb-4 bg-white dark:bg-gray-800 sm:p-6 sm:pb-4 transition-colors duration-300">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white transition-colors duration-300">
                  Create Payment Link
                </h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Customer
                    </label>
                    <select
                      className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      value={paymentLink.customer_id}
                      onChange={(e) =>
                        setPaymentLink({
                          ...paymentLink,
                          customer_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Select a customer</option>
                      {Array.isArray(customers) && customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}{" "}
                          {customer.email ? `(${customer.email})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Booking (Optional)
                    </label>
                    <select
                      className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      value={paymentLink.booking_id}
                      onChange={(e) =>
                        setPaymentLink({
                          ...paymentLink,
                          booking_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Select a booking</option>
                      {Array.isArray(filteredBookingsForLink) && filteredBookingsForLink.map((booking) => (
                        <option key={booking.id} value={booking.id}>
                          {booking.customer_name}{" "}
                          {booking.customer_email
                            ? `(${booking.customer_email})`
                            : ""}{" "}
                          - {booking.service} -{" "}
                          {format(new Date(booking.date), "dd MMM yyyy")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Amount
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400 sm:text-sm transition-colors duration-300">
                          £
                        </span>
                      </div>
                      <input
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                        type="number"
                        step="0.01"
                        min="0"
                        value={paymentLink.amount}
                        onChange={(e) =>
                          setPaymentLink({
                            ...paymentLink,
                            amount: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Description
                    </label>
                    <input
                      className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="text"
                      value={paymentLink.description}
                      onChange={(e) =>
                        setPaymentLink({
                          ...paymentLink,
                          description: e.target.value,
                        })
                      }
                      placeholder="Payment for services"
                    />
                  </div>
                  {formError && (
                    <div className="p-4 mt-4 text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded-lg transition-colors duration-300">
                      {formError}
                    </div>
                  )}
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6 sm:flex sm:flex-row-reverse transition-colors duration-300">
                <button
                  className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-green-600 dark:bg-green-500 border border-transparent rounded-lg shadow-sm hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                  onClick={handleCreatePaymentLink}
                  disabled={processingPayment === "creating"}
                >
                  {processingPayment === "creating" ? (
                    <>
                      <svg
                        className="w-4 h-4 mr-2 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          fill="currentColor"
                        />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    "Create Payment Link"
                  )}
                </button>
                <button
                  className="mt-3 inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-300"
                  onClick={() => setShowPaymentLinkModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Link Result Modal */}
      {showPaymentLinkResult && paymentLinkResult && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75"
              onClick={() => setShowPaymentLinkResult(false)}
            />
            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full transition-colors duration-300">
              <div className="px-4 pt-5 pb-4 bg-white dark:bg-gray-800 sm:p-6 sm:pb-4 transition-colors duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white transition-colors duration-300">
                    Payment Link Created
                  </h3>
                  <button
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
                    onClick={() => setShowPaymentLinkResult(false)}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-green-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                          Payment link created successfully!
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          The link has been copied to your clipboard.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Payment Link
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        readOnly
                        value={paymentLinkResult.payment_link_url}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-l-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      />
                      <button
                        className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-r-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-300"
                        onClick={() =>
                          navigator.clipboard.writeText(
                            paymentLinkResult.payment_link_url
                          )
                        }
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Amount:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        £{paymentLinkResult.payment?.amount}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Currency:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {paymentLinkResult.currency}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Session ID:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white font-mono text-xs">
                        {paymentLinkResult.session_id}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Expires:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {paymentLinkResult.expires_at
                          ? new Date(
                              paymentLinkResult.expires_at * 1000
                            ).toLocaleString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6 sm:flex sm:flex-row-reverse transition-colors duration-300">
                <button
                  className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-300"
                  onClick={() => setShowPaymentLinkResult(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Link Modal - REMOVED - Now using unified modal */}
      {false && showEmailLinkModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75"
              onClick={() => setShowEmailLinkModal(false)}
            />
            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full transition-colors duration-300">
              <div className="px-4 pt-5 pb-4 bg-white dark:bg-gray-800 sm:p-6 sm:pb-4 transition-colors duration-300">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white transition-colors duration-300">
                  Create Payment Link & Send Email
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  This will create a payment link and send it directly to the
                  customer's email address.
                </p>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Customer
                    </label>
                    <select
                      className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      value={emailLink.customer_id}
                      onChange={(e) =>
                        setEmailLink({
                          ...emailLink,
                          customer_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Select a customer</option>
                      {Array.isArray(customers) && customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}{" "}
                          {customer.email ? `(${customer.email})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Booking (Optional)
                    </label>
                    <select
                      className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      value={emailLink.booking_id}
                      onChange={(e) =>
                        setEmailLink({
                          ...emailLink,
                          booking_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Select a booking</option>
                      {Array.isArray(filteredBookingsForEmail) && filteredBookingsForEmail.map((booking) => (
                        <option key={booking.id} value={booking.id}>
                          {booking.customer_name}{" "}
                          {booking.customer_email
                            ? `(${booking.customer_email})`
                            : ""}{" "}
                          - {booking.service} -{" "}
                          {format(new Date(booking.date), "dd MMM yyyy")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Amount
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400 sm:text-sm transition-colors duration-300">
                          £
                        </span>
                      </div>
                      <input
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                        type="number"
                        step="0.01"
                        min="0"
                        value={emailLink.amount}
                        onChange={(e) =>
                          setEmailLink({
                            ...emailLink,
                            amount: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Description
                    </label>
                    <input
                      className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="text"
                      value={emailLink.description}
                      onChange={(e) =>
                        setEmailLink({
                          ...emailLink,
                          description: e.target.value,
                        })
                      }
                      placeholder="Payment for services"
                    />
                  </div>
                  {formError && (
                    <div className="p-4 mt-4 text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded-lg transition-colors duration-300">
                      {formError}
                    </div>
                  )}
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6 sm:flex sm:flex-row-reverse transition-colors duration-300">
                <button
                  className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-orange-600 dark:bg-orange-500 border border-transparent rounded-lg shadow-sm hover:bg-orange-700 dark:hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                  onClick={handleCreateAndSendEmailLink}
                  disabled={processingPayment === "creating_email"}
                >
                  {processingPayment === "creating_email" ? (
                    <>
                      <svg
                        className="w-4 h-4 mr-2 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          fill="currentColor"
                        />
                      </svg>
                      Creating & Sending...
                    </>
                  ) : (
                    "Create & Send Email"
                  )}
                </button>
                <button
                  className="mt-3 inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-300"
                  onClick={() => setShowEmailLinkModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Payment Details
              </h2>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setSelectedPayment(null)}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Customer
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedPayment.customers?.name || "Unknown"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Amount
                  </label>
                  <p className="text-sm text-gray-900">
                    £{selectedPayment.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      selectedPayment.payment_status
                    )}`}
                  >
                    {selectedPayment.payment_status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Method
                  </label>
                  <p className="text-sm text-gray-900 capitalize">
                    {selectedPayment.payment_method.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Date
                  </label>
                  <p className="text-sm text-gray-900">
                    {format(
                      new Date(selectedPayment.payment_date),
                      "dd MMM yyyy"
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Reference
                  </label>
                  <p className="text-sm text-gray-900 break-all">
                    {selectedPayment.reference || "N/A"}
                  </p>
                </div>
              </div>

              {selectedPayment.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Notes
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedPayment.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75"
              onClick={() => setShowEditModal(false)}
            />
            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full transition-colors duration-300">
              <div className="px-4 pt-5 pb-4 bg-white dark:bg-gray-800 sm:p-6 sm:pb-4 transition-colors duration-300">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white transition-colors duration-300">
                  Edit Payment
                </h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Customer
                    </label>
                    <select
                      className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      value={editPayment.customer_id}
                      onChange={(e) =>
                        setEditPayment({
                          ...editPayment,
                          customer_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Select a customer</option>
                      {Array.isArray(customers) && customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}{" "}
                          {customer.email ? `(${customer.email})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Service
                    </label>
                    <select
                      className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      value={editPayment.service}
                      onChange={(e) =>
                        setEditPayment({
                          ...editPayment,
                          service: e.target.value,
                        })
                      }
                    >
                      <option value="">Select a service</option>
                      {DUMMY_SERVICES.map((service) => (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Booking (Optional)
                    </label>
                    <select
                      className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      value={editPayment.booking_id}
                      onChange={(e) =>
                        setEditPayment({
                          ...editPayment,
                          booking_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Select a booking</option>
                      {bookings
                        .filter(
                          (booking) =>
                            booking.customer_id === editPayment.customer_id
                        )
                        .map((booking) => (
                          <option key={booking.id} value={booking.id}>
                            {booking.customer_name}{" "}
                            {booking.customer_email
                              ? `(${booking.customer_email})`
                              : ""}{" "}
                            - {booking.service} -{" "}
                            {format(new Date(booking.date), "dd MMM yyyy")}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Amount
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400 sm:text-sm transition-colors duration-300">
                          £
                        </span>
                      </div>
                      <input
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                        type="number"
                        step="0.01"
                        min="0"
                        value={editPayment.amount}
                        onChange={(e) =>
                          setEditPayment({
                            ...editPayment,
                            amount: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Payment Method
                    </label>
                    <select
                      className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      value={editPayment.payment_method}
                      onChange={(e) =>
                        setEditPayment({
                          ...editPayment,
                          payment_method: e.target.value as any,
                        })
                      }
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Payment Status
                    </label>
                    <select
                      className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      value={editPayment.payment_status}
                      onChange={(e) =>
                        setEditPayment({
                          ...editPayment,
                          payment_status: e.target.value as any,
                        })
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Payment Date
                    </label>
                    <input
                      className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="date"
                      value={editPayment.payment_date}
                      onChange={(e) =>
                        setEditPayment({
                          ...editPayment,
                          payment_date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Reference (Optional)
                    </label>
                    <input
                      className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="text"
                      value={editPayment.reference}
                      onChange={(e) =>
                        setEditPayment({
                          ...editPayment,
                          reference: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Notes (Optional)
                    </label>
                    <textarea
                      className="w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      rows={3}
                      value={editPayment.notes}
                      onChange={(e) =>
                        setEditPayment({
                          ...editPayment,
                          notes: e.target.value,
                        })
                      }
                    />
                  </div>
                  {formError && (
                    <div className="p-4 mt-4 text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded-lg transition-colors duration-300">
                      {formError}
                    </div>
                  )}
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6 sm:flex sm:flex-row-reverse transition-colors duration-300">
                <button
                  className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                  onClick={handleUpdatePayment}
                  disabled={processingPayment === "updating"}
                >
                  {processingPayment === "updating" ? (
                    <>
                      <svg
                        className="w-4 h-4 mr-2 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          fill="currentColor"
                        />
                      </svg>
                      Updating...
                    </>
                  ) : (
                    "Update Payment"
                  )}
                </button>
                <button
                  className="mt-3 inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-300"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && paymentToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75"
              onClick={() => !deletingPayment && setShowDeleteModal(false)}
            />
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                  <svg
                    className="h-6 w-6 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Delete Payment
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Are you sure you want to delete this payment? This action
                      cannot be undone.
                    </p>
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Payment Details:
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Customer:{" "}
                          {paymentToDelete.customers?.name || "Unknown"}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Amount: £{paymentToDelete.amount.toFixed(2)}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Method:{" "}
                          {paymentToDelete.payment_method.replace("_", " ")}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Date:{" "}
                          {format(
                            new Date(paymentToDelete.payment_date),
                            "dd MMM yyyy"
                          )}
                        </p>
                        {paymentToDelete.reference && (
                          <p className="text-gray-600 dark:text-gray-400">
                            Reference: {paymentToDelete.reference}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={confirmDeletePayment}
                  disabled={deletingPayment}
                >
                  {deletingPayment ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    "Delete Payment"
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deletingPayment}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { CreateInvoiceModal } from "@/components/CreateInvoiceModal";
import { EditInvoiceModal } from "@/components/EditInvoiceModal";
import { SendInvoiceModal } from "@/components/SendInvoiceModal";
import { InvoiceDetailsModal } from "@/components/InvoiceDetailsModal";
import { useToast, ToastMessages } from "@/components/Toast";
import { useConfirmation } from "@/hooks/useConfirmation";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { useVATSettings } from "@/hooks/useVATSettings";
import Pagination from "@/components/Pagination";
import { generateInvoicePDF } from "@/lib/invoice-pdf-generator";

import Tooltip from "../../../components/Tooltip";
import { Invoice as BaseInvoice, Customer, Booking } from "@/types";

// Extended Invoice type with nested customer and booking data for display
type Invoice = BaseInvoice & {
  customer?: {
    name: string;
    email: string;
    address: string;
    phone: string;
  };
  booking?: {
    service: string;
    date: string;
    time: string;
    description?: string;
  };
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "cards">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("invoices-view-mode") as "table" | "cards") || "table";
    }
    return "table";
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(10);
  
  const { profile: dbProfile } = useAdminProfile();
  const { showSuccess, showError } = useToast();
  const { confirm, modalProps } = useConfirmation();
  const { settings: vatSettings } = useVATSettings();

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (page: number = 1) => {
    try {
      setLoading(true);
      const [invoicesRes, customersRes, bookingsRes] = await Promise.all([
        fetch(`/api/invoices?page=${page}&limit=${limit}`),
        fetch("/api/customers"),
        fetch("/api/bookings"),
      ]);

      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        console.log("Invoices API response:", invoicesData);
        
        // Parse image_attachments if they're strings
        const processedInvoices = (invoicesData.invoices || []).map((invoice: any) => {
          if (invoice.image_attachments && typeof invoice.image_attachments === 'string') {
            try {
              invoice.image_attachments = JSON.parse(invoice.image_attachments);
            } catch (e) {
              console.error('Error parsing image_attachments:', e);
              invoice.image_attachments = [];
            }
          }
          return invoice;
        });
        
        console.log("Processed invoices:", processedInvoices);
        setInvoices(processedInvoices);
        setTotalPages(invoicesData.pagination?.totalPages || 1);
        setTotalCount(invoicesData.pagination?.totalCount || 0);
        setCurrentPage(invoicesData.pagination?.page || 1);
      }

      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomers(customersData.customers || []);
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        console.log("Bookings data:", bookingsData); // Debug log
        const bookingsArray = bookingsData.bookings || bookingsData || [];
        console.log("Bookings array:", bookingsArray);
        console.log("First booking:", bookingsArray[0]);
        setBookings(bookingsArray);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      showError(ToastMessages.general.error.title, ToastMessages.general.error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    await loadData(page);
  };

  const handleViewModeChange = (mode: "table" | "cards") => {
    setViewMode(mode);
    localStorage.setItem("invoices-view-mode", mode);
  };

  const handleCreateInvoice = async (invoiceData: FormData) => {
    try {
      setCreatingInvoice(true);
      
      const response = await fetch("/api/invoices", {
        method: "POST",
        body: invoiceData, // No need for Content-Type header with FormData
      });

      if (response.ok) {
        await loadData(); // Reload invoices
        setShowCreateModal(false);
        showSuccess(ToastMessages.invoices.created.title, ToastMessages.invoices.created.message);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to create invoice");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      showError(ToastMessages.invoices.error.title, error instanceof Error ? error.message : ToastMessages.invoices.error.message);
    } finally {
      setCreatingInvoice(false);
    }
  };

  const handleSendInvoice = async (includePaymentLink: boolean, currency: string = "gbp") => {
    if (!selectedInvoice) return;

    try {
      setSendingId(selectedInvoice.id);
      
      const response = await fetch(`/api/invoices/${selectedInvoice.id}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ includePaymentLink, currency }),
      });

      if (response.ok) {
        const result = await response.json();
        await loadData(); // Reload invoices to update status
        setShowSendModal(false);
        setSelectedInvoice(null);
        
        const message = includePaymentLink 
          ? `Invoice sent with payment link (${currency.toUpperCase()}) to ${result.recipient}`
          : `Invoice sent to ${result.recipient}`;
        
        showSuccess(ToastMessages.invoices.emailSent.title, message);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to send invoice");
      }
    } catch (error) {
      console.error("Error sending invoice:", error);
      showError(ToastMessages.invoices.error.title, error instanceof Error ? error.message : ToastMessages.invoices.error.message);
    } finally {
      setSendingId(null);
    }
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    setDownloadingId(invoice.id);
    try {
      const pdfBuffer = generateInvoicePDF(invoice, vatSettings);
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${invoice.invoice_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showSuccess(ToastMessages.invoices.downloaded.title, ToastMessages.invoices.downloaded.message);
    } catch (error) {
      console.error("Error generating PDF:", error);
      showError(ToastMessages.invoices.error.title, ToastMessages.invoices.error.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleEditInvoice = async (invoiceId: string, invoiceData: FormData) => {
    try {
      setEditingInvoice(true);
      
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PUT",
        body: invoiceData,
      });

      if (response.ok) {
        await loadData(); // Reload invoices
        setShowEditModal(false);
        setSelectedInvoice(null);
        showSuccess("Invoice Updated", "The invoice has been updated successfully.");
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to update invoice");
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      showError("Update Failed", error instanceof Error ? error.message : "Failed to update invoice");
    } finally {
      setEditingInvoice(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      await confirm(
        {
          title: "Delete Invoice",
          message: "Are you sure you want to delete this invoice? This action cannot be undone.",
          confirmText: "Delete",
          cancelText: "Cancel",
          isDestructive: true,
        },
        async () => {
          setDeletingId(invoiceId);
          const response = await fetch(`/api/invoices/${invoiceId}`, {
            method: "DELETE",
          });

          if (response.ok) {
            showSuccess("Success", "Invoice deleted successfully!");
            loadData(currentPage);
          } else {
            const error = await response.json();
            showError("Error", error.error || "Failed to delete invoice");
          }
        }
      );
    } catch (error) {
      showError("Error", "Failed to delete invoice");
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewDetails = (invoice: Invoice) => {
    console.log("Viewing details for invoice:", invoice);
    console.log("Image attachments:", invoice.image_attachments);
    setViewingInvoice(invoice);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-300";
      case "sent":
        return "bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-300";
      case "paid":
        return "bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-300";
      case "overdue":
        return "bg-red-100 dark:bg-red-800/50 text-red-800 dark:text-red-300";
      case "cancelled":
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: Invoice["status"]) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "sent":
        return "📧";
      case "paid":
        return "✅";
      case "overdue":
        return "⚠️";
      case "cancelled":
        return "❌";
      default:
        return "❓";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            Invoices
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
            Manage and generate UK-compliant invoices for your services
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 transition-colors duration-300">
            <button
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                viewMode === "table"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
              onClick={() => handleViewModeChange("table")}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18m-9 8h9m-9 4h9m-9-8h9" />
              </svg>
              Table
            </button>
            <button
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                viewMode === "cards"
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
              onClick={() => handleViewModeChange("cards")}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
              </svg>
              Cards
            </button>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Create Invoice</span>
            <span className="sm:hidden">Create</span>
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      {viewMode === "table" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium">No invoices yet</p>
                        <p className="text-sm">Create your first invoice to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {invoice.invoice_number}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {format(new Date(invoice.invoice_date), "dd/MM/yyyy")}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {invoice.customer?.name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {invoice.customer?.email || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {invoice.booking?.service || "Manual Entry"}
                        </div>
                        {invoice.booking?.date && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {format(new Date(invoice.booking.date), "dd/MM/yyyy")}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          £{invoice.total_amount.toFixed(2)}
                        </div>
                        {vatSettings?.is_enabled && invoice.vat_amount > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          VAT: £{invoice.vat_amount.toFixed(2)}
                        </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          <span className="mr-1">{getStatusIcon(invoice.status)}</span>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {invoice.due_date ? format(new Date(invoice.due_date), "dd/MM/yyyy") : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Download PDF Button */}
                          <Tooltip content="Download PDF">
                            <button
                              onClick={() => handleDownloadInvoice(invoice)}
                              disabled={downloadingId === invoice.id}
                              className="group relative p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {downloadingId === invoice.id ? (
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              )}
                            </button>
                          </Tooltip>

                          {/* Send Email Button */}
                          <Tooltip content="Send via Email">
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setShowSendModal(true);
                              }}
                              disabled={sendingId === invoice.id}
                              className="group relative p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {sendingId === invoice.id ? (
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              )}
                            </button>
                          </Tooltip>

                          {/* View Button */}
                          <Tooltip content="View Details">
                            <button
                              onClick={() => handleViewDetails(invoice)}
                              className="group relative p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                            >
                              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </Tooltip>

                          {/* Edit Button */}
                          <Tooltip content="Edit Invoice">
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setShowEditModal(true);
                              }}
                              disabled={editingInvoice}
                              className="group relative p-2 text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </Tooltip>

                          {/* Delete Button */}
                          <Tooltip content="Delete Invoice">
                            <button
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              disabled={deletingId === invoice.id}
                              className="group relative p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {deletingId === invoice.id ? (
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cards View */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invoices.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium">No invoices yet</p>
                <p className="text-sm">Create your first invoice to get started</p>
              </div>
            </div>
          ) : (
            invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                      {invoice.invoice_number}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      {format(new Date(invoice.invoice_date), "dd MMM yyyy")}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                    <span className="mr-1">{getStatusIcon(invoice.status)}</span>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                    <svg className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="truncate">{invoice.customer?.name || "N/A"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                    <svg className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="truncate">{invoice.booking?.service || "Manual Entry"}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                    <svg className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span className="font-medium text-gray-900 dark:text-white">£{invoice.total_amount.toFixed(2)}</span>
                    {vatSettings?.is_enabled && invoice.vat_amount > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        (VAT: £{invoice.vat_amount.toFixed(2)})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Tooltip content="Download PDF">
                  <button
                      className="p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-300"
                    onClick={() => handleDownloadInvoice(invoice)}
                    disabled={downloadingId === invoice.id}
                  >
                    {downloadingId === invoice.id ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    )}
                  </button>
                  </Tooltip>
                  <Tooltip content="Send via Email">
                  <button
                      className="p-2 bg-green-600 dark:bg-green-500 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-300"
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setShowSendModal(true);
                      }}
                      disabled={sendingId === invoice.id}
                    >
                      {sendingId === invoice.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </Tooltip>
                  {/* View Button */}
                  <Tooltip content="View Details">
                    <button
                      onClick={() => handleViewDetails(invoice)}
                      className="p-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </Tooltip>
                  <Tooltip content="Edit Invoice">
                    <button
                      className="p-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
                    onClick={() => {
                      setSelectedInvoice(invoice);
                      setShowEditModal(true);
                    }}
                    disabled={editingInvoice}
                  >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                  </button>
                  </Tooltip>
                  <Tooltip content="Delete Invoice">
                    <button
                      className="p-2 bg-red-600 dark:bg-red-500 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors duration-300"
                      onClick={() => handleDeleteInvoice(invoice.id)}
                      disabled={deletingId === invoice.id}
                    >
                      {deletingId === invoice.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </Tooltip>
                </div>
              </div>
            ))
          )}
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

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateInvoice}
        customers={customers}
        bookings={bookings}
        isLoading={creatingInvoice}
      />

      {/* Edit Invoice Modal */}
      <EditInvoiceModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedInvoice(null);
        }}
        onSubmit={handleEditInvoice}
        invoice={selectedInvoice}
        customers={customers}
        bookings={bookings}
        isLoading={editingInvoice}
      />

      {/* Send Invoice Modal */}
      {selectedInvoice && (
        <SendInvoiceModal
          isOpen={showSendModal}
          onClose={() => {
            setShowSendModal(false);
            setSelectedInvoice(null);
          }}
          onConfirm={handleSendInvoice}
          invoice={selectedInvoice}
          isLoading={sendingId === selectedInvoice.id}
        />
      )}

      {/* Invoice Details Modal */}
      <InvoiceDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setViewingInvoice(null);
        }}
        invoice={viewingInvoice}
        adminProfile={dbProfile}
        vatSettings={vatSettings}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal {...modalProps} />
    </div>
  );
}
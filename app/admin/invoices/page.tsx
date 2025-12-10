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
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Table2, Grid3x3, Plus, Download, Mail, Eye, Edit, Trash2 } from "lucide-react";

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

  const getStatusColor = (status: Invoice["status"]): "success" | "warning" | "danger" | "default" | "primary" => {
    switch (status) {
      case "paid":
        return "success";
      case "sent":
        return "primary";
      case "pending":
        return "warning";
      case "overdue":
      case "cancelled":
        return "danger";
      default:
        return "default";
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
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-default-100 rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === "table" ? "solid" : "light"}
              color={viewMode === "table" ? "primary" : "default"}
              startContent={<Table2 className="w-4 h-4" />}
              onPress={() => handleViewModeChange("table")}
              className="min-w-0"
            >
              Table
            </Button>
            <Button
              size="sm"
              variant={viewMode === "cards" ? "solid" : "light"}
              color={viewMode === "cards" ? "primary" : "default"}
              startContent={<Grid3x3 className="w-4 h-4" />}
              onPress={() => handleViewModeChange("cards")}
              className="min-w-0"
            >
              Cards
            </Button>
          </div>
          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onPress={() => setShowCreateModal(true)}
          >
            <span className="hidden sm:inline">Create Invoice</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </div>
      </div>

      {/* Invoices Table */}
      {viewMode === "table" && (
        <Card className="border border-divider">
          <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-divider">
              <thead className="bg-default-100 border-b border-divider">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
                    Invoice
                  </th>
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-default-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-default-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-default-500">
                        <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-semibold mb-2">No invoices yet</p>
                        <p className="text-sm mb-4">Create your first invoice to get started</p>
                        <Button
                          color="primary"
                          startContent={<Plus className="w-4 h-4" />}
                          onPress={() => setShowCreateModal(true)}
                        >
                          Create Invoice
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-default-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {invoice.invoice_number}
                          </div>
                          <div className="text-sm text-default-500">
                            {format(new Date(invoice.invoice_date), "dd/MM/yyyy")}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {invoice.customer?.name || "N/A"}
                          </div>
                          <div className="text-sm text-default-500">
                            {invoice.customer?.email || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-foreground">
                          {invoice.booking?.service || "Manual Entry"}
                        </div>
                        {invoice.booking?.date && (
                          <div className="text-sm text-default-500">
                            {format(new Date(invoice.booking.date), "dd/MM/yyyy")}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">
                          £{invoice.total_amount.toFixed(2)}
                        </div>
                        {vatSettings?.is_enabled && invoice.vat_amount > 0 && (
                        <div className="text-xs text-default-500">
                          VAT: £{invoice.vat_amount.toFixed(2)}
                        </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Chip
                          color={getStatusColor(invoice.status)}
                          variant="flat"
                          size="sm"
                        >
                          <span className="mr-1">{getStatusIcon(invoice.status)}</span>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Chip>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-default-500">
                        {invoice.due_date ? format(new Date(invoice.due_date), "dd/MM/yyyy") : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Tooltip content="Download PDF">
                            <Button
                              isIconOnly
                              variant="light"
                              size="sm"
                              onPress={() => handleDownloadInvoice(invoice)}
                              isLoading={downloadingId === invoice.id}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Send via Email">
                            <Button
                              isIconOnly
                              variant="light"
                              color="success"
                              size="sm"
                              onPress={() => {
                                setSelectedInvoice(invoice);
                                setShowSendModal(true);
                              }}
                              isLoading={sendingId === invoice.id}
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="View Details">
                            <Button
                              isIconOnly
                              variant="light"
                              color="primary"
                              size="sm"
                              onPress={() => handleViewDetails(invoice)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Edit Invoice">
                            <Button
                              isIconOnly
                              variant="light"
                              color="warning"
                              size="sm"
                              onPress={() => {
                                setSelectedInvoice(invoice);
                                setShowEditModal(true);
                              }}
                              isDisabled={editingInvoice}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Delete Invoice">
                            <Button
                              isIconOnly
                              variant="light"
                              color="danger"
                              size="sm"
                              onPress={() => handleDeleteInvoice(invoice.id)}
                              isLoading={deletingId === invoice.id}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
      )}

      {/* Cards View */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {invoices.length === 0 ? (
            <Card className="col-span-full border border-divider">
              <CardBody className="p-12 text-center">
                <div className="text-default-500">
                <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                  <p className="text-lg font-semibold mb-2">No invoices yet</p>
                  <p className="text-sm mb-4">Create your first invoice to get started</p>
                  <Button
                    color="primary"
                    startContent={<Plus className="w-4 h-4" />}
                    onPress={() => setShowCreateModal(true)}
                  >
                    Create Invoice
                  </Button>
              </div>
              </CardBody>
            </Card>
          ) : (
            invoices.map((invoice) => (
              <Card key={invoice.id} className="border border-divider hover:shadow-lg transition-shadow">
                <CardBody className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">
                      {invoice.invoice_number}
                    </h3>
                    <p className="text-sm text-default-500">
                      {format(new Date(invoice.invoice_date), "dd MMM yyyy")}
                    </p>
                  </div>
                  <Chip
                    color={getStatusColor(invoice.status)}
                    variant="flat"
                    size="sm"
                  >
                    <span className="mr-1">{getStatusIcon(invoice.status)}</span>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Chip>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-default-600">
                    <svg className="w-4 h-4 mr-2 text-default-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="truncate">{invoice.customer?.name || "N/A"}</span>
                  </div>
                  <div className="flex items-center text-sm text-default-600">
                    <svg className="w-4 h-4 mr-2 text-default-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="truncate">{invoice.booking?.service || "Manual Entry"}</span>
                  </div>
                  <div className="flex items-center text-sm text-default-600">
                    <svg className="w-4 h-4 mr-2 text-default-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span className="font-semibold">£{invoice.total_amount.toFixed(2)}</span>
                    {vatSettings?.is_enabled && invoice.vat_amount > 0 && (
                      <span className="text-xs text-default-500 ml-1">
                        (VAT: £{invoice.vat_amount.toFixed(2)})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-divider">
                  <Tooltip content="Download PDF">
                    <Button
                      isIconOnly
                      variant="bordered"
                      size="sm"
                      onPress={() => handleDownloadInvoice(invoice)}
                      isLoading={downloadingId === invoice.id}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Send via Email">
                    <Button
                      isIconOnly
                      color="success"
                      size="sm"
                      onPress={() => {
                        setSelectedInvoice(invoice);
                        setShowSendModal(true);
                      }}
                      isLoading={sendingId === invoice.id}
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="View Details">
                    <Button
                      isIconOnly
                      color="primary"
                      size="sm"
                      onPress={() => handleViewDetails(invoice)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Edit Invoice">
                    <Button
                      isIconOnly
                      color="warning"
                      size="sm"
                      onPress={() => {
                      setSelectedInvoice(invoice);
                      setShowEditModal(true);
                    }}
                      isDisabled={editingInvoice}
                  >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Delete Invoice">
                    <Button
                      isIconOnly
                      color="danger"
                      size="sm"
                      onPress={() => handleDeleteInvoice(invoice.id)}
                      isLoading={deletingId === invoice.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                </div>
              </CardBody>
            </Card>
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
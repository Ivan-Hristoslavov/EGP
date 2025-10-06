"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Invoice, ImageAttachment, AdminProfile } from "@/types";

interface InvoiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  adminProfile?: AdminProfile | null;
  vatSettings?: { is_enabled: boolean; vat_rate: number } | null;
}

export function InvoiceDetailsModal({ isOpen, onClose, invoice, adminProfile, vatSettings }: InvoiceDetailsModalProps) {
  const [selectedImage, setSelectedImage] = useState<ImageAttachment | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  if (!isOpen || !invoice) {
    return null;
  }

  // Use business email from admin profile if available, otherwise fall back to invoice company_email
  const displayEmail = adminProfile?.business_email || invoice.company_email;

  const handleImageClick = (image: ImageAttachment) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
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

  return (
    <>
      {/* Main Invoice Details Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Invoice Details - {invoice.invoice_number}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Created on {format(new Date(invoice.created_at), "dd MMM yyyy")}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Invoice Details */}
              <div className="space-y-6">
                {/* Status */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</h4>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                    <span className="mr-2">{getStatusIcon(invoice.status)}</span>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </div>

                {/* Invoice Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Invoice Information</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Invoice Number:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{invoice.invoice_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Invoice Date:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {format(new Date(invoice.invoice_date), "dd MMM yyyy")}
                      </span>
                    </div>
                    {invoice.due_date && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Due Date:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {format(new Date(invoice.due_date), "dd MMM yyyy")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Information</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                    {invoice.customer && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Name:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{invoice.customer.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{invoice.customer.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Address:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white break-words max-w-xs text-right">{invoice.customer.address}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Company Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Information</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Company:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{invoice.company_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Address:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white break-words max-w-xs text-right">{invoice.company_address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Phone:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{invoice.company_phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{displayEmail}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Financial Details & Images */}
              <div className="space-y-6">
                {/* Financial Details */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Financial Details</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                    {vatSettings?.is_enabled && invoice.vat_amount > 0 ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">£{invoice.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">VAT Rate:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{invoice.vat_rate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">VAT Amount:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">£{invoice.vat_amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Total:</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">£{invoice.total_amount.toFixed(2)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Total Amount:</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">£{invoice.total_amount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Service Details */}
                {(invoice.manual_service || invoice.booking) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Service Details</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                      {invoice.manual_service && (
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Service:</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{invoice.manual_service}</div>
                        </div>
                      )}
                      {invoice.manual_description && (
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Description:</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white break-words whitespace-pre-wrap max-w-full overflow-hidden">
                            {invoice.manual_description}
                          </div>
                        </div>
                      )}
                      {invoice.booking && (
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Booking Service:</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{invoice.booking.service}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {invoice.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-900 dark:text-white break-words whitespace-pre-wrap max-w-full overflow-hidden">
                        {invoice.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Images Section - Full Width */}
            {invoice.image_attachments && invoice.image_attachments.length > 0 && (
              <div className="mt-8">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Attached Images ({invoice.image_attachments.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-96 overflow-y-auto">
                  {invoice.image_attachments.map((image: ImageAttachment, index: number) => (
                    <div
                      key={index}
                      className="relative group cursor-pointer"
                      onClick={() => handleImageClick(image)}
                    >
                      <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
                        <img
                          src={image.path}
                          alt={image.filename}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                        {image.filename}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedImage.filename}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Invoice: {invoice.invoice_number}
                </p>
              </div>
              <button
                onClick={handleCloseImageModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Image */}
            <div className="flex-1 p-6">
              <div className="flex items-center justify-center min-h-[400px] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <img
                  src={selectedImage.path}
                  alt={selectedImage.filename}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </div>

            {/* Image Details */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedImage.filename}
                  </h4>
                  {selectedImage.originalSize && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Size: {(selectedImage.originalSize / 1024 / 1024).toFixed(1)}MB
                    </div>
                  )}
                </div>
                <a
                  href={selectedImage.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in new tab
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 
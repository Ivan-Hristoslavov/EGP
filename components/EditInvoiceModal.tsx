"use client";

import { useState, useEffect } from "react";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { Customer, Booking, Invoice } from "@/types";
import { useVATSettings } from "@/hooks/useVATSettings";
import { getSupportedFormatsText, processImageFile } from "@/lib/image-utils";

interface EditInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (invoiceId: string, invoiceData: FormData) => Promise<void>;
  invoice: Invoice | null;
  customers: Customer[];
  bookings: Booking[];
  isLoading?: boolean;
}

export function EditInvoiceModal({
  isOpen,
  onClose,
  onSubmit,
  invoice,
  customers,
  bookings,
  isLoading = false
}: EditInvoiceModalProps) {
  const { profile: dbProfile } = useAdminProfile();
  const { settings: vatSettings, loading: vatLoading } = useVATSettings();
  const [formData, setFormData] = useState({
    customer_id: "",
    booking_id: "",
    invoice_date: "",
    due_date: "",
    notes: "",
    // Manual entry fields
    manual_service: "",
    manual_amount: "",
    manual_description: ""
  });
  const [attachedImages, setAttachedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<{ filename: string; path: string; originalSize?: number; compressedSize?: number; compressionRatio?: number }[]>([]);
  const [replacingImageIndex, setReplacingImageIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [useManualEntry, setUseManualEntry] = useState(false);

  // Initialize form data when invoice changes
  useEffect(() => {
    if (invoice) {
      setFormData({
        customer_id: invoice.customer_id || "",
        booking_id: invoice.booking_id || "",
        invoice_date: invoice.invoice_date.split('T')[0],
        due_date: invoice.due_date ? invoice.due_date.split('T')[0] : "",
        notes: invoice.notes || "",
        manual_service: invoice.manual_service || "",
        manual_amount: invoice.total_amount.toString(),
        manual_description: invoice.manual_description || ""
      });
      setUseManualEntry(!invoice.booking_id);
      
      // Set existing images from invoice
      if (invoice.image_attachments && Array.isArray(invoice.image_attachments)) {
        setExistingImages(invoice.image_attachments);
      } else {
        setExistingImages([]);
      }
    }
  }, [invoice]);

  // Filter bookings for selected customer - show completed and scheduled bookings
  const filteredBookings = formData.customer_id
    ? bookings.filter(b => {
        // First try to match by customer_id if it exists
        if (b.customer_id === formData.customer_id) {
          return b.status === "completed" || b.status === "scheduled";
        }
        // If no customer_id, try to match by email
        const selectedCustomer = customers.find(c => c.id === formData.customer_id);
        if (selectedCustomer && b.customer_email === selectedCustomer.email) {
          return b.status === "completed" || b.status === "scheduled";
        }
        return false;
      })
    : [];

  const selectedCustomer = customers.find(c => c.id === formData.customer_id);
  const selectedBooking = bookings.find(b => b.id === formData.booking_id);

  // Calculate amounts
  const getAmount = () => {
    if (useManualEntry) {
      return parseFloat(formData.manual_amount) || 0;
    }
    return selectedBooking?.amount || 0;
  };

  // Calculate amounts with VAT consideration
  const calculateTotals = () => {
    const amount = getAmount();
    
    if (!vatSettings?.is_enabled) {
      return {
        subtotal: amount,
        vatAmount: 0,
        totalAmount: amount
      };
    }
    
    const vatRate = vatSettings.vat_rate || 20;
    const subtotal = Number((amount / (1 + vatRate / 100)).toFixed(2));
    const vatAmount = Number((amount - subtotal).toFixed(2));
    
    return {
      subtotal,
      vatAmount,
      totalAmount: amount
    };
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Process each file with HEIC support
    const processedFiles: File[] = [];
    
    for (const file of files) {
      try {
        const processedImage = await processImageFile(file, 10);
        processedFiles.push(processedImage.file);
        
        console.log('Image processing result:', {
          originalType: processedImage.originalType,
          finalType: processedImage.finalType,
          wasConverted: processedImage.wasConverted,
          fileName: processedImage.file.name
        });
      } catch (error) {
        console.error('Error processing image:', error);
        setErrors(prev => ({ 
          ...prev, 
          images: error instanceof Error ? error.message : 'Failed to process image' 
        }));
        return;
      }
    }

    // Limit to 5 images total
    const totalImages = attachedImages.length + processedFiles.length;
    if (totalImages > 5) {
      setErrors(prev => ({ ...prev, images: 'Maximum 5 images allowed' }));
      return;
    }

    setAttachedImages(prev => [...prev, ...processedFiles]);
    setErrors(prev => ({ ...prev, images: '' }));
  };

  const removeImage = (index: number) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleReplaceImage = (index: number) => {
    setReplacingImageIndex(index);
    // Create a hidden file input for replacement
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    // Set a timeout to reset the state if no file is selected
    const timeoutId = setTimeout(() => {
      setReplacingImageIndex(null);
    }, 1000); // 1 second timeout
    
    input.onchange = (e) => {
      clearTimeout(timeoutId);
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        // Remove the existing image and add the new one
        setExistingImages(prev => prev.filter((_, i) => i !== index));
        setAttachedImages(prev => [...prev, file]);
      }
      setReplacingImageIndex(null);
    };
    
    input.click();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_id) {
      newErrors.customer_id = "Please select a customer";
    }

    if (!useManualEntry && !formData.booking_id) {
      newErrors.booking_id = "Please select a booking or use manual entry";
    }

    if (useManualEntry) {
      if (!formData.manual_service.trim()) {
        newErrors.manual_service = "Service description is required";
      }
      if (!formData.manual_amount || parseFloat(formData.manual_amount) <= 0) {
        newErrors.manual_amount = "Valid amount is required";
      }
    }

    if (!formData.invoice_date) {
      newErrors.invoice_date = "Invoice date is required";
    }

    if (!formData.due_date) {
      newErrors.due_date = "Due date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !invoice) {
      return;
    }

    const { subtotal, vatAmount, totalAmount } = calculateTotals();

    // Create FormData object to handle file uploads
    const formDataToSend = new FormData();
    
    // Add all form fields
    formDataToSend.append('customer_id', formData.customer_id);
    formDataToSend.append('booking_id', useManualEntry ? '' : formData.booking_id);
    formDataToSend.append('invoice_date', formData.invoice_date);
    formDataToSend.append('due_date', formData.due_date);
    formDataToSend.append('subtotal', subtotal.toString());
    formDataToSend.append('vat_rate', vatSettings?.is_enabled ? (vatSettings.vat_rate || 0).toString() : '0');
    formDataToSend.append('vat_amount', vatAmount.toString());
    formDataToSend.append('total_amount', totalAmount.toString());
            formDataToSend.append('company_name', dbProfile?.company_name || "EGP");
    formDataToSend.append('company_address', dbProfile?.company_address || "London, UK");
    formDataToSend.append('company_phone', dbProfile?.phone || "+44 7700 123456");
    formDataToSend.append('company_email', dbProfile?.business_email || dbProfile?.email || "");
    formDataToSend.append('company_vat_number', vatSettings?.is_enabled ? (vatSettings.vat_number || "") : "");
    formDataToSend.append('notes', formData.notes || '');

    // Manual entry data
    if (useManualEntry) {
      formDataToSend.append('manual_service', formData.manual_service);
      formDataToSend.append('manual_description', formData.manual_description);
    }

    // Add new images
    attachedImages.forEach((file, index) => {
      formDataToSend.append(`images`, file);
    });

    // Add remaining existing images (those not deleted)
    if (existingImages.length > 0) {
      formDataToSend.append('existing_images', JSON.stringify(existingImages));
    }

    await onSubmit(invoice.id, formDataToSend);
  };

  const resetForm = () => {
    setFormData({
      customer_id: "",
      booking_id: "",
      invoice_date: "",
      due_date: "",
      notes: "",
      manual_service: "",
      manual_amount: "",
      manual_description: ""
    });
    setAttachedImages([]);
    setExistingImages([]);
    setReplacingImageIndex(null);
    setErrors({});
    setUseManualEntry(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen || !invoice) return null;

  const { subtotal, vatAmount, totalAmount } = calculateTotals();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit Invoice {invoice.invoice_number}
            </h3>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Business Info Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              EGP Business Info
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-blue-800 dark:text-blue-200">
              <div>
                <strong>Company:</strong> {dbProfile?.company_name || "EGP"}
              </div>
              <div>
                <strong>Phone:</strong> {dbProfile?.phone || "+44 7700 123456"}
              </div>
              <div>
                <strong>Email:</strong> {dbProfile?.business_email || ""}
              </div>
              {vatSettings?.is_enabled && (
                <div>
                  <strong>VAT:</strong> {vatSettings.vat_number || "N/A"}
                </div>
              )}
            </div>
          </div>

          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Customer *
            </label>
            <select
              value={formData.customer_id}
              onChange={(e) => {
                setFormData({ ...formData, customer_id: e.target.value, booking_id: "" });
                setErrors(prev => ({ ...prev, customer_id: '', booking_id: '' }));
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.customer_id 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              disabled={isLoading}
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.email})
                </option>
              ))}
            </select>
            {errors.customer_id && (
              <p className="text-red-500 text-xs mt-1">{errors.customer_id}</p>
            )}
          </div>

          {/* Booking Selection or Manual Entry */}
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!useManualEntry}
                  onChange={() => setUseManualEntry(false)}
                  className="mr-2"
                  disabled={isLoading}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select from existing bookings
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={useManualEntry}
                  onChange={() => setUseManualEntry(true)}
                  className="mr-2"
                  disabled={isLoading}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Manual entry
                </span>
              </label>
            </div>

            {!useManualEntry ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Booking *
                </label>
                <select
                  value={formData.booking_id}
                  onChange={(e) => {
                    setFormData({ ...formData, booking_id: e.target.value });
                    setErrors(prev => ({ ...prev, booking_id: '' }));
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.booking_id 
                      ? 'border-red-300 dark:border-red-600' 
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  disabled={isLoading || !formData.customer_id}
                >
                  <option value="">Select a booking</option>
                  {filteredBookings.map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      {booking.service} - {new Date(booking.date).toLocaleDateString()} - £{booking.amount.toFixed(2)} ({booking.status})
                    </option>
                  ))}
                </select>
                {errors.booking_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.booking_id}</p>
                )}
                {formData.customer_id && filteredBookings.length === 0 && (
                  <p className="text-yellow-600 text-xs mt-1">
                    No available bookings found for this customer. Use manual entry instead.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Service Description *
                  </label>
                  <input
                    type="text"
                    value={formData.manual_service}
                    onChange={(e) => setFormData({ ...formData, manual_service: e.target.value })}
                    placeholder="e.g., Emergency pipe repair"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.manual_service 
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    disabled={isLoading}
                  />
                  {errors.manual_service && (
                    <p className="text-red-500 text-xs mt-1">{errors.manual_service}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {vatSettings?.is_enabled ? 'Amount (including VAT) *' : 'Amount *'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.manual_amount}
                    onChange={(e) => setFormData({ ...formData, manual_amount: e.target.value })}
                    placeholder="0.00"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.manual_amount 
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    disabled={isLoading}
                  />
                  {errors.manual_amount && (
                    <p className="text-red-500 text-xs mt-1">{errors.manual_amount}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Details
                  </label>
                  <textarea
                    value={formData.manual_description}
                    onChange={(e) => setFormData({ ...formData, manual_description: e.target.value })}
                    placeholder="Optional additional details about the service"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Image Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Manage Invoice Images
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Add new images or remove existing ones. Images will be automatically compressed for faster loading. These images will be sent with the invoice email (Max 5 images, 10MB each)
            </p>
            
            <div className="space-y-4">
              {/* File Input */}
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{getSupportedFormatsText()}</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isLoading || attachedImages.length >= 5}
                  />
                </label>
              </div>

              {/* Error Message */}
              {errors.images && (
                <p className="text-red-500 text-xs">{errors.images}</p>
              )}

              {/* Preview of attached images */}
              {attachedImages.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    New Images ({attachedImages.length}/5)
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {attachedImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {(file.size / 1024 / 1024).toFixed(1)} MB (will be compressed)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Existing Images ({existingImages.length})
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">
                              {image.filename}
                            </span>
                            <div className="flex space-x-1">
                              <button
                                type="button"
                                onClick={() => handleReplaceImage(index)}
                                className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                                title="Replace image"
                                disabled={replacingImageIndex === index}
                              >
                                {replacingImageIndex === index ? (
                                  <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                ) : (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => removeExistingImage(index)}
                                className="text-red-500 hover:text-red-700 transition-colors p-1"
                                title="Delete image"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {image.originalSize ? `${(image.originalSize / 1024 / 1024).toFixed(1)} MB` : 'Size unknown'}
                            {image.compressedSize && image.compressionRatio && (
                              <span className={`ml-1 ${image.compressionRatio < 0.8 ? 'text-green-600' : 'text-yellow-600'}`}>
                                (compressed: {(image.compressedSize / 1024 / 1024).toFixed(1)} MB
                                {image.compressionRatio < 1 && `, ${((1 - image.compressionRatio) * 100).toFixed(0)}% smaller`})
                              </span>
                            )}
                          </div>
                          {/* Image Preview */}
                          <div className="mt-2">
                            <img 
                              src={image.path} 
                              alt={image.filename}
                              className="w-full h-20 object-cover rounded border border-gray-200 dark:border-gray-600"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Invoice Date *
              </label>
              <input
                type="date"
                value={formData.invoice_date}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.invoice_date 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                disabled={isLoading}
              />
              {errors.invoice_date && (
                <p className="text-red-500 text-xs mt-1">{errors.invoice_date}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.due_date 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                disabled={isLoading}
              />
              {errors.due_date && (
                <p className="text-red-500 text-xs mt-1">{errors.due_date}</p>
              )}
            </div>
          </div>

          {/* Amount Preview */}
          {(selectedBooking || (useManualEntry && formData.manual_amount)) && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Invoice Summary
              </h4>
              <div className="space-y-2 text-sm">
                {vatSettings?.is_enabled ? (
                  <>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal (excl. VAT):</span>
                  <span className="text-gray-900 dark:text-white">£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">VAT ({vatSettings.vat_rate || 20}%):</span>
                  <span className="text-gray-900 dark:text-white">£{vatAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t border-gray-300 dark:border-gray-600 pt-2">
                  <span className="text-gray-900 dark:text-white">Total:</span>
                  <span className="text-blue-600 dark:text-blue-400">£{totalAmount.toFixed(2)}</span>
                </div>
                  </>
                ) : (
                  <div className="flex justify-between font-semibold text-lg">
                    <span className="text-gray-900 dark:text-white">Total:</span>
                    <span className="text-blue-600 dark:text-blue-400">£{totalAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes for the invoice"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={isLoading}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Update Invoice
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
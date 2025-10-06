"use client";

import { useState, useEffect } from "react";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  customer_type: "individual" | "company";
  company_name?: string;
  vat_number?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  bookings?: Array<{
    id: string;
    date: string;
    service: string;
    amount: number;
    status: string;
    paymentStatus: string;
  }>;
  payments?: Array<{
    id: string;
    date: string;
    amount: number;
    status: string;
  }>;
};

type DataSummary = {
  bookings: {
    count: number;
    sample: Array<any>;
  };
  payments: {
    count: number;
    sample: Array<any>;
  };
  invoices: {
    count: number;
    sample: Array<any>;
  };
};

interface DeleteCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customerId: string) => Promise<void>;
  customer: Customer | null;
}

export function DeleteCustomerModal({
  isOpen,
  onClose,
  onConfirm,
  customer,
}: DeleteCustomerModalProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (isOpen && customer) {
      setConfirmationText("");
      setError("");
      setIsDeleting(false);
      setCountdown(0);
      loadCustomerData();
    }
  }, [isOpen, customer]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const loadCustomerData = async () => {
    if (!customer) return;
    
    try {
      setIsLoadingData(true);
      const response = await fetch(`/api/customers/${customer.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setDataSummary(data.dataSummary);
      } else {
        console.error("Failed to load customer data");
        setDataSummary({
          bookings: { count: 0, sample: [] },
          payments: { count: 0, sample: [] },
          invoices: { count: 0, sample: [] }
        });
      }
    } catch (error) {
      console.error("Error loading customer data:", error);
      setDataSummary({
        bookings: { count: 0, sample: [] },
        payments: { count: 0, sample: [] },
        invoices: { count: 0, sample: [] }
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleDelete = async () => {
    if (confirmationText !== "DELETE") {
      setError("Please type DELETE to confirm deletion");
      setCountdown(6);
      return;
    }

    if (!customer) return;

    try {
      setIsDeleting(true);
      setError("");
      await onConfirm(customer.id);
      onClose();
    } catch (error) {
      setError("Failed to delete customer. Please try again.");
      setCountdown(6);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle confirmation text change
  const handleConfirmationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmationText(value);
    
    // If user types DELETE correctly, start countdown from 3
    if (value === "DELETE") {
      setError("");
      setCountdown(3);
    } else {
      setCountdown(0);
    }
  };

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                  Delete Customer
                </h2>
                <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">Name:</span>
                <p className="text-gray-900 dark:text-white font-medium transition-colors duration-300">{customer.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">Email:</span>
                <p className="text-gray-900 dark:text-white transition-colors duration-300">{customer.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">Phone:</span>
                <p className="text-gray-900 dark:text-white transition-colors duration-300">{customer.phone}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">Type:</span>
                <p className="text-gray-900 dark:text-white transition-colors duration-300 capitalize">{customer.customer_type}</p>
              </div>
            </div>
          </div>

          {/* Data to be deleted */}
          <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-6 mb-6 border border-red-200 dark:border-red-800">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-4 transition-colors duration-300">
              Data That Will Be Deleted
            </h3>
            
            {isLoadingData ? (
              <div className="space-y-3">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">Customer Profile</span>
                  <span className="text-red-600 dark:text-red-400 font-medium transition-colors duration-300">1 record</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">Bookings</span>
                  <span className="text-red-600 dark:text-red-400 font-medium transition-colors duration-300">
                    {dataSummary?.bookings.count || 0} records
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">Payments</span>
                  <span className="text-red-600 dark:text-red-400 font-medium transition-colors duration-300">
                    {dataSummary?.payments.count || 0} records
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">Invoices</span>
                  <span className="text-red-600 dark:text-red-400 font-medium transition-colors duration-300">
                    {dataSummary?.invoices.count || 0} records
                  </span>
                </div>
                
                {/* Sample data preview */}
                {dataSummary && (dataSummary.bookings.count > 0 || dataSummary.payments.count > 0 || dataSummary.invoices.count > 0) && (
                  <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div className="text-sm text-red-800 dark:text-red-200">
                        <p className="font-medium">Sample data that will be deleted:</p>
                        {dataSummary.bookings.count > 0 && (
                          <p className="text-xs mt-1">• {dataSummary.bookings.count} booking(s)</p>
                        )}
                        {dataSummary.payments.count > 0 && (
                          <p className="text-xs">• {dataSummary.payments.count} payment(s)</p>
                        )}
                        {dataSummary.invoices.count > 0 && (
                          <p className="text-xs">• {dataSummary.invoices.count} invoice(s)</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Warning message */}
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="text-sm text-red-800 dark:text-red-200">
                  <p className="font-medium">Warning:</p>
                  <p>This will permanently delete all customer data including bookings, payments, invoices, and any uploaded files. This action cannot be undone.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
              Type "DELETE" to confirm
            </label>
            <input
              type="text"
              value={confirmationText}
              onChange={handleConfirmationChange}
              className={`block w-full border rounded-lg p-3 transition-colors duration-300 ${
                error
                  ? "border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/10 text-red-900 dark:text-red-100"
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
              }`}
              placeholder="Type DELETE to confirm"
              disabled={isDeleting}
            />
            {error && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2 transition-colors duration-300">
                {error}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting || confirmationText !== "DELETE" || countdown > 0}
              className="px-6 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </>
              ) : countdown > 0 ? (
                `Unlocking in ${countdown}s...`
              ) : (
                "Delete Customer"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
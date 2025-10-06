"use client";

import { useState } from "react";

interface SendInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (includePaymentLink: boolean, selectedCurrency: string) => Promise<void>;
  invoice: {
    id: string;
    invoice_number: string;
    total_amount: number;
    customer?: {
      name: string;
      email: string;
    };
  };
  isLoading?: boolean;
}

export function SendInvoiceModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  invoice, 
  isLoading = false 
}: SendInvoiceModalProps) {
  const [includePaymentLink, setIncludePaymentLink] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("gbp");

  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onConfirm(includePaymentLink, selectedCurrency);
  };

  const currencies = [
    { code: "gbp", name: "British Pound (£)", symbol: "£" },
    { code: "usd", name: "US Dollar ($)", symbol: "$" },
    { code: "eur", name: "Euro (€)", symbol: "€" },
    { code: "cad", name: "Canadian Dollar (C$)", symbol: "C$" },
    { code: "aud", name: "Australian Dollar (A$)", symbol: "A$" },
  ];

  const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency) || currencies[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Send Invoice
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

        {/* Content */}
        <div className="px-6 py-4">
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Are you sure you want to send this invoice?
            </p>
            
            {/* Invoice Details */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Invoice:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {invoice.invoice_number}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Customer:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {invoice.customer?.name || "N/A"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Email:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {invoice.customer?.email || "N/A"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                  £{invoice.total_amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Link Option */}
          <div className="mb-6">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includePaymentLink}
                onChange={(e) => setIncludePaymentLink(e.target.checked)}
                disabled={isLoading}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Include Stripe payment link
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Customer will receive a secure payment link for {selectedCurrencyData.symbol}{invoice.total_amount.toFixed(2)} 
                  that they can use to pay online immediately.
                </p>
              </div>
            </label>

            {/* Currency Selection */}
            {includePaymentLink && (
              <div className="mt-4 ml-7">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Currency
                </label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Note: Amount will be converted from £{invoice.total_amount.toFixed(2)} to {selectedCurrencyData.symbol} at current exchange rates.
                </p>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  This action will send the invoice email to the customer and mark it as "Sent".
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Invoice
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 
"use client";

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message: string, duration?: number) => void;
  showSuccess: (title: string, message: string, duration?: number) => void;
  showError: (title: string, message: string, duration?: number) => void;
  showWarning: (title: string, message: string, duration?: number) => void;
  showInfo: (title: string, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message: string, duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, type, title, message, duration };
    
    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  const showSuccess = useCallback((title: string, message: string, duration?: number) => {
    showToast('success', title, message, duration);
  }, [showToast]);

  const showError = useCallback((title: string, message: string, duration?: number) => {
    showToast('error', title, message, duration);
  }, [showToast]);

  const showWarning = useCallback((title: string, message: string, duration?: number) => {
    showToast('warning', title, message, duration);
  }, [showToast]);

  const showInfo = useCallback((title: string, message: string, duration?: number) => {
    showToast('info', title, message, duration);
  }, [showToast]);

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              transform transition-all duration-500 ease-out
              animate-in slide-in-from-right-full
              ${getToastStyles(toast.type)}
              border rounded-xl shadow-lg backdrop-blur-sm p-4
              hover:scale-105 cursor-pointer
            `}
            onClick={() => removeToast(toast.id)}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getToastIcon(toast.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold leading-5">
                  {toast.title}
                </h4>
                <p className="text-sm mt-1 leading-5 opacity-90">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeToast(toast.id);
                }}
                className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// British English Toast Messages
export const ToastMessages = {
  // Gallery Management
  gallery: {
    itemAdded: {
      title: "Gallery Item Added",
      message: "Your gallery item has been successfully added to the collection."
    },
    itemUpdated: {
      title: "Gallery Item Updated", 
      message: "The gallery item has been updated successfully."
    },
    itemDeleted: {
      title: "Gallery Item Removed",
      message: "The gallery item has been permanently deleted."
    },
    sectionAdded: {
      title: "Gallery Section Created",
      message: "New gallery section has been created successfully."
    },
    sectionUpdated: {
      title: "Gallery Section Updated",
      message: "The gallery section has been updated successfully."
    },
    sectionDeleted: {
      title: "Gallery Section Removed",
      message: "The gallery section has been permanently deleted."
    },
    error: {
      title: "Gallery Error",
      message: "Sorry, there was an issue with the gallery operation. Please try again."
    }
  },

  // FAQ Management
  faq: {
    itemAdded: {
      title: "FAQ Added",
      message: "New FAQ item has been successfully created."
    },
    itemUpdated: {
      title: "FAQ Updated",
      message: "The FAQ item has been updated successfully."
    },
    itemDeleted: {
      title: "FAQ Removed",
      message: "The FAQ item has been permanently deleted."
    },
    error: {
      title: "FAQ Error",
      message: "Sorry, there was an issue with the FAQ operation. Please try again."
    }
  },

  // Pricing Management
  pricing: {
    cardAdded: {
      title: "Pricing Card Added",
      message: "New pricing card has been successfully created."
    },
    cardUpdated: {
      title: "Pricing Card Updated",
      message: "The pricing card has been updated successfully."
    },
    cardDeleted: {
      title: "Pricing Card Removed",
      message: "The pricing card has been permanently deleted."
    },
    error: {
      title: "Pricing Error",
      message: "Sorry, there was an issue with the pricing operation. Please try again."
    }
  },

  // Service Areas
  areas: {
    areaAdded: {
      title: "Service Area Added",
      message: "New service area has been successfully created."
    },
    areaUpdated: {
      title: "Service Area Updated",
      message: "The service area has been updated successfully."
    },
    areaDeleted: {
      title: "Service Area Removed",
      message: "The service area has been permanently deleted."
    },
    error: {
      title: "Service Area Error",
      message: "Sorry, there was an issue with the service area operation. Please try again."
    }
  },

  // Reviews
  reviews: {
    approved: {
      title: "Review Approved",
      message: "The customer review has been approved and is now visible on your website."
    },
    deleted: {
      title: "Review Removed",
      message: "The review has been permanently deleted."
    },
    submitted: {
      title: "Review Submitted",
      message: "Thank you! Your review has been submitted and is awaiting approval."
    },
    error: {
      title: "Review Error",
      message: "Sorry, there was an issue with the review operation. Please try again."
    }
  },

  // Profile & Settings
  profile: {
    updated: {
      title: "Profile Updated",
      message: "Your profile information has been successfully updated."
    },
    passwordChanged: {
      title: "Password Changed",
      message: "Your password has been successfully updated."
    },
    settingsSaved: {
      title: "Settings Saved",
      message: "Your settings have been successfully saved."
    },
    dayOffSaved: {
      title: "Day Off Settings Saved",
      message: "Your day off settings have been successfully updated."
    },
    error: {
      title: "Profile Error",
      message: "Sorry, there was an issue updating your profile. Please try again."
    }
  },

  // Bookings & Customers
  bookings: {
    created: {
      title: "Booking Created",
      message: "New booking has been successfully created."
    },
    updated: {
      title: "Booking Updated",
      message: "The booking has been updated successfully."
    },
    submitted: {
      title: "Booking Request Submitted",
      message: "Thank you! Your booking request has been submitted. We'll contact you shortly."
    },
    error: {
      title: "Booking Error",
      message: "Sorry, there was an issue with your booking. Please try again."
    }
  },

  customers: {
    added: {
      title: "Customer Added",
      message: "New customer has been successfully added to your database."
    },
    updated: {
      title: "Customer Updated",
      message: "Customer information has been updated successfully."
    },
    error: {
      title: "Customer Error",
      message: "Sorry, there was an issue with the customer operation. Please try again."
    }
  },

  // Invoices & Payments
  invoices: {
    created: {
      title: "Invoice Created",
      message: "New invoice has been successfully generated."
    },
    downloaded: {
      title: "Invoice Downloaded",
      message: "The invoice PDF has been successfully generated and downloaded."
    },
    emailSent: {
      title: "Invoice Sent",
      message: "The invoice has been successfully sent to the customer."
    },
    error: {
      title: "Invoice Error",
      message: "Sorry, there was an issue with the invoice operation. Please try again."
    }
  },

  payments: {
    created: {
      title: "Payment Created",
      message: "New payment record has been successfully created."
    },
    linkGenerated: {
      title: "Payment Link Generated",
      message: "Payment link has been successfully created and is ready to share."
    },
    error: {
      title: "Payment Error",
      message: "Sorry, there was an issue with the payment operation. Please try again."
    }
  },

  // General
  general: {
    saved: {
      title: "Changes Saved",
      message: "Your changes have been successfully saved."
    },
    deleted: {
      title: "Item Deleted",
      message: "The item has been permanently removed."
    },
    error: {
      title: "Operation Failed",
      message: "Sorry, something went wrong. Please try again in a moment."
    },
    networkError: {
      title: "Connection Error",
      message: "Please check your internet connection and try again."
    },
    validationError: {
      title: "Validation Error",
      message: "Please check your input and ensure all required fields are filled correctly."
    }
  }
}; 
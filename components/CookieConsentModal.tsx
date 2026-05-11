"use client";

import { useState, useEffect } from "react";
import { X, Cookie, Shield, BarChart3, Settings } from "lucide-react";
import Link from "next/link";

import ButtonPrimary from "./ButtonPrimary";

import {
  ANALYTICS_CONSENT_GRANTED_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
} from "@/lib/cookie-consent";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookieConsentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);

    if (!consent) {
      // Show modal after a short delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const consentData = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify(consentData),
    );
    setIsOpen(false);
    if (consentData.analytics && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(ANALYTICS_CONSENT_GRANTED_EVENT));
    }
  };

  const handleRejectAll = () => {
    const consentData = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify(consentData),
    );
    setIsOpen(false);
  };

  const handleSavePreferences = () => {
    const consentData = {
      ...preferences,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify(consentData),
    );
    setIsOpen(false);
    if (consentData.analytics && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(ANALYTICS_CONSENT_GRANTED_EVENT));
    }
  };

  const handleTogglePreference = (key: keyof CookiePreferences) => {
    if (key === "necessary") return; // Cannot disable necessary cookies
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/70 p-4 backdrop-blur-md sm:p-6">
      <div
        aria-labelledby="cookie-consent-title"
        aria-modal="true"
        className="relative z-[10000] max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-800"
        role="dialog"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#464C45] to-[#3a4039] text-white px-6 py-4 flex items-center justify-between rounded-t-2xl z-[10001]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Cookie className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold" id="cookie-consent-title">
              Cookie & Privacy Preferences
            </h2>
          </div>
          <button
            aria-label="Close"
            className="p-2 hover:bg-white/20 rounded-full transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Introduction */}
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              We use cookies and similar technologies to enhance your browsing
              experience, analyze site traffic, and personalize content. By
              clicking{" "}
              <span className="whitespace-nowrap">
                &ldquo;Accept All&rdquo;
              </span>
              , you consent to our use of cookies. You can also customize your
              preferences or reject non-essential cookies.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              For more information, please read our{" "}
              <Link
                className="text-[#464C45] dark:text-[#b5ad9d] hover:underline font-semibold"
                href="/privacy"
              >
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                className="text-[#464C45] dark:text-[#b5ad9d] hover:underline font-semibold"
                href="/terms"
              >
                Terms of Service
              </Link>
              .
            </p>
          </div>

          {/* Cookie Types */}
          {showCustomize && (
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Customize Your Cookie Preferences
              </h3>

              {/* Necessary Cookies */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-[#464C45]/10 dark:bg-[#464C45]/30 rounded-lg mt-1">
                      <Shield className="w-5 h-5 text-[#464C45] dark:text-[#b5ad9d]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-gray-900 dark:text-white">
                          Necessary Cookies
                        </h4>
                        <span className="text-xs bg-[#464C45] text-white px-2 py-1 rounded">
                          Always Active
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        These cookies are essential for the website to function
                        properly. They enable basic features like page
                        navigation and access to secure areas. The website
                        cannot function properly without these cookies.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      disabled
                      aria-disabled="true"
                      aria-label="Necessary cookies always active"
                      checked={preferences.necessary}
                      className="sr-only peer"
                      role="switch"
                      type="checkbox"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#464C45] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#464C45] opacity-60 cursor-not-allowed" />
                  </label>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-[#464C45]/10 dark:bg-[#464C45]/30 rounded-lg mt-1">
                      <BarChart3 className="w-5 h-5 text-[#464C45] dark:text-[#b5ad9d]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                        Analytics Cookies
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        These cookies help us understand how visitors interact
                        with our website by collecting and reporting information
                        anonymously. This helps us improve our website and
                        services.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      aria-label="Allow analytics cookies"
                      checked={preferences.analytics}
                      className="sr-only peer"
                      role="switch"
                      type="checkbox"
                      onChange={() => handleTogglePreference("analytics")}
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#464C45] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#464C45]" />
                  </label>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-[#464C45]/10 dark:bg-[#464C45]/30 rounded-lg mt-1">
                      <Settings className="w-5 h-5 text-[#464C45] dark:text-[#b5ad9d]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                        Marketing Cookies
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        These cookies are used to deliver personalized
                        advertisements and track campaign performance. They may
                        be set by our advertising partners to build a profile of
                        your interests.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      aria-label="Allow marketing cookies"
                      checked={preferences.marketing}
                      className="sr-only peer"
                      role="switch"
                      type="checkbox"
                      onChange={() => handleTogglePreference("marketing")}
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#464C45] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#464C45]" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {!showCustomize ? (
              <>
                <ButtonPrimary
                  className="flex-1 sm:flex-none px-6 py-3"
                  variant="secondary"
                  onClick={() => setShowCustomize(true)}
                >
                  Customize Preferences
                </ButtonPrimary>
                <ButtonPrimary
                  className="flex-1 sm:flex-none px-6 py-3"
                  variant="secondary"
                  onClick={handleRejectAll}
                >
                  Reject All
                </ButtonPrimary>
                <ButtonPrimary
                  className="flex-1 sm:flex-none px-6 py-3"
                  variant="primary"
                  onClick={handleAcceptAll}
                >
                  Accept All
                </ButtonPrimary>
              </>
            ) : (
              <>
                <ButtonPrimary
                  className="flex-1 sm:flex-none px-6 py-3"
                  variant="secondary"
                  onClick={() => setShowCustomize(false)}
                >
                  Back
                </ButtonPrimary>
                <ButtonPrimary
                  className="flex-1 sm:flex-none px-6 py-3"
                  variant="primary"
                  onClick={handleSavePreferences}
                >
                  Save Preferences
                </ButtonPrimary>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

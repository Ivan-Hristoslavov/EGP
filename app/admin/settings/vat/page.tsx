"use client";

import { useState, useEffect } from "react";
import { useToast, ToastMessages } from "@/components/Toast";

type VATSettings = {
  id: string;
  is_enabled: boolean;
  vat_rate: number;
  vat_number: string | null;
};

export default function VATSettingsPage() {
  const [settings, setSettings] = useState<VATSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadVATSettings();
  }, []);

  const loadVATSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/settings/vat");
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        showError("Error", "Failed to load VAT settings");
      }
    } catch (error) {
      console.error("Error loading VAT settings:", error);
      showError("Error", "Failed to load VAT settings");
    } finally {
      setLoading(false);
    }
  };

  const saveVATSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const response = await fetch("/api/admin/settings/vat", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        showSuccess("Success", "VAT settings updated successfully");
      } else {
        showError("Error", "Failed to update VAT settings");
      }
    } catch (error) {
      console.error("Error saving VAT settings:", error);
      showError("Error", "Failed to update VAT settings");
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (updates: Partial<VATSettings>) => {
    if (settings) {
      setSettings({ ...settings, ...updates });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No VAT Settings Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Unable to load VAT settings. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            VAT Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
            Configure VAT settings for your invoices and payments
          </p>
        </div>
      </div>

      {/* VAT Settings Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-6">
          {/* VAT Enable/Disable */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Enable VAT
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enable or disable VAT calculations on invoices
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.is_enabled}
                onChange={(e) => updateSettings({ is_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* VAT Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              VAT Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={settings.vat_rate}
              onChange={(e) => updateSettings({ vat_rate: parseFloat(e.target.value) || 0 })}
              disabled={!settings.is_enabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="20.00"
            />
          </div>

          {/* VAT Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              VAT Number (Optional)
            </label>
            <input
              type="text"
              value={settings.vat_number || ""}
              onChange={(e) => updateSettings({ vat_number: e.target.value || null })}
              disabled={!settings.is_enabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="GB123456789"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Enter your VAT registration number if applicable
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={saveVATSettings}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Information Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              VAT Information
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <ul className="list-disc list-inside space-y-1">
                <li>VAT will be automatically calculated on all invoices when enabled</li>
                <li>Existing invoices will not be affected by changes to these settings</li>
                <li>The VAT number will appear on invoices if provided</li>
                <li>Standard VAT rate in the UK is 20%</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
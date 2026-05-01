"use client";

import { useState, useEffect } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";

import { useToast } from "@/components/Toast";
import { inputClassNames, formLayout } from "@/config/design-system";

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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" />
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
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          VAT Settings
        </h1>
        <p className="text-sm text-default-500 mt-1">
          Configure VAT settings for your invoices and payments
        </p>
      </div>

      {/* VAT Settings Form */}
      <Card className="border border-divider">
        <CardBody className="p-4 sm:p-6">
          <div className={formLayout.sectionGap}>
            {/* VAT Enable/Disable */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-medium text-foreground">
                  Enable VAT
                </h3>
                <p className="text-sm text-default-500">
                  Enable or disable VAT calculations on invoices
                </p>
              </div>
              <Switch
                classNames={{
                  wrapper: "group-data-[selected=true]:bg-primary",
                }}
                isSelected={settings.is_enabled}
                size="lg"
                onValueChange={(v) => updateSettings({ is_enabled: v })}
              />
            </div>

            {/* VAT Rate & Number */}
            <div className={formLayout.gridFields}>
              <Input
                classNames={inputClassNames}
                isDisabled={!settings.is_enabled}
                label="VAT Rate (%)"
                labelPlacement="outside"
                max={100}
                min={0}
                placeholder="20.00"
                step={0.01}
                type="number"
                value={String(settings.vat_rate)}
                variant="bordered"
                onValueChange={(v) =>
                  updateSettings({ vat_rate: parseFloat(v) || 0 })
                }
              />
              <Input
                classNames={inputClassNames}
                description="Enter your VAT registration number if applicable"
                isDisabled={!settings.is_enabled}
                label="VAT Number (Optional)"
                labelPlacement="outside"
                placeholder="GB123456789"
                value={settings.vat_number || ""}
                variant="bordered"
                onValueChange={(v) => updateSettings({ vat_number: v || null })}
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <Button
                className="min-h-[44px] w-full sm:w-auto"
                color="primary"
                isDisabled={saving}
                isLoading={saving}
                onPress={saveVATSettings}
              >
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Information Card */}
      <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4 sm:p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-primary-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                fillRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-primary-800 dark:text-primary-200">
              VAT Information
            </h3>
            <div className="mt-2 text-sm text-primary-700 dark:text-primary-300">
              <ul className="list-disc list-inside space-y-1">
                <li>
                  VAT will be automatically calculated on all invoices when
                  enabled
                </li>
                <li>
                  Existing invoices will not be affected by changes to these
                  settings
                </li>
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

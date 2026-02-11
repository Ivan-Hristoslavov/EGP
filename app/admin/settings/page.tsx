"use client";

import { useState, useEffect } from "react";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { useToast } from "@/components/Toast";
import WorkingHoursManager from "@/components/admin/WorkingHoursManager";
import { Building2, DollarSign, Settings, Save } from "lucide-react";
import { Card, CardBody, CardHeader, Button, Input, Textarea, Checkbox, Tabs, Tab, Spinner } from "@heroui/react";

type SettingsState = {
  // Business Information
  businessCity: string;
  businessPostcode: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  
  // Pricing
  consultationRate: string;
  standardRate: string;
  depositRequired: boolean;
  depositPercentage: string;

  // Working Hours
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: string[];

  // Website Settings
  smsNotifications: boolean;
  autoConfirmBookings: boolean;
  requirePaymentConfirmation: boolean;

};

const defaultSettings: SettingsState = {
  businessCity: "London",
  businessPostcode: "SW1A 1AA",
  businessAddress: "",
  businessPhone: process.env.NEXT_PUBLIC_PHONE_NUMBER || "07944 24 20 79",
  businessEmail: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "info@egpaesthetics.co.uk",
  
  consultationRate: "150",
  standardRate: "75",
  depositRequired: false,
  depositPercentage: "20",

  workingHoursStart: "08:00",
  workingHoursEnd: "18:00",
  workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],

  smsNotifications: false,
  autoConfirmBookings: false,
  requirePaymentConfirmation: true,
};

const workingDaysOptions = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"business" | "pricing">("business");
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const { profile, loading } = useAdminProfile();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    // Load settings from database profile
    if (profile) {
      setSettings({
        businessCity: (profile.company_address || "").split(",").pop()?.trim() || "London",
        businessPostcode: (profile.company_address || "").match(/[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}/i)?.[0] || "SW1A 1AA",
        businessAddress: profile.company_address || "",
        businessPhone: profile.phone || process.env.NEXT_PUBLIC_PHONE_NUMBER || "07944 24 20 79",
        businessEmail: profile.business_email || "",
        consultationRate: "150", // These should come from admin_settings if needed
        standardRate: "75",
        depositRequired: false,
        depositPercentage: "20",
        workingHoursStart: "08:00",
        workingHoursEnd: "18:00",
        workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        smsNotifications: false,
        autoConfirmBookings: false,
        requirePaymentConfirmation: true,
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to database via profile API
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: (profile?.name || "").split(" ")[0] || "Admin",
          lastName: (profile?.name || "").split(" ").slice(1).join(" ") || "User",
          businessEmail: settings.businessEmail,
          phone: settings.businessPhone,
          whatsapp: profile?.whatsapp || settings.businessPhone,
          companyName: profile?.company_name || "",
          companyAddress: settings.businessAddress,
          howToFindUs: (profile as any)?.how_to_find_us || "",
          howToReachUs: (profile as any)?.how_to_reach_us || "",
          googleMapsAddress: (profile as any)?.google_maps_address || settings.businessAddress,
          transportOptions: (profile as any)?.transport_options || {},
          nearbyLandmarks: (profile as any)?.nearby_landmarks || [],
        }),
      });

      if (response.ok) {
        showSuccess("Success", "Settings saved successfully!");
        // Refresh page to reload data
        window.location.reload();
      } else {
        showError("Error", "Failed to save settings. Please try again.");
      }
    } catch (error) {
      showError("Error", "Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (key: keyof SettingsState, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleWorkingDayToggle = (day: string) => {
    setSettings(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }));
  };

  const tabs = [
    { id: "business", label: "Business & Hours", icon: Building2 },
    { id: "pricing", label: "Pricing", icon: DollarSign },
  ];

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-default-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card>
        <CardHeader className="bg-gradient-to-r from-primary-500 via-secondary-500 to-danger-500 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
              <p className="text-white/90 text-sm">Configure your aesthetic clinic settings</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as any)}
            className="w-full"
          >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                <Tab
                    key={tab.id}
                  title={
                    <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    </div>
                  }
                />
                );
              })}
          </Tabs>

          <div className="p-6">
            {activeTab === "business" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <Input
                    label="Business City"
                      value={settings.businessCity}
                      onChange={(e) => handleInputChange("businessCity", e.target.value)}
                      placeholder="Enter city"
                    />
                  <Input
                    label="Postcode"
                      value={settings.businessPostcode}
                      onChange={(e) => handleInputChange("businessPostcode", e.target.value)}
                      placeholder="Enter postcode"
                    />
                </div>

                <div className="border-t border-divider pt-8">
                  <WorkingHoursManager />
                </div>
              </div>
            )}

            {activeTab === "pricing" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <Input
                    label="Consultation Rate (per session)"
                        type="number"
                        value={settings.consultationRate}
                        onChange={(e) => handleInputChange("consultationRate", e.target.value)}
                        placeholder="150"
                    startContent={<span className="text-default-500">£</span>}
                  />
                  <Input
                    label="Standard Treatment Rate (per session)"
                        type="number"
                        value={settings.standardRate}
                        onChange={(e) => handleInputChange("standardRate", e.target.value)}
                        placeholder="75"
                    startContent={<span className="text-default-500">£</span>}
                      />
                    </div>
                <div className="mt-8 pt-6 border-t border-divider">
                  <Button
                    color="primary"
                    onPress={handleSave}
                    isLoading={isSaving}
                    startContent={<Save className="w-4 h-4" />}
                  >
                    {isSaving ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </div>
            )}

          </div>
        </CardBody>
      </Card>
    </div>
  );
}
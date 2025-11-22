"use client";

import { useState, useEffect } from "react";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { useToast } from "@/components/Toast";
import WorkingHoursManager from "@/components/admin/WorkingHoursManager";
import { Building2, DollarSign, Settings, Shield, Save } from "lucide-react";

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

  // Professional Settings
  fullyInsured: boolean;
  insuranceProvider: string;
  gasSafeRegistered: boolean;
  gasSafeNumber: string;
  cqcRegistered: boolean;
  cqcNumber: string;
  yearsOfExperience: string;
  specializations: string;
};

const defaultSettings: SettingsState = {
  businessCity: "London",
  businessPostcode: "SW1A 1AA",
  businessAddress: "",
  businessPhone: "+44 7700 900123",
  businessEmail: "info@egp.com",
  
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

  fullyInsured: true,
  insuranceProvider: "Professional Indemnity Insurance",
  gasSafeRegistered: false,
  gasSafeNumber: "",
  cqcRegistered: false,
  cqcNumber: "",
  yearsOfExperience: "",
  specializations: "",
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
  const [activeTab, setActiveTab] = useState<"business" | "pricing" | "professional">("business");
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const { profile, loading } = useAdminProfile();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem("admin-settings");
    if (savedSettings) {
      setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage (in real app, this would be API call)
      localStorage.setItem("admin-settings", JSON.stringify(settings));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccess("Success", "Settings saved successfully!");
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
    { id: "professional", label: "Professional", icon: Shield },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-pink-50/50 to-purple-50/50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-rose-200 dark:border-rose-800"></div>
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-rose-500 dark:border-t-rose-400 animate-spin"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-pink-50/50 to-purple-50/50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800">
      <div className="w-full max-w-[95%] 2xl:max-w-[1600px] mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent font-playfair mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your clinic settings and preferences
          </p>
        </div>

        {/* Settings Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-rose-100/50 dark:border-gray-700/50 overflow-hidden">
          {/* Settings Header */}
          <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 p-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white font-playfair mb-1">
                  Clinic Configuration
                </h2>
                <p className="text-white/90">Configure your aesthetic clinic settings</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-rose-500 text-rose-600 dark:text-rose-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "business" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Business Location</h3>
                
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Business City
                    </label>
                    <input
                      type="text"
                      value={settings.businessCity}
                      onChange={(e) => handleInputChange("businessCity", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Postcode
                    </label>
                    <input
                      type="text"
                      value={settings.businessPostcode}
                      onChange={(e) => handleInputChange("businessPostcode", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                      placeholder="Enter postcode"
                    />
                  </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Working Hours</h3>
                  <WorkingHoursManager />
                </div>
              </div>
            )}

            {activeTab === "pricing" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Pricing Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Consultation Rate (per session)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">£</span>
                      <input
                        type="number"
                        value={settings.consultationRate}
                        onChange={(e) => handleInputChange("consultationRate", e.target.value)}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                        placeholder="150"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Standard Treatment Rate (per session)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">£</span>
                      <input
                        type="number"
                        value={settings.standardRate}
                        onChange={(e) => handleInputChange("standardRate", e.target.value)}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                        placeholder="75"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "professional" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Professional Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="text"
                      value={settings.yearsOfExperience}
                      onChange={(e) => handleInputChange("yearsOfExperience", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                      placeholder="e.g., 10+ years"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Insurance Provider
                    </label>
                    <input
                      type="text"
                      value={settings.insuranceProvider}
                      onChange={(e) => handleInputChange("insuranceProvider", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                      placeholder="Enter insurance provider"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="fullyInsured"
                      checked={settings.fullyInsured}
                      onChange={(e) => handleInputChange("fullyInsured", e.target.checked)}
                      className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                    />
                    <label htmlFor="fullyInsured" className="ml-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Fully Insured
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Specializations
                  </label>
                  <textarea
                    rows={3}
                    value={settings.specializations}
                    onChange={(e) => handleInputChange("specializations", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none"
                    placeholder="e.g., Botox, Fillers, Skin Treatments"
                  />
                </div>
              </div>
            )}

            {/* Save Button - Only show for tabs that need it (pricing and professional) */}
            {(activeTab === "pricing" || activeTab === "professional") && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:via-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5 mr-2" />
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
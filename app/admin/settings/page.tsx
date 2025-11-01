"use client";

import { useState, useEffect } from "react";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { useToast } from "@/components/Toast";
import WorkingHoursManager from "@/components/admin/WorkingHoursManager";
import { AdminFAQManager } from "@/components/AdminFAQManager";
import { Building2, DollarSign, Clock, Bell, Shield, Settings, Mail, CheckCircle, Save, HelpCircle } from "lucide-react";

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
  emailNotifications: boolean;
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

  // Payment Settings
  stripeEnabled: boolean;
  stripePublishableKey: string;
  stripeSecretKey: string;
  paypalEnabled: boolean;
  paypalClientId: string;

  // Email Settings
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
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

  emailNotifications: true,
  smsNotifications: false,
  autoConfirmBookings: false,
  requirePaymentConfirmation: true,

  fullyInsured: true,
  insuranceProvider: "Professional Indemnity Insurance",
  gasSafeRegistered: false,
  gasSafeNumber: "",
  cqcRegistered: false,
  cqcNumber: "",

  stripeEnabled: true,
  stripePublishableKey: "",
  stripeSecretKey: "",
  paypalEnabled: false,
  paypalClientId: "",

  smtpHost: "",
  smtpPort: "587",
  smtpUsername: "",
  smtpPassword: "",
  fromEmail: "",
  fromName: "EGP Aesthetics",
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
  const [activeTab, setActiveTab] = useState<"business" | "pricing" | "hours" | "notifications" | "professional" | "payments" | "email" | "faq">("business");
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
    { id: "business", label: "Business", icon: Building2 },
    { id: "pricing", label: "Pricing", icon: DollarSign },
    { id: "hours", label: "Hours", icon: Clock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "professional", label: "Professional", icon: Shield },
    { id: "payments", label: "Payments", icon: DollarSign },
    { id: "email", label: "Email", icon: Mail },
    { id: "faq", label: "FAQ", icon: HelpCircle },
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
      <div className="max-w-6xl mx-auto p-6">
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
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Business Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            )}

            {activeTab === "pricing" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Pricing Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {activeTab === "hours" && (
              <WorkingHoursManager />
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Notification Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-rose-600" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Email Notifications</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receive booking notifications via email</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleInputChange("emailNotifications", !settings.emailNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.emailNotifications ? "bg-rose-600" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.emailNotifications ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Booking Confirmation Info */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Automatic Booking Confirmation</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Bookings are automatically confirmed when the customer completes payment. No manual confirmation required.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "professional" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Professional Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-rose-600" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Fully Insured</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Confirm that you have professional insurance</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleInputChange("fullyInsured", !settings.fullyInsured)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.fullyInsured ? "bg-rose-600" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.fullyInsured ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
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
                </div>
              </div>
            )}

            {activeTab === "payments" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Payment Settings</h3>
                
                <div className="space-y-6">
                  {/* Stripe Settings */}
                  <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Stripe Payment</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Accept card payments online</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleInputChange("stripeEnabled", !settings.stripeEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.stripeEnabled ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.stripeEnabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                    
                    {settings.stripeEnabled && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Stripe Publishable Key
                            </label>
                            <input
                              type="text"
                              value={settings.stripePublishableKey}
                              onChange={(e) => handleInputChange("stripePublishableKey", e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              placeholder="pk_test_..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Stripe Secret Key
                            </label>
                            <input
                              type="password"
                              value={settings.stripeSecretKey}
                              onChange={(e) => handleInputChange("stripeSecretKey", e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              placeholder="sk_test_..."
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PayPal Settings */}
                  <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">PayPal Payment</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Accept PayPal payments</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleInputChange("paypalEnabled", !settings.paypalEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.paypalEnabled ? "bg-yellow-600" : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.paypalEnabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                    
                    {settings.paypalEnabled && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          PayPal Client ID
                        </label>
                        <input
                          type="text"
                          value={settings.paypalClientId}
                          onChange={(e) => handleInputChange("paypalClientId", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                          placeholder="PayPal Client ID"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "email" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Email Settings</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={settings.smtpHost}
                        onChange={(e) => handleInputChange("smtpHost", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        SMTP Port
                      </label>
                      <input
                        type="text"
                        value={settings.smtpPort}
                        onChange={(e) => handleInputChange("smtpPort", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                        placeholder="587"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        SMTP Username
                      </label>
                      <input
                        type="text"
                        value={settings.smtpUsername}
                        onChange={(e) => handleInputChange("smtpUsername", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                        placeholder="your-email@gmail.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        SMTP Password
                      </label>
                      <input
                        type="password"
                        value={settings.smtpPassword}
                        onChange={(e) => handleInputChange("smtpPassword", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                        placeholder="App password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        From Email
                      </label>
                      <input
                        type="email"
                        value={settings.fromEmail}
                        onChange={(e) => handleInputChange("fromEmail", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                        placeholder="noreply@egp.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        From Name
                      </label>
                      <input
                        type="text"
                        value={settings.fromName}
                        onChange={(e) => handleInputChange("fromName", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                        placeholder="EGP Aesthetics"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "faq" && (
              <div className="space-y-6">
                <AdminFAQManager />
              </div>
            )}

            {/* Save Button */}
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
          </div>
        </div>
      </div>
    </div>
  );
}
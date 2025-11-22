"use client";

import { useState, useEffect } from "react";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { useToast } from "@/components/Toast";
import { User, Building2, Shield, Eye, EyeOff, Mail, Phone, Users, HelpCircle, DollarSign, Settings, Save, Plus, X, Train, Bus, Car, Navigation } from "lucide-react";
import { TeamManager } from "@/components/TeamManager";
import { AdminFAQManager } from "@/components/AdminFAQManager";
import WorkingHoursManager from "@/components/admin/WorkingHoursManager";

type ProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  businessEmail: string;
  phone: string;
  whatsapp: string;
  about: string;
  companyName: string;
  companyAddress: string;
  yearsOfExperience: string;
  specializations: string;
  insuranceProvider: string;
  avatar: string;
  howToFindUs: string;
  howToReachUs: string;
  googleMapsAddress: string;
  transportOptions: {
    tube?: Array<{ station: string; lines: string; distance: string }>;
    bus?: Array<{ route: string; stop: string; distance: string }>;
    car?: Array<{ parking: string; distance: string; notes: string }>;
    walking?: Array<{ from: string; distance: string }>;
  };
  nearbyLandmarks: Array<{ name: string; type: string; distance: string }>;
};

type PasswordData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

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

  // Professional Settings
  fullyInsured: boolean;
  insuranceProvider: string;
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

  fullyInsured: true,
  insuranceProvider: "Professional Indemnity Insurance",
  yearsOfExperience: "",
  specializations: "",
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"personal" | "company" | "team" | "faq" | "security" | "business" | "pricing" | "professional">("personal");
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { profile: dbProfile, loading } = useAdminProfile();
  const { showSuccess, showError } = useToast();
  
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    businessEmail: "",
    phone: "",
    whatsapp: "",
    about: "",
    companyName: "",
    companyAddress: "",
    yearsOfExperience: "",
    specializations: "",
    insuranceProvider: "",
    avatar: "",
    howToFindUs: "",
    howToReachUs: "",
    googleMapsAddress: "",
    transportOptions: {},
    nearbyLandmarks: [],
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (dbProfile && !loading) {
      const [firstName, ...lastNameParts] = dbProfile.name.split(" ");
      const lastName = lastNameParts.join(" ");

      // Use functional update to access current state and preserve avatar value
      setProfileData((prev) => ({
        firstName: firstName || "Admin",
        lastName: lastName || "User",
        email: dbProfile.email || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "",
        businessEmail: dbProfile.business_email || process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "",
        phone: dbProfile.phone || "+44 7700 900123",
        whatsapp: (dbProfile as any).whatsapp || dbProfile.phone || "+44 7700 900123",
        about: dbProfile.about || "",
        companyName: dbProfile.company_name || "EGP Aesthetics",
        companyAddress: dbProfile.company_address || "809 Wandsworth Road, SW8 3JH, London, UK",
        yearsOfExperience: dbProfile.years_of_experience || "",
        specializations: dbProfile.specializations || "",
        insuranceProvider: dbProfile.insurance_provider || "",
        // Preserve existing avatar value from previous state (avatar is not stored in database)
        avatar: prev.avatar || "",
        howToFindUs: (dbProfile as any).how_to_find_us || "",
        howToReachUs: (dbProfile as any).how_to_reach_us || "",
        googleMapsAddress: (dbProfile as any).google_maps_address || dbProfile.company_address || "809 Wandsworth Road, SW8 3JH, London, UK",
        transportOptions: (dbProfile as any).transport_options || {},
        nearbyLandmarks: (dbProfile as any).nearby_landmarks || [],
      }));
    }
  }, [dbProfile, loading]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          businessEmail: profileData.businessEmail,
          phone: profileData.phone,
          whatsapp: profileData.whatsapp,
          about: profileData.about,
          companyName: profileData.companyName,
          companyAddress: profileData.companyAddress,
          yearsOfExperience: profileData.yearsOfExperience,
          specializations: profileData.specializations,
          insuranceProvider: profileData.insuranceProvider,
          howToFindUs: profileData.howToFindUs,
          howToReachUs: profileData.howToReachUs,
          googleMapsAddress: profileData.googleMapsAddress,
          transportOptions: profileData.transportOptions,
          nearbyLandmarks: profileData.nearbyLandmarks,
        }),
      });

      if (response.ok) {
        showSuccess("Success", "Profile updated successfully!");
      } else {
        showError("Error", "Failed to update profile. Please try again.");
      }
    } catch (error) {
      showError("Error", "An error occurred while updating your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError("Error", "New passwords do not match.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/profile/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        showSuccess("Success", "Password updated successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordForm(false);
      } else {
        showError("Error", "Failed to update password. Please check your current password.");
      }
    } catch (error) {
      showError("Error", "An error occurred while updating your password.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("admin-settings");
    if (savedSettings) {
      setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
    }
  }, []);

  const handleSettingsSave = async () => {
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

  const handleSettingsInputChange = (key: keyof SettingsState, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "company", label: "Company & Business", icon: Building2 },
    { id: "business", label: "Business & Hours", icon: Settings },
    { id: "pricing", label: "Pricing", icon: DollarSign },
    { id: "professional", label: "Professional", icon: Shield },
    { id: "team", label: "Team", icon: Users },
    { id: "faq", label: "FAQ", icon: HelpCircle },
    { id: "security", label: "Security", icon: Eye },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-pink-50/50 to-purple-50/50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-rose-200 dark:border-rose-800"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-rose-500 dark:border-t-rose-400 animate-spin"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
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
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your personal and professional information
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-rose-100/50 dark:border-gray-700/50 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 px-8 py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 flex-shrink-0">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="flex items-center gap-6 flex-wrap">
                  <div>
                    <h2 className="text-xl font-bold text-white font-playfair">
                      {profileData.firstName} {profileData.lastName}
                    </h2>
                    <p className="text-white/90 text-sm">{profileData.companyName}</p>
                  </div>
                  <div className="flex items-center gap-4 text-white/80 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4" />
                      <span>{profileData.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4" />
                      <span>{profileData.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
            <nav className="flex space-x-1 px-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-6 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-rose-500 text-rose-600 dark:text-rose-400 bg-white dark:bg-gray-800"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50"
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
          <div className="p-8 lg:p-10">
            {activeTab === "personal" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Personal Information</h3>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Business Email
                    </label>
                    <input
                      type="email"
                      value={profileData.businessEmail}
                      onChange={(e) => setProfileData(prev => ({ ...prev, businessEmail: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                      placeholder="Enter business email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    About You
                  </label>
                  <textarea
                    rows={4}
                    value={profileData.about}
                    onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none"
                    placeholder="Tell us about yourself and your expertise..."
                  />
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:via-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "company" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Company & Business Information</h3>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={profileData.companyName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, companyName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                      placeholder="Enter company name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={profileData.whatsapp}
                      onChange={(e) => setProfileData(prev => ({ ...prev, whatsapp: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                      placeholder="+44 7700 900123"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Full Address / Location
                  </label>
                  <textarea
                    rows={3}
                    value={profileData.companyAddress}
                    onChange={(e) => setProfileData(prev => ({ ...prev, companyAddress: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none"
                    placeholder="Enter full company address including city and postcode (e.g., 809 Wandsworth Road, SW8 3JH, London, UK)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    How to Find Us
                  </label>
                  <textarea
                    rows={4}
                    value={profileData.howToFindUs}
                    onChange={(e) => setProfileData(prev => ({ ...prev, howToFindUs: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none"
                    placeholder="Describe how to find your clinic location (e.g., Our clinic is located in the heart of London's medical district, easily accessible by public transport and car.)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    How to Reach Us
                  </label>
                  <textarea
                    rows={4}
                    value={profileData.howToReachUs}
                    onChange={(e) => setProfileData(prev => ({ ...prev, howToReachUs: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none"
                    placeholder="Describe how to reach your clinic (e.g., We are conveniently located near major transport links and landmarks.)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Google Maps Address / Location
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    This address will be used for the Google Maps embed and directions. Use the exact format: Street, Postcode, City, Country
                  </p>
                  <input
                    type="text"
                    value={profileData.googleMapsAddress}
                    onChange={(e) => setProfileData(prev => ({ ...prev, googleMapsAddress: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    placeholder="809 Wandsworth Road, SW8 3JH, London, UK"
                  />
                </div>

                {/* Transport Options */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transport Options</h4>
                  
                  {/* Tube/Underground */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Train className="w-5 h-5 text-rose-500" />
                      <h5 className="font-semibold text-gray-800 dark:text-white">Tube/Underground</h5>
                    </div>
                    <div className="space-y-3">
                      {(profileData.transportOptions?.tube || []).map((item: any, index: number) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Station Name</label>
                            <input
                              type="text"
                              value={item.station || ""}
                              onChange={(e) => {
                                const updated = [...(profileData.transportOptions?.tube || [])];
                                updated[index] = { ...updated[index], station: e.target.value };
                                setProfileData(prev => ({
                                  ...prev,
                                  transportOptions: { ...prev.transportOptions, tube: updated }
                                }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                              placeholder="Bond Street Station"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Lines</label>
                            <input
                              type="text"
                              value={item.lines || ""}
                              onChange={(e) => {
                                const updated = [...(profileData.transportOptions?.tube || [])];
                                updated[index] = { ...updated[index], lines: e.target.value };
                                setProfileData(prev => ({
                                  ...prev,
                                  transportOptions: { ...prev.transportOptions, tube: updated }
                                }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                              placeholder="Central & Jubilee lines"
                            />
                          </div>
                          <div className="flex gap-2 items-end">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Distance</label>
                              <input
                                type="text"
                                value={item.distance || ""}
                                onChange={(e) => {
                                  const updated = [...(profileData.transportOptions?.tube || [])];
                                  updated[index] = { ...updated[index], distance: e.target.value };
                                  setProfileData(prev => ({
                                    ...prev,
                                    transportOptions: { ...prev.transportOptions, tube: updated }
                                  }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                placeholder="5 min walk"
                              />
                            </div>
                            <div className="flex items-center pb-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (profileData.transportOptions?.tube || []).filter((_: any, i: number) => i !== index);
                                  setProfileData(prev => ({
                                    ...prev,
                                    transportOptions: { ...prev.transportOptions, tube: updated }
                                  }));
                                }}
                                className="w-7 h-7 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center shrink-0"
                                title="Remove"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(profileData.transportOptions?.tube || []), { station: "", lines: "", distance: "" }];
                          setProfileData(prev => ({
                            ...prev,
                            transportOptions: { ...prev.transportOptions, tube: updated }
                          }));
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Tube Station
                      </button>
                    </div>
                  </div>

                  {/* Bus */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Bus className="w-5 h-5 text-rose-500" />
                      <h5 className="font-semibold text-gray-800 dark:text-white">Bus</h5>
                    </div>
                    <div className="space-y-3">
                      {(profileData.transportOptions?.bus || []).map((item: any, index: number) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Route Numbers</label>
                            <input
                              type="text"
                              value={item.route || ""}
                              onChange={(e) => {
                                const updated = [...(profileData.transportOptions?.bus || [])];
                                updated[index] = { ...updated[index], route: e.target.value };
                                setProfileData(prev => ({
                                  ...prev,
                                  transportOptions: { ...prev.transportOptions, bus: updated }
                                }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                              placeholder="2, 13, 74, 113"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Stop Name</label>
                            <input
                              type="text"
                              value={item.stop || ""}
                              onChange={(e) => {
                                const updated = [...(profileData.transportOptions?.bus || [])];
                                updated[index] = { ...updated[index], stop: e.target.value };
                                setProfileData(prev => ({
                                  ...prev,
                                  transportOptions: { ...prev.transportOptions, bus: updated }
                                }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                              placeholder="Harley Street stop"
                            />
                          </div>
                          <div className="flex gap-2 items-end">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Distance</label>
                              <input
                                type="text"
                                value={item.distance || ""}
                                onChange={(e) => {
                                  const updated = [...(profileData.transportOptions?.bus || [])];
                                  updated[index] = { ...updated[index], distance: e.target.value };
                                  setProfileData(prev => ({
                                    ...prev,
                                    transportOptions: { ...prev.transportOptions, bus: updated }
                                  }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                placeholder="Optional"
                              />
                            </div>
                            <div className="flex items-center pb-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (profileData.transportOptions?.bus || []).filter((_: any, i: number) => i !== index);
                                  setProfileData(prev => ({
                                    ...prev,
                                    transportOptions: { ...prev.transportOptions, bus: updated }
                                  }));
                                }}
                                className="w-7 h-7 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center shrink-0"
                                title="Remove"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(profileData.transportOptions?.bus || []), { route: "", stop: "", distance: "" }];
                          setProfileData(prev => ({
                            ...prev,
                            transportOptions: { ...prev.transportOptions, bus: updated }
                          }));
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Bus Route
                      </button>
                    </div>
                  </div>

                  {/* Car/Parking */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Car className="w-5 h-5 text-rose-500" />
                      <h5 className="font-semibold text-gray-800 dark:text-white">Car/Parking</h5>
                    </div>
                    <div className="space-y-3">
                      {(profileData.transportOptions?.car || []).map((item: any, index: number) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Parking Name</label>
                            <input
                              type="text"
                              value={item.parking || ""}
                              onChange={(e) => {
                                const updated = [...(profileData.transportOptions?.car || [])];
                                updated[index] = { ...updated[index], parking: e.target.value };
                                setProfileData(prev => ({
                                  ...prev,
                                  transportOptions: { ...prev.transportOptions, car: updated }
                                }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                              placeholder="Q-Park Oxford Street"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Distance</label>
                            <input
                              type="text"
                              value={item.distance || ""}
                              onChange={(e) => {
                                const updated = [...(profileData.transportOptions?.car || [])];
                                updated[index] = { ...updated[index], distance: e.target.value };
                                setProfileData(prev => ({
                                  ...prev,
                                  transportOptions: { ...prev.transportOptions, car: updated }
                                }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                              placeholder="5 min walk"
                            />
                          </div>
                          <div className="flex gap-2 items-end">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Notes</label>
                              <input
                                type="text"
                                value={item.notes || ""}
                                onChange={(e) => {
                                  const updated = [...(profileData.transportOptions?.car || [])];
                                  updated[index] = { ...updated[index], notes: e.target.value };
                                  setProfileData(prev => ({
                                    ...prev,
                                    transportOptions: { ...prev.transportOptions, car: updated }
                                  }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                placeholder="Optional notes"
                              />
                            </div>
                            <div className="flex items-center pb-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (profileData.transportOptions?.car || []).filter((_: any, i: number) => i !== index);
                                  setProfileData(prev => ({
                                    ...prev,
                                    transportOptions: { ...prev.transportOptions, car: updated }
                                  }));
                                }}
                                className="w-7 h-7 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center shrink-0"
                                title="Remove"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(profileData.transportOptions?.car || []), { parking: "", distance: "", notes: "" }];
                          setProfileData(prev => ({
                            ...prev,
                            transportOptions: { ...prev.transportOptions, car: updated }
                          }));
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Parking Option
                      </button>
                    </div>
                  </div>

                  {/* Walking */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Navigation className="w-5 h-5 text-rose-500" />
                      <h5 className="font-semibold text-gray-800 dark:text-white">Walking</h5>
                    </div>
                    <div className="space-y-3">
                      {(profileData.transportOptions?.walking || []).map((item: any, index: number) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">From Location</label>
                            <input
                              type="text"
                              value={item.from || ""}
                              onChange={(e) => {
                                const updated = [...(profileData.transportOptions?.walking || [])];
                                updated[index] = { ...updated[index], from: e.target.value };
                                setProfileData(prev => ({
                                  ...prev,
                                  transportOptions: { ...prev.transportOptions, walking: updated }
                                }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                              placeholder="Oxford Street"
                            />
                          </div>
                          <div className="flex gap-2 items-end">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Distance</label>
                              <input
                                type="text"
                                value={item.distance || ""}
                                onChange={(e) => {
                                  const updated = [...(profileData.transportOptions?.walking || [])];
                                  updated[index] = { ...updated[index], distance: e.target.value };
                                  setProfileData(prev => ({
                                    ...prev,
                                    transportOptions: { ...prev.transportOptions, walking: updated }
                                  }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                placeholder="5 minutes"
                              />
                            </div>
                            <div className="flex items-center pb-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (profileData.transportOptions?.walking || []).filter((_: any, i: number) => i !== index);
                                  setProfileData(prev => ({
                                    ...prev,
                                    transportOptions: { ...prev.transportOptions, walking: updated }
                                  }));
                                }}
                                className="w-7 h-7 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center shrink-0"
                                title="Remove"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(profileData.transportOptions?.walking || []), { from: "", distance: "" }];
                          setProfileData(prev => ({
                            ...prev,
                            transportOptions: { ...prev.transportOptions, walking: updated }
                          }));
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Walking Route
                      </button>
                    </div>
                  </div>
                </div>

                {/* Nearby Landmarks */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Nearby Landmarks</h4>
                  <div className="space-y-3">
                    {profileData.nearbyLandmarks.map((landmark, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Landmark Name</label>
                          <input
                            type="text"
                            value={landmark.name || ""}
                            onChange={(e) => {
                              const updated = [...profileData.nearbyLandmarks];
                              updated[index] = { ...updated[index], name: e.target.value };
                              setProfileData(prev => ({ ...prev, nearbyLandmarks: updated }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            placeholder="Vauxhall Bridge"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Type</label>
                          <input
                            type="text"
                            value={landmark.type || ""}
                            onChange={(e) => {
                              const updated = [...profileData.nearbyLandmarks];
                              updated[index] = { ...updated[index], type: e.target.value };
                              setProfileData(prev => ({ ...prev, nearbyLandmarks: updated }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            placeholder="Landmark"
                          />
                        </div>
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Distance</label>
                            <input
                              type="text"
                              value={landmark.distance || ""}
                              onChange={(e) => {
                                const updated = [...profileData.nearbyLandmarks];
                                updated[index] = { ...updated[index], distance: e.target.value };
                                setProfileData(prev => ({ ...prev, nearbyLandmarks: updated }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                              placeholder="~5 min walk"
                            />
                          </div>
                          <div className="flex items-center pb-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = profileData.nearbyLandmarks.filter((_, i) => i !== index);
                                setProfileData(prev => ({ ...prev, nearbyLandmarks: updated }));
                              }}
                              className="w-7 h-7 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center shrink-0"
                              title="Remove"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileData(prev => ({
                          ...prev,
                          nearbyLandmarks: [...prev.nearbyLandmarks, { name: "", type: "", distance: "" }]
                        }));
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Landmark
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:via-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

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
                        onChange={(e) => handleSettingsInputChange("businessCity", e.target.value)}
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
                        onChange={(e) => handleSettingsInputChange("businessPostcode", e.target.value)}
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
                        onChange={(e) => handleSettingsInputChange("consultationRate", e.target.value)}
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
                        onChange={(e) => handleSettingsInputChange("standardRate", e.target.value)}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                        placeholder="75"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleSettingsSave}
                    disabled={isSaving}
                    className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:via-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    {isSaving ? "Saving..." : "Save Settings"}
                  </button>
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
                      onChange={(e) => handleSettingsInputChange("yearsOfExperience", e.target.value)}
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
                      onChange={(e) => handleSettingsInputChange("insuranceProvider", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                      placeholder="Enter insurance provider"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="fullyInsured"
                      checked={settings.fullyInsured}
                      onChange={(e) => handleSettingsInputChange("fullyInsured", e.target.checked)}
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
                    onChange={(e) => handleSettingsInputChange("specializations", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none"
                    placeholder="e.g., Botox, Fillers, Skin Treatments"
                  />
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleSettingsSave}
                    disabled={isSaving}
                    className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:via-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    {isSaving ? "Saving..." : "Save Settings"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "team" && (
              <TeamManager />
            )}

            {activeTab === "faq" && (
              <div className="space-y-6">
                <AdminFAQManager />
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Security Settings</h3>
                
                {!showPasswordForm ? (
                  <div className="text-center py-10">
                    <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Change Password</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Keep your account secure by updating your password regularly
                    </p>
                    <button
                      onClick={() => setShowPasswordForm(true)}
                      className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:via-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Change Password
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordChange} className="space-y-6 max-w-3xl">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Current Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          New Password *
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                          placeholder="Enter new password"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Confirm New Password *
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-4 pt-4">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 px-8 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:via-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? "Updating..." : "Update Password"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordData({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                        }}
                        className="px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { useToast } from "@/components/Toast";
import { User, Building2, Shield, Eye, EyeOff, Mail, Phone, HelpCircle, DollarSign, Settings, Save, Plus, X, Train, Bus, Car, Navigation } from "lucide-react";
import { AdminFAQManager } from "@/components/AdminFAQManager";
import WorkingHoursManager from "@/components/admin/WorkingHoursManager";

type ProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  businessEmail: string;
  phone: string;
  whatsapp: string;
  companyName: string;
  companyAddress: string;
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

};

const defaultSettings: SettingsState = {
  businessCity: "London",
  businessPostcode: "SW1A 1AA",
  businessAddress: "",
  businessPhone: process.env.NEXT_PUBLIC_PHONE_NUMBER || "07944 24 20 79",
  businessEmail: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "info@egpaesthetics.co.uk",
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"company" | "faq" | "security" | "business">("company");
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { profile: dbProfile, loading, error: profileError } = useAdminProfile();
  const { showSuccess, showError } = useToast();
  
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    businessEmail: "",
    phone: "",
    whatsapp: "",
    companyName: "",
    companyAddress: "",
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
    if (!loading) {
      if (dbProfile) {
        const [firstName, ...lastNameParts] = (dbProfile.name || "").split(" ");
        const lastName = lastNameParts.join(" ");

        // Parse JSON strings for transport_options and nearby_landmarks
        let transportOptions = {};
        let nearbyLandmarks: Array<{ name: string; type: string; distance: string }> = [];
        
        try {
          const transportOptionsRaw = (dbProfile as any).transport_options;
          if (typeof transportOptionsRaw === 'string') {
            transportOptions = JSON.parse(transportOptionsRaw);
          } else if (transportOptionsRaw) {
            transportOptions = transportOptionsRaw;
          }
        } catch (e) {
          console.error('Error parsing transport_options:', e);
        }

        try {
          const nearbyLandmarksRaw = (dbProfile as any).nearby_landmarks;
          if (typeof nearbyLandmarksRaw === 'string') {
            nearbyLandmarks = JSON.parse(nearbyLandmarksRaw);
          } else if (Array.isArray(nearbyLandmarksRaw)) {
            nearbyLandmarks = nearbyLandmarksRaw;
          }
        } catch (e) {
          console.error('Error parsing nearby_landmarks:', e);
        }

        // Use functional update to access current state and preserve avatar value
        setProfileData((prev) => ({
          firstName: firstName || "",
          lastName: lastName || "",
          email: dbProfile.email || "",
          businessEmail: dbProfile.business_email || process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "",
          phone: dbProfile.phone || process.env.NEXT_PUBLIC_PHONE_NUMBER || "07944 24 20 79",
          whatsapp: (dbProfile as any).whatsapp || dbProfile.phone || process.env.NEXT_PUBLIC_PHONE_NUMBER || "07944 24 20 79",
          companyName: dbProfile.company_name || "EGP Aesthetics",
          companyAddress: dbProfile.company_address || "809 Wandsworth Road, SW8 3JH, London, UK",
          // Preserve existing avatar value from previous state (avatar is not stored in database)
          avatar: prev.avatar || "",
          howToFindUs: (dbProfile as any).how_to_find_us || "",
          howToReachUs: (dbProfile as any).how_to_reach_us || "",
          googleMapsAddress: (dbProfile as any).google_maps_address || dbProfile.company_address || "809 Wandsworth Road, SW8 3JH, London, UK",
          transportOptions: transportOptions,
          nearbyLandmarks: nearbyLandmarks,
        }));

        // Load settings from database profile instead of localStorage
        setSettings({
          businessCity: (dbProfile.company_address || "").split(",").pop()?.trim() || "London",
          businessPostcode: (dbProfile.company_address || "").match(/[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}/i)?.[0] || "SW1A 1AA",
          businessAddress: dbProfile.company_address || "",
          businessPhone: dbProfile.phone || process.env.NEXT_PUBLIC_PHONE_NUMBER || "07944 24 20 79",
          businessEmail: dbProfile.business_email || process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "",
        });
      } else {
        // Initialize with default values if no profile exists
        setProfileData((prev) => ({
          ...prev,
          firstName: prev.firstName || "Admin",
          lastName: prev.lastName || "User",
          email: prev.email || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "",
          businessEmail: prev.businessEmail || process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "",
          phone: prev.phone || process.env.NEXT_PUBLIC_PHONE_NUMBER || "07944 24 20 79",
          companyName: prev.companyName || "EGP Aesthetics",
          companyAddress: prev.companyAddress || "809 Wandsworth Road, SW8 3JH, London, UK",
        }));
      }
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
          businessEmail: profileData.businessEmail,
          phone: profileData.phone,
          whatsapp: profileData.whatsapp,
          companyName: profileData.companyName,
          companyAddress: profileData.companyAddress,
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

  const handleSettingsInputChange = (key: keyof SettingsState, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSettingsSave = async () => {
    setIsSaving(true);
    try {
      // Save settings to database via profile API
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessEmail: settings.businessEmail,
          phone: settings.businessPhone,
          whatsapp: profileData.whatsapp,
          companyName: profileData.companyName,
          companyAddress: settings.businessAddress,
          howToFindUs: profileData.howToFindUs,
          howToReachUs: profileData.howToReachUs,
          googleMapsAddress: profileData.googleMapsAddress,
          transportOptions: profileData.transportOptions,
          nearbyLandmarks: profileData.nearbyLandmarks,
        }),
      });

      if (response.ok) {
        showSuccess("Success", "Settings saved successfully!");
        // Refresh profile data
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

  const tabs = [
    { id: "company", label: "Company & Business", icon: Building2 },
    { id: "business", label: "Business & Hours", icon: Settings },
    { id: "faq", label: "FAQ", icon: HelpCircle },
    { id: "security", label: "Security", icon: Eye },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-pink-50/50 to-purple-50/50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-2 border-rose-200 dark:border-rose-800"></div>
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-rose-500 dark:border-t-rose-400 animate-spin"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="w-full p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Error Loading Profile</h3>
          <p className="text-red-600 dark:text-red-400">{profileError}</p>
          <p className="text-sm text-red-500 dark:text-red-400 mt-2">
            Please check that the admin profile exists in the database. You may need to initialize it first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
          {/* Profile Header - compact for mobile */}
      <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 flex-shrink-0">
                  <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-white font-playfair truncate">
                    {dbProfile?.name || profileData.companyName}
                  </h2>
                  <p className="text-white/90 text-xs sm:text-sm truncate">{profileData.companyName}</p>
                  <div className="flex flex-col sm:flex-row sm:gap-4 gap-1 mt-2 text-white/80 text-xs sm:text-sm">
                    <span className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{dbProfile?.email || profileData.businessEmail}</span>
                    </span>
                    <span className="flex items-center gap-1.5 truncate">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{profileData.phone}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

      {/* Tabs Navigation - compact for mobile */}
      <div className="mb-4 sm:mb-6 border-b border-gray-200 dark:border-gray-700 -mx-1">
        <nav className="flex space-x-0 overflow-x-auto scrollbar-hide px-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-all whitespace-nowrap min-h-[44px] ${
                      activeTab === tab.id
                    ? "border-rose-500 text-rose-600 dark:text-rose-400 bg-gray-50 dark:bg-gray-800"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
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
      <div className="p-4 sm:p-0 space-y-4 sm:space-y-6">
            {activeTab === "company" && (
              <div className="space-y-4 sm:space-y-6">
                {/* Business Information Section */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Business Information</h3>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Business Email
                      </label>
                      <input
                        type="email"
                        value={profileData.businessEmail}
                        onChange={(e) => setProfileData(prev => ({ ...prev, businessEmail: e.target.value }))}
                        className="w-full min-h-[44px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                        placeholder="Enter business email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full min-h-[44px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        value={profileData.companyName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, companyName: e.target.value }))}
                        className="w-full min-h-[44px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
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
                      className="w-full min-h-[44px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                      placeholder="07944 24 20 79"
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
                    className="w-full min-h-[88px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none"
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
                    className="w-full min-h-[88px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none"
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
                    className="w-full min-h-[88px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none"
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
                    className="w-full min-h-[44px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Business City
                      </label>
                      <input
                        type="text"
                        value={settings.businessCity}
                        onChange={(e) => handleSettingsInputChange("businessCity", e.target.value)}
                        className="w-full min-h-[44px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
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
                        className="w-full min-h-[44px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                        placeholder="Enter postcode"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                  <WorkingHoursManager />
                </div>
              </div>
            )}

            {activeTab === "faq" && (
              <div className="space-y-6">
                <AdminFAQManager />
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
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
                          className="w-full min-h-[44px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
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
                          className="w-full min-h-[44px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
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
  );
}

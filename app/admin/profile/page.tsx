"use client";

import { useState, useEffect } from "react";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { useToast } from "@/components/Toast";
import { User, Building2, Shield, Save, Eye, EyeOff, Camera, Mail, Phone, MapPin } from "lucide-react";

type ProfileData = {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  businessEmail: string;
  phone: string;
  about: string;

  // Company Information
  companyName: string;
  companyAddress: string;

  // Professional Information (Aesthetic Clinic specific)
  yearsOfExperience: string;
  specializations: string;
  insuranceProvider: string;

  // Avatar
  avatar: string;
};

type PasswordData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"personal" | "company" | "professional" | "security">("personal");
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { profile: dbProfile, loading } = useAdminProfile();
  const { showSuccess, showError } = useToast();

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    businessEmail: "",
    phone: "",
    about: "",

    companyName: "",
    companyAddress: "",

    yearsOfExperience: "",
    specializations: "",
    insuranceProvider: "",

    avatar: "",
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Load profile data from database
    if (dbProfile && !loading) {
      const [firstName, ...lastNameParts] = dbProfile.name.split(" ");
      const lastName = lastNameParts.join(" ");

      setProfileData({
        firstName: firstName || "Admin",
        lastName: lastName || "User",
        email: dbProfile.email || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "",
        businessEmail: dbProfile.business_email || process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "",
        phone: dbProfile.phone || "+44 7700 900123",
        about: dbProfile.about || "",

        companyName: dbProfile.company_name || "EGP Aesthetics",
        companyAddress: dbProfile.company_address || "London, UK",

        yearsOfExperience: dbProfile.years_of_experience || "",
        specializations: dbProfile.specializations || "",
        insuranceProvider: dbProfile.insurance_provider || "",
      });
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
          about: profileData.about,
          companyName: profileData.companyName,
          companyAddress: profileData.companyAddress,
          yearsOfExperience: profileData.yearsOfExperience,
          specializations: profileData.specializations,
          insuranceProvider: profileData.insuranceProvider,
        }),
      });

      if (response.ok) {
        showSuccess("Profile updated successfully!");
      } else {
        showError("Failed to update profile. Please try again.");
      }
    } catch (error) {
      showError("An error occurred while updating your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError("New passwords do not match.");
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
        showSuccess("Password updated successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordForm(false);
      } else {
        showError("Failed to update password. Please check your current password.");
      }
    } catch (error) {
      showError("An error occurred while updating your password.");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "company", label: "Company", icon: Building2 },
    { id: "professional", label: "Professional", icon: Shield },
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
      <div className="max-w-4xl mx-auto p-6">
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
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-rose-100/50 dark:border-gray-700/50 overflow-hidden mb-8">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 p-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                  <User className="w-12 h-12 text-white" />
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105">
                  <Camera className="w-4 h-4 text-rose-600" />
                </button>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white font-playfair mb-1">
                  {profileData.firstName} {profileData.lastName}
                </h2>
                <p className="text-white/90 mb-2">{profileData.companyName}</p>
                <div className="flex items-center space-x-4 text-white/80">
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{profileData.email}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{profileData.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-all ${
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
            {activeTab === "personal" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    About You
                  </label>
                  <textarea
                    rows={4}
                    value={profileData.about}
                    onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    placeholder="Tell us about yourself and your expertise..."
                  />
                </div>
              </div>
            )}

            {activeTab === "company" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Company Information</h3>
                
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
                    Company Address
                  </label>
                  <textarea
                    rows={3}
                    value={profileData.companyAddress}
                    onChange={(e) => setProfileData(prev => ({ ...prev, companyAddress: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    placeholder="Enter company address"
                  />
                </div>
              </div>
            )}

            {activeTab === "professional" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Professional Information</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="text"
                    value={profileData.yearsOfExperience}
                    onChange={(e) => setProfileData(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    placeholder="e.g., 10+ years"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Specializations
                  </label>
                  <textarea
                    rows={3}
                    value={profileData.specializations}
                    onChange={(e) => setProfileData(prev => ({ ...prev, specializations: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    placeholder="e.g., Botox, Fillers, Skin Treatments"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Insurance Provider
                  </label>
                  <input
                    type="text"
                    value={profileData.insuranceProvider}
                    onChange={(e) => setProfileData(prev => ({ ...prev, insuranceProvider: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    placeholder="Enter insurance provider"
                  />
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Security Settings</h3>
                
                {!showPasswordForm ? (
                  <div className="text-center py-8">
                    <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Change Password</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Keep your account secure by updating your password regularly
                    </p>
                    <button
                      onClick={() => setShowPasswordForm(true)}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:via-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Change Password
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordChange} className="space-y-6">
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
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

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

                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:via-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Save Button */}
            {activeTab !== "security" && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:via-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
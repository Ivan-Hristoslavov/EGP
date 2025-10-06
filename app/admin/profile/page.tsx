"use client";

import { useState, useEffect } from "react";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { ListManager } from "@/components/AdminProfileData";
import { useToast, ToastMessages } from "@/components/Toast";

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

  // Professional Information
  insuranceProvider: string;
  yearsOfExperience: string;
  specializations: string;
  certifications: string;
  responseTime: string;

  // Banking Information
  bankName: string;
  accountNumber: string;
  sortCode: string;

  // Avatar
  avatar: string;
};

type PasswordData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<
    "personal" | "professional" | "security"
  >("personal");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
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

    insuranceProvider: "",
    yearsOfExperience: "",
    specializations: "",
    certifications: "",
    responseTime: "",

    bankName: "",
    accountNumber: "",
    sortCode: "",

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
        firstName: firstName || "Plamen",
        lastName: lastName || "Zhelev",
        email: dbProfile.email || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "plamen@fixmyleak.co.uk",
        businessEmail: dbProfile.business_email || process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "admin@fixmyleak.co.uk",
        phone: dbProfile.phone || "+44 7700 900123",
        about: dbProfile.about || "",

        companyName: dbProfile.company_name || "Fix My Leak",
        companyAddress: dbProfile.company_address || "London, UK",

        insuranceProvider: dbProfile.insurance_provider || "Zurich Insurance",
        yearsOfExperience: dbProfile.years_of_experience || "",
        specializations: dbProfile.specializations || "",
        certifications: dbProfile.certifications || "",
        responseTime: dbProfile.response_time || "",

        bankName: dbProfile.bank_name || "Barclays Bank",
        accountNumber: dbProfile.account_number || "12345678",
        sortCode: dbProfile.sort_code || "20-00-00",

        avatar: "",
      });
    }
  }, [dbProfile, loading]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage("");

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
          insuranceProvider: profileData.insuranceProvider,
          yearsOfExperience: profileData.yearsOfExperience,
          specializations: profileData.specializations,
          certifications: profileData.certifications,
          responseTime: profileData.responseTime,
          bankName: profileData.bankName,
          accountNumber: profileData.accountNumber,
          sortCode: profileData.sortCode,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      const data = await response.json();
      setSaveMessage("Profile updated successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
      showSuccess("Profile Updated", "Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      setSaveMessage("Error saving profile. Please try again.");
      setTimeout(() => setSaveMessage(""), 3000);
      showError("Save Failed", "Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError(
        ToastMessages.general.validationError.title,
        "New password and confirmation do not match."
      );
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError(
        ToastMessages.general.validationError.title,
        "Password must be at least 6 characters long."
      );
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to change password");
      }

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
      showSuccess(
        ToastMessages.profile.passwordChanged.title,
        ToastMessages.profile.passwordChanged.message
      );
    } catch (error) {
      showError(
        ToastMessages.profile.error.title,
        ToastMessages.profile.error.message
      );
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { 
      id: "personal", 
      name: "Personal Info", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    { 
      id: "security", 
      name: "Security", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
            Manage your personal information and professional credentials.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {saveMessage && (
            <div
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                saveMessage.includes("Error") ||
                saveMessage.includes("do not match") ||
                saveMessage.includes("must be")
                  ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                  : "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
              } transition-colors duration-300`}
            >
              {saveMessage}
            </div>
          )}
        </div>
      </div>

      {/* Profile Header Card */}
      {/* <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full flex items-center justify-center transition-colors duration-300">
              <span className="text-white font-bold text-2xl">
                {profileData.firstName[0]}
                {profileData.lastName[0]}
              </span>
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
              {profileData.firstName} {profileData.lastName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
              {profileData.email}
            </p>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
              {profileData.phone}
            </p>
            <div className="flex items-center mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 transition-colors duration-300">
                <span className="w-2 h-2 bg-green-400 dark:bg-green-500 rounded-full mr-1 transition-colors duration-300" />
                Administrator
              </span>
            </div>
          </div>
        </div>
      </div> */}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-300 flex items-center ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
                onClick={() => setActiveTab(tab.id as any)}
              >
                <span className="mr-2 flex-shrink-0">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Personal Information Tab */}
          {activeTab === "personal" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      First Name
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          firstName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Last Name
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          lastName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Admin Email (Login)
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-sm cursor-not-allowed transition-colors duration-300"
                      type="email"
                      value={profileData.email}
                      readOnly
                      title="Admin email cannot be changed for security reasons"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      This email is used for admin login and cannot be changed.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Business Email
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="email"
                      value={profileData.businessEmail}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          businessEmail: e.target.value,
                        })
                      }
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      This email will be displayed to customers and used for business communications.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Phone Number
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                  About Me
                </h4>
                <MarkdownEditor
                  value={profileData.about}
                  onChange={(value) =>
                    setProfileData({ ...profileData, about: value })
                  }
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                  This will be displayed on your public profile page.
                </p>
              </div>

              <div>
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                  Professional Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Years of Experience
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="text"
                      placeholder="e.g., 10+ Years"
                      value={profileData.yearsOfExperience}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          yearsOfExperience: e.target.value,
                        })
                      }
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      This will be displayed on your website (e.g., "10+ Years").
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Insurance Provider
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="text"
                      placeholder="e.g., Zurich Insurance"
                      value={profileData.insuranceProvider}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          insuranceProvider: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <ListManager
                      value={profileData.specializations}
                      onChange={(value) =>
                        setProfileData({
                          ...profileData,
                          specializations: value,
                        })
                      }
                      label="Specializations"
                      placeholder="e.g., Emergency repairs"
                      description="List your main areas of expertise. Press Enter or click + to add each item."
                    />
                  </div>
                  <div>
                    <ListManager
                      value={profileData.certifications}
                      onChange={(value) =>
                        setProfileData({
                          ...profileData,
                          certifications: value,
                        })
                      }
                      label="Certifications"
                      placeholder="e.g., Gas Safe Registered"
                      description="List your professional certifications and qualifications. Press Enter or click + to add each item."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Response Time
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="text"
                      placeholder="e.g., 45 minutes"
                      value={profileData.responseTime}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          responseTime: e.target.value,
                        })
                      }
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Your typical response time for customer inquiries.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                  Company Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Company Name
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      type="text"
                      placeholder="e.g., Fix My Leak"
                      value={profileData.companyName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          companyName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Company Address
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 resize-none"
                      rows={3}
                      placeholder="e.g., 123 Main Street, London, SW1A 1AA"
                      value={profileData.companyAddress}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          companyAddress: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                  disabled={isSaving}
                  onClick={handleSave}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                  Account Security
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 transition-colors duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
                        Password
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        Last changed: Never
                      </p>
                    </div>
                    <button
                      className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300"
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                    >
                      {showPasswordForm ? "Cancel" : "Change Password"}
                    </button>
                  </div>
                </div>

                {showPasswordForm && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                        Current Password
                      </label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                        New Password
                      </label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                        Confirm Password
                      </label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="md:col-span-3">
                      <button
                        className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                        disabled={isSaving}
                        onClick={handleChangePassword}
                      >
                        {isSaving ? "Changing..." : "Change Password"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

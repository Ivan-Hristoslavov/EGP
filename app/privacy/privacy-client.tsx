"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminProfile } from "@/components/AdminProfileContext";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

export default function PrivacyPageClient() {
  const adminProfile = useAdminProfile();
  const router = useRouter();
  const [privacyContent, setPrivacyContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrivacy = async () => {
      try {
        const response = await fetch("/api/privacy");
        if (response.ok) {
          const data = await response.json();
          setPrivacyContent(data.content || "");
        }
      } catch (error) {
        console.error("Error fetching privacy policy:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrivacy();
  }, []);

  const businessData = {
    businessName: adminProfile?.company_name,
    businessEmail: adminProfile?.business_email,
    businessPhone: adminProfile?.phone,
  };  

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Back Button */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Privacy Policy
            </h1>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading privacy policy...</p>
            </div>
          ) : (
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <MarkdownRenderer content={privacyContent} />
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="mt-8 bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
            Privacy Questions?
          </h3>
          <div className="space-y-2 text-green-800 dark:text-green-200">
            <p>
              <strong>Email:</strong> {businessData.businessEmail}
            </p>
            <p>
              <strong>Phone:</strong> {businessData.businessPhone}
            </p>
            <p>
              <strong>Company:</strong> {businessData.businessName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

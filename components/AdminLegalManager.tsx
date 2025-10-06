"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { useToast, ToastMessages } from "@/components/Toast";

type LegalContent = {
  terms: string;
  privacy_policy: string;
};

export function AdminLegalManager({ triggerModal }: { triggerModal?: boolean }) {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");
  const [content, setContent] = useState<LegalContent>({
    terms: "",
    privacy_policy: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadLegalContent();
  }, []);

  const loadLegalContent = async () => {
    try {
      setLoading(true);
      
      // Load from separate tables
      const [termsResult, privacyResult] = await Promise.all([
        supabase.from("terms").select("content").single(),
        supabase.from("privacy_policy").select("content").single()
      ]);

      let termsContent = "";
      let privacyContent = "";

      if (termsResult.data) {
        termsContent = termsResult.data.content;
      }

      if (privacyResult.data) {
        privacyContent = privacyResult.data.content;
      }

      setContent({
        terms: termsContent,
        privacy_policy: privacyContent,
      });
    } catch (error) {
      console.error("Error loading legal content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Update both tables
      const promises = [];
      
      // Update terms
      promises.push(
        supabase.from("terms").upsert({ 
          id: 1, 
          content: content.terms 
        })
      );
      
      // Update privacy policy
      promises.push(
        supabase.from("privacy_policy").upsert({ 
          id: 1, 
          content: content.privacy_policy 
        })
      );

      const results = await Promise.all(promises);
      
      // Check for errors
      for (const result of results) {
        if (result.error) {
          throw result.error;
        }
      }

      showSuccess("Legal Content Updated", "Terms and Privacy Policy have been saved successfully!");
    } catch (error) {
      console.error("Error saving legal content:", error);
      showError("Save Error", "Failed to save legal content. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { 
      id: "terms", 
      name: "Terms & Conditions", 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      id: "privacy", 
      name: "Privacy Policy", 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
            Manage your Terms & Conditions and Privacy Policy content.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2 text-sm"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
          💡 Quick Tips
        </h4>
        <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li>• Use clear, simple language your customers can understand</li>
          <li>• Include data collection, usage, and storage information</li>
          <li>• Specify service terms, cancellation policies, and payment terms</li>
          <li>• Add contact information for legal inquiries</li>
        </ul>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "terms" | "privacy")}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-300 flex items-center ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <span className="mr-2 flex-shrink-0">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Editor */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 lg:p-6 transition-colors duration-300">
        {activeTab === "terms" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
              Terms & Conditions
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Use Markdown formatting for rich text. This content will be displayed on your Terms of Service page.
              </p>
            </div>
            <MarkdownEditor
              value={content.terms}
              onChange={(value) => setContent({ ...content, terms: value })}
              placeholder="Enter your Terms & Conditions here using Markdown formatting..."
            />
          </div>
        )}

        {activeTab === "privacy" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
              Privacy Policy
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Use Markdown formatting for rich text. This content will be displayed on your Privacy Policy page.
              </p>
            </div>
            <MarkdownEditor
              value={content.privacy_policy}
              onChange={(value) => setContent({ ...content, privacy_policy: value })}
              placeholder="Enter your Privacy Policy here using Markdown formatting..."
            />
          </div>
        )}
      </div>

      {/* Preview Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 lg:p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
          Preview
        </h3>
        <div className="prose prose-lg max-w-none dark:prose-invert">
          {activeTab === "terms" && content.terms ? (
            <MarkdownRenderer content={content.terms} />
          ) : activeTab === "privacy" && content.privacy_policy ? (
            <MarkdownRenderer content={content.privacy_policy} />
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">
              No content to preview. Start typing in the editor above.
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 
"use client";

import { useState } from "react";
import { useToast, ToastMessages } from "@/components/Toast";

interface TestResults {
  sendgrid?: any;
  stripe?: any;
  emailSent?: any;
}

export default function TestEmailPage() {
  const [testEmail, setTestEmail] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const { showSuccess, showError } = useToast();

  const testSendGridConfig = async () => {
    setIsTesting(true);
    try {
      const response = await fetch("/api/test-email");
      const result = await response.json();
      
      setTestResults((prev: TestResults | null) => ({
        ...prev,
        sendgrid: result
      }));

      if (result.success && result.configured) {
        showSuccess("SMTP Test", "SMTP (Gmail) is properly configured!");
      } else {
        showError("SMTP Test", result.message || "SMTP configuration failed");
      }
    } catch (error) {
      console.error("Error testing SMTP:", error);
      showError("SMTP Test", "Failed to test SMTP configuration");
    } finally {
      setIsTesting(false);
    }
  };

  const sendTestEmail = async () => {
    setIsTesting(true);
    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(testEmail && { to: testEmail }),
          subject: "Test Email from Admin Panel",
          message: "This is a test email to verify that SMTP (Gmail) is working correctly with the admin panel.",
        }),
      });

      const result = await response.json();
      
      setTestResults((prev: TestResults | null) => ({
        ...prev,
        emailSent: result
      }));

      if (result.success) {
        showSuccess("Test Email", `Test email sent successfully to ${result.recipient || testEmail}`);
      } else {
        showError("Test Email", result.error || "Failed to send test email");
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      showError("Test Email", "Failed to send test email");
    } finally {
      setIsTesting(false);
    }
  };

  const testStripeConfig = async () => {
    setIsTesting(true);
    try {
      const response = await fetch("/api/payments/verify?test=true");
      const result = await response.json();
      
      setTestResults((prev: TestResults | null) => ({
        ...prev,
        stripe: result
      }));

      if (result.success) {
        showSuccess("Stripe Test", "Stripe is properly configured!");
      } else {
        showError("Stripe Test", result.error || "Stripe configuration failed");
      }
    } catch (error) {
      console.error("Error testing Stripe:", error);
      showError("Stripe Test", "Failed to test Stripe configuration");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mt-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            Test Email & Payment Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
            Test SMTP (Gmail) email functionality and Stripe payment configuration.
          </p>
        </div>
      </div>

      {/* Configuration Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SMTP Email (Gmail) Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              SMTP Email (Gmail)
            </h3>
            <div className={`w-3 h-3 rounded-full ${
              testResults?.sendgrid?.configured 
                ? 'bg-green-500' 
                : testResults?.sendgrid 
                  ? 'bg-red-500' 
                  : 'bg-gray-300'
            }`} />
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                SMTP configuration (SMTP_SERVER, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD) is verified when you run the test below. These are server-side environment variables.
              </p>
            </div>

            <button
              onClick={testSendGridConfig}
              disabled={isTesting}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isTesting ? "Testing..." : "Test SMTP Configuration"}
            </button>

            {testResults?.sendgrid && (
              <div className={`p-3 rounded-md text-sm ${
                testResults.sendgrid.success && testResults.sendgrid.configured
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
              }`}>
                {testResults.sendgrid.message}
              </div>
            )}
          </div>
        </div>

        {/* Stripe Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Stripe Configuration
            </h3>
            <div className={`w-3 h-3 rounded-full ${
              testResults?.stripe?.success 
                ? 'bg-green-500' 
                : testResults?.stripe 
                  ? 'bg-red-500' 
                  : 'bg-gray-300'
            }`} />
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Environment Variables:
              </p>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${
                    process.env.STRIPE_SECRET_KEY ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                    STRIPE_SECRET_KEY: {process.env.STRIPE_SECRET_KEY ? '✓ Set' : '✗ Missing'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${
                    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✓ Set' : '✗ Missing'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={testStripeConfig}
              disabled={isTesting}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isTesting ? "Testing..." : "Test Stripe Configuration"}
            </button>

            {testResults?.stripe && (
              <div className={`p-3 rounded-md text-sm ${
                testResults.stripe.success
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
              }`}>
                {testResults.stripe.message || testResults.stripe.error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Test Email Sending */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Send Test Email
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Enter email or leave blank to use SMTP_TO_ADDRESS"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            onClick={sendTestEmail}
            disabled={isTesting}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isTesting ? "Sending..." : "Send Test Email"}
          </button>

          {testResults?.emailSent && (
            <div className={`p-3 rounded-md text-sm ${
              testResults.emailSent.success
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            }`}>
              {testResults.emailSent.message || testResults.emailSent.error}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Setup Instructions
        </h3>
        <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <strong>Gmail SMTP Setup:</strong>
            <ol className="list-decimal list-inside mt-1 ml-4 space-y-1">
              <li>Add SMTP_SERVER=smtp.gmail.com, SMTP_PORT=465, SMTP_SECURITY=SSL to .env</li>
              <li>Set SMTP_USERNAME and SMTP_FROM_ADDRESS to your Gmail address</li>
              <li>Use an App Password for SMTP_PASSWORD (Google Account → Security → 2-Step Verification → App passwords)</li>
              <li>Optionally set SMTP_TO_ADDRESS for default test recipient</li>
            </ol>
          </div>
          <div>
            <strong>Stripe Setup:</strong>
            <ol className="list-decimal list-inside mt-1 ml-4 space-y-1">
              <li>Create a Stripe account at stripe.com</li>
              <li>Get your API keys from the Stripe dashboard</li>
              <li>Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to environment variables</li>
              <li>Configure webhook endpoints if needed</li>
            </ol>
          </div>
          <div>
            <strong>Sender Email Logic:</strong>
            <p className="mt-1 ml-4">
              The system uses SMTP_FROM_ADDRESS from environment, or falls back to business_email from admin profile, 
              then ADMIN_EMAIL.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
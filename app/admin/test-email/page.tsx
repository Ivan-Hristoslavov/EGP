"use client";

import { useState, useEffect } from "react";

import { useToast } from "@/components/Toast";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Spinner } from "@heroui/spinner";

import { formLayout, inputClassNames } from "@/config/design-system";
import { textColors, typography } from "@/config/typography";

type TemplateId =
  | "simple"
  | "booking_confirmation"
  | "payment_confirmed"
  | "admin_new_paid_booking"
  | "admin_booking_request"
  | "newsletter_welcome";

const TEMPLATE_OPTIONS: { value: TemplateId; label: string }[] = [
  { value: "simple", label: "Simple SMTP test" },
  {
    value: "booking_confirmation",
    label: "Booking confirmation (customer, with deposit)",
  },
  {
    value: "payment_confirmed",
    label: "Payment confirmed (customer, after Stripe)",
  },
  { value: "admin_new_paid_booking", label: "New paid booking (admin)" },
  {
    value: "admin_booking_request",
    label: "New booking request (admin, pending)",
  },
  { value: "newsletter_welcome", label: "Newsletter welcome (discount code)" },
];

interface TestResults {
  sendgrid?: any;
  stripe?: any;
  emailSent?: any;
}

export default function TestEmailPage() {
  const [testEmail, setTestEmail] = useState("");
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateId>("simple");
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [previewSubject, setPreviewSubject] = useState<string>("");
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  // Load preview when template changes
  useEffect(() => {
    let cancelled = false;

    setPreviewLoading(true);
    fetch(`/api/test-email?template=${encodeURIComponent(selectedTemplate)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.html != null) {
          setPreviewSubject(data.subject ?? "");
          setPreviewHtml(data.html);
        } else {
          setPreviewSubject("");
          setPreviewHtml("");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPreviewSubject("");
          setPreviewHtml("");
        }
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedTemplate]);

  const testSendGridConfig = async () => {
    setIsTesting(true);
    try {
      const response = await fetch("/api/test-email");
      const result = await response.json();

      setTestResults((prev: TestResults | null) => ({
        ...prev,
        sendgrid: result,
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
      const payload: Record<string, unknown> = {
        ...(testEmail && { to: testEmail }),
      };

      if (selectedTemplate !== "simple") {
        payload.template = selectedTemplate;
      } else {
        payload.subject = "Test Email from Admin Panel";
        payload.message =
          "This is a test email to verify that SMTP (Gmail) is working correctly with the admin panel.";
      }

      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      setTestResults((prev: TestResults | null) => ({
        ...prev,
        emailSent: result,
      }));

      if (result.success) {
        const templateLabel =
          TEMPLATE_OPTIONS.find((o) => o.value === selectedTemplate)?.label ??
          selectedTemplate;

        showSuccess(
          "Test Email",
          `"${templateLabel}" sent to ${result.recipient || testEmail}`,
        );
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
        stripe: result,
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
    <div className={`space-y-8 ${formLayout.sectionGap}`}>
      <div className="mt-6 flex items-center justify-between">
        <div>
          <h1
            className={`${typography.headingSection} ${textColors.heading} transition-colors duration-300`}
          >
            Test Email &amp; Payment Configuration
          </h1>
          <p
            className={`${typography.body} ${textColors.muted} mt-1 transition-colors duration-300`}
          >
            Test SMTP (Gmail) email functionality and Stripe payment
            configuration.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border border-divider shadow-sm">
          <CardHeader className="flex flex-col gap-1 border-b border-divider pb-4">
            <div className="flex items-center justify-between">
              <h3
                className={`${typography.headingCard} ${textColors.heading}`}
              >
                SMTP Email (Gmail)
              </h3>
              <div
                className={`h-3 w-3 rounded-full ${
                  testResults?.sendgrid?.configured
                    ? "bg-success-500"
                    : testResults?.sendgrid
                      ? "bg-danger-500"
                      : "bg-default-300"
                }`}
              />
            </div>
          </CardHeader>
          <CardBody className={formLayout.sectionGap}>
            <p className={`${typography.small} ${textColors.muted}`}>
              SMTP configuration (SMTP_SERVER, SMTP_PORT, SMTP_USERNAME,
              SMTP_PASSWORD) is verified when you run the test below. These are
              server-side environment variables.
            </p>
            <Button
              className="w-full"
              color="primary"
              isDisabled={isTesting}
              variant="solid"
              onPress={testSendGridConfig}
            >
              {isTesting ? "Testing…" : "Test SMTP Configuration"}
            </Button>
            {testResults?.sendgrid ? (
              <div
                className={`rounded-md p-3 text-sm ${
                  testResults.sendgrid.success &&
                  testResults.sendgrid.configured
                    ? "bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-300"
                    : "bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-300"
                }`}
              >
                {testResults.sendgrid.message}
              </div>
            ) : null}
          </CardBody>
        </Card>

        <Card className="border border-divider shadow-sm">
          <CardHeader className="flex flex-col gap-1 border-b border-divider pb-4">
            <div className="flex items-center justify-between">
              <h3
                className={`${typography.headingCard} ${textColors.heading}`}
              >
                Stripe Configuration
              </h3>
              <div
                className={`h-3 w-3 rounded-full ${
                  testResults?.stripe?.success
                    ? "bg-success-500"
                    : testResults?.stripe
                      ? "bg-danger-500"
                      : "bg-default-300"
                }`}
              />
            </div>
          </CardHeader>
          <CardBody className={formLayout.sectionGap}>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Environment Variables:
              </p>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      process.env.STRIPE_SECRET_KEY
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                    STRIPE_SECRET_KEY:{" "}
                    {process.env.STRIPE_SECRET_KEY ? "✓ Set" : "✗ Missing"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:{" "}
                    {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                      ? "✓ Set"
                      : "✗ Missing"}
                  </span>
                </div>
              </div>
            </div>

            <Button
              className="w-full"
              color="success"
              isDisabled={isTesting}
              variant="solid"
              onPress={testStripeConfig}
            >
              {isTesting ? "Testing…" : "Test Stripe Configuration"}
            </Button>

            {testResults?.stripe ? (
              <div
                className={`rounded-md p-3 text-sm ${
                  testResults.stripe.success
                    ? "bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-300"
                    : "bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-300"
                }`}
              >
                {testResults.stripe.message || testResults.stripe.error}
              </div>
            ) : null}
          </CardBody>
        </Card>
      </div>

      <Card className="border border-divider shadow-sm">
        <CardHeader className="flex flex-col gap-1 border-b border-divider">
          <h3 className={`${typography.headingCard} ${textColors.heading}`}>
            Send Test Email
          </h3>
          <p className={`${typography.small} ${textColors.muted}`}>
            Choose a template to send a test email with autofilled data (1:1
            with real booking/newsletter emails).
          </p>
        </CardHeader>
        <CardBody className={formLayout.sectionGap}>
          <Select
            label="Template"
            selectedKeys={new Set([selectedTemplate])}
            variant="bordered"
            onSelectionChange={(keys) => {
              const v = Array.from(keys)[0] as TemplateId | undefined;

              if (v) setSelectedTemplate(v);
            }}
          >
            {TEMPLATE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value}>{opt.label}</SelectItem>
            ))}
          </Select>
          <Input
            classNames={inputClassNames}
            label="Email Address"
            placeholder="Leave blank to use SMTP_TO_ADDRESS or ADMIN_EMAIL"
            type="email"
            value={testEmail}
            variant="bordered"
            onValueChange={setTestEmail}
          />

          <Button
            className="w-full"
            color="secondary"
            isDisabled={isTesting}
            variant="solid"
            onPress={sendTestEmail}
          >
            {isTesting
              ? "Sending…"
              : `Send "${TEMPLATE_OPTIONS.find((o) => o.value === selectedTemplate)?.label ?? selectedTemplate}" test email`}
          </Button>

          <div className="mt-6 border-t border-divider pt-6">
            <h4
              className={`${typography.headingSmall} ${textColors.heading} mb-2`}
            >
              Preview
            </h4>
            {previewSubject ? (
              <p className={`${typography.small} ${textColors.muted} mb-2`}>
                Subject:{" "}
                <span className={`font-medium ${textColors.body}`}>
                  {previewSubject}
                </span>
              </p>
            ) : null}
            <div className="overflow-hidden rounded-lg border border-divider bg-content2">
              {previewLoading ? (
                <div className="flex h-64 flex-col items-center justify-center gap-3 text-default-500">
                  <Spinner color="primary" size="lg" />
                  <span className={typography.small}>Loading preview…</span>
                </div>
              ) : previewHtml ? (
                <iframe
                  className="max-h-[70vh] min-h-[420px] w-full border-0 bg-white dark:bg-white"
                  sandbox="allow-same-origin"
                  srcDoc={previewHtml}
                  title="Email preview"
                />
              ) : (
                <div className="flex h-64 items-center justify-center text-default-500">
                  <span className={typography.small}>
                    Select a template to preview
                  </span>
                </div>
              )}
            </div>
          </div>

          {testResults?.emailSent ? (
            <div
              className={`rounded-md p-3 text-sm ${
                testResults.emailSent.success
                  ? "bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-300"
                  : "bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-300"
              }`}
            >
              {testResults.emailSent.message || testResults.emailSent.error}
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card className="border border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/20">
        <CardBody className={formLayout.sectionGap}>
          <h3
            className={`${typography.headingCard} text-primary-900 dark:text-primary-100`}
          >
            Setup Instructions
          </h3>
          <div
            className={`space-y-3 ${typography.body} text-primary-800 dark:text-primary-200`}
          >
            <div>
              <strong>Gmail SMTP Setup:</strong>
              <ol className="ml-4 mt-1 list-inside list-decimal space-y-1">
                <li>
                  Add SMTP_SERVER=smtp.gmail.com, SMTP_PORT=465,
                  SMTP_SECURITY=SSL to .env
                </li>
                <li>
                  Set SMTP_USERNAME and SMTP_FROM_ADDRESS to your Gmail address
                </li>
                <li>
                  Use an App Password for SMTP_PASSWORD (Google Account →
                  Security → 2-Step Verification → App passwords)
                </li>
                <li>Optionally set SMTP_TO_ADDRESS for default test recipient</li>
              </ol>
            </div>
            <div>
              <strong>Stripe Setup:</strong>
              <ol className="ml-4 mt-1 list-inside list-decimal space-y-1">
                <li>Create a Stripe account at stripe.com</li>
                <li>Get your API keys from the Stripe dashboard</li>
                <li>
                  Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                  to environment variables
                </li>
                <li>Configure webhook endpoints if needed</li>
              </ol>
            </div>
            <div>
              <strong>Sender Email Logic:</strong>
              <p className="ml-4 mt-1">
                The system uses SMTP_FROM_ADDRESS from environment, or falls back
                to business_email from admin profile, then ADMIN_EMAIL.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

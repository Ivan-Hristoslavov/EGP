"use client";
import { useState } from "react";
import { useReviews } from "@/hooks/useReviews";
import { useToast, ToastMessages } from "@/components/Toast";
import { Input, Textarea, Button } from "@heroui/react";

// Helpers
function isValidEmail(value: string) {
  if (!value) return true;
  return /\S+@\S+\.\S+/.test(value.trim());
}

function getValidationMessage(formData: { name: string; email: string; message: string; rating: number; }) {
  if (!formData.name.trim()) return "Name is required.";
  if (formData.name.trim().length < 2) return "Name must be at least 2 characters.";
  if (!isValidEmail(formData.email)) return "Please enter a valid email.";
  if (!formData.message.trim()) return "Review message is required.";
  if (formData.message.trim().length < 20) return "Review must be at least 20 characters.";
  if (formData.rating < 1) return "Please select a rating.";
  return "";
}

export function ReviewForm() {
  const { addReview } = useReviews();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    rating: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<null | {
    success: boolean;
    message: string;
  }>(null);

  const nameInvalid = formData.name !== "" && formData.name.trim().length < 2;
  const emailInvalid = formData.email !== "" && !isValidEmail(formData.email);
  const messageInvalid = formData.message !== "" && formData.message.trim().length < 20;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const validationMessage = getValidationMessage(formData);
      if (validationMessage) {
        showError(ToastMessages.general.validationError.title, validationMessage);
        setIsSubmitting(false);
        return;
      }

      await addReview({
        customer_name: formData.name,
        customer_email: formData.email,
        rating: formData.rating,
        title: "",
        comment: formData.message,
        message: formData.message,
        is_featured: false,
      });
      showSuccess(
        ToastMessages.reviews.submitted.title,
        ToastMessages.reviews.submitted.message
      );

      setSubmitResult({
        success: true,
        message: "Thank you! Your review has been submitted and is awaiting approval.",
      });

      setTimeout(() => {
        setSubmitResult(null);
        setFormData({ name: "", email: "", message: "", rating: 0 });
      }, 5000);
    } catch (err: any) {
      showError(
        ToastMessages.reviews.error.title,
        err.message || ToastMessages.reviews.error.message
      );
      setSubmitResult({
        success: false,
        message: "There was an error submitting your review. Please try again.",
      });

      setTimeout(() => {
        setSubmitResult(null);
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitResult) {
    return (
      <section className="py-16 bg-warm-beige-lighter dark:bg-gray-900" id="leave-review">
        <div className="max-w-xl mx-auto px-4">
          <div className={`relative overflow-hidden rounded-2xl p-8 text-center ${
            submitResult.success 
              ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800" 
              : "bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800"
          }`}>
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 ${
              submitResult.success ? "bg-green-400" : "bg-red-400"
              }`}></div>
            <div className="relative z-10">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                submitResult.success ? "bg-green-100 dark:bg-green-900/40" : "bg-red-100 dark:bg-red-900/40"
              }`}>
                <svg className={`w-10 h-10 ${submitResult.success ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {submitResult.success ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  )}
                </svg>
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${submitResult.success ? "text-green-900 dark:text-green-100" : "text-red-900 dark:text-red-100"}`}>
                {submitResult.success ? "Review Submitted!" : "Error Occurred"}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{submitResult.message}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-warm-beige-lighter dark:bg-gray-900" id="leave-review">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Share Your Experience
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Help us improve by sharing your feedback
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="bg-blue-600 p-4">
            <p className="text-white text-sm font-medium text-center">Your opinion matters to us</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6" noValidate>
            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                size="md"
                variant="bordered"
                radius="lg"
                label="Full Name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                isInvalid={nameInvalid}
                errorMessage={nameInvalid ? "Minimum 2 characters" : undefined}
                isRequired
                classNames={{
                  input: "text-sm",
                  label: "text-sm font-medium",
                }}
              />
              <Input
                size="md"
                variant="bordered"
                radius="lg"
                type="email"
                label="Email (Optional)"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                isInvalid={emailInvalid}
                errorMessage={emailInvalid ? "Invalid email format" : undefined}
                classNames={{
                  input: "text-sm",
                  label: "text-sm font-medium",
                }}
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                How would you rate your experience? <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, rating: v }))}
                      className={`transition-all duration-200 ${
                        formData.rating >= v
                          ? "text-amber-400 scale-110"
                          : "text-gray-300 dark:text-gray-600 hover:text-amber-300"
                      }`}
                    >
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
                {formData.rating > 0 && (
                  <span className="ml-auto px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm font-semibold text-amber-700 dark:text-amber-400">
                    {formData.rating} / 5
                  </span>
                )}
              </div>
            </div>

            {/* Message */}
            <Textarea
              size="md"
              variant="bordered"
              radius="lg"
              label="Your Review"
              minRows={5}
              placeholder="Share details about your experience with our services..."
              value={formData.message}
              onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
              isInvalid={messageInvalid}
              errorMessage={messageInvalid ? "Minimum 20 characters required" : undefined}
              isRequired
              classNames={{
                input: "text-sm",
                label: "text-sm font-medium",
              }}
            />
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <span>Minimum 20 characters</span>
              <span className="font-medium">{formData.message.trim().length} / 2000</span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                color="primary"
                size="lg"
                className="w-full font-semibold"
                isDisabled={isSubmitting || !!getValidationMessage(formData)}
                isLoading={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
                Your review will be published after our team approves it
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

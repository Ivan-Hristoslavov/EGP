"use client";
import { useState } from "react";
import { useReviews } from "@/hooks/useReviews";
import { useToast, ToastMessages } from "@/components/Toast";
import { Button, Input, Textarea, Card, CardBody, CardHeader } from "@heroui/react";

export function ReviewForm() {
  const { addReview } = useReviews();
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    rating: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [submitResult, setSubmitResult] = useState<null | {
    success: boolean;
    message: string;
  }>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    setSubmitResult(null);

    try {
      if (!form.name || !form.message) {
        showError(
          ToastMessages.general.validationError.title,
          "Name and message are required."
        );
        setSubmitting(false);
        return;
      }

      await addReview({
        customer_name: form.name,
        customer_email: form.email,
        rating: form.rating,
        title: "",
        comment: form.message,
        message: form.message, // Add the missing message field
        is_featured: false,
      });
      showSuccess(
        ToastMessages.reviews.submitted.title,
        ToastMessages.reviews.submitted.message
      );

      // Show success state
      setSubmitResult({
        success: true,
        message:
          "Thank you for your review! Your feedback has been submitted and is awaiting approval. It will be published on our website once reviewed by our team.",
      });

      // Reset form and success state after 5 seconds
      setTimeout(() => {
        setSubmitResult(null);
        setForm({ name: "", email: "", message: "", rating: 0 });
        setSuccess("");
        setError("");
      }, 5000);
    } catch (err: any) {
      showError(
        ToastMessages.reviews.error.title,
        err.message || ToastMessages.reviews.error.message
      );
      setSubmitResult({
        success: false,
        message:
          "There was an error submitting your review. Please try again or contact us directly.",
      });

      // Reset error state after 5 seconds
      setTimeout(() => {
        setSubmitResult(null);
      }, 5000);
    } finally {
      setSubmitting(false);
    }
  };

  // Show success/error result state
  if (submitResult) {
    return (
      <section
        className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-500"
        id="leave-review"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex flex-col items-center justify-center min-h-[500px] w-full rounded-3xl shadow-lg bg-white dark:bg-gray-900 p-8 transition-colors duration-300 ${submitResult.success ? "border-green-400" : "border-red-400"} border-2`}
          >
            <svg
              className={`w-20 h-20 mb-8 ${submitResult.success ? "text-green-500" : "text-red-500"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {submitResult.success ? (
                <>
                  <path
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </>
              ) : (
                <path
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              )}
            </svg>
            <h2
              className={`text-3xl font-bold mb-6 text-center ${submitResult.success ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
            >
              {submitResult.success ? "Review Submitted!" : "Submission Error"}
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 text-center mb-4 max-w-2xl leading-relaxed">
              {submitResult.message}
            </p>
            {submitResult.success && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                This form will reset in 5 seconds
              </div>
            )}
            <div className="w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
              <div
                className={`h-2 rounded-full ${submitResult.success ? "bg-green-500" : "bg-red-500"} animate-pulse`}
                style={{ width: "100%" }}
              ></div>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
              {submitResult.success
                ? "Thank you for choosing our services!"
                : "Please try again or contact us for assistance."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-500"
      id="leave-review"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-800 dark:text-blue-300 text-sm font-medium mb-6">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            Share Your Experience
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            Leave a Review
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
            Help others by sharing your experience with our aesthetic treatments
          </p>
        </div>

        {/* Review Form */}
        <div className="relative">
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-0">
              <div className="text-center">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-800 dark:text-blue-300 text-sm font-medium mb-6">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                  Share Your Experience
                </div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                  Leave a Review
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
                  Help others by sharing your experience with our aesthetic treatments
                </p>
              </div>
            </CardHeader>
            <CardBody className="p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
            {/* Success/Error Messages */}
            {success && (
              <div className="mb-8 p-4 bg-green-500/20 dark:bg-green-400/20 border border-green-400/40 dark:border-green-300/40 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-300 dark:text-green-200 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  <p className="text-green-200 dark:text-green-100 font-medium">
                    {success}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-8 p-4 bg-red-500/20 dark:bg-red-400/20 border border-red-400/30 dark:border-red-300/30 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-red-400 dark:text-red-300 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  <p className="text-red-200 dark:text-red-100 font-medium">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-300">
                  Your Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="w-full px-4 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 font-medium"
                    placeholder="Enter your full name"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg
                      className="w-5 h-5 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-300">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    className="w-full px-4 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 font-medium"
                    placeholder="your@email.com"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg
                      className="w-5 h-5 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating Section */}
            <div className="mt-8">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                Rate Your Experience
              </label>
              <div className="flex items-center justify-center gap-2 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setForm((f) => ({ ...f, rating: i + 1 }))}
                    className={`group relative w-12 h-12 rounded-full transition-all duration-300 transform hover:scale-110 ${
                      form.rating > i
                        ? "bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/30"
                        : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600"
                    }`}
                    aria-label={`Rate ${i + 1} stars`}
                  >
                    <svg
                      className={`w-6 h-6 mx-auto transition-colors duration-300 ${
                        form.rating > i
                          ? "text-white"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                    </svg>
                    {form.rating > i && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full shadow-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </button>
                ))}
                <div className="ml-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {form.rating}/5
                  </div>
                </div>
              </div>
            </div>

                {/* Message Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-300">
                    Your Review *
                  </label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Tell us about your experience with our aesthetic treatments. What did you like? How was our service quality and results?"
                    isRequired
                    variant="bordered"
                    minRows={6}
                    classNames={{
                      input: "text-gray-900 dark:text-white",
                      inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    }}
                  />
                </div>

                {/* Submit Button */}
                <div className="text-center">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg px-12 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                    size="lg"
                    isLoading={submitting}
                   >
                     {submitting ? "Submitting Review..." : "Submit Review"}
                  </Button>

                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Your review will be published after approval by our team
                  </p>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
}

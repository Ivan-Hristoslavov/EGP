"use client";

import { useState } from "react";
import { Calendar, X, Clock, User, Mail, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";

interface ButtonBookNowProps {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcon?: boolean;
}

export default function ButtonBookNow({
  variant = "primary",
  size = "md",
  className = "",
  showIcon = true,
}: ButtonBookNowProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    preferredDate: "",
    preferredTime: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          service: "Book Treatment Now",
          date: formData.preferredDate,
          time: formData.preferredTime,
          amount: 0,
          notes: formData.notes,
          status: "pending",
        }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          phone: "",
          preferredDate: "",
          preferredTime: "",
          notes: "",
        });
        
        // Close modal after 2 seconds
        setTimeout(() => {
          setIsModalOpen(false);
          setSubmitStatus("idle");
        }, 2000);
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Error submitting consultation request:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getButtonClasses = () => {
    const baseClasses = "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300";
    
    const sizeClasses = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    const variantClasses = {
      primary: "bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white hover:from-rose-600 hover:via-pink-600 hover:to-rose-700 shadow-lg hover:shadow-xl hover:scale-105",
      secondary: "bg-white text-rose-600 border-2 border-rose-500 hover:bg-rose-50 shadow-md hover:shadow-lg",
      outline: "bg-transparent text-rose-600 border-2 border-rose-500 hover:bg-gradient-to-r hover:from-rose-500 hover:to-pink-600 hover:text-white",
    };

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  };

  return (
    <>
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-3xl font-bold">Book Treatment Now</h2>
                <p className="text-rose-100 text-base mt-2">Worth £50 - Absolutely FREE!</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              {submitStatus === "success" ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Calendar className="w-8 h-8 text-rose-600" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    Consultation Booked!
                  </h3>
                  <p className="text-gray-600">
                    Thank you! We'll contact you shortly to confirm your appointment.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/30 transition-colors"
                      placeholder="John Smith"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/30 transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/30 transition-colors"
                      placeholder="+44 7XXX XXXXXX"
                    />
                  </div>

                  {/* Preferred Date & Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-3 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/30 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Preferred Time
                      </label>
                      <select
                        value={formData.preferredTime}
                        onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                        className="w-full px-4 py-3 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/30 transition-colors"
                      >
                        <option value="">Select time</option>
                        <option value="09:00">09:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="14:00">02:00 PM</option>
                        <option value="15:00">03:00 PM</option>
                        <option value="16:00">04:00 PM</option>
                        <option value="17:00">05:00 PM</option>
                        <option value="18:00">06:00 PM</option>
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/30 transition-colors resize-none"
                      placeholder="Any specific concerns or questions?"
                    />
                  </div>

                  {/* Error Message */}
                  {submitStatus === "error" && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      Sorry, there was an error booking your consultation. Please try calling us directly.
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-lg p-4">
                    <h4 className="font-semibold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-rose-600" />
                      What to Expect:
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold">✓</span>
                        <span>30-minute consultation worth £50</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold">✓</span>
                        <span>Digital skin analysis included</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold">✓</span>
                        <span>Personalized treatment plan</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold">✓</span>
                        <span>No obligation to book</span>
                      </li>
                    </ul>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold rounded-full hover:from-rose-600 hover:via-pink-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Booking...</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-5 h-5" />
                        <span>Book & Pay Now</span>
                      </>
                    )}
                  </button>

                  {/* Contact Alternative */}
                  <div className="text-center pt-4 border-t border-rose-100">
                    <p className="text-sm text-gray-600 mb-2">Prefer to speak to us?</p>
                    <a
                      href={`tel:${siteConfig.contact.phone}`}
                      className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent hover:from-rose-700 hover:to-pink-700 font-bold text-sm"
                    >
                      Call {siteConfig.contact.phone}
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}


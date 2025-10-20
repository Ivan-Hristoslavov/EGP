"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Calendar, Gift, Star, ArrowRight } from "lucide-react";

export default function MembershipSuccessPage() {
  const [membership, setMembership] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      verifyMembership(sessionId);
    } else {
      setError("No session ID provided");
      setLoading(false);
    }
  }, [sessionId]);

  const verifyMembership = async (sessionId: string) => {
    try {
      const response = await fetch("/api/membership/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (response.ok) {
        setMembership(data.membership);
      } else {
        setError(data.error || "Failed to verify membership");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-pink-50/50 to-purple-50/50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying your membership...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-pink-50/50 to-purple-50/50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Link
              href="/membership"
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Membership
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-pink-50/50 to-purple-50/50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-6">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent font-playfair mb-4">
            Welcome to {membership?.plan_name}!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Your membership has been successfully activated. You can now enjoy all the exclusive benefits.
          </p>
        </div>

        {/* Membership Details */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Membership Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Plan Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{membership?.plan_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Started:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(membership?.start_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Next Billing:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(membership?.next_billing_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Benefits</h3>
              <div className="space-y-3">
                {membership?.discount_percentage > 0 && (
                  <div className="flex items-center">
                    <Gift className="w-5 h-5 text-rose-500 mr-3" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {membership.discount_percentage}% discount on all treatments
                    </span>
                  </div>
                )}
                {membership?.priority_booking && (
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-rose-500 mr-3" />
                    <span className="text-gray-700 dark:text-gray-300">Priority booking access</span>
                  </div>
                )}
                {membership?.free_treatments_per_month > 0 && (
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-rose-500 mr-3" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {membership.free_treatments_per_month} free treatment{membership.free_treatments_per_month > 1 ? 's' : ''} per month
                    </span>
                  </div>
                )}
                {membership?.exclusive_access && (
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-rose-500 mr-3" />
                    <span className="text-gray-700 dark:text-gray-300">Exclusive member access</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">What's Next?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-full mb-4">
                <Calendar className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Book Your First Treatment</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Use your new membership benefits to book your next treatment with priority access.
              </p>
              <Link
                href="/book"
                className="inline-flex items-center text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-medium"
              >
                Book Now <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-full mb-4">
                <Star className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Explore Your Dashboard</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Manage your membership, view benefits, and track your treatment history.
              </p>
              <Link
                href="/customer/dashboard"
                className="inline-flex items-center text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-medium"
              >
                View Dashboard <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-full mb-4">
                <Gift className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Share the Benefits</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Refer friends and family to enjoy exclusive member benefits together.
              </p>
              <Link
                href="/customer/dashboard"
                className="inline-flex items-center text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-medium"
              >
                Refer Friends <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Questions about your membership? We're here to help!
          </p>
          <div className="flex justify-center space-x-6">
            <a
              href="tel:+442012345678"
              className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-medium"
            >
              +44 20 1234 5678
            </a>
            <a
              href="mailto:info@egpaesthetics.co.uk"
              className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-medium"
            >
              info@egpaesthetics.co.uk
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Star, ArrowLeft, CreditCard, Calendar, Gift } from "lucide-react";

interface MembershipPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  discount_percentage: number;
  priority_booking: boolean;
  free_treatments_per_month: number;
  consultation_discount: number;
  exclusive_access: boolean;
  features: string[];
  display_order: number;
}

export default function MembershipSignupPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadMembershipPlans();
  }, []);

  const loadMembershipPlans = async () => {
    try {
      const response = await fetch("/api/membership/plans");
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans);
        if (data.plans.length > 0) {
          setSelectedPlan(data.plans[1]); // Default to Premium plan
        }
      }
    } catch (error) {
      console.error("Error loading membership plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!selectedPlan) return;

    setProcessing(true);
    setError("");

    try {
      const token = localStorage.getItem("customer_token");
      if (!token) {
        router.push("/customer/login?redirect=/membership/signup");
        return;
      }

      const response = await fetch("/api/membership/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          billingCycle,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl;
      } else {
        setError(data.error || "Failed to create membership");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const getPrice = (plan: MembershipPlan) => {
    return billingCycle === "yearly" ? plan.price_yearly : plan.price_monthly;
  };

  const getSavings = (plan: MembershipPlan) => {
    if (billingCycle === "yearly") {
      const monthlyTotal = plan.price_monthly * 12;
      return monthlyTotal - plan.price_yearly;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-pink-50/50 to-purple-50/50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading membership plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-pink-50/50 to-purple-50/50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/membership" 
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Membership
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent font-playfair mb-4">
              Choose Your Membership Plan
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Join our exclusive membership program and enjoy premium benefits, priority booking, and exclusive discounts.
            </p>
          </div>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-rose-100/50 dark:border-gray-700/50">
            <div className="flex">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  billingCycle === "yearly"
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
            </div>
          </div>
        )}

        {/* Membership Plans */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border transition-all cursor-pointer ${
                  selectedPlan?.id === plan.id
                    ? "border-rose-300 dark:border-rose-600 shadow-2xl scale-105"
                    : "border-rose-100/50 dark:border-gray-700/50 hover:shadow-xl"
                }`}
                onClick={() => setSelectedPlan(plan)}
              >
                {/* Popular Badge */}
                {plan.slug === "premium" && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {plan.description}
                    </p>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        £{getPrice(plan)}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 ml-2">
                        /{billingCycle === "yearly" ? "year" : "month"}
                      </span>
                    </div>
                    {getSavings(plan) > 0 && (
                      <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                        Save £{getSavings(plan)} per year
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Additional Benefits */}
                  <div className="space-y-3 mb-8">
                    {plan.discount_percentage > 0 && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Gift className="w-4 h-4 mr-2" />
                        {plan.discount_percentage}% discount on all treatments
                      </div>
                    )}
                    {plan.priority_booking && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        Priority booking access
                      </div>
                    )}
                    {plan.free_treatments_per_month > 0 && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Star className="w-4 h-4 mr-2" />
                        {plan.free_treatments_per_month} free treatment{plan.free_treatments_per_month > 1 ? 's' : ''} per month
                      </div>
                    )}
                  </div>

                  {/* Select Button */}
                  <button
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                      selectedPlan?.id === plan.id
                        ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {selectedPlan?.id === plan.id ? "Selected" : "Select Plan"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sign Up Button */}
        {selectedPlan && (
          <div className="text-center mt-12">
            <button
              onClick={handleSignup}
              disabled={processing}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white font-semibold rounded-lg hover:from-rose-600 hover:via-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-3" />
                  Start {selectedPlan.name} Membership
                </>
              )}
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              Secure payment powered by Stripe. Cancel anytime.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

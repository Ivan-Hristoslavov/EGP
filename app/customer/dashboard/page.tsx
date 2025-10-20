"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Settings, 
  LogOut,
  Plus,
  Eye,
  Edit,
  X,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  Award
} from "lucide-react";

interface Booking {
  id: string;
  service: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  amount: number;
  practitioner?: string;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  memberSince: string;
  totalBookings: number;
  membershipTier?: string;
}

export default function CustomerDashboardPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "profile">("overview");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("customer_token");
    if (!token) {
      router.push("/customer/login");
      return;
    }

    loadCustomerData();
  }, [router]);

  const loadCustomerData = async () => {
    try {
      const token = localStorage.getItem("customer_token");
      const response = await fetch("/api/customer/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomer(data.customer);
        setBookings(data.bookings);
      } else {
        // Token expired or invalid
        localStorage.removeItem("customer_token");
        localStorage.removeItem("customer_id");
        router.push("/customer/login");
      }
    } catch (error) {
      console.error("Error loading customer data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_id");
    router.push("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-pink-50/50 to-purple-50/50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-pink-50/50 to-purple-50/50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Unable to load customer data</p>
          <button 
            onClick={() => router.push("/customer/login")}
            className="mt-4 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-pink-50/50 to-purple-50/50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent font-playfair mb-2">
                Welcome back, {customer.firstName}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your bookings and treatments
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/book"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Book Treatment
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 p-6 mb-8">
          <div className="flex space-x-8">
            {[
              { id: "overview", label: "Overview", icon: TrendingUp },
              { id: "bookings", label: "My Bookings", icon: Calendar },
              { id: "profile", label: "Profile", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats Cards */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{customer.totalBookings}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {bookings.filter(b => b.status === "completed").length}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {customer.membershipTier || "Standard"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Membership</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Bookings */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming Bookings</h3>
                {bookings.filter(b => b.status === "confirmed" || b.status === "pending").length > 0 ? (
                  <div className="space-y-4">
                    {bookings
                      .filter(b => b.status === "confirmed" || b.status === "pending")
                      .slice(0, 3)
                      .map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${getStatusColor(booking.status)}`}>
                              {getStatusIcon(booking.status)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{booking.service}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(booking.date).toLocaleDateString()} at {booking.time}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">£{booking.amount}</span>
                            <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">No upcoming bookings</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/book"
                    className="flex items-center space-x-3 p-3 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-lg hover:from-rose-100 hover:to-pink-100 dark:hover:from-rose-900/30 dark:hover:to-pink-900/30 transition-all"
                  >
                    <Plus className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    <span className="text-gray-900 dark:text-white">Book New Treatment</span>
                  </Link>
                  <Link
                    href="/customer/profile"
                    className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                  >
                    <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white">Update Profile</span>
                  </Link>
                  <Link
                    href="/membership"
                    className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                  >
                    <Award className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white">View Membership</span>
                  </Link>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Need Help?</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">+44 20 1234 5678</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">info@egpaesthetics.co.uk</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">London, UK</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">All Bookings</h3>
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{booking.service}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(booking.date).toLocaleDateString()} at {booking.time}
                          </p>
                          {booking.practitioner && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              with {booking.practitioner}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">£{booking.amount}</span>
                        <div className="flex items-center space-x-2">
                          <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <Eye className="w-4 h-4" />
                          </button>
                          {(booking.status === "confirmed" || booking.status === "pending") && (
                            <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No bookings yet</p>
                <Link
                  href="/book"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Book Your First Treatment
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-rose-100/50 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                <input
                  type="text"
                  value={customer.firstName}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                <input
                  type="text"
                  value={customer.lastName}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={customer.email}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={customer.phone}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Member Since</label>
                <input
                  type="text"
                  value={new Date(customer.memberSince).toLocaleDateString()}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Membership Tier</label>
                <input
                  type="text"
                  value={customer.membershipTier || "Standard"}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  readOnly
                />
              </div>
            </div>
            <div className="mt-6">
              <button className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all">
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

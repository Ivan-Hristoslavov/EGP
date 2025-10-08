"use client";

import { useState, useEffect } from "react";
import { AdminProfileData } from "@/components/AdminProfileData";
import FormBooking from "@/components/FormBooking";
import { useWorkingHours } from "@/hooks/useWorkingHours";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useToast, ToastMessages } from "@/components/Toast";
import { useAdminProfile } from "@/components/AdminProfileContext";

type ServiceArea = {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
};

type BusinessSettings = {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  emergencyRate: string;
  standardRate: string;
  responseTime: string;
};

export default function SectionContact() {
  const { showSuccess, showError } = useToast();
  const adminProfile = useAdminProfile();
  const { settings: adminSettings, isLoading: isLoadingSettings } =
    useAdminSettings();
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [isLoadingAreas, setIsLoadingAreas] = useState(true);
  const { workingHours } = useWorkingHours();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<null | {
    success: boolean;
    message: string;
  }>(null);

  // Get business data from admin profile and settings
  const businessData = {
    businessName: adminProfile?.company_name || "EGP",
    businessEmail: adminProfile?.business_email || "",
    businessPhone: adminProfile?.phone || "+44 7541777225",
    businessAddress: adminProfile?.company_address || "London, UK",
    responseTime:
      adminSettings?.responseTime ||
      adminProfile?.response_time ||
      "45 minutes",
    emergencyRate: adminSettings?.emergencyRate || "150",
    standardRate: adminSettings?.standardRate || "75",
  };



  useEffect(() => {
    const fetchServiceAreas = async () => {
      try {
        const areasResponse = await fetch("/api/areas");
        if (areasResponse.ok) {
          const areas = await areasResponse.json();
          setServiceAreas(areas.filter((area: ServiceArea) => area.is_active));
        }
      } catch (error) {
        console.error("Error fetching service areas:", error);
      } finally {
        setIsLoadingAreas(false);
      }
    };

    fetchServiceAreas();
  }, []);

  const formatWorkingHours = () => {
    const start = workingHours.workingHoursStart;
    const end = workingHours.workingHoursEnd;
    const days = workingHours.workingDays;

    // Create a mapping of day names to their short forms
    const dayMap: { [key: string]: string } = {
      monday: "Mon",
      tuesday: "Tue",
      wednesday: "Wed",
      thursday: "Thu",
      friday: "Fri",
      saturday: "Sat",
      sunday: "Sun",
    };

    // Sort days in the correct order
    const dayOrder = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const sortedDays = days.sort(
      (a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)
    );

    // Convert to short day names
    const shortDays = sortedDays.map((day) => dayMap[day] || day);

    // Function to find consecutive ranges
    const findConsecutiveRanges = (days: string[]) => {
      const ranges: string[][] = [];
      let currentRange: string[] = [];

      for (let i = 0; i < days.length; i++) {
        const currentDay = days[i];
        const currentIndex = dayOrder.indexOf(currentDay);
        
        if (currentRange.length === 0) {
          currentRange.push(currentDay);
        } else {
          const lastDay = currentRange[currentRange.length - 1];
          const lastIndex = dayOrder.indexOf(lastDay);
          
          if (currentIndex === lastIndex + 1) {
            // Consecutive day
            currentRange.push(currentDay);
          } else {
            // Non-consecutive, save current range and start new one
            ranges.push([...currentRange]);
            currentRange = [currentDay];
          }
        }
      }
      
      // Add the last range
      if (currentRange.length > 0) {
        ranges.push(currentRange);
      }
      
      return ranges;
    };

    // Format the display string
    if (days.length === 0) {
      return `${start} - ${end} (No working days set)`;
    } else if (days.length === 7) {
      return `${start} - ${end} (7 days/week)`;
    } else if (days.length === 1) {
      return `${start} - ${end} (${shortDays[0]})`;
    } else {
      // Find consecutive ranges
      const ranges = findConsecutiveRanges(sortedDays);
      
      // Format each range
      const formattedRanges = ranges.map(range => {
        const rangeShortDays = range.map(day => dayMap[day] || day);
        if (range.length === 1) {
          return rangeShortDays[0];
        } else {
          return `${rangeShortDays[0]}-${rangeShortDays[rangeShortDays.length - 1]}`;
        }
      });
      
      return `${start} - ${end} (${formattedRanges.join(", ")})`;
    }
  };

  return (
    <section
      className="py-24 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500"
      id="contact"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-full text-blue-700 dark:text-blue-300 text-sm font-semibold mb-6 shadow-sm">
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            {/* Get Professional Help - COMMENTED OUT - Will use direct booking with payment instead */}
          </div>
          {/* <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
            Contact & Book Your Service
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-300 max-w-4xl mx-auto">
            Get in touch for immediate assistance or book your service online.
            Professional plumbing solutions available 24/7.
          </p> */}
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
            Book & Pay Immediately
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-300 max-w-4xl mx-auto">
            Book your aesthetic treatment and pay securely online. 
            Professional aesthetic treatments with instant confirmation.
          </p>
        </div>

        {/* Two Row Layout */}
        <div className="space-y-12">
          {/* Row 1: Contact Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Emergency Contact */}
            <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 dark:from-red-500/10 dark:to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Emergency 24/7
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Urgent plumbing repairs
                </p>
                {isLoadingSettings ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                ) : (
                  <>
                    <a
                      href={`tel:${businessData.businessPhone}`}
                      className="text-red-600 dark:text-red-400 font-bold text-lg hover:text-red-700 dark:hover:text-red-300 transition-colors"
                    >
                      {businessData.businessPhone}
                    </a>
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      From £{businessData.emergencyRate}/hour
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Regular Contact */}
            <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Regular Service
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {isLoadingSettings ? "Loading..." : formatWorkingHours()}
                </p>
                {isLoadingSettings ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                ) : (
                  <>
                    <a
                      href={`tel:${businessData.businessPhone}`}
                      className="text-green-600 dark:text-green-400 font-bold text-lg hover:text-green-700 dark:hover:text-green-300 transition-colors"
                    >
                      {businessData.businessPhone}
                    </a>
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      From £{businessData.standardRate}/hour
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Email Contact */}
            <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-7 h-7 text-white"
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Email Us
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Quick quotes & inquiries
                </p>
                {isLoadingSettings ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
                  </div>
                ) : (
                  <>
                    <a
                      href={`mailto:${businessData.businessEmail}`}
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors text-sm break-all"
                    >
                      {businessData.businessEmail}
                    </a>
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      Response within {businessData.responseTime}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Service Areas */}
            <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 dark:from-purple-500/10 dark:to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                    <path
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Coverage Areas
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {isLoadingAreas ? "Loading..." : serviceAreas.length > 0 ? `${serviceAreas.length} areas` : "South West London"}
                </p>
                {isLoadingAreas ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                ) : serviceAreas.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {serviceAreas.map((area) => (
                      <span
                        key={area.id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                      >
                        {area.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-purple-600 dark:text-purple-400 font-semibold text-sm">
                    {isLoadingAreas ? "Loading..." : "Clapham, Balham, Chelsea"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Booking Form */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Book Your Service Online
                  </h3>
                  <p className="text-blue-100">
                    Fast booking • Transparent pricing • Professional service
                  </p>
                </div>
                <div className="hidden lg:flex items-center space-x-6 text-white">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
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
                    <span className="text-sm">
                      {" "}
                      {businessData.responseTime} response
                    </span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
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
                    <span className="text-sm">No hidden fees</span>
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="p-8">
              <FormBooking />
            </div> */}
            <div className="p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Direct Booking with Payment
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Coming soon - Book and pay for your treatment instantly online.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={`tel:${businessData.businessPhone}`}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-lg font-semibold rounded-full hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call to Book Now
                </a>
                <a
                  href={`https://wa.me/${businessData.businessPhone.replace(/\s/g, "").replace(/\+/g, "")}?text=${encodeURIComponent("Hi! I'd like to book a treatment.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-green-500 text-green-500 dark:text-green-400 text-lg font-semibold rounded-full hover:bg-green-500 hover:text-white transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp Booking
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

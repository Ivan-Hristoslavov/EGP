"use client";

import { useState, useEffect } from "react";
import { useToast, ToastMessages } from "@/components/Toast";
import { usePricingCardsForBooking, type BookingService } from "@/hooks/usePricingCardsForBooking";
import { useWorkingHours } from "@/hooks/useWorkingHours";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useAdminProfile } from "@/components/AdminProfileContext";
import CustomDatePicker from "./CustomDatePicker";

type DayOffSettings = {
  isEnabled: boolean;
  message: string;
  startDate: string;
  endDate: string;
};

export default function FormBooking() {
  const { showSuccess, showError } = useToast();
  const { services, isLoading: isLoadingServices } = usePricingCardsForBooking();
  const { timeSlots, isLoading: isLoadingTimeSlots } = useWorkingHours();
  const { settings: adminSettings, isLoading: isLoadingSettings } = useAdminSettings();
  const adminProfile = useAdminProfile();
  const [selectedService, setSelectedService] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formKey] = useState(() => Math.random().toString(36));
  const [submitResult, setSubmitResult] = useState<null | { success: boolean; message: string }>(null);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [dayOffInfo, setDayOffInfo] = useState<{
    isDayOff: boolean;
    title?: string;
    description?: string;
    bannerMessage?: string;
  }>({ isDayOff: false });

  // State to store day-off periods for date validation
  const [dayOffPeriods, setDayOffPeriods] = useState<Array<{
    start_date: string;
    end_date: string;
    title: string;
  }>>([]);

  // Get business phone from admin profile
  const businessPhone = adminProfile?.phone || "+44 7541777225";

  // Get today's date for the minimum date and default value
  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  // Function to find the next available date after day-off periods
  const findNextAvailableDate = (dayOffPeriods: Array<{ start_date: string; end_date: string; title: string }>) => {
    let checkDate = new Date(today);
    
    // Check up to 30 days in the future
    for (let i = 0; i < 30; i++) {
      const dateString = checkDate.toISOString().split("T")[0];
      
      // Check if this date is not in any day-off period
      const isDisabled = dayOffPeriods.some(period => {
        const checkDateObj = new Date(dateString);
        const startDate = new Date(period.start_date);
        const endDate = new Date(period.end_date);
        return checkDateObj >= startDate && checkDateObj <= endDate;
      });
      
      if (!isDisabled) {
        return dateString;
      }
      
      // Move to next day
      checkDate.setDate(checkDate.getDate() + 1);
    }
    
    // If no available date found in 30 days, return today
    return minDate;
  };

  // Initialize with today's date, will be updated when day-off periods are loaded
  const [selectedDate, setSelectedDate] = useState(minDate);

  // Check if a date is in day off period
  const isDateInDayOff = (date: string) => {
    const dayOffSettings = adminSettings?.dayOffSettings;
    if (!dayOffSettings || !dayOffSettings.isEnabled) return false;
    
    const checkDate = new Date(date);
    const startDate = dayOffSettings.startDate ? new Date(dayOffSettings.startDate) : null;
    const endDate = dayOffSettings.endDate ? new Date(dayOffSettings.endDate) : null;

    if (startDate && checkDate < startDate) return false;
    if (endDate && checkDate > endDate) return false;
    
    return true;
  };

  // Get max date considering day off periods
  const getMaxDate = () => {
    // Default to 3 months from now
    const defaultMaxDate = new Date();
    defaultMaxDate.setMonth(defaultMaxDate.getMonth() + 3);
    return defaultMaxDate.toISOString().split("T")[0];
  };

  // Fetch day-off periods for date validation
  useEffect(() => {
    const fetchDayOffPeriods = async () => {
      try {
        const response = await fetch("/api/admin/day-off");
        if (response.ok) {
          const periods = await response.json();
          setDayOffPeriods(periods);
          
          // Automatically set the next available date
          const nextAvailableDate = findNextAvailableDate(periods);
          setSelectedDate(nextAvailableDate);
        }
      } catch (error) {
        console.error("Error fetching day-off periods:", error);
      }
    };

    fetchDayOffPeriods();
  }, []);

  // Check if a date is in a day-off period
  const isDateDisabled = (date: string) => {
    return dayOffPeriods.some(period => {
      const checkDate = new Date(date);
      const startDate = new Date(period.start_date);
      const endDate = new Date(period.end_date);
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  // Check availability when date changes
  useEffect(() => {
    if (selectedDate) {
      checkAvailability(selectedDate);
    }
  }, [selectedDate]);

  // Update selected date when day-off periods change
  useEffect(() => {
    if (dayOffPeriods.length > 0) {
      const nextAvailableDate = findNextAvailableDate(dayOffPeriods);
      setSelectedDate(nextAvailableDate);
    }
  }, [dayOffPeriods]);

  const checkAvailability = async (date: string) => {
    setIsCheckingAvailability(true);
    try {
      const response = await fetch(`/api/bookings/availability?date=${date}`);
      if (response.ok) {
        const data = await response.json();
        
        // Check if this date is in a day-off period
        if (data.isDayOff) {
          setBookedTimes([]); // No time slots available
          setDayOffInfo({
            isDayOff: true,
            title: data.dayOffTitle,
            description: data.dayOffDescription,
            bannerMessage: data.bannerMessage
          });
          return;
        }
        
        // Reset day-off info if not in day-off period
        setDayOffInfo({ isDayOff: false });
        const bookedTimeSlots = data.bookedTimes.map((slot: any) => slot.time);
        setBookedTimes(bookedTimeSlots);
      } else {
        console.error("Failed to check availability");
        setBookedTimes([]);
        setDayOffInfo({ isDayOff: false });
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      setBookedTimes([]);
      setDayOffInfo({ isDayOff: false });
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Normalize time to HH:mm
  function normalizeTime(str: string) {
    // Взимаме само първите 5 символа, ако е във формат HH:mm или HH:mm:SS
    // Ако е във формат '18:00 - 19:00', взимаме първата част
    const time = str.split(" - ")[0].trim();
    // Ако е HH:mm:SS -> HH:mm
    if (time.length >= 5) return time.slice(0,5);
    return time;
  }

  const isTimeSlotBooked = (timeSlot: string) => {
    const slotTime = normalizeTime(timeSlot);
    return bookedTimes.some(t => normalizeTime(t) === slotTime);
  };

  const availableTimeSlots = dayOffInfo.isDayOff 
    ? [] // No time slots available during day-off periods
    : timeSlots.filter((slot: string) => !isTimeSlotBooked(slot));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        address: formData.get("address") as string,
        service: formData.get("service") as string,
        preferredDate: formData.get("preferred-date") as string,
        timeSlot: formData.get("timeSlot") as string,
        description: formData.get("description") as string,
      };

      // Validate required fields
      if (
        !data.name ||
        !data.email ||
        !data.phone ||
        !data.address ||
        !data.service ||
        !data.preferredDate ||
        !data.timeSlot
      ) {
        showError(ToastMessages.general.validationError.title, "Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      // Check if selected time slot is booked
      if (isTimeSlotBooked(data.timeSlot)) {
        showError("Time Slot Unavailable", "This time slot is no longer available. Please select a different time.");
        setIsSubmitting(false);
        return;
      }

      // Check if date is in day off period
      if (dayOffInfo.isDayOff) {
        showError("Day Off Period", "Bookings are not available on this date. Please select another date.");
        setIsSubmitting(false);
        return;
      }

      // Find selected service details
      const selectedServiceData = services.find((s: BookingService) => s.id === data.service);
      const serviceName = selectedServiceData?.name || data.service;

      // First, create or find customer
      let customerId: string;

      // Check if customer already exists by email
      const existingCustomerResponse = await fetch("/api/customers");
      const existingCustomers = await existingCustomerResponse.json();
      const existingCustomer = existingCustomers.find(
        (c: any) => c.email === data.email,
      );

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        // Create new customer
        const customerData = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          customer_type: "individual",
        };

        const customerResponse = await fetch("/api/customers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(customerData),
        });

        if (!customerResponse.ok) {
          const errorData = await customerResponse.json();
          throw new Error(errorData.error || "Failed to create customer");
        }

        const newCustomer = await customerResponse.json();
        customerId = newCustomer.id;
      }

      // Create booking
      const bookingData = {
        customer_id: customerId,
        customer_name: data.name,
        customer_email: data.email,
        customer_phone: data.phone,
        service: serviceName,
        date: data.preferredDate,
        time: data.timeSlot.split(" - ")[0],
        status: "scheduled",
        payment_status: "pending",
        amount: 80.0,
        address: data.address,
        notes: data.description || null,
      };

      const bookingResponse = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json();
        if (errorData.conflict) {
          showError("Time Slot Conflict", errorData.message);
        } else {
          throw new Error(errorData.error || "Failed to create booking");
        }
        setIsSubmitting(false);
        return;
      }

      showSuccess(ToastMessages.bookings.submitted.title, ToastMessages.bookings.submitted.message);
      setSubmitResult({ success: true, message: "Your booking request was sent successfully! We'll contact you soon." });
      setTimeout(() => {
        setSubmitResult(null);
        setSelectedService("");
        setSelectedDate("");
        setBookedTimes([]);
        (e.target as HTMLFormElement).reset();
      }, 5000);
    } catch (error) {
      console.error("Error submitting booking:", error);
      showError(
        ToastMessages.bookings.error.title,
        error instanceof Error
          ? error.message
          : ToastMessages.bookings.error.message
      );
      setSubmitResult({ success: false, message: "There was an error sending your booking request. Please try again or call us directly." });
      setTimeout(() => setSubmitResult(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitResult) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[500px] w-full rounded-xl shadow-lg bg-white dark:bg-gray-800 p-8 transition-colors duration-300 ${submitResult.success ? 'border-green-400' : 'border-red-400'} border-2`}>
        <svg
          className={`w-16 h-16 mb-6 ${submitResult.success ? 'text-green-500' : 'text-red-500'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {submitResult.success ? (
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          ) : (
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          )}
        </svg>
        <h2 className={`text-2xl font-bold mb-4 ${submitResult.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>{submitResult.success ? 'Success!' : 'Error'}</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 text-center mb-2">{submitResult.message}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">This message will disappear in 5 seconds.</p>
      </div>
    );
  }

  return (
    <form key={formKey} className="space-y-6" onSubmit={handleSubmit}>
      
      {/* Grid Layout for Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column - Personal Details */}
        <div className="space-y-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">1</span>
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Your Details</h4>
          </div>
          
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="name">
              Full Name *
            </label>
            <input
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base"
              id="name"
              name="name"
              placeholder="Your full name"
              type="text"
            />
          </div>

          {/* Email and Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="email">
                Email *
              </label>
              <input
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base"
                id="email"
                name="email"
                placeholder="your@email.com"
                type="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="phone">
                Phone *
              </label>
              <input
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base"
                id="phone"
                name="phone"
                placeholder="+44 7XXX XXXXXX"
                type="tel"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="address">
              Service Address *
            </label>
            <textarea
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none text-sm"
              id="address"
              name="address"
              placeholder="Full address where service is needed"
              rows={2}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="description">
              Problem Description
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none text-sm"
              id="description"
              name="description"
              placeholder="Any additional notes or questions..."
              rows={2}
            />
          </div>
        </div>

        {/* Right Column - Service & Schedule */}
        <div className="space-y-4">
          
          {/* Service Selection */}
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-7 h-7 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 font-bold text-xs">2</span>
              </div>
              <h4 className="text-base font-semibold text-gray-900 dark:text-white">Service & Schedule</h4>
            </div>
            
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Service *
              </label>
              {isLoadingServices ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-16"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {services.map((service: BookingService) => (
                    <div
                      key={service.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-sm ${
                        selectedService === service.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                      onClick={() => setSelectedService(service.id)}
                    >
                      <input
                        checked={selectedService === service.id}
                        className="sr-only"
                        name="service"
                        type="radio"
                        value={service.id}
                        onChange={(e) => setSelectedService(e.target.value)}
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1">
                          <span className="text-lg">{service.icon}</span>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 dark:text-white text-xs">
                              {service.name}
                            </h5>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">
                              {service.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-full whitespace-nowrap">
                            {service.price}
                          </span>
                          {selectedService === service.id && (
                            <div className="text-blue-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="preferred-date">
                Date *
              </label>
              <CustomDatePicker
                value={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                  checkAvailability(date);
                }}
                minDate={minDate}
                maxDate={getMaxDate()}
                dayOffPeriods={dayOffPeriods}
                className="w-full"
              />
              {/* Hidden input for form submission */}
              <input
                type="hidden"
                name="preferred-date"
                value={selectedDate}
                required
              />
              {/* Date Status Messages */}
              <div className="mt-2 space-y-2">
                {/* Next Available Date Message */}
                {selectedDate && selectedDate !== minDate && (
                  <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-xs">
                      <p className="font-medium text-green-800 dark:text-green-200">
                        Next available appointment
                      </p>
                      <p className="text-green-700 dark:text-green-300">
                        {new Date(selectedDate).toLocaleDateString('en-GB', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Day-off Periods Info */}
                {dayOffPeriods.length > 0 && (
                  <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-xs">
                      <p className="font-medium text-blue-800 dark:text-blue-200">
                        Business closed
                      </p>
                      <p className="text-blue-700 dark:text-blue-300">
                        {dayOffPeriods.map(period => 
                          `${new Date(period.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${new Date(period.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} (${period.title})`
                        ).join(', ')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {/* Day-off Warning */}
              {selectedDate && dayOffInfo.isDayOff && (
                <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="text-xs">
                      <p className="font-medium text-orange-800 dark:text-orange-200 mb-1">
                        {dayOffInfo.title || 'Business Closed'}
                      </p>
                      <p className="text-orange-700 dark:text-orange-300 mb-2">
                        {dayOffInfo.description || 'No appointments available on this date'}
                      </p>
                      {dayOffInfo.bannerMessage && (
                        <p className="text-orange-600 dark:text-orange-400 text-xs">
                          {dayOffInfo.bannerMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="timeSlot">
                Time *
                {isCheckingAvailability && (
                  <span className="ml-1 text-xs text-blue-500">
                    Checking...
                  </span>
                )}
              </label>
              {isLoadingTimeSlots ? (
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-9"></div>
              ) : (
                <>
                  <select
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white appearance-none text-sm"
                    id="timeSlot"
                    name="timeSlot"
                    disabled={availableTimeSlots.length === 0}
                  >
                    <option value="">Select time slot</option>
                    {timeSlots.map((slot: string) => {
                      const isBooked = isTimeSlotBooked(slot);
                      return (
                        <option 
                          key={slot} 
                          value={slot}
                          disabled={isBooked}
                          style={isBooked ? { color: '#9CA3AF', backgroundColor: '#F3F4F6' } : {}}
                        >
                          {slot} {isBooked ? '(Booked)' : ''}
                        </option>
                      );
                    })}
                  </select>
                  {availableTimeSlots.length === 0 && !dayOffInfo.isDayOff && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          All time slots are booked for this date
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-center">
        <button
          className={`px-8 py-3 rounded-lg font-semibold text-white text-base transition-all ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
          }`}
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
              Sending...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
              Send Request
            </div>
          )}
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          * Required fields. Questions? Call{" "}
          <a href={`tel:${businessPhone}`} className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
            {businessPhone}
          </a>
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          We'll contact you within 45 minutes to confirm your booking
        </p>
      </div>
    </form>
  );
}

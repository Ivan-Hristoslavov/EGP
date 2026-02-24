"use client";

import {
  useState,
  useEffect,
  Suspense,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";
import { typography, layout, textColors } from "@/config/typography";
import {
  Calendar,
  Clock,
  CreditCard,
  CheckCircle,
  Plus,
  Minus,
  X,
  ArrowLeft,
  Info,
  Shield,
  ChevronDown,
  Lock,
  Trash2,
} from "lucide-react";
import StripePaymentForm from "@/components/StripePaymentForm";
import { useServices } from "@/hooks/useServices";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Spinner } from "@heroui/react";
import { Input } from "@heroui/react";
import { useToast } from "@/components/Toast";
import ButtonPrimary from "@/components/ButtonPrimary";
import { PriceWithDiscount } from "@/components/PriceWithDiscount";

type OrderItem = {
  serviceId: string; // This will now be the service ID (UUID), not slug
  name: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  duration: number;
  category: string;
  quantity: number;
};

type CalendarDay = {
  date: string;
  status: "available" | "full" | "closed";
  timeSlots: string[];
  allSlots: string[];
  bookedSlots: string[];
  workingHours?: {
    start: string;
    end: string;
    buffer_minutes?: number;
    max_appointments?: number;
  };
};

type BookingStepKey = "services" | "team" | "date" | "customer" | "preview";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  specializations?: string;
  experience_years?: string;
  certifications?: string;
  image_url?: string;
  service_ids?: string[] | null;
  is_active: boolean;
  dayOffPeriods?: Array<{
    start_date: string;
    end_date: string;
    reason?: string;
  }>;
};

function BookingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { services, isLoading: servicesLoading } = useServices();
  const { showError } = useToast();
  const [selectedServices, setSelectedServices] = useState<OrderItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]); // All time slots for the selected duration
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState<CalendarDay[]>([]);
  const [selectedDateSlots, setSelectedDateSlots] =
    useState<CalendarDay | null>(null); // Time slots for selected date only
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [dateSelectionLoading, setDateSelectionLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null,
  );
  const [currentStep, setCurrentStep] = useState<BookingStepKey>("services");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [serviceSelectorDiscountedOnly, setServiceSelectorDiscountedOnly] =
    useState(false);
  const [serviceInfoModal, setServiceInfoModal] = useState<string | null>(null);

  // Deposit settings (from admin); used when deposit is enabled
  type DepositConfig = {
    enabled: boolean;
    type: "percentage" | "fixed";
    percentage?: number;
    fixedAmount?: number | null;
  };
  const [depositConfig, setDepositConfig] = useState<DepositConfig>({
    enabled: false,
    type: "percentage",
    percentage: 50,
    fixedAmount: null,
  });
  const [payDepositOnly, setPayDepositOnly] = useState(false);

  // Customer data state
  const [customerData, setCustomerData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [customerDataErrors, setCustomerDataErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const bookingSteps = useMemo(
    () =>
      [
        { key: "services", label: "Services", icon: CheckCircle },
        { key: "team", label: "Select Practitioner", icon: Shield },
        { key: "date", label: "Date & Time", icon: Calendar },
        { key: "customer", label: "Your Details", icon: Info },
        { key: "preview", label: "Review & Payment", icon: CreditCard },
      ] as const,
    [],
  );

  const stepOrder = useMemo(
    () => bookingSteps.map((step) => step.key),
    [bookingSteps],
  );
  const currentStepIndex = stepOrder.indexOf(currentStep);

  const stepDescriptions: Record<BookingStepKey, string> = {
    team: "Choose your preferred practitioner",
    services: "Select treatments and tailor your session",
    date: "Choose the perfect date and time",
    customer: "Enter your contact information",
    preview: "Review your booking details and complete payment",
  };

  const isStepUnlocked = (stepKey: BookingStepKey) => {
    switch (stepKey) {
      case "services":
        return true;
      case "team":
        return selectedServices.length > 0;
      case "date":
        return selectedServices.length > 0 && Boolean(selectedTeamMember);
      case "customer":
        return (
          selectedServices.length > 0 &&
          Boolean(selectedTeamMember) &&
          Boolean(selectedDate) &&
          Boolean(selectedTime)
        );
      case "preview":
        return (
          selectedServices.length > 0 &&
          Boolean(selectedTeamMember) &&
          Boolean(selectedDate) &&
          Boolean(selectedTime) &&
          Boolean(customerData.firstName) &&
          Boolean(customerData.lastName) &&
          Boolean(customerData.email) &&
          Boolean(customerData.phone)
        );
      default:
        return false;
    }
  };

  const handleStepToggle = (stepKey: BookingStepKey) => {
    const targetIndex = stepOrder.indexOf(stepKey);
    const canAccess =
      targetIndex <= currentStepIndex || isStepUnlocked(stepKey);
    if (!canAccess || currentStep === stepKey) {
      return;
    }
    setCurrentStep(stepKey);
    // Reset payment form when navigating away from preview
    if (stepKey !== "preview") {
      setShowPaymentForm(false);
    }
  };

  // Create a lookup map from services for easy access (using ID as key). Use discounted price when available.
  const servicesDataMap = useMemo(() => {
    const map: Record<string, any> = {};
    services.forEach((service) => {
      const effectivePrice = service.discounted_price ?? service.price;
      map[service.id] = {
        name: service.name,
        price: effectivePrice,
        originalPrice: service.price,
        discount_percentage: service.discount_percentage ?? null,
        category: service.category.name,
        duration: service.duration,
        description: service.description,
        details: service.details,
        benefits: service.benefits,
        preparation: service.preparation,
        aftercare: service.aftercare,
        requiresConsultation: service.requires_consultation,
        downtimeDays: service.downtime_days,
        resultsDurationWeeks: service.results_duration_weeks,
        imageUrl: service.image_url,
        slug: service.slug, // Keep slug for backwards compatibility if needed
      };
    });
    return map;
  }, [services]);

  // Group services by category (using ID as key)
  const servicesByCategory = useMemo(() => {
    const grouped: Record<string, Array<[string, any]>> = {};
    services.forEach((service) => {
      const categoryName = service.category.name;
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push([service.id, servicesDataMap[service.id]]);
    });
    return grouped;
  }, [services, servicesDataMap]);

  const hasDiscount = useCallback(
    (service: {
      discounted_price?: number | null;
      price: number;
      discount_percentage?: number | null;
    }) => {
      return (
        (service.discounted_price != null &&
          service.discounted_price < service.price) ||
        (service.discount_percentage != null && service.discount_percentage > 0)
      );
    },
    [],
  );

  // Service selector: optionally filter to discounted only
  const servicesByCategoryForSelector = useMemo(() => {
    const list = serviceSelectorDiscountedOnly
      ? services.filter(hasDiscount)
      : services;
    const grouped: Record<string, Array<[string, any]>> = {};
    list.forEach((service) => {
      const categoryName = service.category.name;
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push([service.id, servicesDataMap[service.id]]);
    });
    return grouped;
  }, [services, servicesDataMap, serviceSelectorDiscountedOnly, hasDiscount]);

  // Load team members and filter by selected services
  useEffect(() => {
    const loadTeamMembers = async () => {
      setTeamMembersLoading(true);
      try {
        const response = await fetch("/api/admin/team");
        const data = await response.json();
        console.log("Team API response:", data);
        if (response.ok && data.team) {
          let activeMembers = data.team.filter(
            (member: TeamMember) => member.is_active === true,
          );

          // Load day off periods for each team member
          const membersWithDayOff = await Promise.all(
            activeMembers.map(async (member: TeamMember) => {
              try {
                const dayOffResponse = await fetch(
                  `/api/admin/team/${member.id}/day-off`,
                );
                if (dayOffResponse.ok) {
                  const dayOffData = await dayOffResponse.json();
                  return {
                    ...member,
                    dayOffPeriods: dayOffData.dayOffPeriods || [],
                  };
                }
              } catch (error) {
                console.error(`Error loading day off for ${member.id}:`, error);
              }
              return { ...member, dayOffPeriods: [] };
            }),
          );

          // Filter team members based on selected services
          // Only show team members who can perform ALL selected services
          if (selectedServices.length > 0) {
            // serviceId is now the actual ID, not slug
            const selectedServiceIds = selectedServices
              .map((s) => s.serviceId)
              .filter(Boolean) as string[];

            if (selectedServiceIds.length > 0) {
              activeMembers = membersWithDayOff.filter((member: TeamMember) => {
                // If member has no service_ids, don't show them (they can't perform any services)
                if (!member.service_ids || member.service_ids.length === 0) {
                  return false;
                }
                // Check if member can perform ALL selected services
                return selectedServiceIds.every((serviceId) =>
                  member.service_ids?.includes(serviceId),
                );
              });
            } else {
              activeMembers = membersWithDayOff;
            }
          } else {
            activeMembers = membersWithDayOff;
          }

          console.log("Filtered team members:", activeMembers);
          setTeamMembers(activeMembers);

          // Clear selected team member if they can't perform all selected services
          if (selectedTeamMember && selectedServices.length > 0) {
            // serviceId is now the actual ID, not slug
            const selectedServiceIds = selectedServices
              .map((s) => s.serviceId)
              .filter(Boolean) as string[];

            if (selectedServiceIds.length > 0) {
              const currentMember = activeMembers.find(
                (m: TeamMember) => m.id === selectedTeamMember,
              );
              if (!currentMember) {
                // Selected team member is no longer available, clear selection
                setSelectedTeamMember("");
              } else if (
                currentMember.service_ids &&
                currentMember.service_ids.length > 0
              ) {
                // Check if current member can still perform all services
                const canPerformAll = selectedServiceIds.every((serviceId) =>
                  currentMember.service_ids?.includes(serviceId),
                );
                if (!canPerformAll) {
                  setSelectedTeamMember("");
                }
              }
            }
          }
        } else {
          console.error(
            "Failed to load team members:",
            data.error || "Unknown error",
          );
        }
      } catch (error) {
        console.error("Error loading team members:", error);
      } finally {
        setTeamMembersLoading(false);
      }
    };
    loadTeamMembers();
  }, [selectedServices, services]); // Removed selectedTeamMember from dependencies

  // Fetch deposit settings for booking (public config)
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/settings?key=deposit_settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((value) => {
        if (cancelled || !value || typeof value !== "object") return;
        setDepositConfig({
          enabled: !!value.enabled,
          type: value.type === "fixed" ? "fixed" : "percentage",
          percentage: value.percentage != null ? Number(value.percentage) : 50,
          fixedAmount:
            value.fixedAmount != null ? Number(value.fixedAmount) : null,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Calculate total service duration in minutes
  const totalServiceDuration = useMemo(() => {
    return selectedServices.reduce((total, service) => {
      return total + service.duration * service.quantity;
    }, 0);
  }, [selectedServices]);

  const isLoadingRef = useRef(false);

  const loadAvailability = useCallback(async () => {
    // Prevent concurrent calls - but allow if previous call completed
    if (isLoadingRef.current) {
      console.log("loadAvailability: Already loading, skipping...");
      return;
    }

    isLoadingRef.current = true;
    setAvailabilityLoading(true);
    setAvailabilityError(null);

    try {
      // Create start date at local midnight to avoid timezone issues
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(start);
      end.setDate(start.getDate() + 30);

      // Team member is required - only show availability if team member is selected
      if (selectedTeamMember && totalServiceDuration > 0) {
        // Helper function to format date without timezone issues
        const formatDateLocal = (date: Date): string => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        const startDateStr = formatDateLocal(start);
        const endDateStr = formatDateLocal(end);

        // Make single API call for all dates in range
        try {
          const response = await fetch(
            `/api/bookings/availability/team/range?team_member_id=${selectedTeamMember}&start_date=${startDateStr}&end_date=${endDateStr}&service_duration_minutes=${totalServiceDuration}`,
          );

          if (response.ok) {
            const data = await response.json();
            const availability = data.availability || {};

            // Convert to CalendarDay array
            const dates: CalendarDay[] = [];
            const dayCount = Math.ceil(
              (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
            );

            for (let i = 0; i < dayCount; i++) {
              const currentDate = new Date(
                start.getFullYear(),
                start.getMonth(),
                start.getDate() + i,
              );
              const dateStr = formatDateLocal(currentDate);

              const dateAvailability = availability[dateStr];
              if (dateAvailability) {
                dates.push({
                  date: dateStr,
                  status: dateAvailability.status,
                  timeSlots: dateAvailability.availableSlots || [],
                  allSlots: [
                    ...(dateAvailability.availableSlots || []),
                    ...(dateAvailability.bookedSlots || []),
                  ],
                  bookedSlots: dateAvailability.bookedSlots || [],
                  workingHours: dateAvailability.workingHours,
                });
              } else {
                dates.push({
                  date: dateStr,
                  status: "closed" as const,
                  timeSlots: [],
                  allSlots: [],
                  bookedSlots: [],
                });
              }
            }

            setAvailableDates(dates);
          } else {
            throw new Error("Failed to fetch availability");
          }
        } catch (error) {
          console.error("Error fetching availability range:", error);
          setAvailabilityError(
            "Unable to load availability. Please try again later.",
          );
        }
      } else {
        // No team member selected or no services - show empty calendar
        setAvailableDates([]);
        // Let finally block handle cleanup
      }
    } catch (error) {
      console.error("Error loading availability:", error);
      setAvailabilityError(
        "Unable to load availability. Please try again later.",
      );
    } finally {
      setAvailabilityLoading(false);
      isLoadingRef.current = false;
    }
  }, [selectedTeamMember, totalServiceDuration]);

  // Load availability when team member or services change
  useEffect(() => {
    if (selectedTeamMember && totalServiceDuration > 0) {
      loadAvailability();
    } else {
      // If no team member or services, ensure loading is false and reset ref
      setAvailabilityLoading(false);
      isLoadingRef.current = false;
      setAvailableDates([]);
    }
  }, [selectedTeamMember, totalServiceDuration, loadAvailability]);

  // Clear selected date if it's no longer in available dates
  useEffect(() => {
    if (
      availableDates.length &&
      selectedDate &&
      !availableDates.some((day) => day.date === selectedDate)
    ) {
      setSelectedDate("");
      setSelectedTime("");
    }
  }, [availableDates, selectedDate]);

  // Check for pending service from URL or sessionStorage (from + Book on services page, featured services, etc.)
  const pendingProcessedRef = useRef(false);
  useEffect(() => {
    if (
      servicesLoading ||
      services.length === 0 ||
      Object.keys(servicesDataMap).length === 0
    )
      return;
    if (selectedServices.length > 0) return; // Don't add if services already selected
    if (pendingProcessedRef.current) return; // Already processed this session (avoids Strict Mode double-add)

    // Prefer URL param (reliable across navigations), then sessionStorage (legacy)
    const pendingServiceId =
      searchParams.get("pendingServiceId") ||
      (typeof window !== "undefined"
        ? sessionStorage.getItem("pendingServiceId")
        : null);

    if (pendingServiceId) {
      const service = servicesDataMap[pendingServiceId];
      if (
        service &&
        !selectedServices.some((s) => s.serviceId === pendingServiceId)
      ) {
        pendingProcessedRef.current = true;
        setSelectedServices([
          {
            serviceId: pendingServiceId,
            name: service.name,
            price: service.price,
            originalPrice: service.originalPrice ?? undefined,
            discountPercentage: service.discount_percentage ?? undefined,
            duration: service.duration,
            category: service.category,
            quantity: 1,
          },
        ]);
        // Clear URL param without full reload
        if (searchParams.get("pendingServiceId")) {
          const params = new URLSearchParams(searchParams.toString());
          params.delete("pendingServiceId");
          router.replace(
            params.toString() ? `/book?${params.toString()}` : "/book",
            { scroll: false },
          );
        }
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("pendingServiceId");
        }
      } else {
        if (searchParams.get("pendingServiceId")) {
          const params = new URLSearchParams(searchParams.toString());
          params.delete("pendingServiceId");
          router.replace(
            params.toString() ? `/book?${params.toString()}` : "/book",
            { scroll: false },
          );
        }
        if (typeof window !== "undefined")
          sessionStorage.removeItem("pendingServiceId");
      }
    }
  }, [
    servicesLoading,
    services,
    servicesDataMap,
    selectedServices,
    searchParams,
    router,
  ]);

  const totalAmount = selectedServices.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const totalDuration = selectedServices.reduce(
    (sum, item) => sum + item.duration * item.quantity,
    0,
  );

  // Deposit: amount to charge now and remaining due on arrival
  const depositAmount = useMemo(() => {
    if (!depositConfig.enabled || totalAmount <= 0) return 0;
    if (depositConfig.type === "fixed" && depositConfig.fixedAmount != null) {
      return Math.min(Number(depositConfig.fixedAmount), totalAmount);
    }
    const pct = depositConfig.percentage ?? 50;
    return Math.round(((totalAmount * pct) / 100) * 100) / 100;
  }, [
    depositConfig.enabled,
    depositConfig.type,
    depositConfig.percentage,
    depositConfig.fixedAmount,
    totalAmount,
  ]);
  const remainingAmount = Math.max(
    0,
    Math.round((totalAmount - depositAmount) * 100) / 100,
  );
  const amountToCharge =
    depositConfig.enabled && payDepositOnly ? depositAmount : totalAmount;
  const isDepositPayment =
    depositConfig.enabled &&
    payDepositOnly &&
    depositAmount > 0 &&
    depositAmount < totalAmount;

  // Helper function to check if adding a service would exceed working hours
  const wouldExceedWorkingHours = useCallback(
    (additionalDuration: number): boolean => {
      // Only check if date and time are already selected
      if (!selectedDate || !selectedTime || !selectedDateSlots?.workingHours) {
        return false; // Allow if no date/time selected yet
      }

      const currentTotalDuration = selectedServices.reduce(
        (sum, item) => sum + item.duration * item.quantity,
        0,
      );
      const newTotalDuration = currentTotalDuration + additionalDuration;

      // Parse selected time
      const [startHour, startMin] = selectedTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;

      // Calculate end time with new duration
      const endMinutes = startMinutes + newTotalDuration;

      // Parse working hours end time
      const [endHour, endMin] = selectedDateSlots.workingHours.end
        .split(":")
        .map(Number);
      const workingHoursEndMinutes = endHour * 60 + endMin;

      // Check if the service would extend past working hours
      return endMinutes > workingHoursEndMinutes;
    },
    [selectedDate, selectedTime, selectedDateSlots, selectedServices],
  );

  const addService = (serviceId: string): boolean => {
    const service = servicesDataMap[serviceId];
    if (!service) {
      console.error(`Service not found in servicesDataMap: ${serviceId}`);
      console.log("Available services:", Object.keys(servicesDataMap));
      showError(
        "Service Not Found",
        `The service "${serviceId}" could not be found. Please try selecting it from the list.`,
      );
      return false;
    }

    // Check if service is already selected
    const existingIndex = selectedServices.findIndex(
      (item) => item.serviceId === serviceId,
    );
    if (existingIndex >= 0) {
      showError(
        "Service Already Added",
        "This service is already in your selection. Each service can only be added once.",
      );
      return false;
    }

    // Check if adding this service would exceed working hours
    const additionalDuration = service.duration;
    if (wouldExceedWorkingHours(additionalDuration)) {
      showError(
        "Cannot Add Service",
        `Adding this service would exceed working hours. The appointment would end after closing time.`,
      );
      return false;
    }

    setSelectedServices([
      ...selectedServices,
      {
        serviceId,
        name: service.name,
        price: service.price,
        originalPrice: service.originalPrice ?? undefined,
        discountPercentage: service.discount_percentage ?? undefined,
        duration: service.duration,
        category: service.category,
        quantity: 1,
      },
    ]);
    return true;
  };

  const removeService = (serviceId: string) => {
    setSelectedServices(
      selectedServices.filter((item) => item.serviceId !== serviceId),
    );
  };

  const updateQuantity = (serviceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeService(serviceId);
      return;
    }

    // Check if increasing quantity would exceed working hours
    const service = selectedServices.find(
      (item) => item.serviceId === serviceId,
    );
    if (service && quantity > service.quantity) {
      const additionalDuration =
        service.duration * (quantity - service.quantity);
      if (wouldExceedWorkingHours(additionalDuration)) {
        showError(
          "Cannot Increase Quantity",
          `Increasing the quantity would exceed working hours. The appointment would end after closing time.`,
        );
        return;
      }
    }

    const updated = selectedServices.map((item) =>
      item.serviceId === serviceId ? { ...item, quantity } : item,
    );
    setSelectedServices(updated);
  };

  const handleDateSelect = (date: string) => {
    // No server calls - only filter from cached data
    if (availabilityLoading) return;

    // Always set the selected date first to show it's selected
    setSelectedDate(date);
    setSelectedTime("");
    setSelectedTimeSlots([]);

    // Find date in cached availability data
    const existingInfo = availableDates.find((item) => item.date === date);

    if (existingInfo) {
      // Use cached data - no loading, no server call
      setSelectedDateSlots(existingInfo);
    } else {
      // Date not in cache - show as closed/unavailable
      setSelectedDateSlots({
        date: date,
        status: "closed" as const,
        timeSlots: [],
        allSlots: [],
        bookedSlots: [],
      });
    }
    // Never change step - just update the time slots from cache
  };

  const handleTimeSelect = (startTime: string) => {
    // Calculate all time slots needed based on duration
    // Duration is in minutes, we need to mark consecutive hours
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const durationHours = Math.ceil(totalServiceDuration / 60); // Round up to get full hours needed

    const selectedSlots: string[] = [];

    // Add all consecutive hours starting from the selected time
    for (let i = 0; i < durationHours; i++) {
      const hour = startHour + i;
      if (hour >= 24) break; // Don't go past midnight
      const timeStr = `${String(hour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`;
      selectedSlots.push(timeStr);
    }

    setSelectedTime(startTime);
    setSelectedTimeSlots(selectedSlots);
    // Don't automatically navigate - user must click the button to proceed
  };

  const proceedToPayment = () => {
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = (bookingId: string) => {
    // Reset payment form state
    setShowPaymentForm(false);
    // Redirect to success page or show success message
    window.location.href = `/book/success?booking=${bookingId}`;
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
    // You could show a toast notification here
  };

  const renderStepContent = (stepKey: BookingStepKey) => {
    switch (stepKey) {
      case "services":
        return renderServicesStep();
      case "team":
        return renderTeamStep();
      case "date":
        return renderCalendar();
      case "customer":
        return renderCustomerDetails();
      case "preview":
        return renderOrderPreview();
      default:
        return null;
    }
  };

  const renderServicesStep = () => (
    <div className="space-y-6">
      {selectedServices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d6ccb9] dark:border-gray-700 bg-[#faf7f1] dark:bg-gray-900/60 p-8 sm:p-10 text-center">
          <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-[#c0b49f] dark:text-[#b5ad9d] mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No services selected yet
          </h4>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Explore our treatments to build your bespoke experience. You can
            always adjust later.
          </p>
          <ButtonPrimary
            onPress={() => setShowServiceSelector(true)}
            variant="primary"
            startContent={<Plus className="w-4 h-4" />}
          >
            Browse Services
          </ButtonPrimary>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedServices.map((item) => {
              const serviceData = servicesDataMap[item.serviceId];
              return (
                <Card
                  key={item.serviceId}
                  className="group hover:shadow-lg transition-all duration-200"
                  shadow="md"
                >
                  <CardBody className="p-5 flex flex-col">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <h4 className="text-base sm:text-lg font-bold text-foreground leading-tight flex-1 line-clamp-2">
                          {item.name}
                        </h4>
                        <Chip
                          size="sm"
                          variant="flat"
                          startContent={<Clock className="w-3 h-3" />}
                          className="flex-shrink-0 bg-egp-green/10 text-egp-green dark:bg-egp-green-dark/20 dark:text-white"
                        >
                          {item.duration} min
                        </Chip>
                      </div>

                      <div className="mb-4 pb-4 border-b border-divider">
                        <p className="text-xs uppercase tracking-wide text-default-500 mb-1">
                          Subtotal
                        </p>
                        <PriceWithDiscount
                          price={item.price}
                          originalPrice={item.originalPrice}
                          discountPercentage={item.discountPercentage}
                          quantity={item.quantity}
                          size="md"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-auto">
                      <Button
                        onPress={() => setServiceInfoModal(item.serviceId)}
                        variant="bordered"
                        size="sm"
                        className="flex-1 border-egp-green text-egp-green dark:border-egp-green dark:text-white hover:bg-egp-green/10"
                        startContent={<Info className="w-4 h-4" />}
                      >
                        Details
                      </Button>
                      <Button
                        onPress={() => removeService(item.serviceId)}
                        isIconOnly
                        variant="light"
                        color="danger"
                        size="sm"
                        className="hover:bg-danger-50 dark:hover:bg-danger-900/20"
                        aria-label="Remove service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>

          <div className="border-t border-divider pt-5 mt-6 flex flex-row items-center justify-between gap-3">
            <ButtonPrimary
              onPress={() => setShowServiceSelector(true)}
              variant="secondary"
              className="flex-1 border-2 border-egp-beige-dark bg-egp-beige hover:bg-egp-beige-dark text-gray-900 dark:bg-egp-beige-darkest dark:text-white dark:border-egp-beige-darker dark:hover:bg-egp-beige-darker"
              startContent={<Plus className="w-4 h-4" />}
            >
              Add Services
            </ButtonPrimary>
            <ButtonPrimary
              onPress={() => setCurrentStep("team")}
              isDisabled={selectedServices.length === 0}
              variant="primary"
              className={`flex-1 ${selectedServices.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              endContent={
                selectedServices.length === 0 ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                )
              }
            >
              {selectedServices.length === 0
                ? "Please add at least one service"
                : "Continue to Select Practitioner"}
            </ButtonPrimary>
          </div>
        </>
      )}
    </div>
  );

  const renderTeamStep = () => (
    <div className="space-y-6">
      {teamMembersLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" color="primary" />
          <span className="ml-3 text-sm text-default-500">
            Loading practitioners...
          </span>
        </div>
      ) : teamMembers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d6ccb9] dark:border-gray-700 bg-[#faf7f1] dark:bg-gray-900/60 p-8 sm:p-10 text-center">
          <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-[#c0b49f] dark:text-[#b5ad9d] mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No practitioners available
          </h4>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {selectedServices.length > 0
              ? "No practitioners are available who can perform all selected services. Please try selecting different services or contact us to schedule your appointment."
              : "Please contact us to schedule your appointment."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {teamMembers.map((member) => (
              <Card
                key={member.id}
                isPressable
                onPress={() => setSelectedTeamMember(member.id)}
                className={`group relative transition-all duration-200 ${
                  selectedTeamMember === member.id
                    ? "border-2 border-[#9d9585] dark:border-[#c9c1b0] bg-[#f5f1e9] dark:bg-gray-800/50 shadow-lg scale-[1.02]"
                    : ""
                }`}
                shadow={selectedTeamMember === member.id ? "lg" : "sm"}
              >
                {/* Selected Indicator */}
                {selectedTeamMember === member.id && (
                  <div className="absolute top-3 right-3 z-10">
                    <Chip
                      size="sm"
                      color="primary"
                      className="bg-[#9d9585] dark:bg-[#c9c1b0]"
                    >
                      <CheckCircle className="w-4 h-4 text-white" />
                    </Chip>
                  </div>
                )}

                <CardBody className="p-5 sm:p-6">
                  {/* Avatar/Image */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-shrink-0">
                      {member.image_url ? (
                        <img
                          src={member.image_url}
                          alt={member.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#e4d9c8] dark:border-gray-700"
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#9d9585] to-[#c9c1b0] flex items-center justify-center border-2 border-[#e4d9c8] dark:border-gray-700">
                          <span className="text-2xl sm:text-3xl font-bold text-white">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                          {member.name}
                        </h4>
                        {member.dayOffPeriods &&
                          member.dayOffPeriods.length > 0 &&
                          (() => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const isOnDayOff = member.dayOffPeriods.some(
                              (period) => {
                                const start = new Date(period.start_date);
                                const end = new Date(period.end_date);
                                return today >= start && today <= end;
                              },
                            );
                            const nextAvailable = member.dayOffPeriods
                              .map((period) => new Date(period.end_date))
                              .sort((a, b) => a.getTime() - b.getTime())
                              .find((date) => date > today);

                            if (isOnDayOff) {
                              return (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-semibold border border-orange-300 dark:border-orange-700">
                                  <Calendar className="w-3 h-3" />
                                  {nextAvailable
                                    ? `Day Off - Available ${nextAvailable.toLocaleDateString()}`
                                    : "Day Off"}
                                </span>
                              );
                            }
                            return null;
                          })()}
                      </div>
                      <p className="text-sm text-[#9d9585] dark:text-[#c9c1b0] font-medium mt-0.5">
                        {member.role}
                      </p>
                    </div>
                  </div>

                  {/* Information */}
                  <div className="space-y-3">
                    {member.experience_years && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4 text-[#9d9585] dark:text-[#c9c1b0]" />
                        <span>{member.experience_years} years experience</span>
                      </div>
                    )}

                    {member.specializations && (
                      <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Info className="w-4 h-4 text-[#9d9585] dark:text-[#c9c1b0] mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">
                          {member.specializations}
                        </span>
                      </div>
                    )}

                    {member.certifications && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Shield className="w-4 h-4 text-[#9d9585] dark:text-[#c9c1b0]" />
                        <span>{member.certifications} certifications</span>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {selectedTeamMember && (
            <div className="border-t border-divider pt-5 mt-6 flex justify-end">
              <ButtonPrimary
                onPress={() => setCurrentStep("date")}
                variant="primary"
                endContent={<ArrowLeft className="w-4 h-4 rotate-180" />}
              >
                Continue to Date Selection
              </ButtonPrimary>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderServiceInfoModal = () => {
    if (!serviceInfoModal) return null;

    const service = servicesDataMap[serviceInfoModal];
    if (!service) return null;

    const metaItems = [
      {
        label: "Investment",
        value: `£${service.price}`,
      },
      service.duration && {
        label: "Duration",
        value: `${service.duration} min`,
      },
      service.requiresConsultation !== undefined && {
        label: "Consultation",
        value: service.requiresConsultation ? "Required" : "Optional",
      },
      service.downtimeDays !== undefined && {
        label: "Downtime",
        value:
          service.downtimeDays > 0
            ? `${service.downtimeDays} day${service.downtimeDays > 1 ? "s" : ""}`
            : "Minimal",
      },
      service.resultsDurationWeeks && {
        label: "Results last",
        value: `${service.resultsDurationWeeks} week${service.resultsDurationWeeks > 1 ? "s" : ""}`,
      },
    ].filter(Boolean) as Array<{ label: string; value: string }>;

    return (
      <Modal
        isOpen={true}
        onClose={() => setServiceInfoModal(null)}
        size="3xl"
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-black/60 backdrop-blur-sm",
          base: "bg-white dark:bg-gray-900",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] text-white rounded-t-2xl [&>button]:hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 w-full">
                  <div className="flex-1">
                    <p className="text-sm uppercase tracking-[0.3em] font-semibold text-[#3f3a31]/70">
                      Treatment insight
                    </p>
                    <h2 className={`${typography.headingCard} mt-1`}>
                      {service.name}
                    </h2>
                    <p className="text-sm text-[#3f3a31]/80 mt-1">
                      {service.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {service.imageUrl && (
                      <div className="hidden sm:block w-20 h-20 rounded-xl overflow-hidden border border-white/40 shadow-lg">
                        <img
                          src={service.imageUrl}
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <ButtonPrimary
                      variant="secondary"
                      onPress={onClose}
                      isIconOnly
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                      aria-label="Close modal"
                    >
                      <X className="w-4 h-4" />
                    </ButtonPrimary>
                  </div>
                </div>
              </ModalHeader>

              <ModalBody className="py-6">
                <div className="space-y-6">
                  {metaItems.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {metaItems.map(({ label, value }) => (
                        <div
                          key={label}
                          className="bg-[#f5f1e9] dark:bg-gray-800/40 border border-[#e4d9c8] dark:border-gray-700 rounded-lg px-4 py-3"
                        >
                          <p className="text-xs uppercase tracking-wide text-[#6b5f4b] dark:text-[#c9c1b0] font-semibold">
                            {label}
                          </p>
                          <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 font-medium mt-1">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {service.description && (
                    <div>
                      <h3 className={`${typography.headingSmall} ${textColors.heading} mb-3 flex items-center gap-2`}>
                        <Info className="w-5 h-5 text-[#9d9585]" />
                        Overview
                      </h3>
                      <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  )}

                  {service.details && (
                    <div className="bg-white/80 dark:bg-gray-900/50 rounded-xl border border-[#e4d9c8] dark:border-gray-700 p-6">
                      <h3 className={`${typography.headingSmall} ${textColors.heading} mb-3`}>
                        Treatment experience
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {service.details}
                      </p>
                    </div>
                  )}

                  {service.benefits && service.benefits.length > 0 && (
                    <div>
                      <h3 className={`${typography.headingSmall} ${textColors.heading} mb-3 flex items-center gap-2`}>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Key benefits
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                        {service.benefits.map(
                          (benefit: string, index: number) => (
                            <li key={index}>{benefit}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}

                  {(service.preparation || service.aftercare) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {service.preparation && (
                        <div className="bg-[#f5f1e9] dark:bg-gray-800/40 border border-[#e4d9c8] dark:border-gray-700 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-[#6b5f4b] dark:text-[#c9c1b0] mb-2 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-[#9d9585]" />
                            Preparation tips
                          </h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {service.preparation}
                          </p>
                        </div>
                      )}
                      {service.aftercare && (
                        <div className="bg-[#f5f1e9] dark:bg-gray-800/40 border border-[#e4d9c8] dark:border-gray-700 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-[#6b5f4b] dark:text-[#c9c1b0] mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#9d9585]" />
                            Aftercare guidance
                          </h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {service.aftercare}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ModalBody>

              <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-center w-full">
                  <ButtonPrimary variant="secondary" onPress={onClose}>
                    Close
                  </ButtonPrimary>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    );
  };

  const renderServiceSelector = () => {
    return (
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-start justify-center p-3 sm:p-4 pt-24 sm:pt-28 z-[10000] overflow-y-auto"
        onClick={(e) => {
          // Close modal when clicking on backdrop
          if (e.target === e.currentTarget) {
            setShowServiceSelector(false);
          }
        }}
      >
        <div
          className="bg-gray-800 dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[85vh] flex flex-col relative z-[10001]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gray-900 dark:bg-gray-950 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl flex-shrink-0 border-b border-gray-700 relative z-[10002]">
            <h2 className={`${typography.headingCard}`}>Select Services</h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowServiceSelector(false);
              }}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center relative z-[10003]"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Discount filter - only show if any service has discount */}
          {services.some(hasDiscount) && (
            <div className="px-6 py-3 border-b border-gray-700 bg-gray-800/50 dark:bg-gray-900/50 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-400">Filter:</span>
              <button
                type="button"
                onClick={() => setServiceSelectorDiscountedOnly(false)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !serviceSelectorDiscountedOnly
                    ? "bg-egp-green text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setServiceSelectorDiscountedOnly(true)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  serviceSelectorDiscountedOnly
                    ? "bg-egp-green text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                On offer
              </button>
            </div>
          )}

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1 bg-gray-800 dark:bg-gray-900">
            {Object.entries(servicesByCategoryForSelector).map(
              ([category, servicesList]) => {
                // Filter out services that are already selected
                const availableServices = servicesList.filter(
                  ([serviceId, service]) =>
                    service &&
                    !selectedServices.some(
                      (item) => item.serviceId === serviceId,
                    ),
                );

                if (availableServices.length === 0) return null;

                return (
                  <div key={category} className="mb-8">
                    <h3 className={`${typography.headingSmall} text-white mb-5`}>
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {availableServices.map(([serviceId, service]) => {
                        if (!service) return null;
                        return (
                          <Card
                            key={serviceId}
                            className="h-full flex flex-col bg-gray-700 dark:bg-gray-800 border border-gray-600 dark:border-gray-700 hover:border-egp-green transition-all"
                            shadow="lg"
                          >
                            <CardHeader className="bg-gray-700 dark:bg-gray-800 px-5 py-4 relative min-h-[140px]">
                              {/* Category Badge - Top Left */}
                              <div className="absolute top-3 left-3">
                                <Chip
                                  size="sm"
                                  className="bg-gray-600 dark:bg-gray-700 text-white text-xs font-semibold"
                                  variant="flat"
                                >
                                  {service.category || category}
                                </Chip>
                              </div>

                              {/* Duration Badge - Top Right */}
                              <div className="absolute top-3 right-3">
                                <Chip
                                  size="sm"
                                  startContent={<Clock className="w-3 h-3" />}
                                  variant="flat"
                                  className="bg-gray-600 dark:bg-gray-700 text-white text-xs"
                                >
                                  {service.duration} min
                                </Chip>
                              </div>

                              {/* Service Name and Price - Centered */}
                              <div className="text-center pt-8 pb-3 w-full">
                                <h4 className="text-lg font-bold text-white leading-tight line-clamp-2 mb-3">
                                  {service.name}
                                </h4>
                                <div className="flex flex-col items-center gap-1 w-full [&_.line-through]:text-gray-400 [&_.font-bold]:text-white">
                                  <PriceWithDiscount
                                    price={service.price}
                                    originalPrice={service.originalPrice}
                                    discountPercentage={
                                      service.discount_percentage
                                    }
                                    size="lg"
                                    layout="stack"
                                    align="center"
                                  />
                                </div>
                              </div>
                            </CardHeader>

                            <CardBody className="p-5 flex flex-col flex-1 bg-gray-700 dark:bg-gray-800">
                              {/* Description */}
                              {service.description && (
                                <p className="text-sm text-gray-300 mb-4 leading-relaxed line-clamp-3">
                                  {service.description}
                                </p>
                              )}

                              {/* Action Buttons - Stacked */}
                              <div className="flex flex-col gap-2 pt-4 mt-auto border-t border-gray-600 dark:border-gray-700">
                                <Button
                                  onPress={() => setServiceInfoModal(serviceId)}
                                  variant="bordered"
                                  size="sm"
                                  className="w-full border-gray-500 text-gray-300 hover:bg-gray-600 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                                  startContent={<Info className="w-4 h-4" />}
                                >
                                  Details
                                </Button>
                                <ButtonPrimary
                                  onPress={() => {
                                    const success = addService(serviceId);
                                    if (success) {
                                      setShowServiceSelector(false);
                                    }
                                  }}
                                  variant="primary"
                                  className="w-full bg-gray-600 hover:bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 text-white"
                                  size="sm"
                                  startContent={<Plus className="w-4 h-4" />}
                                >
                                  Book
                                </ButtonPrimary>
                              </div>
                            </CardBody>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    const selectedDayInfo = selectedDate
      ? availableDates.find((item) => item.date === selectedDate)
      : null;

    if (availabilityLoading) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg sm:text-xl font-bold text-foreground">
            Select Date &amp; Time
          </h3>
          <Card>
            <CardBody className="flex items-center gap-3">
              <Spinner size="md" color="primary" />
              <span className="text-sm sm:text-base text-default-600">
                Loading availability...
              </span>
            </CardBody>
          </Card>
        </div>
      );
    }

    if (availabilityError) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            Select Date &amp; Time
          </h3>
          <div className="bg-[#fce8e8] dark:bg-red-900/20 border border-[#f3b3b0] dark:border-red-800 rounded-xl px-4 py-6 space-y-4">
            <p className="text-sm sm:text-base text-[#7f2b27] dark:text-red-200">
              {availabilityError}
            </p>
            <ButtonPrimary onPress={loadAvailability} variant="primary">
              Retry loading availability
            </ButtonPrimary>
          </div>
        </div>
      );
    }

    if (!availableDates.length && !availabilityLoading && selectedTeamMember) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            Select Date &amp; Time
          </h3>
          <div className="bg-[#f5f1e9] dark:bg-gray-900/60 border border-[#e4d9c8] dark:border-gray-700 rounded-xl px-4 py-6 space-y-4 text-center">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              {selectedTeamMember
                ? "No availability found for the next 30 days. This may be because working hours are not configured or all days are closed."
                : "Please select a team member to view availability."}
            </p>
            {selectedTeamMember && (
              <ButtonPrimary
                onPress={loadAvailability}
                variant="primary"
                className="mx-auto"
              >
                Refresh availability
              </ButtonPrimary>
            )}
          </div>
        </div>
      );
    }

    // Build calendar grid with proper alignment
    const calendarGrid: (CalendarDay | null)[] = [];

    if (availableDates.length > 0) {
      // Get the first date to determine starting day of week
      const firstDate = new Date(availableDates[0].date);
      // Convert to UTC to avoid timezone issues
      const firstDateUTC = new Date(
        Date.UTC(
          firstDate.getFullYear(),
          firstDate.getMonth(),
          firstDate.getDate(),
        ),
      );
      // Get day of week: 0 = Sunday, 1 = Monday, etc.
      // Adjust to Monday = 0: (dayOfWeek + 6) % 7
      let firstDayOfWeek = firstDateUTC.getUTCDay();
      // Convert Sunday (0) to 6, Monday (1) to 0, etc. for Monday-first calendar
      firstDayOfWeek = (firstDayOfWeek + 6) % 7;

      // Add empty cells before the first date
      for (let i = 0; i < firstDayOfWeek; i++) {
        calendarGrid.push(null);
      }

      // Add all available dates (limit to 28 days for 4 weeks)
      const daysToShow = Math.min(availableDates.length, 28 - firstDayOfWeek);
      for (let i = 0; i < daysToShow; i++) {
        calendarGrid.push(availableDates[i]);
      }

      // Fill remaining cells to complete the grid (up to 35 cells for 5 weeks)
      while (calendarGrid.length < 35 && calendarGrid.length % 7 !== 0) {
        calendarGrid.push(null);
      }
    }

    return (
      <div className="space-y-6">
        {/* Show selected team member info */}
        {selectedTeamMember && (
          <div className="mb-4 p-4 bg-[#f5f1e9] dark:bg-gray-800/50 border border-[#e4d9c8] dark:border-gray-700 rounded-xl">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {teamMembers.find((m) => m.id === selectedTeamMember)?.name} -{" "}
                {teamMembers.find((m) => m.id === selectedTeamMember)?.role}
              </span>
            </div>
            {selectedServices.length > 0 && totalServiceDuration > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-7">
                Service duration: {Math.floor(totalServiceDuration / 60)}h{" "}
                {totalServiceDuration % 60}m
              </p>
            )}
          </div>
        )}

        {/* Show calendar or message */}
        {!selectedTeamMember ? (
          <div className="bg-[#f5f1e9] dark:bg-gray-900/60 border border-[#e4d9c8] dark:border-gray-700 rounded-xl px-4 py-6 text-center">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Please select a practitioner in the previous step to view
              available dates and times.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#d9534f]"></span>{" "}
                Fully booked
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#80c48f]"></span>{" "}
                Slots available
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-200"></span>{" "}
                Clinic closed
              </span>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 w-full">
              {/* Calendar Section */}
              <div className="flex-1 lg:flex-1">
                <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400 py-0.5"
                      >
                        {day}
                      </div>
                    ),
                  )}

                  {calendarGrid.map((dateInfo, index) => {
                    if (!dateInfo) {
                      return (
                        <div key={`empty-${index}`} className="aspect-square" />
                      );
                    }

                    // Parse date using UTC to avoid timezone issues
                    const [year, month, day] = dateInfo.date
                      .split("-")
                      .map(Number);
                    const date = new Date(Date.UTC(year, month - 1, day));
                    const isSelected = selectedDate === dateInfo.date;
                    const today = new Date();
                    const todayUTC = new Date(
                      Date.UTC(
                        today.getFullYear(),
                        today.getMonth(),
                        today.getDate(),
                      ),
                    );
                    const isToday = date.getTime() === todayUTC.getTime();
                    const isClosed = dateInfo.status === "closed";
                    const isFull = dateInfo.status === "full";
                    const hasSlots = dateInfo.timeSlots.length > 0;
                    const disabled = isClosed || isFull || !hasSlots;

                    let statusClasses = "";
                    if (isSelected) {
                      statusClasses =
                        "bg-gradient-to-br from-[#9d9585] to-[#c9c1b0] text-white shadow-lg border border-transparent";
                    } else if (isClosed) {
                      statusClasses =
                        "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border border-transparent cursor-not-allowed";
                    } else if (isFull) {
                      statusClasses =
                        "bg-[#fce8e8] text-[#7f2b27] border border-[#f3b3b0]";
                    } else {
                      statusClasses =
                        "bg-[#e7f4eb] text-[#2f6b3d] border border-[#b4dfc1]";
                    }

                    return (
                      <button
                        key={dateInfo.date}
                        onClick={() => handleDateSelect(dateInfo.date)}
                        disabled={disabled}
                        className={`
                        aspect-square rounded-md text-sm sm:text-base font-medium transition-all touch-manipulation min-h-[24px] sm:min-h-[28px]
                    ${statusClasses}
                    ${isToday ? "border-2 border-green-500 dark:border-green-400" : ""}
                  `}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Section - Moved to right side */}
              <div className="flex-1 lg:flex-1">
                {selectedDate ? (
                  <div>
                    <div className="mb-3 sm:mb-4">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                        Available Times
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {new Date(selectedDate).toLocaleDateString("en-GB", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      {selectedTimeSlots.length > 0 && (
                        <button
                          onClick={() => {
                            setSelectedTime("");
                            setSelectedTimeSlots([]);
                          }}
                          className="mt-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-red-300 dark:border-red-700 transition-colors"
                        >
                          Clear Selection
                        </button>
                      )}
                    </div>

                    {/* Hours section - filtered from cached data, no loading needed */}
                    {selectedDateSlots
                      ? (() => {
                          const bookedSlotsSet = new Set(
                            selectedDateSlots.bookedSlots || [],
                          );
                          const availableSlotsSet = new Set(
                            selectedDateSlots.timeSlots || [],
                          );
                          const durationHours = Math.ceil(
                            totalServiceDuration / 60,
                          );

                          // Generate all time slots from working hours start to end
                          let allTimeSlots: string[] = [];

                          if (selectedDateSlots.workingHours) {
                            const [startHour, startMin] =
                              selectedDateSlots.workingHours.start
                                .split(":")
                                .map(Number);
                            const [endHour, endMin] =
                              selectedDateSlots.workingHours.end
                                .split(":")
                                .map(Number);
                            const startMinutes = startHour * 60 + startMin;
                            const endMinutes = endHour * 60 + endMin;
                            const slotInterval = 60; // 1 hour intervals

                            // Generate all hourly slots from start to end
                            for (
                              let timeMinutes = startMinutes;
                              timeMinutes < endMinutes;
                              timeMinutes += slotInterval
                            ) {
                              const hours = Math.floor(timeMinutes / 60);
                              const minutes = timeMinutes % 60;
                              const timeString = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
                              allTimeSlots.push(timeString);
                            }
                          } else {
                            // Fallback: use available and booked slots, but generate full range
                            const allSlots = [
                              ...(selectedDateSlots.timeSlots || []),
                              ...(selectedDateSlots.bookedSlots || []),
                            ];
                            if (allSlots.length > 0) {
                              // Find min and max hours
                              const hours = allSlots.map((slot) => {
                                const [h] = slot.split(":").map(Number);
                                return h;
                              });
                              const minHour = Math.min(...hours);
                              const maxHour = Math.max(...hours);

                              // Generate all slots from min to max
                              for (let h = minHour; h <= maxHour; h++) {
                                allTimeSlots.push(
                                  `${String(h).padStart(2, "0")}:00`,
                                );
                              }
                            }
                          }

                          if (allTimeSlots.length === 0) {
                            return (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                No time slots available. Please select another
                                date.
                              </p>
                            );
                          }

                          // Helper function to check if any booked slot overlaps with an hour
                          // Since booked slots might be in 15-minute intervals, we need to check if any booking
                          // overlaps with the hour range [hour:00 to hour+1:00)
                          const isHourBooked = (hour: number): boolean => {
                            const hourStartMinutes = hour * 60;
                            const hourEndMinutes = (hour + 1) * 60;

                            // Check all booked slots to see if any overlap with this hour
                            for (const bookedSlot of selectedDateSlots.bookedSlots ||
                              []) {
                              const [bookedHour, bookedMin] = bookedSlot
                                .split(":")
                                .map(Number);
                              const bookedMinutes = bookedHour * 60 + bookedMin;

                              // If the booked slot is within this hour range, the hour is booked
                              // We check if booked slot starts before hour ends and ends after hour starts
                              // Since booked slots are 15-minute intervals, we check if it's within the hour
                              if (
                                bookedMinutes >= hourStartMinutes &&
                                bookedMinutes < hourEndMinutes
                              ) {
                                return true;
                              }
                            }

                            return false;
                          };

                          // Helper function to check if a time slot has enough consecutive hours available
                          const hasEnoughConsecutiveHours = (
                            startTime: string,
                          ): boolean => {
                            const [startHour, startMin] = startTime
                              .split(":")
                              .map(Number);

                            // First, check if the end time would be within working hours
                            if (selectedDateSlots.workingHours) {
                              const [whStartHour, whStartMin] =
                                selectedDateSlots.workingHours.start
                                  .split(":")
                                  .map(Number);
                              const [whEndHour, whEndMin] =
                                selectedDateSlots.workingHours.end
                                  .split(":")
                                  .map(Number);
                              const whStartMinutes =
                                whStartHour * 60 + whStartMin;
                              const whEndMinutes = whEndHour * 60 + whEndMin;

                              // Calculate end time
                              const startMinutes = startHour * 60 + startMin;
                              const endMinutes =
                                startMinutes + totalServiceDuration;

                              // Check if start time is within working hours
                              if (
                                startMinutes < whStartMinutes ||
                                startMinutes >= whEndMinutes
                              ) {
                                return false; // Start time is outside working hours
                              }

                              // Check if end time would exceed or equal working hours end time
                              // Service must end BEFORE closing time, not at closing time
                              if (endMinutes >= whEndMinutes) {
                                return false; // End time is at or exceeds working hours end
                              }
                            }

                            // Check each hour in the required duration
                            for (let i = 0; i < durationHours; i++) {
                              const checkHour = startHour + i;
                              if (checkHour >= 24) {
                                return false; // Goes past midnight
                              }

                              const checkTime = `${String(checkHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`;

                              // Check if this hour is within working hours
                              if (selectedDateSlots.workingHours) {
                                const [whStartHour, whStartMin] =
                                  selectedDateSlots.workingHours.start
                                    .split(":")
                                    .map(Number);
                                const [whEndHour, whEndMin] =
                                  selectedDateSlots.workingHours.end
                                    .split(":")
                                    .map(Number);
                                const checkMinutes = checkHour * 60 + startMin;
                                const whStartMinutes =
                                  whStartHour * 60 + whStartMin;
                                const whEndMinutes = whEndHour * 60 + whEndMin;

                                // Check if this hour is within working hours
                                if (
                                  checkMinutes < whStartMinutes ||
                                  checkMinutes >= whEndMinutes
                                ) {
                                  return false; // Outside working hours
                                }
                              }

                              // Check if this hour has any bookings (using the hour-level check)
                              if (isHourBooked(checkHour)) {
                                return false;
                              }

                              // Also check if the exact time slot is booked
                              if (bookedSlotsSet.has(checkTime)) {
                                return false;
                              }

                              // If we have working hours and the slot is within them and not booked,
                              // it should be available (even if not explicitly in availableSlots)
                              // The API filters availableSlots based on consecutive availability,
                              // but we're doing that check here, so we can be more lenient
                              if (selectedDateSlots.workingHours) {
                                const [whStartHour, whStartMin] =
                                  selectedDateSlots.workingHours.start
                                    .split(":")
                                    .map(Number);
                                const [whEndHour, whEndMin] =
                                  selectedDateSlots.workingHours.end
                                    .split(":")
                                    .map(Number);
                                const checkMinutes = checkHour * 60 + startMin;
                                const whStartMinutes =
                                  whStartHour * 60 + whStartMin;
                                const whEndMinutes = whEndHour * 60 + whEndMin;

                                // If within working hours and not booked, it's available
                                if (
                                  checkMinutes >= whStartMinutes &&
                                  checkMinutes < whEndMinutes
                                ) {
                                  continue; // This hour is available, check next
                                } else {
                                  return false; // Outside working hours
                                }
                              } else {
                                // Without working hours, require it to be in availableSlots
                                if (!availableSlotsSet.has(checkTime)) {
                                  return false;
                                }
                              }
                            }

                            return true; // All consecutive hours are available
                          };

                          return (
                            <>
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2">
                                {allTimeSlots.map((time) => {
                                  const isBooked = bookedSlotsSet.has(time);
                                  const isSelected =
                                    selectedTimeSlots.includes(time);
                                  const isStartTime = selectedTime === time;

                                  // Check if this slot has enough consecutive hours available
                                  const isActuallyAvailable =
                                    !isBooked &&
                                    hasEnoughConsecutiveHours(time);

                                  // Show as unavailable (red) if booked or doesn't have enough consecutive hours
                                  if (!isActuallyAvailable) {
                                    return (
                                      <div
                                        key={time}
                                        className="px-2 py-1.5 min-h-[36px] rounded-md text-xs sm:text-sm font-medium border-2 border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 cursor-not-allowed opacity-60 flex items-center justify-center"
                                      >
                                        {time}
                                      </div>
                                    );
                                  }

                                  // Show as available (green) if it has enough consecutive hours
                                  return (
                                    <button
                                      key={time}
                                      onClick={() => handleTimeSelect(time)}
                                      className={`px-2 py-1.5 min-h-[36px] rounded-md text-xs sm:text-sm font-medium transition-all touch-manipulation active:scale-95 border-2 flex items-center justify-center
                              ${
                                isStartTime
                                  ? "bg-egp-green hover:bg-egp-green-dark text-white shadow-md border-egp-green font-bold"
                                  : isSelected
                                    ? "bg-egp-green-light dark:bg-egp-green-dark text-white border-egp-green"
                                    : "border-egp-green dark:border-egp-green-light bg-egp-green/10 dark:bg-egp-green-dark/20 text-egp-green dark:text-white hover:bg-egp-green/20 dark:hover:bg-egp-green-dark/30 hover:border-egp-green-dark"
                              }
                            `}
                                    >
                                      {time}
                                    </button>
                                  );
                                })}
                              </div>
                              {selectedTimeSlots.length > 0 && (
                                <div className="mt-4 p-3 bg-[#f5f1e9] dark:bg-gray-800/40 border border-[#e4d9c8] dark:border-gray-700 rounded-lg">
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    <span className="font-semibold">
                                      Selected time slots:
                                    </span>{" "}
                                    {selectedTimeSlots.join(" → ")}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    Total duration:{" "}
                                    {Math.floor(totalServiceDuration / 60)}h{" "}
                                    {totalServiceDuration % 60}m
                                  </p>
                                </div>
                              )}
                              {selectedTime && (
                                <div className="mt-4">
                                  <ButtonPrimary
                                    onPress={() => setCurrentStep("customer")}
                                    variant="primary"
                                    className="w-full"
                                    endContent={
                                      <ArrowLeft className="w-4 h-4 rotate-180" />
                                    }
                                  >
                                    Continue to Your Details
                                  </ButtonPrimary>
                                </div>
                              )}
                            </>
                          );
                        })()
                      : null}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[200px] bg-[#f5f1e9] dark:bg-gray-800/40 border border-[#e4d9c8] dark:border-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center px-4">
                      Select a day to show available hours
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // Validate customer data
  const validateCustomerData = (): boolean => {
    const errors = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    };
    let isValid = true;

    if (!customerData.firstName.trim()) {
      errors.firstName = "First name is required";
      isValid = false;
    }

    if (!customerData.lastName.trim()) {
      errors.lastName = "Last name is required";
      isValid = false;
    }

    if (!customerData.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Phone is required
    if (!customerData.phone.trim()) {
      errors.phone = "Phone number is required";
      isValid = false;
    } else if (!/^[\d\s\-\+\(\)]+$/.test(customerData.phone.trim())) {
      errors.phone = "Please enter a valid phone number";
      isValid = false;
    }

    setCustomerDataErrors(errors);
    return isValid;
  };

  const renderCustomerDetails = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="Enter your first name"
            value={customerData.firstName}
            onValueChange={(value) =>
              setCustomerData({ ...customerData, firstName: value })
            }
            isRequired
            isInvalid={!!customerDataErrors.firstName}
            errorMessage={customerDataErrors.firstName}
            variant="bordered"
            size="lg"
            classNames={{
              input: "text-base",
              label: "text-base",
            }}
          />
          <Input
            label="Last Name"
            placeholder="Enter your last name"
            value={customerData.lastName}
            onValueChange={(value) =>
              setCustomerData({ ...customerData, lastName: value })
            }
            isRequired
            isInvalid={!!customerDataErrors.lastName}
            errorMessage={customerDataErrors.lastName}
            variant="bordered"
            size="lg"
            classNames={{
              input: "text-base",
              label: "text-base",
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="your.email@example.com"
            value={customerData.email}
            onValueChange={(value) =>
              setCustomerData({ ...customerData, email: value })
            }
            isRequired
            isInvalid={!!customerDataErrors.email}
            errorMessage={customerDataErrors.email}
            variant="bordered"
            size="lg"
            classNames={{
              input: "text-base",
              label: "text-base",
            }}
          />
          <Input
            label="Phone"
            type="tel"
            placeholder="+44 7XXX XXXXXX"
            value={customerData.phone}
            onValueChange={(value) =>
              setCustomerData({ ...customerData, phone: value })
            }
            isRequired
            isInvalid={!!customerDataErrors.phone}
            errorMessage={customerDataErrors.phone}
            variant="bordered"
            size="lg"
            classNames={{
              input: "text-base",
              label: "text-base",
            }}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            variant="bordered"
            onPress={() => setCurrentStep("date")}
            startContent={<ArrowLeft className="w-4 h-4" />}
            className="flex-1"
            size="lg"
          >
            Back
          </Button>
          <ButtonPrimary
            onPress={() => {
              if (validateCustomerData()) {
                setCurrentStep("preview");
              }
            }}
            variant="primary"
            className="flex-1"
            endContent={<ArrowLeft className="w-4 h-4 rotate-180" />}
            size="lg"
          >
            Continue to Review
          </ButtonPrimary>
        </div>
      </div>
    );
  };

  const renderOrderPreview = () => {
    const formattedAppointmentDate = selectedDate
      ? new Date(selectedDate).toLocaleDateString("en-GB", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Select a date";

    const formattedAppointmentTime = selectedTime || "Select a time";

    // Calculate end time based on start time and total duration
    let timeRange = formattedAppointmentTime;
    if (selectedTime && totalServiceDuration > 0) {
      const [startHour, startMin] = selectedTime.split(":").map(Number);
      const durationHours = Math.floor(totalServiceDuration / 60);
      const durationMinutes = totalServiceDuration % 60;

      let endHour = startHour + durationHours;
      let endMin = startMin + durationMinutes;

      if (endMin >= 60) {
        endHour += Math.floor(endMin / 60);
        endMin = endMin % 60;
      }

      if (endHour >= 24) {
        endHour = endHour % 24;
      }

      const endTime = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;
      timeRange = `${selectedTime} to ${endTime}`;
    }

    const selectedTeamMemberData = selectedTeamMember
      ? teamMembers.find((m) => m.id === selectedTeamMember)
      : null;

    return (
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Booking summary + Your details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Appointment card */}
            <Card className="border border-[#e4d9c8] dark:border-gray-700 shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b border-[#e4d9c8] dark:border-gray-700 bg-[#faf7f1] dark:bg-gray-800/50">
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                  Appointment
                </h4>
              </CardHeader>
              <CardBody className="p-5 space-y-5">
                {selectedTeamMemberData && (
                  <div className="flex items-center gap-4">
                    {selectedTeamMemberData.image_url ? (
                      <img
                        src={selectedTeamMemberData.image_url}
                        alt=""
                        className="w-14 h-14 rounded-full object-cover border-2 border-[#e4d9c8] dark:border-gray-600 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-egp-green/10 dark:bg-egp-green/20 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-7 h-7 text-egp-green dark:text-egp-beige" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Practitioner
                      </p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
                        {selectedTeamMemberData.name}
                      </p>
                      {selectedTeamMemberData.role && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedTeamMemberData.role}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-egp-green/10 dark:bg-egp-green/20 flex-shrink-0">
                      <Calendar className="w-4 h-4 text-egp-green dark:text-egp-beige" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
                        {formattedAppointmentDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-egp-green/10 dark:bg-egp-green/20 flex-shrink-0">
                      <Clock className="w-4 h-4 text-egp-green dark:text-egp-beige" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Time
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
                        {timeRange}
                      </p>
                      {selectedTimeSlots.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                          {selectedTimeSlots.join(" → ")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Your details */}
            <Card className="border border-[#e4d9c8] dark:border-gray-700 shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b border-[#e4d9c8] dark:border-gray-700 bg-[#faf7f1] dark:bg-gray-800/50">
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                  Your details
                </h4>
              </CardHeader>
              <CardBody className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Name
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {customerData.firstName} {customerData.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Email
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white break-all">
                      {customerData.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Phone
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {customerData.phone}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right: Treatments + Payment summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Treatments list */}
            <Card className="border border-[#e4d9c8] dark:border-gray-700 shadow-sm overflow-hidden">
              <CardHeader className="pb-3 border-b border-[#e4d9c8] dark:border-gray-700 bg-[#faf7f1] dark:bg-gray-800/50">
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                  Treatments
                </h4>
              </CardHeader>
              <CardBody className="p-0">
                <ul className="divide-y divide-[#e4d9c8] dark:divide-gray-700">
                  {selectedServices.map((item, i) => (
                    <li
                      key={item.serviceId}
                      className="px-5 py-4 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {item.duration} min
                          {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <PriceWithDiscount
                          price={item.price}
                          originalPrice={item.originalPrice}
                          discountPercentage={item.discountPercentage}
                          quantity={item.quantity}
                          size="sm"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>

            {/* Payment summary + CTA */}
            <Card className="border-2 border-egp-green dark:border-egp-beige bg-gradient-to-b from-[#f5f1e9] to-white dark:from-gray-800 dark:to-gray-900 shadow-lg overflow-hidden">
              <CardBody className="p-6 space-y-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-egp-green dark:text-white">
                    £{totalAmount.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {totalDuration} min total
                </p>
                {depositConfig.enabled && (
                  <div className="pt-3 border-t border-egp-green/20 dark:border-egp-beige/20 space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={payDepositOnly}
                        onChange={(e) => setPayDepositOnly(e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-egp-green focus:ring-egp-green"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Pay deposit only (rest on arrival)
                      </span>
                    </label>
                    {payDepositOnly && (
                      <div className="pl-6 space-y-1">
                        <p className="text-sm font-semibold text-egp-green dark:text-white">
                          Pay now: £{depositAmount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          £{remainingAmount.toFixed(2)} due on arrival
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-amber-700 dark:text-amber-300/90">
                      Cancel or request a refund up to 24 hours before your
                      appointment.
                    </p>
                  </div>
                )}
                {!showPaymentForm ? (
                  <ButtonPrimary
                    onPress={proceedToPayment}
                    variant="primary"
                    className="w-full mt-2"
                    size="lg"
                    startContent={<CreditCard className="w-5 h-5" />}
                  >
                    Proceed to Payment
                  </ButtonPrimary>
                ) : null}
              </CardBody>
            </Card>
          </div>
        </div>

        {showPaymentForm && (
          <Card className="border border-[#e4d9c8] dark:border-gray-700 shadow-sm overflow-hidden">
            <CardBody className="p-6 space-y-5">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/40">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-200">
                    Secure payment by Stripe
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300/80">
                    Your payment information is encrypted and secure.
                  </p>
                </div>
              </div>

              {/* Stripe Payment Form */}
              {(() => {
                // Validate customer data before rendering payment form
                const hasValidCustomerData =
                  customerData.firstName?.trim() && customerData.email?.trim();

                if (!hasValidCustomerData) {
                  return (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                        Please complete the "Your Details" step before
                        proceeding to payment.
                      </p>
                    </div>
                  );
                }

                return (
                  <StripePaymentForm
                    amount={totalAmount}
                    amountToCharge={amountToCharge}
                    depositMetadata={
                      isDepositPayment
                        ? {
                            isDeposit: true,
                            totalAmount,
                            depositAmount,
                            remainingAmount,
                          }
                        : undefined
                    }
                    services={selectedServices.map((item) => ({
                      name: item.name,
                      price: item.price,
                      quantity: item.quantity,
                      duration: item.duration,
                    }))}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    teamMemberId={selectedTeamMember || undefined}
                    teamMemberName={
                      selectedTeamMember
                        ? teamMembers.find((m) => m.id === selectedTeamMember)
                            ?.name
                        : undefined
                    }
                    teamMemberRole={
                      selectedTeamMember
                        ? teamMembers.find((m) => m.id === selectedTeamMember)
                            ?.role
                        : undefined
                    }
                    teamMemberPhone={
                      selectedTeamMember
                        ? teamMembers.find((m) => m.id === selectedTeamMember)
                            ?.phone
                        : undefined
                    }
                    teamMemberEmail={
                      selectedTeamMember
                        ? teamMembers.find((m) => m.id === selectedTeamMember)
                            ?.email
                        : undefined
                    }
                    serviceDurationMinutes={totalServiceDuration || undefined}
                    customerData={{
                      firstName: customerData.firstName.trim(),
                      lastName: customerData.lastName?.trim() || "",
                      email: customerData.email.trim(),
                      phone: customerData.phone.trim(),
                    }}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                    onTestBooking={handlePaymentSuccess}
                  />
                );
              })()}
            </CardBody>
          </Card>
        )}
      </div>
    );
  };

  const renderStripePayment = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setCurrentStep("preview")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Secure Payment
          </h3>
        </div>

        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Secure Payment by Stripe</span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-500 mt-1">
            Your payment information is encrypted and secure
          </p>
        </div>

        {/* Real Stripe Payment Form */}
        {(() => {
          // Validate customer data before rendering payment form
          const hasValidCustomerData =
            customerData.firstName?.trim() && customerData.email?.trim();

          if (!hasValidCustomerData) {
            console.warn(
              "Cannot render payment form - invalid customer data:",
              {
                firstName: customerData.firstName,
                lastName: customerData.lastName,
                email: customerData.email,
                phone: customerData.phone,
              },
            );
            return (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  Please complete the "Your Details" step before proceeding to
                  payment.
                </p>
              </div>
            );
          }

          return (
            <StripePaymentForm
              amount={totalAmount}
              amountToCharge={amountToCharge}
              depositMetadata={
                isDepositPayment
                  ? {
                      isDeposit: true,
                      totalAmount,
                      depositAmount,
                      remainingAmount,
                    }
                  : undefined
              }
              services={selectedServices.map((item) => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                duration: item.duration,
              }))}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              teamMemberId={selectedTeamMember || undefined}
              teamMemberName={
                selectedTeamMember
                  ? teamMembers.find((m) => m.id === selectedTeamMember)?.name
                  : undefined
              }
              teamMemberRole={
                selectedTeamMember
                  ? teamMembers.find((m) => m.id === selectedTeamMember)?.role
                  : undefined
              }
              teamMemberPhone={
                selectedTeamMember
                  ? teamMembers.find((m) => m.id === selectedTeamMember)?.phone
                  : undefined
              }
              teamMemberEmail={
                selectedTeamMember
                  ? teamMembers.find((m) => m.id === selectedTeamMember)?.email
                  : undefined
              }
              serviceDurationMinutes={totalServiceDuration || undefined}
              customerData={{
                firstName: customerData.firstName.trim(),
                lastName: customerData.lastName?.trim() || "",
                email: customerData.email.trim(),
                phone: customerData.phone?.trim() || undefined,
              }}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              onTestBooking={handlePaymentSuccess} // Use same success handler for test bookings
            />
          );
        })()}
      </div>
    );
  };

  // Show loading state while services are being fetched
  if (servicesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" color="primary" className="mb-4" />
          <p className="text-gray-600 dark:text-gray-300">
            Loading services...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={`${layout.containerWide} pt-24 pb-16`}>
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 px-4">
          <h1 className={`${typography.headingPage} ${textColors.heading} mb-3 sm:mb-4 md:mb-6 font-playfair`}>
            Book Your Treatment
          </h1>
          <p className={`${typography.lead} font-montserrat font-light max-w-3xl mx-auto`}>
            Select services, choose date & time, and pay securely
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 sm:gap-8 px-4 sm:px-0 items-start">
          <div className="space-y-5">
            {bookingSteps.map((step, index) => {
              const Icon = step.icon;
              const isOpen = currentStep === step.key;
              const isCompleted = currentStepIndex > index;
              const isUnlocked = isStepUnlocked(step.key);
              const canInteract = isUnlocked || index <= currentStepIndex;
              const statusLabel = isCompleted
                ? "Completed"
                : isOpen
                  ? "In progress"
                  : canInteract
                    ? "Ready"
                    : "Locked";
              const statusClass = isCompleted
                ? "text-[#357a52] dark:text-[#6bb18d]"
                : isOpen
                  ? "text-[#9d9585] dark:text-[#c9c1b0]"
                  : canInteract
                    ? "text-gray-600 dark:text-gray-300"
                    : "text-gray-400 dark:text-gray-600";
              const iconWrapperClasses = isCompleted
                ? "bg-[#6bb18d] text-white"
                : isOpen
                  ? "bg-[#9d9585] text-white"
                  : "bg-white text-gray-600 dark:bg-gray-800 dark:text-gray-300";

              return (
                <section
                  key={step.key}
                  className="rounded-3xl border border-[#e4d9c8] dark:border-gray-800 bg-white/60 dark:bg-gray-900/50 backdrop-blur-sm shadow-lg"
                >
                  <button
                    type="button"
                    onClick={() => handleStepToggle(step.key)}
                    disabled={!canInteract}
                    className={`w-full flex items-center justify-between gap-4 px-4 sm:px-6 py-5 text-left rounded-3xl transition-colors ${
                      canInteract
                        ? "hover:bg-white/80 dark:hover:bg-gray-900/70"
                        : "opacity-70 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-4 sm:gap-5">
                      <span
                        className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-[#e4d9c8]/70 dark:border-gray-700 transition-all ${iconWrapperClasses}`}
                      >
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </span>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                          {step.label}
                        </h3>
                        <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                          Step {index + 1} of {bookingSteps.length}
                        </p>
                        <p className="hidden sm:block text-sm text-gray-500 dark:text-gray-400">
                          {stepDescriptions[step.key]}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs sm:text-sm font-semibold ${statusClass}`}
                      >
                        {statusLabel}
                      </span>
                      {canInteract ? (
                        <ChevronDown
                          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                      )}
                    </div>
                  </button>
                  <div
                    className={`${isOpen ? "block" : "hidden"} border-t border-[#e4d9c8] dark:border-gray-800 px-4 sm:px-6 pb-6`}
                  >
                    <div className="pt-6">{renderStepContent(step.key)}</div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>

      {/* Service Selector Modal */}
      {showServiceSelector && renderServiceSelector()}

      {/* Service Info Modal */}
      {renderServiceInfoModal()}
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-default-50 flex items-center justify-center">
          <div className="text-center">
            <Spinner size="lg" color="primary" className="mb-4" />
            <p className="text-default-600">Loading...</p>
          </div>
        </div>
      }
    >
      <BookingPageContent />
    </Suspense>
  );
}

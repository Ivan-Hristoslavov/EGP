"use client";

import { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { siteConfig } from "@/config/site";
import { Calendar, Clock, CreditCard, CheckCircle, Plus, Minus, X, ArrowLeft, Info, Shield, ChevronDown, Lock } from "lucide-react";
import StripePaymentForm from '@/components/StripePaymentForm';
import { useServices } from '@/hooks/useServices';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { useToast } from '@/components/Toast';

type OrderItem = {
  serviceId: string;
  name: string;
  price: number;
  duration: number;
  category: string;
  quantity: number;
};

type CalendarDay = {
  date: string;
  status: 'available' | 'full' | 'closed';
  timeSlots: string[];
  allSlots: string[];
  bookedSlots: string[];
  workingHours?: {
    start: string;
    end: string;
  };
};

type BookingStepKey = 'services' | 'date' | 'preview' | 'payment';

type TeamMember = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
};

function BookingPageContent() {
  const searchParams = useSearchParams();
  const { services, isLoading: servicesLoading } = useServices();
  const { showError } = useToast();
  const [selectedServices, setSelectedServices] = useState<OrderItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]); // All time slots for the selected duration
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState<CalendarDay[]>([]);
  const [selectedDateSlots, setSelectedDateSlots] = useState<CalendarDay | null>(null); // Time slots for selected date only
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'services' | 'date' | 'preview' | 'payment'>('services');
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [serviceInfoModal, setServiceInfoModal] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [hoverTooltip, setHoverTooltip] = useState<{ 
    x: number; 
    y: number; 
    content: string;
    date: string;
    slots: string[];
    bookedSlots: string[];
    totalSlots: number;
    status: 'available' | 'full' | 'closed';
    showAbove: boolean;
  } | null>(null);

  const bookingSteps = useMemo(() => ([
    { key: 'services', label: 'Services', icon: CheckCircle },
    { key: 'date', label: 'Date & Time', icon: Calendar },
    { key: 'preview', label: 'Preview', icon: CheckCircle },
    { key: 'payment', label: 'Payment', icon: CreditCard }
  ] as const), []);

  const stepOrder = useMemo(() => bookingSteps.map(step => step.key), [bookingSteps]);
  const currentStepIndex = stepOrder.indexOf(currentStep);

  const stepDescriptions: Record<BookingStepKey, string> = {
    services: "Select treatments and tailor your session",
    date: "Choose the perfect date and time",
    preview: "Review your booking details",
    payment: "Confirm and secure your booking"
  };

  const isStepUnlocked = (stepKey: BookingStepKey) => {
    switch (stepKey) {
      case 'services':
        return true;
      case 'date':
        return selectedServices.length > 0 && Boolean(selectedTeamMember);
      case 'preview':
        return selectedServices.length > 0 && Boolean(selectedTeamMember) && Boolean(selectedDate) && Boolean(selectedTime);
      case 'payment':
        return selectedServices.length > 0 && Boolean(selectedTeamMember) && Boolean(selectedDate) && Boolean(selectedTime);
      default:
        return false;
    }
  };

  const handleStepToggle = (stepKey: BookingStepKey) => {
    const targetIndex = stepOrder.indexOf(stepKey);
    const canAccess = targetIndex <= currentStepIndex || isStepUnlocked(stepKey);
    if (!canAccess || currentStep === stepKey) {
      return;
    }
    setCurrentStep(stepKey);
  };

  // Create a lookup map from services for easy access
  const servicesDataMap = useMemo(() => {
    const map: Record<string, any> = {};
    services.forEach(service => {
      map[service.slug] = {
        name: service.name,
        price: service.price,
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
      };
    });
    return map;
  }, [services]);

  // Group services by category
  const servicesByCategory = useMemo(() => {
    const grouped: Record<string, Array<[string, any]>> = {};
    services.forEach(service => {
      const categoryName = service.category.name;
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push([service.slug, servicesDataMap[service.slug]]);
    });
    return grouped;
  }, [services, servicesDataMap]);

  // Load team members
  useEffect(() => {
    const loadTeamMembers = async () => {
      setTeamMembersLoading(true);
      try {
        const response = await fetch('/api/admin/team');
        const data = await response.json();
        console.log('Team API response:', data);
        if (response.ok && data.team) {
          const activeMembers = data.team.filter((member: TeamMember) => member.is_active === true);
          console.log('Active team members:', activeMembers);
          setTeamMembers(activeMembers);
        } else {
          console.error('Failed to load team members:', data.error || 'Unknown error');
        }
      } catch (error) {
        console.error('Error loading team members:', error);
      } finally {
        setTeamMembersLoading(false);
      }
    };
    loadTeamMembers();
  }, []);

  // Calculate total service duration in minutes
  const totalServiceDuration = useMemo(() => {
    return selectedServices.reduce((total, service) => {
      return total + (service.duration * service.quantity);
    }, 0);
  }, [selectedServices]);

  const loadAvailability = useCallback(async () => {
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
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };
        
        const startDateStr = formatDateLocal(start);
        const endDateStr = formatDateLocal(end);
          
        // Make single API call for all dates in range
        try {
          const response = await fetch(
            `/api/bookings/availability/team/range?team_member_id=${selectedTeamMember}&start_date=${startDateStr}&end_date=${endDateStr}&service_duration_minutes=${totalServiceDuration}`
          );
          
              if (response.ok) {
                const data = await response.json();
            const availability = data.availability || {};
            
            // Convert to CalendarDay array
            const dates: CalendarDay[] = [];
            const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            
            for (let i = 0; i < dayCount; i++) {
              const currentDate = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
              const dateStr = formatDateLocal(currentDate);
              
              const dateAvailability = availability[dateStr];
              if (dateAvailability) {
                dates.push({
                    date: dateStr,
                  status: dateAvailability.status,
                  timeSlots: dateAvailability.availableSlots || [],
                  allSlots: [...(dateAvailability.availableSlots || []), ...(dateAvailability.bookedSlots || [])],
                  bookedSlots: dateAvailability.bookedSlots || [],
                  workingHours: dateAvailability.workingHours,
                });
                } else {
                dates.push({
                    date: dateStr,
                    status: 'closed' as const,
                    timeSlots: [],
                    allSlots: [],
                    bookedSlots: [],
                });
                }
            }
            
            setAvailableDates(dates);
          } else {
            throw new Error('Failed to fetch availability');
          }
        } catch (error) {
          console.error('Error fetching availability range:', error);
          setAvailabilityError('Unable to load availability. Please try again later.');
        }
      } else {
        // No team member selected or no services - show empty calendar
        setAvailableDates([]);
      }

      if (availableDates.length && selectedDate && !availableDates.some((day) => day.date === selectedDate)) {
        setSelectedDate('');
        setSelectedTime('');
      }
    } catch (error) {
      console.error('Error loading availability:', error);
      setAvailabilityError('Unable to load availability. Please try again later.');
    } finally {
      setAvailabilityLoading(false);
    }
  }, [selectedDate, selectedTeamMember, totalServiceDuration]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  // Reload availability when team member or services change
  useEffect(() => {
    if (selectedServices.length > 0) {
      // Small delay to avoid too many requests
      const timeoutId = setTimeout(() => {
        loadAvailability();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [selectedTeamMember, totalServiceDuration, loadAvailability]);

  // Auto-select service from URL parameter
  useEffect(() => {
    if (servicesLoading || services.length === 0) return;
    
    const serviceParam = searchParams.get('service');
    const conditionParam = searchParams.get('condition');
    
    if (serviceParam && servicesDataMap[serviceParam]) {
      addService(serviceParam);
    }
    
    // If coming from condition, show service selector and suggest relevant services
    if (conditionParam) {
      setShowServiceSelector(true);
      
      // Auto-suggest relevant services based on condition
      const conditionServiceMapping: { [key: string]: string[] } = {
        'cellulite-thighs-buttocks-abdomen': ['radiofrequency-ultrasound', 'ultrasound-lift-tighten', 'body-fat-burning-mesotherapy'],
        'stubborn-belly-fat-abdominal-fat': ['fat-freezing-treatment', 'body-fat-burning-mesotherapy', 'radiofrequency-ultrasound'],
        'love-handles-flanks': ['fat-freezing-treatment', 'radiofrequency-ultrasound', 'body-fat-burning-mesotherapy'],
        'sagging-skin-skin-laxity': ['radiofrequency-ultrasound', 'ultrasound-lift-tighten', 'combined-treatment'],
        'stretch-marks': ['microneedling-facial', 'radiofrequency-ultrasound', 'prp-treatment'],
        'arm-fat-bingo-wings': ['fat-freezing-treatment', 'radiofrequency-ultrasound', 'ultrasound-lift-tighten'],
        'thigh-fat-inner-thigh-laxity': ['fat-freezing-treatment', 'radiofrequency-ultrasound', 'ultrasound-lift-tighten'],
        'double-chin-jawline-fat': ['fat-freezing-treatment', 'jaw-slimming', 'jawline-filler'],
        'post-pregnancy-tummy': ['radiofrequency-ultrasound', 'ultrasound-lift-tighten', 'body-fat-burning-mesotherapy'],
        'water-retention-bloating-swelling': ['body-fat-burning-mesotherapy', 'radiofrequency-ultrasound', 'combined-treatment']
      };
      
      const suggestedServices = conditionServiceMapping[conditionParam] || [];
      if (suggestedServices.length > 0) {
        // Add first suggested service automatically
        addService(suggestedServices[0]);
      }
    }
  }, [searchParams, servicesLoading, services, servicesDataMap]);

  const totalAmount = selectedServices.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDuration = selectedServices.reduce((sum, item) => sum + (item.duration * item.quantity), 0);

  // Helper function to check if adding a service would exceed working hours
  const wouldExceedWorkingHours = useCallback((additionalDuration: number): boolean => {
    // Only check if date and time are already selected
    if (!selectedDate || !selectedTime || !selectedDateSlots?.workingHours) {
      return false; // Allow if no date/time selected yet
    }

    const currentTotalDuration = selectedServices.reduce((sum, item) => sum + (item.duration * item.quantity), 0);
    const newTotalDuration = currentTotalDuration + additionalDuration;

    // Parse selected time
    const [startHour, startMin] = selectedTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;

    // Calculate end time with new duration
    const endMinutes = startMinutes + newTotalDuration;

    // Parse working hours end time
    const [endHour, endMin] = selectedDateSlots.workingHours.end.split(':').map(Number);
    const workingHoursEndMinutes = endHour * 60 + endMin;

    // Check if the service would extend past working hours
    return endMinutes > workingHoursEndMinutes;
  }, [selectedDate, selectedTime, selectedDateSlots, selectedServices]);

  const addService = (serviceId: string): boolean => {
    const service = servicesDataMap[serviceId];
    if (!service) return false;

    // Check if adding this service would exceed working hours
    const additionalDuration = service.duration;
    if (wouldExceedWorkingHours(additionalDuration)) {
      showError(
        "Cannot Add Service",
        `Adding this service would exceed working hours. The appointment would end after closing time.`
      );
      return false;
    }

    const existingIndex = selectedServices.findIndex(item => item.serviceId === serviceId);
    
    if (existingIndex >= 0) {
      const updated = [...selectedServices];
      updated[existingIndex].quantity += 1;
      setSelectedServices(updated);
    } else {
      setSelectedServices([...selectedServices, {
        serviceId,
        name: service.name,
        price: service.price,
        duration: service.duration,
        category: service.category,
        quantity: 1
      }]);
    }
    return true;
  };

  const removeService = (serviceId: string) => {
    setSelectedServices(selectedServices.filter(item => item.serviceId !== serviceId));
  };

  const updateQuantity = (serviceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeService(serviceId);
      return;
    }

    // Check if increasing quantity would exceed working hours
    const service = selectedServices.find(item => item.serviceId === serviceId);
    if (service && quantity > service.quantity) {
      const additionalDuration = service.duration * (quantity - service.quantity);
      if (wouldExceedWorkingHours(additionalDuration)) {
        showError(
          "Cannot Increase Quantity",
          `Increasing the quantity would exceed working hours. The appointment would end after closing time.`
        );
        return;
      }
    }
    
    const updated = selectedServices.map(item => 
      item.serviceId === serviceId ? { ...item, quantity } : item
    );
    setSelectedServices(updated);
  };

  const handleDateSelect = async (date: string) => {
    if (availabilityLoading) return;

    // Check if we already have this date's data
    const existingInfo = availableDates.find((item) => item.date === date);
    if (existingInfo && existingInfo.status !== 'closed' && existingInfo.timeSlots.length > 0) {
      setSelectedDate(date);
      setSelectedTime('');
      setSelectedTimeSlots([]);
      setSelectedDateSlots(existingInfo);
      setCurrentStep('date');
      return;
    }

    // If not in cache, fetch only this date's availability
    if (selectedTeamMember && totalServiceDuration > 0) {
      setAvailabilityLoading(true);
      try {
        const response = await fetch(
          `/api/bookings/availability/team?team_member_id=${selectedTeamMember}&date=${date}&service_duration_minutes=${totalServiceDuration}`
        );
        
        if (response.ok) {
          const data = await response.json();
          const availableSlots = data.availableSlots || [];
          const bookedSlots = data.bookedSlots || [];
          
          const dateInfo: CalendarDay = {
            date: date,
            status: availableSlots.length > 0 ? 'available' as const : 'full' as const,
            timeSlots: availableSlots,
            allSlots: [...availableSlots, ...bookedSlots],
            bookedSlots: bookedSlots,
            workingHours: data.workingHours || undefined,
          };

    setSelectedDate(date);
    setSelectedTime('');
          setSelectedTimeSlots([]);
          setSelectedDateSlots(dateInfo);
    setCurrentStep('date');
          
          // Also update the availableDates cache
          const updatedDates = availableDates.map(d => d.date === date ? dateInfo : d);
          if (!updatedDates.find(d => d.date === date)) {
            updatedDates.push(dateInfo);
          }
          setAvailableDates(updatedDates);
        }
      } catch (error) {
        console.error('Error fetching date availability:', error);
      } finally {
        setAvailabilityLoading(false);
      }
    }
  };

  const handleTimeSelect = (startTime: string) => {
    // Calculate all time slots needed based on duration
    // Duration is in minutes, we need to mark consecutive hours
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const durationHours = Math.ceil(totalServiceDuration / 60); // Round up to get full hours needed
    
    const selectedSlots: string[] = [];
    
    // Add all consecutive hours starting from the selected time
    for (let i = 0; i < durationHours; i++) {
      const hour = startHour + i;
      if (hour >= 24) break; // Don't go past midnight
      const timeStr = `${String(hour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
      selectedSlots.push(timeStr);
    }
    
    setSelectedTime(startTime);
    setSelectedTimeSlots(selectedSlots);
    setCurrentStep('preview');
  };

  const proceedToPayment = () => {
    setCurrentStep('payment');
  };

  const handlePaymentSuccess = (bookingId: string) => {
    // Redirect to success page or show success message
    window.location.href = `/book/success?booking=${bookingId}`;
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    // You could show a toast notification here
  };

  const renderStepContent = (stepKey: BookingStepKey) => {
    switch (stepKey) {
      case 'services':
        return renderServicesStep();
      case 'date':
        return renderCalendar();
      case 'preview':
        return renderOrderPreview();
      case 'payment':
        return renderStripePayment();
      default:
        return null;
    }
  };

  const renderServicesStep = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Selected Services</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Curate your treatment plan before choosing a date.
          </p>
        </div>
        <button
          onClick={() => setShowServiceSelector(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#b8ae9b] via-[#d0c6b4] to-[#e3d8c4] text-[#3f3a31] font-semibold shadow-md hover:shadow-lg transition-all active:scale-95 touch-manipulation min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Services</span>
        </button>
      </div>

      {selectedServices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d6ccb9] dark:border-gray-700 bg-[#faf7f1] dark:bg-gray-900/60 p-8 sm:p-10 text-center">
          <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-[#c0b49f] dark:text-[#b5ad9d] mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No services selected yet</h4>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Explore our treatments to build your bespoke experience. You can always adjust later.
          </p>
          <button
            onClick={() => setShowServiceSelector(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] text-[#3f3a31] font-medium shadow-md hover:shadow-lg transition-all active:scale-95 touch-manipulation"
          >
            <Plus className="w-4 h-4" />
            <span>Browse Services</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          {selectedServices.map(item => {
            const serviceData = servicesDataMap[item.serviceId];
            return (
              <div
                key={item.serviceId}
                className="group rounded-2xl border border-[#e4d9c8] dark:border-gray-700 bg-white/95 dark:bg-gray-900/50 shadow-sm hover:shadow-lg transition-all p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">{item.name}</h4>
                      <span className="text-lg font-bold text-[#9d9585] dark:text-[#c9c1b0] whitespace-nowrap">
                        £{item.price}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0ede7] dark:bg-gray-800/60 text-xs font-medium text-gray-700 dark:text-gray-300">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.duration} min</span>
                      </span>
                      {serviceData?.requires_consultation && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#f8f0e5] dark:bg-gray-800/60 text-xs font-medium text-[#6b5f4b] dark:text-[#d8c5a7]">
                          Consultation required
                        </span>
                      )}
                      {serviceData?.downtime_days > 0 && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#eef8f2] dark:bg-gray-800/60 text-xs font-medium text-[#2f6b3d] dark:text-[#80c48f]">
                          {serviceData.downtime_days}d downtime
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.serviceId, item.quantity - 1)}
                        className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800/70 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:border-[#c9c1b0] hover:text-[#8c846f] transition-colors touch-manipulation active:scale-95"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800/60 text-base font-semibold text-gray-900 dark:text-white min-w-[48px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.serviceId, item.quantity + 1)}
                        className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800/70 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:border-[#c9c1b0] hover:text-[#8c846f] transition-colors touch-manipulation active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <div className="text-left sm:text-right">
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Subtotal</p>
                        <p className="text-xl font-bold text-[#9d9585] dark:text-[#c9c1b0]">£{item.price * item.quantity}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setServiceInfoModal(item.serviceId);
                        }}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[#c9c1b0] text-[#6b5f4b] dark:text-[#c9c1b0] hover:bg-[#f5f1e9] dark:hover:bg-gray-800/60 transition-colors text-sm font-medium min-h-[40px] touch-manipulation active:scale-95"
                      >
                        <Info className="w-4 h-4" />
                        <span>Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="border-t border-[#e4d9c8] dark:border-gray-700 pt-5">
            <button
              onClick={() => setCurrentStep('date')}
              disabled={selectedServices.length === 0}
              className="w-full bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] text-[#3f3a31] py-3.5 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all active:scale-95 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Date Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderServiceInfoModal = () => {
    if (!serviceInfoModal) return null;
    
    const service = servicesDataMap[serviceInfoModal];
    if (!service) return null;

    const metaItems = [
      {
        label: 'Investment',
        value: `£${service.price}`,
      },
      service.duration && {
        label: 'Duration',
        value: `${service.duration} min`,
      },
      service.requiresConsultation !== undefined && {
        label: 'Consultation',
        value: service.requiresConsultation ? 'Required' : 'Optional',
      },
      service.downtimeDays !== undefined && {
        label: 'Downtime',
        value: service.downtimeDays > 0 ? `${service.downtimeDays} day${service.downtimeDays > 1 ? 's' : ''}` : 'Minimal',
      },
      service.resultsDurationWeeks && {
        label: 'Results last',
        value: `${service.resultsDurationWeeks} week${service.resultsDurationWeeks > 1 ? 's' : ''}`,
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
              <ModalHeader className="bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] text-[#3f3a31] rounded-t-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 w-full">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] font-semibold text-[#3f3a31]/70">Treatment insight</p>
                    <h2 className="text-2xl sm:text-3xl font-bold mt-1">{service.name}</h2>
                    <p className="text-sm text-[#3f3a31]/80 mt-1">{service.category}</p>
                  </div>
                  {service.imageUrl && (
                    <div className="hidden sm:block w-20 h-20 rounded-xl overflow-hidden border border-white/40 shadow-lg">
                      <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </ModalHeader>

              <ModalBody className="py-6">
                <div className="space-y-6">
                  {metaItems.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {metaItems.map(({ label, value }) => (
                        <div key={label} className="bg-[#f5f1e9] dark:bg-gray-800/40 border border-[#e4d9c8] dark:border-gray-700 rounded-lg px-4 py-3">
                          <p className="text-xs uppercase tracking-wide text-[#6b5f4b] dark:text-[#c9c1b0] font-semibold">{label}</p>
                          <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 font-medium mt-1">{value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {service.description && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
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
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Treatment experience</h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{service.details}</p>
                    </div>
                  )}

                  {service.benefits && service.benefits.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Key benefits
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                        {service.benefits.map((benefit: string, index: number) => (
                          <li key={index}>{benefit}</li>
                        ))}
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
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{service.preparation}</p>
                        </div>
                      )}
                      {service.aftercare && (
                        <div className="bg-[#f5f1e9] dark:bg-gray-800/40 border border-[#e4d9c8] dark:border-gray-700 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-[#6b5f4b] dark:text-[#c9c1b0] mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#9d9585]" />
                            Aftercare guidance
                          </h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{service.aftercare}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ModalBody>

              <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="light"
                  onPress={onClose}
                  className="w-full"
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    );
  };

  const renderServiceSelector = () => {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4" style={{ zIndex: 9000 }}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] text-[#3f3a31] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-2xl flex-shrink-0">
            <h2 className="text-xl sm:text-2xl font-bold">Select Services</h2>
            <button
              onClick={() => setShowServiceSelector(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {Object.entries(servicesByCategory).map(([category, servicesList]) => (
              <div key={category} className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-5">{category}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {servicesList.map(([serviceId, service]) => (
                    <div
                      key={serviceId}
                      className="border border-[#e4d9c8] dark:border-gray-700 rounded-xl p-4 sm:p-5 hover:border-[#c9c1b0] dark:hover:border-[#b5ad9d] transition-all duration-200 hover:shadow-lg relative group bg-white/95 dark:bg-gray-900/70"
                    >
                      <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg mb-2 leading-tight">{service.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                              {service.description}
                            </p>
                        </div>
                          <div className="flex items-center justify-between sm:justify-start sm:flex-col sm:items-start gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex flex-col">
                              <div className="text-xl sm:text-2xl font-bold text-[#9d9585] dark:text-[#c9c1b0]">£{service.price}</div>
                              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{service.duration} min</div>
                            </div>
                        </div>
                      </div>
                        
                        {service.details && (
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4 mt-2">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-1.5 text-sm sm:text-base">Treatment Details</h5>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">{service.details}</p>
                    </div>
                        )}
                        
                        {service.benefits && service.benefits.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                            {service.benefits.slice(0, 3).map((benefit: string, index: number) => (
                              <span key={index} className="bg-[#f5f1e9] dark:bg-gray-800/40 text-[#6b5f4b] dark:text-[#c9c1b0] px-2 sm:px-2.5 py-1 rounded-full text-xs">
                                {benefit}
                              </span>
                            ))}
                            {service.benefits.length > 3 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">+{service.benefits.length - 3} more</span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span className="hidden sm:inline">{service.duration} minutes</span>
                            <span className="sm:hidden">{service.duration}m</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="hidden sm:inline">Professional</span>
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setServiceInfoModal(serviceId);
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#c9c1b0] text-[#6b5f4b] dark:text-[#c9c1b0] rounded-lg hover:bg-[#f5f1e9] dark:hover:bg-gray-800/40 transition-colors font-medium text-sm sm:text-base min-h-[44px] touch-manipulation active:scale-95"
                          >
                            <Info className="w-4 h-4" />
                            <span>More Info</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const success = addService(serviceId);
                              if (success) {
                        setShowServiceSelector(false);
                              }
                      }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#9d9585] to-[#c9c1b0] text-[#3f3a31] rounded-lg hover:from-[#8c846f] hover:to-[#b5ad9d] transition-all font-medium shadow-md hover:shadow-lg text-sm sm:text-base min-h-[44px] touch-manipulation active:scale-95"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Service</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Select Date &amp; Time</h3>
        <div className="flex items-center gap-3 bg-[#f5f1e9] dark:bg-gray-900/60 border border-[#e4d9c8] dark:border-gray-700 rounded-xl px-4 py-6">
          <div className="w-6 h-6 border-2 border-[#c9c1b0] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Loading availability...</span>
        </div>
      </div>
    );
  }

  if (availabilityError) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Select Date &amp; Time</h3>
        <div className="bg-[#fce8e8] dark:bg-red-900/20 border border-[#f3b3b0] dark:border-red-800 rounded-xl px-4 py-6 space-y-4">
          <p className="text-sm sm:text-base text-[#7f2b27] dark:text-red-200">{availabilityError}</p>
          <Button
            onPress={loadAvailability}
            color="primary"
            className="bg-gradient-to-r from-[#9d9585] to-[#c9c1b0] text-[#3f3a31]"
          >
            Retry loading availability
          </Button>
        </div>
      </div>
    );
  }

  if (!availableDates.length && !availabilityLoading && selectedTeamMember) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Select Date &amp; Time</h3>
        <div className="bg-[#f5f1e9] dark:bg-gray-900/60 border border-[#e4d9c8] dark:border-gray-700 rounded-xl px-4 py-6 space-y-4 text-center">
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
            {selectedTeamMember 
              ? "No availability found for the next 30 days. This may be because working hours are not configured or all days are closed."
              : "Please select a team member to view availability."
            }
          </p>
          {selectedTeamMember && (
            <Button
              onPress={loadAvailability}
              color="primary"
              variant="light"
              className="mx-auto"
            >
              Refresh availability
            </Button>
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
      const firstDateUTC = new Date(Date.UTC(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate()));
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
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Select Date &amp; Time</h3>
      
      {/* Team Member Selection - REQUIRED FIRST */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Select Team Member <span className="text-red-500">*</span>
          {selectedServices.length > 0 && totalServiceDuration > 0 && (
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">
              (Service duration: {Math.floor(totalServiceDuration / 60)}h {totalServiceDuration % 60}m)
            </span>
          )}
        </label>
        {teamMembersLoading ? (
          <div className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Loading team members...</span>
          </div>
        ) : (
          <select
            value={selectedTeamMember}
            onChange={(e) => {
              setSelectedTeamMember(e.target.value);
              setSelectedDate('');
              setSelectedTime('');
            }}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
          >
            <option value="">-- Please select a team member --</option>
            {teamMembers.length === 0 ? (
              <option value="" disabled>No team members available</option>
            ) : (
              teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.role}
                </option>
              ))
            )}
          </select>
        )}
        {!teamMembersLoading && teamMembers.length === 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            No active team members found. Please contact support.
          </p>
        )}
        {!selectedTeamMember && !teamMembersLoading && teamMembers.length > 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            Please select a team member to view available dates and times
          </p>
        )}
        {selectedTeamMember && selectedServices.length > 0 && totalServiceDuration > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Only time slots with {Math.floor(totalServiceDuration / 60)}h {totalServiceDuration % 60}m consecutive availability will be shown
          </p>
        )}
      </div>

      {/* Only show calendar if team member is selected */}
      {!selectedTeamMember && !teamMembersLoading && teamMembers.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-6 text-center">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Please select a team member above to view available dates and times
          </p>
        </div>
      )}

      {/* Only show calendar if team member is selected */}
      {selectedTeamMember && (
        <>
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#d9534f]"></span> Fully booked</span>
            <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#80c48f]"></span> Slots available</span>
            <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-200"></span> Clinic closed</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 relative">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-center text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}

            {calendarGrid.map((dateInfo, index) => {
              if (!dateInfo) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }
              
              // Parse date using UTC to avoid timezone issues
              const [year, month, day] = dateInfo.date.split('-').map(Number);
              const date = new Date(Date.UTC(year, month - 1, day));
              const isSelected = selectedDate === dateInfo.date;
              const today = new Date();
              const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
              const isToday = date.getTime() === todayUTC.getTime();
              const isClosed = dateInfo.status === 'closed';
              const isFull = dateInfo.status === 'full';
              const hasSlots = dateInfo.timeSlots.length > 0;
              const disabled = isClosed || isFull || !hasSlots;

              let statusClasses = '';
              if (isSelected) {
                statusClasses = 'bg-gradient-to-br from-[#9d9585] to-[#c9c1b0] text-white shadow-lg border border-transparent';
              } else if (isClosed) {
                statusClasses = 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border border-transparent cursor-not-allowed';
              } else if (isFull) {
                statusClasses = 'bg-[#fce8e8] text-[#7f2b27] border border-[#f3b3b0]';
              } else {
                statusClasses = 'bg-[#e7f4eb] text-[#2f6b3d] border border-[#b4dfc1] hover:bg-[#d7eddc]';
              }

              return (
                <button
                  key={dateInfo.date}
                  onClick={() => handleDateSelect(dateInfo.date)}
                  disabled={disabled}
                  className={`
                    aspect-square rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation min-h-[36px] sm:min-h-[44px]
                    ${statusClasses}
                    ${isToday ? 'border-2 border-green-500 dark:border-green-400' : ''}
                  `}
                  onMouseEnter={(event) => {
                    setHoveredDate(dateInfo.date);
                    const rect = (event.currentTarget as HTMLButtonElement).getBoundingClientRect();
                    
                    // Position tooltip below the button, centered horizontally
                    // Use getBoundingClientRect for accurate positioning
                    const tooltipX = rect.left + rect.width / 2;
                    // Check if there's enough space below, otherwise show above
                    const spaceBelow = window.innerHeight - rect.bottom;
                    const showAbove = spaceBelow < 150; // Show above if less than 150px space below
                    const tooltipY = showAbove ? rect.top - 8 : rect.bottom + 8; // 8px gap
                    
                    // Format date for display
                    const dateObj = new Date(dateInfo.date);
                    const formattedDate = dateObj.toLocaleDateString('en-GB', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short'
                    });
                    
                    // Create tooltip content based on status
                    let tooltipContent = '';
                    if (hasSlots) {
                      const slotCount = dateInfo.timeSlots.length;
                      tooltipContent = `${slotCount} available time slot${slotCount === 1 ? '' : 's'}`;
                    } else if (isFull) {
                      tooltipContent = 'Fully booked';
                    } else {
                      tooltipContent = 'Clinic closed';
                    }
                    
                    setHoverTooltip({
                      x: tooltipX,
                      y: tooltipY,
                      content: tooltipContent,
                      date: formattedDate,
                      slots: dateInfo.timeSlots, // Show all available slots
                      bookedSlots: dateInfo.bookedSlots || [], // Show all booked slots
                      totalSlots: dateInfo.timeSlots.length,
                      status: dateInfo.status,
                      showAbove: showAbove,
                    });
                  }}
                  onMouseLeave={() => {
                    setHoveredDate(null);
                    setHoverTooltip(null);
                  }}
                >
                  {day}
                </button>
              );
            })}

            {hoverTooltip && (
              <div
                className="pointer-events-none fixed z-50 bg-gray-900 dark:bg-gray-800 text-white text-xs sm:text-sm rounded-lg shadow-xl border border-gray-700 max-w-[280px]"
                style={{
                  top: hoverTooltip.showAbove ? 'auto' : `${hoverTooltip.y}px`,
                  bottom: hoverTooltip.showAbove ? `${window.innerHeight - hoverTooltip.y}px` : 'auto',
                  left: `${hoverTooltip.x}px`,
                  transform: 'translateX(-50%)', // Center horizontally
                }}
              >
                {/* Arrow pointing to the cell */}
                {hoverTooltip.showAbove ? (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                ) : (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900 dark:border-b-gray-800"></div>
                )}
                
                <div className="px-3 py-2.5">
                  {/* Date */}
                  <div className="font-semibold text-white mb-1.5 border-b border-gray-700 pb-1.5">
                    {hoverTooltip.date}
                  </div>
                  
                  {/* Status */}
                  <div className="mb-2">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
                      hoverTooltip.status === 'available' 
                        ? 'bg-green-500/20 text-green-300' 
                        : hoverTooltip.status === 'full'
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {hoverTooltip.status === 'available' && (
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                      )}
                      {hoverTooltip.status === 'full' && (
                        <span className="w-2 h-2 rounded-full bg-red-400"></span>
                      )}
                      {hoverTooltip.status === 'closed' && (
                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      )}
                {hoverTooltip.content}
                    </span>
                  </div>
                  
                  {/* Show all time slots if available */}
                  {hoverTooltip.slots.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-gray-400 text-xs font-medium">Available times:</div>
                      <div className="flex flex-wrap gap-1 max-h-[200px] overflow-y-auto pr-1">
                        {hoverTooltip.slots.map((slot, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-700 rounded text-xs font-mono whitespace-nowrap">
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Show booked slots if any */}
                  {hoverTooltip.status === 'available' && hoverTooltip.bookedSlots && hoverTooltip.bookedSlots.length > 0 && (
                    <div className="space-y-1 mt-2 pt-2 border-t border-gray-700">
                      <div className="text-gray-400 text-xs font-medium">Booked times:</div>
                      <div className="flex flex-wrap gap-1 max-h-[200px] overflow-y-auto pr-1">
                        {hoverTooltip.bookedSlots.map((slot: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-700/50 rounded text-xs font-mono text-gray-500 line-through whitespace-nowrap">
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {selectedDateSlots && (
            <div>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Available Times</h4>
                {selectedTimeSlots.length > 0 && (
                    <button
                    onClick={() => {
                      setSelectedTime('');
                      setSelectedTimeSlots([]);
                    }}
                    className="px-3 py-1.5 text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-red-300 dark:border-red-700 transition-colors"
                  >
                    Clear Selection
                    </button>
                )}
                </div>
              {(() => {
                const bookedSlotsSet = new Set(selectedDateSlots.bookedSlots || []);
                const availableSlotsSet = new Set(selectedDateSlots.timeSlots || []);
                const durationHours = Math.ceil(totalServiceDuration / 60);
                
                // Generate all time slots from working hours start to end
                let allTimeSlots: string[] = [];
                
                if (selectedDateSlots.workingHours) {
                  const [startHour, startMin] = selectedDateSlots.workingHours.start.split(':').map(Number);
                  const [endHour, endMin] = selectedDateSlots.workingHours.end.split(':').map(Number);
                  const startMinutes = startHour * 60 + startMin;
                  const endMinutes = endHour * 60 + endMin;
                  const slotInterval = 60; // 1 hour intervals
                  
                  // Generate all hourly slots from start to end
                  for (let timeMinutes = startMinutes; timeMinutes < endMinutes; timeMinutes += slotInterval) {
                    const hours = Math.floor(timeMinutes / 60);
                    const minutes = timeMinutes % 60;
                    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                    allTimeSlots.push(timeString);
                  }
                } else {
                  // Fallback: use available and booked slots, but generate full range
                  const allSlots = [...(selectedDateSlots.timeSlots || []), ...(selectedDateSlots.bookedSlots || [])];
                  if (allSlots.length > 0) {
                    // Find min and max hours
                    const hours = allSlots.map(slot => {
                      const [h] = slot.split(':').map(Number);
                      return h;
                    });
                    const minHour = Math.min(...hours);
                    const maxHour = Math.max(...hours);
                    
                    // Generate all slots from min to max
                    for (let h = minHour; h <= maxHour; h++) {
                      allTimeSlots.push(`${String(h).padStart(2, '0')}:00`);
                    }
                  }
                }
                
                if (allTimeSlots.length === 0) {
                  return (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No time slots available. Please select another date.</p>
                  );
                }
                
                // Helper function to check if any booked slot overlaps with an hour
                // Since booked slots might be in 15-minute intervals, we need to check if any booking
                // overlaps with the hour range [hour:00 to hour+1:00)
                const isHourBooked = (hour: number): boolean => {
                  const hourStartMinutes = hour * 60;
                  const hourEndMinutes = (hour + 1) * 60;
                  
                  // Check all booked slots to see if any overlap with this hour
                  for (const bookedSlot of selectedDateSlots.bookedSlots || []) {
                    const [bookedHour, bookedMin] = bookedSlot.split(':').map(Number);
                    const bookedMinutes = bookedHour * 60 + bookedMin;
                    
                    // If the booked slot is within this hour range, the hour is booked
                    // We check if booked slot starts before hour ends and ends after hour starts
                    // Since booked slots are 15-minute intervals, we check if it's within the hour
                    if (bookedMinutes >= hourStartMinutes && bookedMinutes < hourEndMinutes) {
                      return true;
                    }
                  }
                  
                  return false;
                };
                
                // Helper function to check if a time slot has enough consecutive hours available
                const hasEnoughConsecutiveHours = (startTime: string): boolean => {
                  const [startHour, startMin] = startTime.split(':').map(Number);
                  
                  // First, check if the end time would be within working hours
                  if (selectedDateSlots.workingHours) {
                    const [whStartHour, whStartMin] = selectedDateSlots.workingHours.start.split(':').map(Number);
                    const [whEndHour, whEndMin] = selectedDateSlots.workingHours.end.split(':').map(Number);
                    const whStartMinutes = whStartHour * 60 + whStartMin;
                    const whEndMinutes = whEndHour * 60 + whEndMin;
                    
                    // Calculate end time
                    const startMinutes = startHour * 60 + startMin;
                    const endMinutes = startMinutes + totalServiceDuration;
                    
                    // Check if start time is within working hours
                    if (startMinutes < whStartMinutes || startMinutes >= whEndMinutes) {
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
                    
                    const checkTime = `${String(checkHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
                    
                    // Check if this hour is within working hours
                    if (selectedDateSlots.workingHours) {
                      const [whStartHour, whStartMin] = selectedDateSlots.workingHours.start.split(':').map(Number);
                      const [whEndHour, whEndMin] = selectedDateSlots.workingHours.end.split(':').map(Number);
                      const checkMinutes = checkHour * 60 + startMin;
                      const whStartMinutes = whStartHour * 60 + whStartMin;
                      const whEndMinutes = whEndHour * 60 + whEndMin;
                      
                      // Check if this hour is within working hours
                      if (checkMinutes < whStartMinutes || checkMinutes >= whEndMinutes) {
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
                      const [whStartHour, whStartMin] = selectedDateSlots.workingHours.start.split(':').map(Number);
                      const [whEndHour, whEndMin] = selectedDateSlots.workingHours.end.split(':').map(Number);
                      const checkMinutes = checkHour * 60 + startMin;
                      const whStartMinutes = whStartHour * 60 + whStartMin;
                      const whEndMinutes = whEndHour * 60 + whEndMin;
                      
                      // If within working hours and not booked, it's available
                      if (checkMinutes >= whStartMinutes && checkMinutes < whEndMinutes) {
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {allTimeSlots.map(time => {
                        const isBooked = bookedSlotsSet.has(time);
                        const isSelected = selectedTimeSlots.includes(time);
                        const isStartTime = selectedTime === time;
                        
                        // Check if this slot has enough consecutive hours available
                        const isActuallyAvailable = !isBooked && hasEnoughConsecutiveHours(time);
                        
                        // Show as unavailable (red) if booked or doesn't have enough consecutive hours
                        if (!isActuallyAvailable) {
                          return (
                      <div
                        key={time}
                              className="px-3 sm:px-4 py-2.5 sm:py-3 min-h-[44px] rounded-lg text-sm sm:text-base font-medium border-2 border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 cursor-not-allowed opacity-60"
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
                            className={`px-3 sm:px-4 py-2.5 sm:py-3 min-h-[44px] rounded-lg text-sm sm:text-base font-medium transition-all touch-manipulation active:scale-95 border-2
                              ${isStartTime
                                ? 'bg-gradient-to-r from-[#9d9585] to-[#c9c1b0] text-[#3f3a31] shadow-md border-[#9d9585] font-bold'
                                : isSelected
                                ? 'bg-[#d4c5a0] dark:bg-[#b5ad9d] text-[#3f3a31] border-[#9d9585]'
                                : 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 hover:border-green-600 dark:hover:border-green-300'}
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
                          <span className="font-semibold">Selected time slots:</span> {selectedTimeSlots.join(' → ')}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Total duration: {Math.floor(totalServiceDuration / 60)}h {totalServiceDuration % 60}m
                        </p>
                </div>
              )}
                  </>
                );
              })()}
            </div>
          )}
        </>
      )}
    </div>
  );
};

  const renderOrderPreview = () => {
    const formattedAppointmentDate = selectedDate
      ? new Date(selectedDate).toLocaleDateString('en-GB', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Select a date';

    const formattedAppointmentTime = selectedTime || 'Select a time';
    
    // Calculate end time based on start time and total duration
    let timeRange = formattedAppointmentTime;
    if (selectedTime && totalServiceDuration > 0) {
      const [startHour, startMin] = selectedTime.split(':').map(Number);
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
      
      const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
      timeRange = `${selectedTime} to ${endTime}`;
    }

    return (
      <div className="space-y-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Order Summary</h3>
        
        {/* Selected Services */}
        <div className="space-y-4 sm:space-y-5 mb-4 sm:mb-6">
          {selectedServices.map(item => {
            const serviceData = servicesDataMap[item.serviceId];
            return (
              <div
                key={item.serviceId}
                className="group rounded-2xl border border-[#e4d9c8] dark:border-gray-700 bg-white/95 dark:bg-gray-900/50 shadow-sm hover:shadow-lg transition-all p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">{item.name}</h4>
                      <span className="text-lg font-bold text-[#9d9585] dark:text-[#c9c1b0] whitespace-nowrap">
                        £{item.price}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0ede7] dark:bg-gray-800/60 text-xs font-medium text-gray-700 dark:text-gray-300">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.duration} min</span>
                      </span>
                      {serviceData?.requires_consultation && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#f8f0e5] dark:bg-gray-800/60 text-xs font-medium text-[#6b5f4b] dark:text-[#d8c5a7]">
                          Consultation required
                        </span>
                      )}
                      {serviceData?.downtime_days > 0 && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#eef8f2] dark:bg-gray-800/60 text-xs font-medium text-[#2f6b3d] dark:text-[#80c48f]">
                          {serviceData.downtime_days}d downtime
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.serviceId, item.quantity - 1)}
                        className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800/70 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:border-[#c9c1b0] hover:text-[#8c846f] transition-colors touch-manipulation active:scale-95"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800/60 text-base font-semibold text-gray-900 dark:text-white min-w-[48px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.serviceId, item.quantity + 1)}
                        className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800/70 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:border-[#c9c1b0] hover:text-[#8c846f] transition-colors touch-manipulation active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <div className="text-left sm:text-right">
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Subtotal</p>
                        <p className="text-xl font-bold text-[#9d9585] dark:text-[#c9c1b0]">£{item.price * item.quantity}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setServiceInfoModal(item.serviceId);
                        }}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[#c9c1b0] text-[#6b5f4b] dark:text-[#c9c1b0] hover:bg-[#f5f1e9] dark:hover:bg-gray-800/60 transition-colors text-sm font-medium min-h-[40px] touch-manipulation active:scale-95"
                      >
                        <Info className="w-4 h-4" />
                        <span>Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Appointment Details */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-3 sm:pt-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
            <span className="text-sm sm:text-base text-gray-900 dark:text-white font-semibold break-words">
              {formattedAppointmentDate}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
            <span className="text-sm sm:text-base text-gray-900 dark:text-white font-semibold">{timeRange}</span>
          </div>
        </div>
        
        {/* Total */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-3 sm:pt-4">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Total Duration:</span>
            <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{totalDuration} min</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Total Amount:</span>
            <span className="text-[#9d9585] dark:text-[#c9c1b0]">£{totalAmount.toFixed(0)}</span>
          </div>
        </div>
        
        <button
          onClick={proceedToPayment}
          className="w-full mt-4 sm:mt-6 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] text-[#3f3a31] py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:shadow-xl transition-all active:scale-95 touch-manipulation min-h-[44px]"
        >
          <CreditCard className="w-5 h-5 inline mr-2" />
          Proceed to Payment
        </button>
      </div>
    );
  };

  const renderStripePayment = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setCurrentStep('preview')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Secure Payment</h3>
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
        <StripePaymentForm
          amount={totalAmount}
          services={selectedServices.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            duration: item.duration,
          }))}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          teamMemberId={selectedTeamMember || undefined}
          teamMemberName={selectedTeamMember ? teamMembers.find(m => m.id === selectedTeamMember)?.name : undefined}
          teamMemberRole={selectedTeamMember ? teamMembers.find(m => m.id === selectedTeamMember)?.role : undefined}
          teamMemberPhone={selectedTeamMember ? teamMembers.find(m => m.id === selectedTeamMember)?.phone : undefined}
          teamMemberEmail={selectedTeamMember ? teamMembers.find(m => m.id === selectedTeamMember)?.email : undefined}
          serviceDurationMinutes={totalServiceDuration || undefined}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      </div>
    );
  };

  // Show loading state while services are being fetched
  if (servicesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9d9585] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 px-4 mt-8 sm:mt-12 md:mt-16">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 md:mb-6 font-playfair">
            Book Your Treatment
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 font-montserrat font-light max-w-3xl mx-auto">
            Select services, choose date & time, and pay securely
          </p>
        </div>


        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0 items-start">
          <div className="lg:col-span-2 space-y-5">
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
                        ? 'hover:bg-white/80 dark:hover:bg-gray-900/70'
                        : 'opacity-70 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-4 sm:gap-5">
                      <span className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-[#e4d9c8]/70 dark:border-gray-700 transition-all ${iconWrapperClasses}`}>
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
                      <span className={`text-xs sm:text-sm font-semibold ${statusClass}`}>
                        {statusLabel}
                      </span>
                      {canInteract ? (
                        <ChevronDown
                          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                      )}
                    </div>
                  </button>
                  <div className={`${isOpen ? 'block' : 'hidden'} border-t border-[#e4d9c8] dark:border-gray-800 px-4 sm:px-6 pb-6`}>
                    <div className="pt-6">
                      {renderStepContent(step.key)}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
          
          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 z-20">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">Order Summary</h3>
                
                {selectedServices.length > 0 && (
                  <>
                    {/* Services */}
                    <div className="space-y-3 mb-4">
                      <h4 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-2">Services</h4>
                      {selectedServices.map(item => (
                        <div key={item.serviceId} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{item.name} × {item.quantity}</span>
                          <span className="font-semibold">£{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Team Member */}
                    {selectedTeamMember && (
                      <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-600">
                        <h4 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-2">Team Member</h4>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-900 dark:text-white font-medium">
                            {teamMembers.find(m => m.id === selectedTeamMember)?.name || 'Selected Team Member'}
                          </span>
                      </div>
                        {teamMembers.find(m => m.id === selectedTeamMember)?.role && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                            {teamMembers.find(m => m.id === selectedTeamMember)?.role}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* Appointment Details */}
                    {selectedDate && selectedTime && (() => {
                      // Calculate end time for right column summary
                      let timeRangeDisplay = selectedTime;
                      if (totalServiceDuration > 0) {
                        const [startHour, startMin] = selectedTime.split(':').map(Number);
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
                        
                        const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
                        timeRangeDisplay = `${selectedTime} to ${endTime}`;
                      }
                      
                      const formattedDate = new Date(selectedDate).toLocaleDateString('en-GB', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      });
                      
                      return (
                        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-600">
                          <h4 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-2">Appointment</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              <span className="text-gray-900 dark:text-white">{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              <span className="text-gray-900 dark:text-white font-medium">{timeRangeDisplay}</span>
                      </div>
                    </div>
                  </div>
                      );
                    })()}
                    
                    {/* Total */}
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Total Duration:</span>
                          <span className="text-gray-900 dark:text-white font-semibold">
                            {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                          </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                          <span className="text-gray-900 dark:text-white">Total Amount:</span>
                          <span className="text-[#9d9585] dark:text-[#c9c1b0]">£{totalAmount.toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {selectedServices.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No services selected yet</p>
                  </div>
                )}
              </div>
            </div>
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
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9d9585] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <BookingPageContent />
    </Suspense>
  );
}

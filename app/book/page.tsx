"use client";

import { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { siteConfig } from "@/config/site";
import { Calendar, Clock, CreditCard, CheckCircle, Plus, Minus, X, ArrowLeft, Info, Shield } from "lucide-react";
import StripePaymentForm from '@/components/StripePaymentForm';
import { useServices } from '@/hooks/useServices';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";

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
};

function BookingPageContent() {
  const searchParams = useSearchParams();
  const { services, isLoading: servicesLoading } = useServices();
  const [selectedServices, setSelectedServices] = useState<OrderItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<CalendarDay[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'services' | 'date' | 'preview' | 'payment'>('services');
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [serviceInfoModal, setServiceInfoModal] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [hoverTooltip, setHoverTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

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

  const loadAvailability = useCallback(async () => {
    setAvailabilityLoading(true);
    setAvailabilityError(null);

    try {
      const start = new Date();
      const startISO = start.toISOString().split('T')[0];
      const end = new Date(start);
      end.setDate(start.getDate() + 30);
      const endISO = end.toISOString().split('T')[0];

      const response = await fetch(`/api/booking/availability?start=${startISO}&end=${endISO}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load availability');
      }

      const mapped: CalendarDay[] = (data.days ?? []).map((day: any) => ({
        date: day.date,
        status: day.status,
        timeSlots: day.availableSlots ?? [],
        allSlots: day.allSlots ?? [],
        bookedSlots: day.bookedSlots ?? [],
      }));

      setAvailableDates(mapped);

      if (mapped.length && selectedDate && !mapped.some((day) => day.date === selectedDate)) {
        setSelectedDate('');
        setSelectedTime('');
      }
    } catch (error) {
      console.error('Error loading availability:', error);
      setAvailabilityError('Unable to load availability. Please try again later.');
    } finally {
      setAvailabilityLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

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

  const addService = (serviceId: string) => {
    const service = servicesDataMap[serviceId];
    if (!service) return;

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
  };

  const removeService = (serviceId: string) => {
    setSelectedServices(selectedServices.filter(item => item.serviceId !== serviceId));
  };

  const updateQuantity = (serviceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeService(serviceId);
      return;
    }
    
    const updated = selectedServices.map(item => 
      item.serviceId === serviceId ? { ...item, quantity } : item
    );
    setSelectedServices(updated);
  };

  const handleDateSelect = (date: string) => {
    if (availabilityLoading) return;

    const info = availableDates.find((item) => item.date === date);
    if (!info || info.status === 'closed' || info.timeSlots.length === 0) {
      return;
    }

    setSelectedDate(date);
    setSelectedTime('');
    setCurrentStep('date');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
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
                        addService(serviceId);
                        setShowServiceSelector(false);
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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Select Date &amp; Time</h3>
          <div className="flex items-center gap-3 bg-[#f5f1e9] dark:bg-gray-900/60 border border-[#e4d9c8] dark:border-gray-700 rounded-xl px-4 py-6">
            <div className="w-6 h-6 border-2 border-[#c9c1b0] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Loading availability...</span>
          </div>
        </div>
      );
    }

    if (availabilityError) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Select Date &amp; Time</h3>
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

    if (!availableDates.length) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Select Date &amp; Time</h3>
          <div className="bg-[#f5f1e9] dark:bg-gray-900/60 border border-[#e4d9c8] dark:border-gray-700 rounded-xl px-4 py-6 space-y-4 text-center">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">No availability found for the next 30 days.</p>
            <Button
              onPress={loadAvailability}
              color="primary"
              variant="light"
              className="mx-auto"
            >
              Refresh availability
            </Button>
          </div>
        </div>
      );
    }

    const gridDays = availableDates.slice(0, 28);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Select Date &amp; Time</h3>
        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#d9534f]"></span> Fully booked</span>
          <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#80c48f]"></span> Slots available</span>
          <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-200"></span> Clinic closed</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-4 sm:mb-6 relative">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}

          {gridDays.map((dateInfo) => {
            const date = new Date(dateInfo.date);
            const isSelected = selectedDate === dateInfo.date;
            const isToday = date.toDateString() === new Date().toDateString();
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
                  ${isToday ? 'ring-2 ring-[#d8c5a7] dark:ring-[#b5ad9d]' : ''}
                `}
                onMouseEnter={(event) => {
                  setHoveredDate(dateInfo.date);
                  const rect = (event.currentTarget as HTMLButtonElement).getBoundingClientRect();
                  const tooltipContent = hasSlots
                    ? `${dateInfo.timeSlots.length} available slot${dateInfo.timeSlots.length === 1 ? '' : 's'}`
                    : isFull
                      ? 'Fully booked'
                      : 'Clinic closed';
                  setHoverTooltip({
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                    content: tooltipContent,
                  });
                }}
                onMouseMove={(event) => {
                  if (!hoverTooltip) return;
                  setHoverTooltip({ ...hoverTooltip, x: event.clientX, y: event.clientY });
                }}
                onMouseLeave={() => {
                  setHoveredDate(null);
                  setHoverTooltip(null);
                }}
              >
                {date.getDate()}
              </button>
            );
          })}

          {hoverTooltip && (
            <div
              className="pointer-events-none fixed z-50 bg-[#3f3a31] text-white text-xs sm:text-sm px-3 py-2 rounded-md shadow-lg"
              style={{
                top: hoverTooltip.y + 16,
                left: hoverTooltip.x + 16,
              }}
            >
              {hoverTooltip.content}
            </div>
          )}
        </div>

        {selectedDayInfo && (
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Available Times</h4>
            {selectedDayInfo.timeSlots.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">This day is fully booked. Please select another date.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {selectedDayInfo.timeSlots.map(time => (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    className={`px-3 sm:px-4 py-2.5 sm:py-3 min-h-[44px] rounded-lg text-sm sm:text-base font-medium transition-all touch-manipulation active:scale-95 border
                      ${selectedTime === time
                        ? 'bg-gradient-to-r from-[#9d9585] to-[#c9c1b0] text-[#3f3a31] shadow-md border-transparent'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-[#b5ad9d] hover:text-[#8c846f] dark:hover:text-[#c9c1b0] hover:bg-[#f5f1e9] dark:hover:bg-gray-800/40'}
                    `}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}
          </div>
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

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Order Summary</h3>
        
        {/* Selected Services */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          {selectedServices.map(item => {
            const serviceData = servicesDataMap[item.serviceId];
            return (
              <div key={item.serviceId} className="p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  {/* Left: Service Name, Price & Duration */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-2">{item.name}</h4>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="text-base sm:text-lg font-bold text-[#9d9585] dark:text-[#c9c1b0]">£{item.price}</span>
                      <Chip 
                        size="sm" 
                        variant="flat" 
                        color="default"
                        classNames={{
                          base: "inline-flex items-center",
                          content: "inline-flex items-center gap-1 text-xs"
                        }}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{item.duration} min</span>
                      </Chip>
                      {serviceData?.requires_consultation && (
                        <Chip size="sm" variant="flat" color="warning">
                          Consultation
                        </Chip>
                      )}
                      {serviceData?.downtime_days > 0 && (
                        <Chip size="sm" variant="flat" color="secondary">
                          {serviceData.downtime_days}d downtime
                        </Chip>
                      )}
              </div>
                  </div>

                  {/* Right: Quantity & Total */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.serviceId, item.quantity - 1)}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors touch-manipulation active:scale-95"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                      <span className="w-12 text-center font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.serviceId, item.quantity + 1)}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors touch-manipulation active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                    {/* Total Price */}
                    <div className="text-left sm:text-right min-w-[80px]">
                      <div className="text-lg sm:text-xl font-bold text-[#9d9585] dark:text-[#c9c1b0]">£{item.price * item.quantity}</div>
            </div>
                
                    {/* Details Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setServiceInfoModal(item.serviceId);
                        }}
                      className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border border-[#c9c1b0] text-[#6b5f4b] dark:text-[#c9c1b0] rounded-lg hover:bg-[#f5f1e9] dark:hover:bg-gray-800/40 transition-colors flex items-center gap-1.5 min-h-[36px] touch-manipulation active:scale-95"
                      >
                      <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Details</span>
                      </button>
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
            <span className="text-sm sm:text-base text-gray-900 dark:text-white font-semibold">{formattedAppointmentTime}</span>
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
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
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
        <div className="text-center mb-8 sm:mb-12 px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 md:mb-6 font-playfair">
            Book Your Treatment
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 font-montserrat font-light max-w-3xl mx-auto">
            Select services, choose date & time, and pay securely
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8 sm:mb-12 px-4 overflow-x-auto">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-max">
            {[
              { key: 'services', label: 'Services', icon: CheckCircle },
              { key: 'date', label: 'Date & Time', icon: Calendar },
              { key: 'preview', label: 'Preview', icon: CheckCircle },
              { key: 'payment', label: 'Payment', icon: CreditCard }
            ].map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.key;
              const isCompleted = ['services', 'date', 'preview', 'payment'].indexOf(currentStep) > ['services', 'date', 'preview', 'payment'].indexOf(step.key);
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className={`
                    w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0
                    ${isCompleted ? 'bg-[#6bb18d] text-white' : 
                      isActive ? 'bg-[#9d9585] text-white' : 
                      'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}
                  `}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className={`ml-1.5 sm:ml-2 font-medium text-xs sm:text-sm md:text-base whitespace-nowrap ${
                    isActive ? 'text-[#9d9585] dark:text-[#c9c1b0]' : 
                    isCompleted ? 'text-[#6bb18d] dark:text-[#6bb18d]' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                  {index < 3 && (
                    <div className={`w-4 sm:w-8 h-0.5 mx-2 sm:mx-4 flex-shrink-0 ${
                      isCompleted ? 'bg-[#6bb18d]' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0">
          {/* Left Column - Current Step Content */}
          <div className="lg:col-span-2">
            {currentStep === 'services' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Selected Services</h3>
                  <button
                    onClick={() => setShowServiceSelector(true)}
                    className="w-full sm:w-auto bg-gradient-to-r from-[#9d9585] to-[#c9c1b0] text-[#3f3a31] px-4 sm:px-6 py-2.5 sm:py-2 rounded-lg hover:from-[#8c846f] hover:to-[#b5ad9d] transition-all font-medium text-sm sm:text-base min-h-[44px] touch-manipulation"
                  >
                    Add Services
                  </button>
                </div>
                
                {selectedServices.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">No services selected</h4>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 px-4">Add services to your order to continue</p>
                    <button
                      onClick={() => setShowServiceSelector(true)}
                      className="bg-gradient-to-r from-[#9d9585] to-[#c9c1b0] text-[#3f3a31] px-6 py-3 rounded-lg hover:from-[#8c846f] hover:to-[#b5ad9d] transition-all font-medium text-sm sm:text-base min-h-[44px] touch-manipulation"
                    >
                      Browse Services
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {selectedServices.map(item => {
                      const serviceData = servicesDataMap[item.serviceId];
                      return (
                        <div key={item.serviceId} className="p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                            {/* Left: Service Name, Price & Duration */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-2">{item.name}</h4>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <span className="text-base sm:text-lg font-bold text-[#9d9585] dark:text-[#c9c1b0]">£{item.price}</span>
                                <Chip 
                                  size="sm" 
                                  variant="flat" 
                                  color="default"
                                  classNames={{
                                    base: "inline-flex items-center",
                                    content: "inline-flex items-center gap-1"
                                  }}
                                >
                                  <Clock className="w-3 h-3" />
                                  <span>{item.duration} min</span>
                                </Chip>
                                {serviceData?.requires_consultation && (
                                  <Chip size="sm" variant="flat" color="warning">
                                    Consultation
                                  </Chip>
                                )}
                                {serviceData?.downtime_days > 0 && (
                                  <Chip size="sm" variant="flat" color="secondary">
                                    {serviceData.downtime_days}d downtime
                                  </Chip>
                                )}
                              </div>
                            </div>

                            {/* Right: Quantity & Total */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQuantity(item.serviceId, item.quantity - 1)}
                                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors touch-manipulation active:scale-95"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-12 text-center font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.serviceId, item.quantity + 1)}
                                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors touch-manipulation active:scale-95"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Total Price */}
                              <div className="text-left sm:text-right min-w-[80px]">
                                <div className="text-lg sm:text-xl font-bold text-[#9d9585] dark:text-[#c9c1b0]">£{item.price * item.quantity}</div>
                              </div>
                
                              {/* Details Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setServiceInfoModal(item.serviceId);
                                }}
                                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border border-[#c9c1b0] text-[#6b5f4b] dark:text-[#c9c1b0] rounded-lg hover:bg-[#f5f1e9] dark:hover:bg-gray-800/40 transition-colors flex items-center gap-1.5 min-h-[36px] touch-manipulation active:scale-95"
                              >
                                <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span>Details</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentStep('date')}
                      disabled={selectedServices.length === 0}
                      className="w-full bg-gradient-to-r from-[#9d9585] to-[#c9c1b0] text-[#3f3a31] py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:from-[#8c846f] hover:to-[#b5ad9d] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation active:scale-95"
                    >
                      Continue to Date Selection
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {currentStep === 'date' && renderCalendar()}
            {currentStep === 'preview' && renderOrderPreview()}
            {currentStep === 'payment' && renderStripePayment()}
          </div>
          
          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">Order Summary</h3>
                
                {selectedServices.length > 0 && (
                  <>
                    <div className="space-y-3 mb-4">
                      {selectedServices.map(item => (
                        <div key={item.serviceId} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{item.name} × {item.quantity}</span>
                          <span className="font-semibold">£{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-gray-900 dark:text-white">Total:</span>
                        <span className="text-[#9d9585] dark:text-[#c9c1b0]">£{totalAmount}</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Duration: {totalDuration} minutes
                      </div>
                    </div>
                  </>
                )}
                
                {selectedDate && selectedTime && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(selectedDate).toLocaleDateString('en-GB')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{selectedTime}</span>
                      </div>
                    </div>
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

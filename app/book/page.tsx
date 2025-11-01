"use client";

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { siteConfig } from "@/config/site";
import { Calendar, Clock, CreditCard, CheckCircle, Plus, Minus, X, ArrowLeft, Info, Shield } from "lucide-react";
import StripePaymentForm from '@/components/StripePaymentForm';
import { useServices } from '@/hooks/useServices';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";

// Mock calendar data - in real app this would come from API
const getAvailableDates = () => {
  const dates = [];
  const today = new Date();
  
  for (let i = 1; i <= 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Skip weekends for now (can be configured)
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      dates.push({
        date: date.toISOString().split('T')[0],
        available: Math.random() > 0.3, // 70% availability
        timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
      });
    }
  }
  
  return dates;
};

interface OrderItem {
  serviceId: string;
  name: string;
  price: number;
  duration: number;
  category: string;
  quantity: number;
}

function BookingPageContent() {
  const searchParams = useSearchParams();
  const { services, isLoading: servicesLoading } = useServices();
  const [selectedServices, setSelectedServices] = useState<OrderItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableDates, setAvailableDates] = useState(getAvailableDates());
  const [currentStep, setCurrentStep] = useState<'services' | 'date' | 'preview' | 'payment'>('services');
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [serviceInfoModal, setServiceInfoModal] = useState<string | null>(null);

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
        aftercare: service.aftercare
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
              <ModalHeader className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white rounded-t-2xl">
                <div className="flex-1">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">{service.name}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-rose-100">
                    <span className="flex items-center gap-1">
                  <Clock className="w-5 h-5" />
                  {service.duration} minutes
                </span>
                <span className="text-2xl font-bold">£{service.price}</span>
              </div>
            </div>
              </ModalHeader>

              <ModalBody className="py-6">
                <div className="space-y-6">
            {/* Description */}
            <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-rose-500" />
                Overview
              </h3>
                    <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                {service.description}
              </p>
            </div>

            {/* Details */}
            {service.details && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  Treatment Details
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {service.details}
                </p>
              </div>
            )}

            {/* Benefits */}
            {service.benefits && service.benefits.length > 0 && (
              <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Key Benefits
                </h3>
                      <div className="flex flex-wrap gap-2">
                        {service.benefits.map((benefit: string, index: number) => (
                          <Chip
                            key={index}
                            variant="flat"
                            color="success"
                            className="text-sm"
                          >
                            {benefit}
                          </Chip>
                  ))}
                </div>
              </div>
            )}

            {/* Preparation */}
            {service.preparation && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-500">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  Preparation
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {service.preparation}
                </p>
              </div>
            )}

            {/* Aftercare */}
            {service.aftercare && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border-l-4 border-purple-500">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  Aftercare
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {service.aftercare}
                </p>
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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl flex-shrink-0">
            <h2 className="text-2xl font-bold">Select Services</h2>
            <button
              onClick={() => setShowServiceSelector(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1">
            {Object.entries(servicesByCategory).map(([category, servicesList]) => (
              <div key={category} className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {servicesList.map(([serviceId, service]) => (
                    <div
                      key={serviceId}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-rose-300 dark:hover:border-rose-600 transition-all duration-200 hover:shadow-lg relative group"
                    >
                      <div className="space-y-3">
                      <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">{service.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                              {service.description}
                            </p>
                        </div>
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">£{service.price}</div>
                            <div className="text-sm text-gray-500">{service.duration} min</div>
                        </div>
                      </div>
                        
                        {service.details && (
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2">Treatment Details</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{service.details}</p>
                    </div>
                        )}
                        
                        {service.benefits && service.benefits.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {service.benefits.slice(0, 3).map((benefit: string, index: number) => (
                              <span key={index} className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-2 py-1 rounded-full text-xs">
                                {benefit}
                              </span>
                            ))}
                            {service.benefits.length > 3 && (
                              <span className="text-xs text-gray-500">+{service.benefits.length - 3} more</span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {service.duration} minutes
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            Professional treatment
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setServiceInfoModal(serviceId);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-medium"
                          >
                            <Info className="w-4 h-4" />
                            More Info
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                        addService(serviceId);
                        setShowServiceSelector(false);
                      }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all font-medium shadow-md hover:shadow-lg"
                          >
                            <Plus className="w-4 h-4" />
                            Add Service
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
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Select Date & Time</h3>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
          
          {availableDates.slice(0, 28).map((dateInfo) => {
            const date = new Date(dateInfo.date);
            const isSelected = selectedDate === dateInfo.date;
            const isAvailable = dateInfo.available;
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <button
                key={dateInfo.date}
                onClick={() => isAvailable ? handleDateSelect(dateInfo.date) : null}
                disabled={!isAvailable}
                className={`
                  aspect-square rounded-lg text-sm font-medium transition-all
                  ${isSelected 
                    ? 'bg-rose-500 text-white' 
                    : isAvailable 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-rose-100 dark:hover:bg-rose-900/30' 
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }
                  ${isToday ? 'ring-2 ring-rose-300' : ''}
                `}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
        
        {/* Time Slots */}
        {selectedDate && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Available Times</h4>
            <div className="grid grid-cols-3 gap-3">
              {availableDates.find(d => d.date === selectedDate)?.timeSlots.map(time => (
                <button
                  key={time}
                  onClick={() => handleTimeSelect(time)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderOrderPreview = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h3>
        
        {/* Selected Services */}
        <div className="space-y-3 mb-6">
          {selectedServices.map(item => {
            const serviceData = servicesDataMap[item.serviceId];
            return (
              <div key={item.serviceId} className="p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all">
                <div className="flex items-center justify-between gap-4">
                  {/* Left: Service Name, Price & Duration */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-base mb-2 truncate">{item.name}</h4>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-lg font-bold text-rose-600 dark:text-rose-400">£{item.price}</span>
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
                  <div className="flex items-center gap-3">
                    {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.serviceId, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                      <span className="w-10 text-center font-semibold text-gray-900 dark:text-white">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.serviceId, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                    {/* Total Price */}
                    <div className="text-right min-w-[80px]">
                      <div className="text-xl font-bold text-rose-600 dark:text-rose-400">£{item.price * item.quantity}</div>
            </div>
                
                    {/* Details Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setServiceInfoModal(item.serviceId);
                        }}
                      className="px-3 py-2 text-xs font-medium border border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-1"
                      >
                      <Info className="w-4 h-4" />
                      Details
                      </button>
                    </div>
                    </div>
              </div>
            );
          })}
        </div>
        
        {/* Appointment Details */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-900 dark:text-white font-semibold">
              {new Date(selectedDate).toLocaleDateString('en-GB', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-900 dark:text-white font-semibold">{selectedTime}</span>
          </div>
        </div>
        
        {/* Total */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Duration:</span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">{totalDuration} minutes</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-900 dark:text-white">Total Amount:</span>
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">£{totalAmount}</span>
          </div>
        </div>
        
        <button
          onClick={proceedToPayment}
          className="w-full mt-6 bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 rounded-lg font-semibold text-lg hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 font-playfair">
            Book Your Treatment
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 font-montserrat font-light max-w-3xl mx-auto">
            Select services, choose date & time, and pay securely
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
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
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${isCompleted ? 'bg-green-500 text-white' : 
                      isActive ? 'bg-rose-500 text-white' : 
                      'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`ml-2 font-medium ${
                    isActive ? 'text-rose-600 dark:text-rose-400' : 
                    isCompleted ? 'text-green-600 dark:text-green-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                  {index < 3 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Current Step Content */}
          <div className="lg:col-span-2">
            {currentStep === 'services' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Selected Services</h3>
                  <button
                    onClick={() => setShowServiceSelector(true)}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all"
                  >
                    Add Services
                  </button>
                </div>
                
                {selectedServices.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No services selected</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Add services to your order to continue</p>
                    <button
                      onClick={() => setShowServiceSelector(true)}
                      className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all"
                    >
                      Browse Services
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedServices.map(item => {
                      const serviceData = servicesDataMap[item.serviceId];
                      return (
                        <div key={item.serviceId} className="p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all">
                          <div className="flex items-center justify-between gap-4">
                            {/* Left: Service Name, Price & Duration */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-white text-base mb-2 truncate">{item.name}</h4>
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-lg font-bold text-rose-600 dark:text-rose-400">£{item.price}</span>
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
                            <div className="flex items-center gap-3">
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQuantity(item.serviceId, item.quantity - 1)}
                                  className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-10 text-center font-semibold text-gray-900 dark:text-white">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.serviceId, item.quantity + 1)}
                                  className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Total Price */}
                              <div className="text-right min-w-[80px]">
                                <div className="text-xl font-bold text-rose-600 dark:text-rose-400">£{item.price * item.quantity}</div>
                              </div>

                              {/* Details Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setServiceInfoModal(item.serviceId);
                                }}
                                className="px-3 py-2 text-xs font-medium border border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-1"
                              >
                                <Info className="w-4 h-4" />
                                Details
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentStep('date')}
                      disabled={selectedServices.length === 0}
                      className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 rounded-lg font-semibold text-lg hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Order Summary</h3>
                
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
                        <span className="text-rose-600 dark:text-rose-400">£{totalAmount}</span>
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <BookingPageContent />
    </Suspense>
  );
}

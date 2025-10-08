"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { siteConfig } from "@/config/site";
import { Calendar, Clock, CreditCard, CheckCircle, Plus, Minus, X, ArrowLeft } from "lucide-react";
import StripePaymentForm from '@/components/StripePaymentForm';

// Service data from the price list
const servicesData = {
  // FACE Services
  'book-treatment-now': { name: 'Book Treatment Now', price: 50, category: 'Face', duration: 30 },
  'digital-skin-analysis': { name: 'Digital Skin Analysis', price: 50, category: 'Face', duration: 45 },
  'prp': { name: 'PRP', price: 480, category: 'Face', duration: 60 },
  'exosomes': { name: 'Exosomes', price: 550, category: 'Face', duration: 60 },
  'polynucleotides': { name: 'Polynucleotides', price: 390, category: 'Face', duration: 45 },
  '5-point-facelift': { name: '5-Point Facelift', price: 950, category: 'Face', duration: 90 },
  'profhilo': { name: 'Profhilo', price: 390, category: 'Face', duration: 45 },
  'sculptra': { name: 'Sculptra', price: 790, category: 'Face', duration: 60 },
  'skin-boosters': { name: 'Skin Boosters', price: 230, category: 'Face', duration: 45 },
  'deep-cleansing-facial': { name: 'Deep Cleansing Facial', price: 170, category: 'Face', duration: 60 },
  'medical-skin-peels': { name: 'Medical Skin Peels', price: 200, category: 'Face', duration: 45 },
  'deep-hydra-detox-facial': { name: 'Deep Hydra Detox Facial', price: 200, category: 'Face', duration: 60 },
  'nctf-under-eye-skin-booster': { name: 'NCTF Under-Eye Skin Booster', price: 159, category: 'Face', duration: 30 },
  '3-step-under-eye-treatment': { name: '3-Step Under-Eye Treatment', price: 390, category: 'Face', duration: 60 },
  'injectable-mesotherapy': { name: 'Injectable Mesotherapy', price: 170, category: 'Face', duration: 45 },
  'microneedling-facial': { name: 'Microneedling Facial', price: 170, category: 'Face', duration: 60 },
  'full-face-balancing': { name: 'Full Face Balancing', price: 790, category: 'Face', duration: 90 },

  // ANTI-WRINKLE INJECTIONS
  'baby-botox': { name: 'Baby Botox', price: 199, category: 'Anti-Wrinkle Injections', duration: 30 },
  'brow-lift': { name: 'Brow Lift', price: 279, category: 'Anti-Wrinkle Injections', duration: 30 },
  'eye-wrinkles': { name: 'Eye Wrinkles', price: 179, category: 'Anti-Wrinkle Injections', duration: 30 },
  'forehead-lines': { name: 'Forehead Lines', price: 179, category: 'Anti-Wrinkle Injections', duration: 30 },
  'glabella-lines': { name: 'Glabella Lines', price: 179, category: 'Anti-Wrinkle Injections', duration: 30 },
  'barcode-lips': { name: 'Barcode Lips', price: 129, category: 'Anti-Wrinkle Injections', duration: 30 },
  'bunny-lines': { name: 'Bunny Lines', price: 129, category: 'Anti-Wrinkle Injections', duration: 30 },
  'lip-lines': { name: 'Lip Lines', price: 179, category: 'Anti-Wrinkle Injections', duration: 30 },
  'gummy-smile': { name: 'Gummy Smile', price: 129, category: 'Anti-Wrinkle Injections', duration: 30 },
  'neck-lift': { name: 'Neck Lift', price: 329, category: 'Anti-Wrinkle Injections', duration: 45 },
  'jaw-slimming': { name: 'Jaw Slimming', price: 279, category: 'Anti-Wrinkle Injections', duration: 45 },
  'pebble-chin': { name: 'Pebble Chin', price: 179, category: 'Anti-Wrinkle Injections', duration: 30 },
  'bruxism': { name: 'Bruxism', price: 279, category: 'Anti-Wrinkle Injections', duration: 45 },

  // FILLERS
  'cheek-mid-face-filler': { name: 'Cheek & Mid-Face Filler', price: 390, category: 'Fillers', duration: 60 },
  'chin-filler': { name: 'Chin Filler', price: 290, category: 'Fillers', duration: 45 },
  'marionette-lines-filler': { name: 'Marionette Lines Filler', price: 290, category: 'Fillers', duration: 45 },
  'nasolabial-folds-filler': { name: 'Nasolabial Folds Filler', price: 290, category: 'Fillers', duration: 45 },
  'jawline-filler': { name: 'Jawline Filler', price: 550, category: 'Fillers', duration: 60 },
  'lip-enhancement': { name: 'Lip Enhancement', price: 290, category: 'Fillers', duration: 45 },
  'lip-hydration': { name: 'Lip Hydration', price: 190, category: 'Fillers', duration: 30 },
  'tear-trough-filler': { name: 'Tear Trough Filler', price: 390, category: 'Fillers', duration: 60 },
  'temple-filler': { name: 'Temple Filler', price: 290, category: 'Fillers', duration: 45 },
  'filler-dissolving': { name: 'Filler Dissolving', price: 150, category: 'Fillers', duration: 30 },

  // BODY
  'body-fat-burning-mesotherapy': { name: 'Body Fat Burning Mesotherapy', price: 170, category: 'Body', duration: 60 },
  'radiofrequency-ultrasound': { name: 'Radiofrequency & Ultrasound', price: 250, category: 'Body', duration: 90 },
  'fat-freezing-treatment': { name: 'Fat Freezing Treatment', price: 200, category: 'Body', duration: 60 },
  'ultrasound-lift-tighten': { name: 'Ultrasound Lift & Tighten', price: 190, category: 'Body', duration: 60 },
  'combined-treatment': { name: 'Combined Treatment', price: 350, category: 'Body', duration: 120 }
};

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

export default function BookingPage() {
  const searchParams = useSearchParams();
  const [selectedServices, setSelectedServices] = useState<OrderItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableDates, setAvailableDates] = useState(getAvailableDates());
  const [currentStep, setCurrentStep] = useState<'services' | 'date' | 'preview' | 'payment'>('services');
  const [showServiceSelector, setShowServiceSelector] = useState(false);

  // Auto-select service from URL parameter
  useEffect(() => {
    const serviceParam = searchParams.get('service');
    const conditionParam = searchParams.get('condition');
    
    if (serviceParam && servicesData[serviceParam as keyof typeof servicesData]) {
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
  }, [searchParams]);

  const totalAmount = selectedServices.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDuration = selectedServices.reduce((sum, item) => sum + (item.duration * item.quantity), 0);

  const addService = (serviceId: string) => {
    const service = servicesData[serviceId as keyof typeof servicesData];
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

  const renderServiceSelector = () => {
    const categories = {
      'Face': Object.entries(servicesData).filter(([_, service]) => service.category === 'Face'),
      'Anti-Wrinkle Injections': Object.entries(servicesData).filter(([_, service]) => service.category === 'Anti-Wrinkle Injections'),
      'Fillers': Object.entries(servicesData).filter(([_, service]) => service.category === 'Fillers'),
      'Body': Object.entries(servicesData).filter(([_, service]) => service.category === 'Body')
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-2xl font-bold">Select Services</h2>
            <button
              onClick={() => setShowServiceSelector(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-6">
            {Object.entries(categories).map(([category, services]) => (
              <div key={category} className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map(([serviceId, service]) => (
                    <div
                      key={serviceId}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-rose-300 dark:hover:border-rose-600 transition-colors cursor-pointer"
                      onClick={() => {
                        addService(serviceId);
                        setShowServiceSelector(false);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{service.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{service.duration} minutes</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-rose-600 dark:text-rose-400">£{service.price}</div>
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
        <div className="space-y-4 mb-6">
          {selectedServices.map(item => (
            <div key={item.serviceId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{item.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.category} • {item.duration} min</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.serviceId, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.serviceId, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-right">
                  <div className="font-bold text-rose-600 dark:text-rose-400">£{item.price * item.quantity}</div>
                </div>
              </div>
            </div>
          ))}
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 font-playfair">
            Book Your Treatment
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 font-montserrat font-light">
            Select services, choose date & time, and pay securely
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
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
                  <div className="space-y-4">
                    {selectedServices.map(item => (
                      <div key={item.serviceId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{item.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{item.category} • {item.duration} min</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.serviceId, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.serviceId, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-rose-600 dark:text-rose-400">£{item.price * item.quantity}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
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
    </div>
  );
}

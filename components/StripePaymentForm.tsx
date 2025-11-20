"use client";

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { CreditCard, CheckCircle, AlertCircle, Loader, Calendar, Clock, Phone, Mail } from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripePaymentFormProps {
  amount: number;
  services: Array<{
    name: string;
    price: number;
    quantity: number;
    duration: number;
  }>;
  selectedDate: string;
  selectedTime: string;
  teamMemberId?: string;
  teamMemberName?: string;
  teamMemberRole?: string;
  teamMemberPhone?: string;
  teamMemberEmail?: string;
  serviceDurationMinutes?: number;
  onPaymentSuccess: (bookingId: string) => void;
  onPaymentError: (error: string) => void;
}

interface PaymentFormProps {
  amount: number;
  services: StripePaymentFormProps['services'];
  selectedDate: string;
  selectedTime: string;
  teamMemberId?: string;
  teamMemberName?: string;
  teamMemberRole?: string;
  teamMemberPhone?: string;
  teamMemberEmail?: string;
  serviceDurationMinutes?: number;
  onPaymentSuccess: (bookingId: string) => void;
  onPaymentError: (error: string) => void;
}

function PaymentForm({
  amount,
  services,
  selectedDate,
  selectedTime,
  teamMemberId,
  teamMemberName,
  teamMemberRole,
  teamMemberPhone,
  teamMemberEmail,
  serviceDurationMinutes,
  onPaymentSuccess,
  onPaymentError,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      // Payment intent is already created, just confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/book/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setPaymentStatus('error');
        setErrorMessage(error.message || 'Payment failed');
        onPaymentError(error.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        setPaymentStatus('success');
        
        // Confirm payment on server
        const confirmResponse = await fetch('/api/stripe/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
          }),
        });

        const confirmData = await confirmResponse.json();
        
        if (confirmData.success) {
          onPaymentSuccess(confirmData.bookingId);
        } else {
          throw new Error('Failed to confirm booking');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed');
      onPaymentError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="text-center py-6 sm:py-8 px-4">
        <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-3 sm:mb-4" />
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Payment Successful!
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Your booking has been confirmed. You will receive a confirmation email shortly.
        </p>
      </div>
    );
  }

  // Calculate time range
  let timeRangeDisplay = selectedTime;
  if (serviceDurationMinutes && serviceDurationMinutes > 0) {
    const [startHour, startMin] = selectedTime.split(':').map(Number);
    const durationHours = Math.floor(serviceDurationMinutes / 60);
    const durationMinutes = serviceDurationMinutes % 60;
    
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

  // Calculate total duration
  const totalDuration = services.reduce((sum, service) => sum + (service.duration * service.quantity), 0);

  // Format date
  const formattedDate = new Date(selectedDate).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Payment Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
        <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">
          Payment Summary
        </h4>
        
        {services.length > 0 && (
          <>
            {/* Services */}
            <div className="space-y-3 mb-4">
              <h5 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-2">Services</h5>
              {services.map((service, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{service.name} × {service.quantity}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">£{service.price * service.quantity}</span>
                </div>
              ))}
          </div>
            
            {/* Team Member */}
            {teamMemberName && (
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-600">
                <h5 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-3">Team Member</h5>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-900 dark:text-white font-medium">
                    {teamMemberName}
            </span>
          </div>
                {teamMemberRole && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 ml-6">
                    {teamMemberRole}
                  </p>
                )}
                {(teamMemberPhone || teamMemberEmail) && (
                  <div className="mt-3 ml-6 space-y-2">
                    {teamMemberPhone && (
                      <a
                        href={`tel:${teamMemberPhone.replace(/\s+/g, '')}`}
                        className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 cursor-pointer group"
                      >
                        <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0 transition-colors duration-200" />
                        <span className="underline decoration-dotted underline-offset-2">
                          {teamMemberPhone}
                        </span>
                      </a>
                    )}
                    {teamMemberEmail && (
                      <a
                        href={`mailto:${teamMemberEmail}`}
                        className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 cursor-pointer group"
                      >
                        <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0 transition-colors duration-200" />
                        <span className="underline decoration-dotted underline-offset-2">
                          {teamMemberEmail}
                        </span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Appointment Details */}
            {selectedDate && selectedTime && (
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-600">
                <h5 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-2">Appointment</h5>
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
            )}
            
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
                  <span className="text-[#9d9585] dark:text-[#c9c1b0]">£{amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Stripe Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4">
          <PaymentElement 
            options={{
              layout: 'tabs',
            }}
          />
        </div>

        {/* Error Message */}
        {paymentStatus === 'error' && (
          <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-400 text-sm sm:text-base break-words">{errorMessage}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!stripe || !elements || isLoading}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px] touch-manipulation active:scale-95"
        >
          {isLoading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>Pay £{amount.toFixed(2)} Now</span>
            </>
          )}
        </button>
      </form>

      {/* Security Notice */}
      <div className="text-center px-4">
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          🔒 Your payment information is secure and encrypted by Stripe
        </p>
      </div>
    </div>
  );
}

export default function StripePaymentForm(props: StripePaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string>('');

  const handleInitializePayment = async () => {
    // Validate required data
    if (!props.amount || props.amount <= 0 || !props.selectedDate || !props.selectedTime || props.services.length === 0) {
      setInitError('Please complete all booking details before proceeding to payment.');
      return;
    }

    setIsInitializing(true);
    setInitError('');

      try {
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: props.amount,
            metadata: {
              services: JSON.stringify(props.services),
              selectedDate: props.selectedDate,
              selectedTime: props.selectedTime,
              teamMemberId: props.teamMemberId || '',
              serviceDurationMinutes: props.serviceDurationMinutes?.toString() || '',
              timestamp: new Date().toISOString(),
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Failed to initialize payment';
        setInitError(errorMessage);
        setIsInitializing(false);
        return;
      }

      const data = await response.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        setInitError('Failed to initialize payment. Please try again.');
        }
      } catch (error) {
        console.error('Error creating payment intent:', error);
      setInitError(error instanceof Error ? error.message : 'Failed to initialize payment. Please try again.');
    } finally {
      setIsInitializing(false);
    }
  };

  // Calculate time range for initialization view
  let timeRangeDisplay = props.selectedTime;
  if (props.serviceDurationMinutes && props.serviceDurationMinutes > 0) {
    const [startHour, startMin] = props.selectedTime.split(':').map(Number);
    const durationHours = Math.floor(props.serviceDurationMinutes / 60);
    const durationMinutes = props.serviceDurationMinutes % 60;
    
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
    timeRangeDisplay = `${props.selectedTime} to ${endTime}`;
  }

  // Calculate total duration
  const totalDuration = props.services.reduce((sum, service) => sum + (service.duration * service.quantity), 0);

  // Format date
  const formattedDate = new Date(props.selectedDate).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Show initialization button if payment intent hasn't been created yet
  if (!clientSecret) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Payment Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
          <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">
            Payment Summary
          </h4>
          
          {props.services.length > 0 && (
            <>
              {/* Services */}
              <div className="space-y-3 mb-4">
                <h5 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-2">Services</h5>
                {props.services.map((service, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{service.name} × {service.quantity}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">£{service.price * service.quantity}</span>
                  </div>
                ))}
              </div>
              
              {/* Team Member */}
              {props.teamMemberName && (
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-600">
                  <h5 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-3">Team Member</h5>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-900 dark:text-white font-medium">
                      {props.teamMemberName}
                    </span>
                  </div>
                  {props.teamMemberRole && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 ml-6">
                      {props.teamMemberRole}
                    </p>
                  )}
                  {(props.teamMemberPhone || props.teamMemberEmail) && (
                    <div className="mt-3 ml-6 space-y-2">
                      {props.teamMemberPhone && (
                        <a
                          href={`tel:${props.teamMemberPhone.replace(/\s+/g, '')}`}
                          className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 cursor-pointer group"
                        >
                          <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0 transition-colors duration-200" />
                          <span className="underline decoration-dotted underline-offset-2">
                            {props.teamMemberPhone}
                          </span>
                        </a>
                      )}
                      {props.teamMemberEmail && (
                        <a
                          href={`mailto:${props.teamMemberEmail}`}
                          className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 cursor-pointer group"
                        >
                          <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0 transition-colors duration-200" />
                          <span className="underline decoration-dotted underline-offset-2">
                            {props.teamMemberEmail}
                          </span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Appointment Details */}
              {props.selectedDate && props.selectedTime && (
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-600">
                  <h5 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-2">Appointment</h5>
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
              )}
              
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
                    <span className="text-[#9d9585] dark:text-[#c9c1b0]">£{props.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Error Message */}
        {initError && (
          <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-400 text-sm sm:text-base break-words">{initError}</p>
          </div>
        )}

        {/* Initialize Payment Button */}
        <button
          onClick={handleInitializePayment}
          disabled={isInitializing}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px] touch-manipulation active:scale-95"
        >
          {isInitializing ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Initializing Payment...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>Pay £{props.amount.toFixed(2)} Now</span>
            </>
          )}
        </button>

        {/* Security Notice */}
        <div className="text-center px-4">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            🔒 Your payment information is secure and encrypted by Stripe
          </p>
        </div>
      </div>
    );
  }

  // Once clientSecret is available, show the payment form
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#e11d48', // rose-600
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements options={options} stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
}

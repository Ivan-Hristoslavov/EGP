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
import ButtonPrimary from './ButtonPrimary';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export type DepositMetadata = {
  isDeposit: true;
  totalAmount: number;
  depositAmount: number;
  remainingAmount: number;
};

interface StripePaymentFormProps {
  amount: number;
  /** Amount to charge now (deposit or full). Defaults to amount. */
  amountToCharge?: number;
  /** When paying deposit only, pass so backend can persist booking totals. */
  depositMetadata?: DepositMetadata;
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
  customerData?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  onPaymentSuccess: (bookingId: string) => void;
  onPaymentError: (error: string) => void;
  onTestBooking?: (bookingId: string) => void;
  /** Called when payment is initializing or processing (for loading overlay) */
  onProcessingChange?: (processing: boolean) => void;
}

interface PaymentFormProps {
  amount: number;
  /** Amount actually charged (for button label and validation). */
  amountToCharge?: number;
  depositMetadata?: DepositMetadata;
  services: StripePaymentFormProps['services'];
  selectedDate: string;
  selectedTime: string;
  teamMemberId?: string;
  teamMemberName?: string;
  teamMemberRole?: string;
  teamMemberPhone?: string;
  teamMemberEmail?: string;
  serviceDurationMinutes?: number;
  customerData?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  onPaymentSuccess: (bookingId: string) => void;
  onPaymentError: (error: string) => void;
  onTestBooking?: (bookingId: string) => void;
  onProcessingChange?: (processing: boolean) => void;
}

function FreeBookingConfirmation({
  formattedDate,
  timeRangeDisplay,
  totalDuration,
  services,
  customerData,
  selectedDate,
  selectedTime,
  teamMemberId,
  serviceDurationMinutes,
  onPaymentSuccess,
  onPaymentError,
  onProcessingChange,
}: {
  formattedDate: string;
  timeRangeDisplay: string;
  totalDuration: number;
  services: StripePaymentFormProps['services'];
  customerData?: StripePaymentFormProps['customerData'];
  selectedDate: string;
  selectedTime: string;
  teamMemberId?: string;
  serviceDurationMinutes?: number | null;
  onPaymentSuccess: (bookingId: string) => void;
  onPaymentError: (error: string) => void;
  onProcessingChange?: (processing: boolean) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleConfirm = async () => {
    setIsLoading(true);
    setErrorMessage('');
    onProcessingChange?.(true);

    try {
      const servicesSummary = services
        .map((s) => `${s.name}${s.quantity > 1 ? ` (x${s.quantity})` : ''}`)
        .join(', ');
      const customerName =
        customerData && (customerData.firstName || customerData.lastName)
          ? `${customerData.firstName} ${customerData.lastName}`.trim()
          : 'Guest Customer';

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerData?.email || null,
          customer_phone: customerData?.phone || null,
          service: servicesSummary,
          date: selectedDate,
          time: selectedTime,
          amount: 0,
          total_amount: 0,
          amount_paid: 0,
          remaining_amount: 0,
          payment_type: 'full',
          payment_method: 'free',
          status: 'confirmed',
          payment_status: 'paid',
          team_member_id: teamMemberId || null,
          service_duration_minutes: serviceDurationMinutes || null,
          notes: 'Free consultation booking – no payment required',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success || !data?.booking?.id) {
        throw new Error(data?.error || 'Failed to create free booking');
      }

      onPaymentSuccess(data.booking.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create free booking';
      setErrorMessage(message);
      onPaymentError(message);
    } finally {
      setIsLoading(false);
      onProcessingChange?.(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="border border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 sm:p-4">
        <p className="text-sm sm:text-base text-emerald-900 dark:text-emerald-100 font-medium mb-1">
          No payment required
        </p>
        <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-200">
          This consultation is free. Confirm your booking below and you&apos;ll receive an email with the details.
        </p>
        <p className="mt-2 text-xs text-emerald-800 dark:text-emerald-200">
          {formattedDate} · {timeRangeDisplay} · {totalDuration} min
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 dark:text-red-400 text-sm sm:text-base break-words">{errorMessage}</p>
        </div>
      )}

      <div className="flex justify-center">
        <ButtonPrimary
          type="button"
          variant="primary"
          size="lg"
          isDisabled={isLoading}
          isLoading={isLoading}
          startContent={!isLoading ? <CheckCircle className="w-5 h-5" /> : undefined}
          onPress={handleConfirm}
        >
          {isLoading ? 'Confirming...' : 'Confirm Free Booking'}
        </ButtonPrimary>
      </div>
    </div>
  );
}

function PaymentForm({
  amount,
  amountToCharge,
  depositMetadata,
  services,
  selectedDate,
  selectedTime,
  teamMemberId,
  teamMemberName,
  teamMemberRole,
  teamMemberPhone,
  teamMemberEmail,
  serviceDurationMinutes,
  customerData,
  onPaymentSuccess,
  onPaymentError,
  onTestBooking,
  onProcessingChange,
}: PaymentFormProps) {
  const chargeAmount = amountToCharge ?? amount;
  const isFree = chargeAmount <= 0;
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [isTestBooking, setIsTestBooking] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleTestBooking = async () => {
    if (!onTestBooking) return;
    
    setIsTestBooking(true);
    setErrorMessage('');

    try {
      // Create booking without payment
      const response = await fetch('/api/bookings/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          services: services.map(service => ({
            name: service.name,
            price: service.price,
            quantity: service.quantity,
            duration: service.duration,
          })),
          selectedDate,
          selectedTime,
          teamMemberId: teamMemberId || null,
          serviceDurationMinutes: serviceDurationMinutes || null,
          amount,
          customerData: customerData ? {
            firstName: customerData.firstName,
            lastName: customerData.lastName,
            email: customerData.email,
            phone: customerData.phone || null,
          } : null,
          notes: 'Test booking - No payment required',
        }),
      });

      const data = await response.json();

      if (response.ok && data.bookingId) {
        onTestBooking(data.bookingId);
      } else {
        throw new Error(data.error || 'Failed to create test booking');
      }
    } catch (error) {
      console.error('Test booking error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create test booking');
      onPaymentError(error instanceof Error ? error.message : 'Failed to create test booking');
    } finally {
      setIsTestBooking(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    // If this is a free booking (amount 0), skip Stripe entirely and just create a booking
    if (isFree) {
      event.preventDefault();
      setIsLoading(true);
      setPaymentStatus('processing');
      setErrorMessage('');
      onProcessingChange?.(true);

      try {
        const servicesSummary = services
          .map((s) => `${s.name}${s.quantity > 1 ? ` (x${s.quantity})` : ''}`)
          .join(', ');

        const customerName =
          customerData && (customerData.firstName || customerData.lastName)
            ? `${customerData.firstName} ${customerData.lastName}`.trim()
            : 'Guest Customer';

        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customer_name: customerName,
            customer_email: customerData?.email || null,
            customer_phone: customerData?.phone || null,
            service: servicesSummary,
            date: selectedDate,
            time: selectedTime,
            amount: 0,
            total_amount: 0,
            amount_paid: 0,
            remaining_amount: 0,
            payment_type: 'full',
            payment_method: 'free',
            status: 'confirmed',
            payment_status: 'paid',
            team_member_id: teamMemberId || null,
            service_duration_minutes: serviceDurationMinutes || null,
            notes: 'Free consultation booking – no payment required',
          }),
        });

        const data = await response.json();

        if (!response.ok || !data?.success || !data?.booking?.id) {
          throw new Error(data?.error || 'Failed to create free booking');
        }

        setPaymentStatus('success');
        onPaymentSuccess(data.booking.id);
      } catch (error) {
        console.error('Free booking error:', error);
        const message =
          error instanceof Error ? error.message : 'Failed to create free booking';
        setPaymentStatus('error');
        setErrorMessage(message);
        onPaymentError(message);
      } finally {
        setIsLoading(false);
        onProcessingChange?.(false);
      }

      return;
    }

    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setPaymentStatus('processing');
    setErrorMessage('');
    onProcessingChange?.(true);

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
      onProcessingChange?.(false);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="text-center py-6 sm:py-8 px-4">
        <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-3 sm:mb-4" />
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
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

  // If free, show a simple confirmation UI instead of Stripe
  if (isFree) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="border border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 sm:p-4">
          <p className="text-sm sm:text-base text-emerald-900 dark:text-emerald-100 font-medium mb-1">
            No payment required
          </p>
          <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-200">
            This consultation is free. Confirm your booking below and you&apos;ll receive an email with the details.
          </p>
          <p className="mt-2 text-xs text-emerald-800 dark:text-emerald-200">
            {formattedDate} · {timeRangeDisplay} · {totalDuration} min
          </p>
        </div>

        {paymentStatus === 'error' && (
          <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-400 text-sm sm:text-base break-words">{errorMessage}</p>
          </div>
        )}

        <div className="flex justify-center">
          <ButtonPrimary
            type="button"
            variant="primary"
            size="lg"
            isDisabled={isLoading}
            isLoading={isLoading}
            startContent={!isLoading ? <CheckCircle className="w-5 h-5" /> : undefined}
            onClick={(e) => {
              // Reuse handleSubmit logic for free bookings
              handleSubmit(e as unknown as React.FormEvent);
            }}
          >
            {isLoading ? "Confirming..." : "Confirm Free Booking"}
          </ButtonPrimary>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
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
        <div className="flex justify-center">
          <ButtonPrimary
            type="submit"
            variant="primary"
            size="lg"
            isDisabled={!stripe || !elements || isLoading || isTestBooking}
            isLoading={isLoading}
            startContent={!isLoading ? <CreditCard className="w-5 h-5" /> : undefined}
          >
            {isLoading ? "Processing Payment..." : `Pay £${chargeAmount.toFixed(2)} Now`}
          </ButtonPrimary>
        </div>
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
  const [isTestBooking, setIsTestBooking] = useState(false);
  const [initError, setInitError] = useState<string>('');

  // Debug: Log customer data when it changes
  useEffect(() => {
    console.log('StripePaymentForm - Customer data received:', {
      hasCustomerData: !!props.customerData,
      firstName: props.customerData?.firstName,
      lastName: props.customerData?.lastName,
      email: props.customerData?.email,
      phone: props.customerData?.phone,
      fullData: props.customerData
    });
  }, [props.customerData]);

  const handleTestBookingMain = async () => {
    if (!props.onTestBooking) return;

    // Validate customer data - must have at least first name and email
    if (!props.customerData?.firstName?.trim() || !props.customerData?.email?.trim()) {
      setInitError('Please fill in your details (at least first name and email) before creating a test booking.');
      return;
    }

    // Build customer data properly
    const customerFirstName = props.customerData.firstName.trim();
    const customerLastName = props.customerData.lastName?.trim() || '';
    const customerName = customerLastName 
      ? `${customerFirstName} ${customerLastName}` 
      : customerFirstName;
    const customerEmail = props.customerData.email.trim();
    const customerPhone = props.customerData.phone?.trim() || '';
    
    setIsTestBooking(true);
    setInitError('');

    try {
      // Create booking without payment
      const response = await fetch('/api/bookings/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          services: props.services.map(service => ({
            name: service.name,
            price: service.price,
            quantity: service.quantity,
            duration: service.duration,
          })),
          selectedDate: props.selectedDate,
          selectedTime: props.selectedTime,
          teamMemberId: props.teamMemberId || null,
          serviceDurationMinutes: props.serviceDurationMinutes || null,
          amount: props.amount,
          customerName: customerName,
          customerEmail: customerEmail,
          customerPhone: customerPhone,
          notes: 'Test booking - No payment required',
        }),
      });

      const data = await response.json();

      if (response.ok && data.bookingId) {
        props.onTestBooking(data.bookingId);
      } else {
        throw new Error(data.error || 'Failed to create test booking');
      }
    } catch (error) {
      console.error('Test booking error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create test booking';
      setInitError(errorMessage);
      props.onPaymentError(errorMessage);
    } finally {
      setIsTestBooking(false);
    }
  };

  const handleInitializePayment = async () => {
    // Validate required data
    if (!props.amount || props.amount <= 0 || !props.selectedDate || !props.selectedTime || props.services.length === 0) {
      setInitError('Please complete all booking details before proceeding to payment.');
      return;
    }

    // Validate customer data - must have at least first name and email
    // Check if customerData exists and has required fields
    if (!props.customerData) {
      console.error('Customer data is missing:', props.customerData);
      setInitError('Please fill in your details in the "Your Details" step before proceeding to payment.');
      return;
    }

    const firstName = props.customerData.firstName?.trim() || '';
    const email = props.customerData.email?.trim() || '';

    if (!firstName || !email) {
      console.error('Customer data validation failed:', {
        firstName: firstName || 'MISSING',
        email: email || 'MISSING',
        fullCustomerData: props.customerData
      });
      setInitError('Please fill in your details (at least first name and email) in the "Your Details" step before proceeding to payment.');
      return;
    }

    // Build customer name properly
    const customerFirstName = firstName;
    const customerLastName = props.customerData.lastName?.trim() || '';
    const customerName = customerLastName 
      ? `${customerFirstName} ${customerLastName}` 
      : customerFirstName;
    const customerEmail = email;
    const customerPhone = props.customerData.phone?.trim() || '';

    console.log('Initializing payment with customer data:', { customerName, customerEmail, customerPhone });

    setIsInitializing(true);
    setInitError('');
    props.onProcessingChange?.(true);

      try {
        const chargeAmount = props.amountToCharge ?? props.amount;
        const metadata: Record<string, string> = {
          services: JSON.stringify(props.services),
          selectedDate: props.selectedDate,
          selectedTime: props.selectedTime,
          teamMemberId: props.teamMemberId || '',
          serviceDurationMinutes: props.serviceDurationMinutes?.toString() || '',
          customerName: customerName,
          customerEmail: customerEmail,
          customerPhone: customerPhone,
          timestamp: new Date().toISOString(),
        };
        if (props.depositMetadata?.isDeposit) {
          metadata.isDeposit = 'true';
          metadata.totalAmount = String(props.depositMetadata.totalAmount);
          metadata.depositAmount = String(props.depositMetadata.depositAmount);
          metadata.remainingAmount = String(props.depositMetadata.remainingAmount);
        }
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: chargeAmount,
            metadata,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Failed to initialize payment';
        setInitError(errorMessage);
        setIsInitializing(false);
        props.onProcessingChange?.(false);
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
      props.onProcessingChange?.(false);
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

  const chargeAmount = props.amountToCharge ?? props.amount;
  const isFreeBooking = chargeAmount <= 0;

  // When amount is 0, show free-booking confirmation directly (no Stripe, no "Pay £0.00 Now")
  if (isFreeBooking) {
    return (
      <FreeBookingConfirmation
        formattedDate={formattedDate}
        timeRangeDisplay={timeRangeDisplay}
        totalDuration={totalDuration}
        services={props.services}
        customerData={props.customerData}
        selectedDate={props.selectedDate}
        selectedTime={props.selectedTime}
        teamMemberId={props.teamMemberId}
        serviceDurationMinutes={props.serviceDurationMinutes}
        onPaymentSuccess={props.onPaymentSuccess}
        onPaymentError={props.onPaymentError}
        onProcessingChange={props.onProcessingChange}
      />
    );
  }

  // Show initialization button if payment intent hasn't been created yet
  if (!clientSecret) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Error Message */}
        {initError && (
          <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-400 text-sm sm:text-base break-words">{initError}</p>
          </div>
        )}

        {/* Initialize Payment Button */}
        <div className="flex justify-center">
          <ButtonPrimary
            onPress={handleInitializePayment}
            variant="primary"
            size="lg"
            isDisabled={isInitializing || isTestBooking}
            isLoading={isInitializing}
            startContent={!isInitializing ? <CreditCard className="w-5 h-5" /> : undefined}
          >
            {isInitializing ? "Initializing Payment..." : `Pay £${(props.amountToCharge ?? props.amount).toFixed(2)} Now`}
          </ButtonPrimary>
        </div>
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
      <PaymentForm {...props} onProcessingChange={props.onProcessingChange} />
    </Elements>
  );
}

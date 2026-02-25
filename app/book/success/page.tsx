"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Calendar, Clock, Mail, Phone, ArrowRight, Download, X, User } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { useAdminProfile } from '@/components/AdminProfileContext';
import ButtonPrimary from '@/components/ButtonPrimary';

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking');
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const adminProfile = useAdminProfile();
  
  // Get contact info from admin profile, fallback to siteConfig
  const contactPhone = adminProfile?.phone || siteConfig.contact.phone;
  const contactEmail = adminProfile?.business_email || adminProfile?.email || siteConfig.contact.email;

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) return;
      
      try {
        const response = await fetch(`/api/bookings/${bookingId}`);
        if (response.ok) {
          const data = await response.json();
          const booking = data.booking;
          
          // Parse service field (could be a string or JSON)
          let services = [];
          try {
            if (typeof booking.service === 'string') {
              // If service is a JSON string, parse it
              const parsed = JSON.parse(booking.service);
              services = Array.isArray(parsed) ? parsed : [{ name: booking.service, price: booking.amount, quantity: 1 }];
            } else if (Array.isArray(booking.service)) {
              services = booking.service;
            } else {
              services = [{ name: booking.service || 'Service', price: booking.amount, quantity: 1 }];
            }
          } catch {
            // If parsing fails, treat as single service
            services = [{ name: booking.service || 'Service', price: booking.amount, quantity: 1 }];
          }
          
          const totalAmount = booking.total_amount ?? booking.amount;
          const amountPaid = booking.amount_paid ?? booking.amount;
          const paymentType = booking.payment_type || 'full';
          const remainingAmount = booking.remaining_amount ?? 0;
          setBookingDetails({
            id: booking.booking_number || booking.id,
            bookingNumber: booking.booking_number,
            services: services,
            totalAmount: totalAmount,
            amountPaid: amountPaid,
            paymentType: paymentType,
            remainingAmount: remainingAmount,
            selectedDate: booking.date,
            selectedTime: booking.time,
            customerName: booking.customer_name,
            customerEmail: booking.customer_email,
            customerPhone: booking.customer_phone,
            status: booking.status || 'confirmed',
            teamMember: booking.team ? {
              name: booking.team.name,
              role: booking.team.role
            } : null
          });
        } else if (response.status === 404) {
          // Booking not found - show error state
          setBookingDetails({
            error: true,
            errorMessage: 'Booking not found. Please check your booking ID and try again.'
          });
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to fetch booking details:', errorData);
          setBookingDetails({
            error: true,
            errorMessage: errorData.error || 'Failed to load booking details. Please try again later.'
          });
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
        setBookingDetails({
          error: true,
          errorMessage: 'An error occurred while loading your booking. Please try again later.'
        });
      }
    };
    
    fetchBookingDetails();
  }, [bookingId]);

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9d9585] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading booking details...</p>
        </div>
      </div>
    );
  }

  // Show error state if booking not found or error occurred
  if (bookingDetails.error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
              <X className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Booking Not Found
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              {bookingDetails.errorMessage || 'The booking you are looking for could not be found.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/book"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#ddd5c3] text-white rounded-lg hover:from-[#857d68] hover:via-[#aea693] hover:to-[#c9c1b0] transition-all shadow-lg"
              >
                <Calendar className="w-4 h-4" />
                Book a New Appointment
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#9d9585] text-[#9d9585] dark:text-[#b5ad9d] rounded-lg hover:bg-[#9d9585] hover:text-white dark:hover:bg-[#b5ad9d] transition-all"
              >
                <ArrowRight className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* Hide navigation, footer, and action buttons */
          header,
          footer,
          nav,
          .no-print,
          button,
          a[href] {
            display: none !important;
          }
          
          /* Reset page margins - minimal top margin to minimize browser header space */
          @page {
            margin: 0mm 10mm 10mm 10mm;
            size: A4;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Show only printable content - move to absolute top */
          .print-content {
            display: block !important;
            padding-top: 0 !important;
            padding-bottom: 0 !important;
            min-height: auto !important;
            margin-top: 0 !important;
          }
          
          /* Ensure proper print layout - compact with minimal top padding */
          .print-container {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 5mm 10mm 10mm 10mm !important;
            box-shadow: none !important;
            background: white !important;
          }
          
          /* Logo positioning - at absolute top */
          .print-logo {
            margin-top: 0 !important;
            margin-bottom: 10px !important;
            padding-top: 0 !important;
          }
          
          /* Compact header for print - no top spacing */
          .print-content .text-center.mb-8 {
            margin-bottom: 12px !important;
            padding-top: 0 !important;
            margin-top: 0 !important;
          }
          
          /* Remove any top spacing from first element */
          .print-container > *:first-child {
            margin-top: 0 !important;
            padding-top: 0 !important;
          }
          
          .print-content .text-center.mb-8 .mb-8 {
            margin-bottom: 8px !important;
          }
          
          .print-content .text-center.mb-8 h1 {
            font-size: 28px !important;
            margin-bottom: 5px !important;
            font-weight: 700 !important;
            line-height: 1.2 !important;
          }
          
          .print-content .text-center.mb-8 p {
            font-size: 14px !important;
            margin-bottom: 0 !important;
            line-height: 1.3 !important;
          }
          
          /* Compact booking details card */
          .print-content .rounded-2xl {
            margin-bottom: 15px !important;
            padding: 15px !important;
            border-radius: 6px !important;
            border: 1px solid #e5e7eb !important;
          }
          
          .print-content .rounded-2xl h2,
          .print-content .rounded-2xl h3 {
            font-size: 18px !important;
            margin-bottom: 10px !important;
            font-weight: 700 !important;
            line-height: 1.2 !important;
          }
          
          .print-content .space-y-4 > * + * {
            margin-top: 6px !important;
          }
          
          .print-content .space-y-3 > * + * {
            margin-top: 4px !important;
          }
          
          .print-content .mb-6 {
            margin-bottom: 8px !important;
          }
          
          .print-content .mb-4 {
            margin-bottom: 6px !important;
          }
          
          .print-content .gap-8 {
            gap: 12px !important;
          }
          
          .print-content .gap-3 {
            gap: 8px !important;
          }
          
          /* Logo for print - show at top, bigger and moved up */
          .print-logo {
            display: block !important;
            margin: -5px auto 15px !important;
            max-width: 300px !important;
            height: auto !important;
          }
          
          .print-logo img {
            width: 300px !important;
            height: auto !important;
            max-width: 100% !important;
          }
          
          /* Larger checkmark for print */
          .print-content .w-20.h-20 {
            width: 80px !important;
            height: 80px !important;
          }
          
          .print-content .w-20.h-20 svg {
            width: 50px !important;
            height: 50px !important;
          }
          
          /* Smaller detail icons for print */
          .print-content .w-10.h-10 {
            width: 30px !important;
            height: 30px !important;
          }
          
          .print-content .w-5.h-5 {
            width: 14px !important;
            height: 14px !important;
          }
          
          .print-content .w-10.h-10 svg {
            width: 16px !important;
            height: 16px !important;
          }
          
          /* Compact grid layout */
          .print-content .grid {
            gap: 15px !important;
          }
          
          /* Smaller text sizes for compact fit */
          .print-content .text-sm {
            font-size: 11px !important;
          }
          
          .print-content .text-xs {
            font-size: 10px !important;
          }
          
          .print-content .text-xl {
            font-size: 14px !important;
          }
          
          .print-content .text-2xl {
            font-size: 18px !important;
          }
          
          .print-content .text-4xl {
            font-size: 28px !important;
          }
          
          /* Reduce icon sizes */
          .print-content .w-10.h-10 {
            width: 24px !important;
            height: 24px !important;
          }
          
          .print-content .w-10.h-10 svg {
            width: 14px !important;
            height: 14px !important;
          }
          
          /* Compact print footer */
          .print-only {
            margin-top: 12px !important;
            padding-top: 10px !important;
          }
          
          .print-only h3 {
            font-size: 14px !important;
            margin-bottom: 4px !important;
          }
          
          .print-only p {
            font-size: 11px !important;
            line-height: 1.4 !important;
            margin-bottom: 4px !important;
          }
          
          .print-only .text-base {
            font-size: 13px !important;
          }
          
          .print-only .text-sm {
            font-size: 10px !important;
          }
          
          .print-only .text-xs {
            font-size: 9px !important;
          }
          
          /* Remove dark mode for print */
          .dark,
          .dark * {
            color: #000 !important;
            background: white !important;
          }
          
          /* Ensure text is black for print */
          * {
            color: #000 !important;
          }
          
          /* Keep borders visible */
          .print-container * {
            border-color: #000 !important;
          }
          
          /* Show print-only elements */
          .print-only {
            display: block !important;
          }
          
          /* Ensure everything fits on one page */
          .print-content {
            page-break-inside: avoid;
          }
          
          .print-content .rounded-2xl {
            page-break-inside: avoid;
          }
        }
      `}} />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-8 print-content">
        <div className="container mx-auto px-4 max-w-4xl print-container">
          {/* Logo - Print Only */}
          <div className="hidden print-only print-logo">
            <Image
              src="/logos/LOGO_LONG BLACK.png"
              alt="EGP Aesthetics"
              width={300}
              height={54}
              className="mx-auto"
              priority
            />
          </div>
          
          {/* Success Header */}
          <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#f5f1e9] dark:bg-[#9d9585]/30 rounded-full mb-8">
            <CheckCircle className="w-10 h-10 text-[#9d9585] dark:text-[#c9c1b0]" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#464C45] dark:text-[#c9c1b0] mb-4 font-playfair">
            Booking Confirmed!
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 font-montserrat font-light max-w-3xl mx-auto">
            Thank you for choosing EGP Aesthetics London
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Booking Details */}
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Booking Details
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#f5f1e9] dark:bg-[#9d9585]/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-[#9d9585] dark:text-[#b5ad9d]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Date</p>
                    <p className="font-semibold text-base text-gray-900 dark:text-white">
                      {new Date(bookingDetails.selectedDate).toLocaleDateString('en-GB', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#f5f1e9] dark:bg-[#9d9585]/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-[#9d9585] dark:text-[#b5ad9d]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Time</p>
                    <p className="font-semibold text-base text-gray-900 dark:text-white">
                      {bookingDetails.selectedTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#f5f1e9] dark:bg-[#9d9585]/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-[#9d9585] dark:text-[#b5ad9d]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Booking Number</p>
                    <p className="font-semibold text-base text-gray-900 dark:text-white">
                      {bookingDetails.bookingNumber || bookingDetails.id}
                    </p>
                  </div>
                </div>

                {bookingDetails.teamMember && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#f5f1e9] dark:bg-[#9d9585]/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-[#9d9585] dark:text-[#b5ad9d]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Practitioner</p>
                      <p className="font-semibold text-base text-gray-900 dark:text-white">
                        {bookingDetails.teamMember.name}
                      </p>
                      {bookingDetails.teamMember.role && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {bookingDetails.teamMember.role}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Customer Information */}
            <div className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Customer Information
              </h2>
              
              <div className="space-y-4">
                {bookingDetails.customerName && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#f5f1e9] dark:bg-[#9d9585]/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-[#9d9585] dark:text-[#b5ad9d]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Customer Name</p>
                      <p className="font-semibold text-base text-gray-900 dark:text-white">
                        {bookingDetails.customerName}
                      </p>
                    </div>
                  </div>
                )}

                {bookingDetails.customerEmail && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#f5f1e9] dark:bg-[#9d9585]/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-[#9d9585] dark:text-[#b5ad9d]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email</p>
                      <p className="font-semibold text-base text-gray-900 dark:text-white">
                        {bookingDetails.customerEmail}
                      </p>
                    </div>
                  </div>
                )}

                {bookingDetails.customerPhone && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#f5f1e9] dark:bg-[#9d9585]/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-[#9d9585] dark:text-[#b5ad9d]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Phone</p>
                      <p className="font-semibold text-base text-gray-900 dark:text-white">
                        {bookingDetails.customerPhone}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Services Booked Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Services Booked
            </h2>
            
            <div className="space-y-4 mb-6">
              {bookingDetails.services.map((service: any, index: number) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                        {service.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Quantity: {service.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-xl text-[#9d9585] dark:text-[#b5ad9d] whitespace-nowrap">
                      £{service.price * service.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-6 space-y-2">
              {bookingDetails.paymentType === 'deposit' && bookingDetails.remainingAmount != null && bookingDetails.remainingAmount > 0 ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Paid now (deposit):</span>
                    <span className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                      £{Number(bookingDetails.amountPaid ?? bookingDetails.totalAmount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base text-gray-600 dark:text-gray-400">Due on arrival:</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      £{Number(bookingDetails.remainingAmount).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
                    You can cancel or request a refund up to 24 hours before your appointment.
                  </p>
                </>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Paid:</span>
                  <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                    £{Number(bookingDetails.totalAmount).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 no-print">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            What Happens Next?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Confirmation Email
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You'll receive a detailed confirmation email within the next few minutes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Pre-Treatment Call
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We'll call you 24 hours before your appointment to confirm details.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Arrival Instructions
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Please arrive 10 minutes early and bring a form of ID.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 no-print">
          <ButtonPrimary
            as={Link}
            href="/book"
            variant="primary"
            className="w-full min-h-[44px]"
            startContent={<ArrowRight className="w-4 h-4 rotate-180" />}
          >
            Back to Booking
          </ButtonPrimary>

          <ButtonPrimary
            as={Link}
            href="/book"
            variant="primary"
            className="w-full min-h-[44px]"
            startContent={<Calendar className="w-4 h-4" />}
          >
            Book Another
          </ButtonPrimary>

          <ButtonPrimary
            as="a"
            href={`tel:${contactPhone}`}
            variant="secondary"
            className="w-full min-h-[44px]"
            startContent={<Phone className="w-4 h-4" />}
          >
            Call Us
          </ButtonPrimary>

          <ButtonPrimary
            onPress={() => window.print()}
            variant="secondary"
            className="w-full min-h-[44px]"
            startContent={<Download className="w-4 h-4" />}
          >
            Print Receipt
          </ButtonPrimary>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center no-print">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Questions about your booking?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <a 
              href={`tel:${contactPhone}`}
              className="flex items-center gap-2 text-[#9d9585] dark:text-[#b5ad9d] hover:text-[#857d68] dark:hover:text-[#c9c1b0] transition-colors"
            >
              <Phone className="w-4 h-4" />
              {contactPhone}
            </a>
            <a 
              href={`mailto:${contactEmail}`}
              className="flex items-center gap-2 text-[#9d9585] dark:text-[#b5ad9d] hover:text-[#857d68] dark:hover:text-[#c9c1b0] transition-colors"
            >
              <Mail className="w-4 h-4" />
              {contactEmail}
            </a>
          </div>
        </div>
        
        {/* Print-only footer with location and thank you message */}
        <div className="mt-8 text-center print-only hidden border-t border-gray-300 pt-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">Our Location</h3>
            <p className="text-sm leading-relaxed">
              {adminProfile?.company_address || siteConfig.contact.address.full || "London, UK"}
            </p>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-300">
            <p className="text-base font-semibold mb-2 text-gray-900">
              Thank you for your booking!
            </p>
            <p className="text-sm leading-relaxed text-gray-700 max-w-md mx-auto">
              We are delighted to have you join us. Our team looks forward to welcoming you and providing exceptional service. We look forward to seeing you!
            </p>
          </div>
          <div className="mt-4 text-xs text-gray-600">
            <p>Phone: {contactPhone} | Email: {contactEmail}</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9d9585] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}

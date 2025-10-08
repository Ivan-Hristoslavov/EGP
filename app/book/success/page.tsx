"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Calendar, Clock, Mail, Phone, ArrowRight, Download } from 'lucide-react';
import { siteConfig } from '@/config/site';

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking');
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  useEffect(() => {
    // In a real app, you would fetch booking details using the bookingId
    // For now, we'll simulate the booking details
    setBookingDetails({
      id: bookingId || 'booking_123456',
      services: [
        { name: 'Baby Botox', price: 199, quantity: 1 },
        { name: 'Digital Skin Analysis', price: 50, quantity: 1 }
      ],
      totalAmount: 249,
      selectedDate: '2024-01-15',
      selectedTime: '14:00',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      status: 'confirmed'
    });
  }, [bookingId]);

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 font-playfair">
            Booking Confirmed!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 font-montserrat font-light">
            Thank you for choosing EGP Aesthetics London
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Booking Info */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Booking Details
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {new Date(bookingDetails.selectedDate).toLocaleDateString('en-GB', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Time</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {bookingDetails.selectedTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Booking ID</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {bookingDetails.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Services & Total */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Services Booked
              </h3>
              
              <div className="space-y-3 mb-6">
                {bookingDetails.services.map((service: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {service.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Quantity: {service.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-rose-600 dark:text-rose-400">
                      £{service.price * service.quantity}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Paid:</span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    £{bookingDetails.totalAmount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
          >
            <ArrowRight className="w-4 h-4" />
            Back to Home
          </Link>

          <Link
            href="/book"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-rose-500 text-rose-500 dark:text-rose-400 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
          >
            <Calendar className="w-4 h-4" />
            Book Another
          </Link>

          <Link
            href={`tel:${siteConfig.contact.phone}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            <Phone className="w-4 h-4" />
            Call Us
          </Link>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            <Download className="w-4 h-4" />
            Print Receipt
          </button>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Questions about your booking?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <a 
              href={`tel:${siteConfig.contact.phone}`}
              className="flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300"
            >
              <Phone className="w-4 h-4" />
              {siteConfig.contact.phone}
            </a>
            <a 
              href={`mailto:${siteConfig.contact.email}`}
              className="flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300"
            >
              <Mail className="w-4 h-4" />
              {siteConfig.contact.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

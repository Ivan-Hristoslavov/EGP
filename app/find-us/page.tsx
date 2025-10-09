"use client";

import { useState } from 'react';
import { siteConfig } from "@/config/site";
import { MapPin, Phone, Mail, Clock, Navigation, Car, Train, Bus, ArrowLeft, ExternalLink } from "lucide-react";
import Link from 'next/link';

export default function FindUsPage() {
  const [activeTab, setActiveTab] = useState<'location' | 'contact' | 'hours'>('location');

  const contactInfo = {
    address: "123 Harley Street, London W1G 6BA, United Kingdom",
    phone: "+44 20 7123 4567",
    email: "info@egpaesthetics.com",
    whatsapp: "+44 20 7123 4567"
  };

  const openingHours = {
    monday: { day: "Monday", hours: "9:00 AM - 7:00 PM", isOpen: true },
    tuesday: { day: "Tuesday", hours: "9:00 AM - 7:00 PM", isOpen: true },
    wednesday: { day: "Wednesday", hours: "9:00 AM - 7:00 PM", isOpen: true },
    thursday: { day: "Thursday", hours: "9:00 AM - 8:00 PM", isOpen: true },
    friday: { day: "Friday", hours: "9:00 AM - 7:00 PM", isOpen: true },
    saturday: { day: "Saturday", hours: "10:00 AM - 5:00 PM", isOpen: true },
    sunday: { day: "Sunday", hours: "Closed", isOpen: false }
  };

  const transportOptions = [
    {
      type: "Tube/Underground",
      icon: <Train className="w-5 h-5" />,
      details: [
        "Bond Street Station (Central & Jubilee lines) - 5 min walk",
        "Oxford Circus Station (Central, Bakerloo & Victoria lines) - 7 min walk",
        "Regent's Park Station (Bakerloo line) - 10 min walk"
      ]
    },
    {
      type: "Bus",
      icon: <Bus className="w-5 h-5" />,
      details: [
        "Bus routes 2, 13, 74, 113, 139, 159, 453 - Harley Street stop",
        "Bus routes 88, 453 - Cavendish Square stop",
        "Bus routes 2, 13, 74, 139, 159 - Oxford Circus stop"
      ]
    },
    {
      type: "Car/Parking",
      icon: <Car className="w-5 h-5" />,
      details: [
        "Q-Park Oxford Street - 5 min walk",
        "NCP Car Park Cavendish Square - 3 min walk",
        "Meter parking available on surrounding streets",
        "Valet parking service available (advance booking required)"
      ]
    },
    {
      type: "Walking",
      icon: <Navigation className="w-5 h-5" />,
      details: [
        "5 minutes from Oxford Street",
        "7 minutes from Regent Street",
        "10 minutes from Bond Street",
        "Located in the heart of London's medical district"
      ]
    }
  ];

  const nearbyLandmarks = [
    { name: "Oxford Street", distance: "5 min walk", type: "Shopping" },
    { name: "Regent Street", distance: "7 min walk", type: "Shopping" },
    { name: "Bond Street", distance: "5 min walk", type: "Shopping" },
    { name: "Regent's Park", distance: "10 min walk", type: "Park" },
    { name: "Marylebone High Street", distance: "8 min walk", type: "Shopping" },
    { name: "Selfridges", distance: "6 min walk", type: "Department Store" }
  ];

  const handleCall = () => {
    window.open(`tel:${contactInfo.phone}`, '_self');
  };

  const handleEmail = () => {
    window.open(`mailto:${contactInfo.email}`, '_self');
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${contactInfo.whatsapp.replace(/\s/g, '')}`, '_blank');
  };

  const handleDirections = () => {
    const encodedAddress = encodeURIComponent(contactInfo.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 font-playfair">
            Find Us
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 font-montserrat font-light max-w-3xl mx-auto">
            Visit our clinic in the heart of London's prestigious Harley Street medical district
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 flex gap-2">
            <button
              onClick={() => setActiveTab('location')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'location'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400'
              }`}
            >
              <MapPin className="w-5 h-5 inline mr-2" />
              Location & Directions
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'contact'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400'
              }`}
            >
              <Phone className="w-5 h-5 inline mr-2" />
              Contact Info
            </button>
            <button
              onClick={() => setActiveTab('hours')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'hours'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400'
              }`}
            >
              <Clock className="w-5 h-5 inline mr-2" />
              Opening Hours
            </button>
          </div>
        </div>

        {/* Location & Directions Tab */}
        {activeTab === 'location' && (
          <div className="space-y-8">
            {/* Address Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <div className="flex items-start gap-6">
                <div className="bg-rose-100 dark:bg-rose-900/30 p-4 rounded-xl">
                  <MapPin className="w-8 h-8 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Our Location
                  </h2>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    {contactInfo.address}
                  </p>
                  <button
                    onClick={handleDirections}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all font-medium shadow-md hover:shadow-lg"
                  >
                    <Navigation className="w-5 h-5" />
                    Get Directions
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Interactive Map
              </h3>
              <div className="bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl h-96 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-pink-500/10"></div>
                <div className="text-center z-10">
                  <MapPin className="w-16 h-16 text-rose-600 dark:text-rose-400 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Interactive Map Coming Soon
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    We're working on integrating a live map to help you find us easily
                  </p>
                  <button
                    onClick={handleDirections}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all font-medium shadow-md hover:shadow-lg"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in Google Maps
                  </button>
                </div>
              </div>
            </div>

            {/* Transport Options */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                How to Reach Us
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {transportOptions.map((option, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded-lg">
                        {option.icon}
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {option.type}
                      </h4>
                    </div>
                    <ul className="space-y-2">
                      {option.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                          <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby Landmarks */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Nearby Landmarks
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nearbyLandmarks.map((landmark, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {landmark.name}
                      </h4>
                      <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-2 py-1 rounded-full text-xs">
                        {landmark.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {landmark.distance}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contact Info Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-8">
            {/* Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Phone */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className="bg-rose-100 dark:bg-rose-900/30 p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Phone className="w-8 h-8 text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Call Us
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {contactInfo.phone}
                </p>
                <button
                  onClick={handleCall}
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-2 rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all font-medium"
                >
                  Call Now
                </button>
              </div>

              {/* Email */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className="bg-rose-100 dark:bg-rose-900/30 p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Email Us
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  {contactInfo.email}
                </p>
                <button
                  onClick={handleEmail}
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-2 rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all font-medium"
                >
                  Send Email
                </button>
              </div>

              {/* WhatsApp */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  WhatsApp
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {contactInfo.whatsapp}
                </p>
                <button
                  onClick={handleWhatsApp}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium"
                >
                  Message Us
                </button>
              </div>

              {/* Address */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className="bg-rose-100 dark:bg-rose-900/30 p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Visit Us
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  {contactInfo.address}
                </p>
                <button
                  onClick={handleDirections}
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-2 rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all font-medium"
                >
                  Get Directions
                </button>
              </div>
            </div>

            {/* Quick Contact */}
            <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl shadow-lg p-8 text-white">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Need Immediate Assistance?
                </h3>
                <p className="text-rose-100 mb-6 text-lg">
                  For urgent bookings or consultations, please contact us directly
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleCall}
                    className="bg-white text-rose-600 px-8 py-3 rounded-lg font-semibold hover:bg-rose-50 transition-colors"
                  >
                    Call {contactInfo.phone}
                  </button>
                  <button
                    onClick={handleWhatsApp}
                    className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                  >
                    WhatsApp Us
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Opening Hours Tab */}
        {activeTab === 'hours' && (
          <div className="space-y-8">
            {/* Opening Hours */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-6 mb-8">
                <div className="bg-rose-100 dark:bg-rose-900/30 p-4 rounded-xl">
                  <Clock className="w-8 h-8 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Opening Hours
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    We're here to help you look and feel your best
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(openingHours).map(([key, dayInfo]) => (
                  <div
                    key={key}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      dayInfo.isOpen
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                        : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {dayInfo.day}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          dayInfo.isOpen
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }`}
                      >
                        {dayInfo.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      {dayInfo.hours}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Hours Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Important Notes
              </h3>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>We recommend booking appointments in advance to secure your preferred time slot</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Last appointment bookings are accepted 30 minutes before closing time</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Consultations outside regular hours may be available - please call us to inquire</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Holiday hours may vary - please check with us for specific dates</span>
                </li>
              </ul>
            </div>

            {/* Booking CTA */}
            <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl shadow-lg p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Book Your Appointment?
              </h3>
              <p className="text-rose-100 mb-6 text-lg">
                Schedule your consultation during our convenient hours
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/book"
                  className="bg-white text-rose-600 px-8 py-3 rounded-lg font-semibold hover:bg-rose-50 transition-colors"
                >
                  Book Online
                </Link>
                <button
                  onClick={handleCall}
                  className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-rose-600 transition-colors"
                >
                  Call to Book
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

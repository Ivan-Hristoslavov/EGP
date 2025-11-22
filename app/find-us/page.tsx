"use client";

import { useState } from 'react';
import { siteConfig } from "@/config/site";
import { MapPin, Phone, Mail, Clock, Navigation, Car, Train, Bus, ArrowLeft, ExternalLink } from "lucide-react";
import Link from 'next/link';
import { useSiteData } from "@/contexts/SiteDataContext";

export default function FindUsPage() {
  const [activeTab, setActiveTab] = useState<'location' | 'contact' | 'hours'>('location');
  const { contactInfo, openingHours, findUsData, loading } = useSiteData();

  // Use default values if data is still loading or not available
  const displayContactInfo = contactInfo || {
    address: "809 Wandsworth Road, SW8 3JH, London, UK",
    phone: "+44 20 7123 4567",
    email: "info@egpaesthetics.com",
    whatsapp: "+44 20 7123 4567",
    googleMapsAddress: "809 Wandsworth Road, SW8 3JH, London, UK"
  };

  const displayFindUsData = findUsData || {
    howToFindUs: "Our clinic is located in the heart of London's medical district, easily accessible by public transport and car.",
    howToReachUs: "We are conveniently located near major transport links and landmarks.",
    transportOptions: {},
    nearbyLandmarks: []
  };

  // Build transport options from database
  const transportOptions = [];
  if (displayFindUsData.transportOptions.tube && displayFindUsData.transportOptions.tube.length > 0) {
    transportOptions.push({
      type: "Tube/Underground",
      icon: <Train className="w-5 h-5" />,
      details: displayFindUsData.transportOptions.tube.map(t => 
        `${t.station} (${t.lines})${t.distance ? ` - ${t.distance}` : ''}`
      )
    });
  }
  if (displayFindUsData.transportOptions.bus && displayFindUsData.transportOptions.bus.length > 0) {
    transportOptions.push({
      type: "Bus",
      icon: <Bus className="w-5 h-5" />,
      details: displayFindUsData.transportOptions.bus.map(b => 
        `Bus routes ${b.route} - ${b.stop}${b.distance ? ` - ${b.distance}` : ''}`
      )
    });
  }
  if (displayFindUsData.transportOptions.car && displayFindUsData.transportOptions.car.length > 0) {
    transportOptions.push({
      type: "Car/Parking",
      icon: <Car className="w-5 h-5" />,
      details: displayFindUsData.transportOptions.car.map(c => 
        `${c.parking}${c.distance ? ` - ${c.distance}` : ''}${c.notes ? ` (${c.notes})` : ''}`
      )
    });
  }
  if (displayFindUsData.transportOptions.walking && displayFindUsData.transportOptions.walking.length > 0) {
    transportOptions.push({
      type: "Walking",
      icon: <Navigation className="w-5 h-5" />,
      details: displayFindUsData.transportOptions.walking.map(w => 
        `${w.distance} from ${w.from}`
      )
    });
  }

  // Use nearby landmarks from database
  const nearbyLandmarks = displayFindUsData.nearbyLandmarks || [];


  const handleDirections = () => {
    const addressToUse = displayContactInfo.googleMapsAddress || displayContactInfo.address;
    const encodedAddress = encodeURIComponent(addressToUse);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const handleCall = () => {
    window.open(`tel:${displayContactInfo.phone}`, '_self');
  };

  const handleEmail = () => {
    window.open(`mailto:${displayContactInfo.email}`, '_self');
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${displayContactInfo.whatsapp.replace(/\s/g, '')}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#f5f1e9] dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-[#6f6652] dark:text-[#d8c5a7] hover:text-[#4c4435] dark:hover:text-[#f5f1e9] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-[#3a3428] dark:text-white mb-6 font-playfair">
            Find Us
          </h1>
          <p className="text-2xl text-[#6f6652] dark:text-gray-300 font-montserrat font-light max-w-3xl mx-auto">
            Visit our clinic in Wandsworth, South West London
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 flex gap-2">
            <button
              onClick={() => setActiveTab('location')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'location'
                  ? 'bg-[#9d8c76] text-white shadow-md'
                  : 'text-[#6f6652] dark:text-gray-400 hover:text-[#3a3428] dark:hover:text-[#f5f1e9]'
              }`}
            >
              <MapPin className="w-5 h-5 inline mr-2" />
              Location & Directions
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'contact'
                  ? 'bg-[#9d8c76] text-white shadow-md'
                  : 'text-[#6f6652] dark:text-gray-400 hover:text-[#3a3428] dark:hover:text-[#f5f1e9]'
              }`}
            >
              <Phone className="w-5 h-5 inline mr-2" />
              Contact Info
            </button>
            <button
              onClick={() => setActiveTab('hours')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'hours'
                  ? 'bg-[#9d8c76] text-white shadow-md'
                  : 'text-[#6f6652] dark:text-gray-400 hover:text-[#3a3428] dark:hover:text-[#f5f1e9]'
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
                <div className="bg-[#e8e1d4] dark:bg-[#3a3428] p-4 rounded-xl">
                  <MapPin className="w-8 h-8 text-[#6f6652] dark:text-[#d8c5a7]" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[#3a3428] dark:text-white mb-4">
                    Our Location
                  </h2>
                  <p className="text-lg text-[#524a3a] dark:text-gray-300 mb-4 leading-relaxed">
                    {displayContactInfo.address}
                  </p>
                  <button
                    onClick={handleDirections}
                    className="inline-flex items-center gap-2 bg-[#3a3428] text-[#f5f1e9] px-6 py-3 rounded-lg hover:bg-[#2c261c] transition-all font-medium shadow-md hover:shadow-lg"
                  >
                    <Navigation className="w-5 h-5" />
                    Get Directions
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Google Map */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-[#3a3428] dark:text-white mb-6">
                Interactive Map
              </h3>
              <div className="rounded-xl overflow-hidden h-96 shadow-lg border border-[#e1d8c7] dark:border-gray-700">
                <iframe
                  src={`https://www.google.com/maps?q=${encodeURIComponent(displayContactInfo.googleMapsAddress || displayContactInfo.address)}&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                  title={`EGP Aesthetics Location - ${displayContactInfo.googleMapsAddress || displayContactInfo.address}`}
                />
              </div>
              <div className="mt-4 text-center">
                  <button
                    onClick={handleDirections}
                    className="inline-flex items-center gap-2 bg-[#3a3428] text-[#f5f1e9] px-6 py-3 rounded-lg hover:bg-[#2c261c] transition-all font-medium shadow-md hover:shadow-lg"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in Google Maps
                  </button>
                </div>
              </div>

            {/* How to Find Us */}
            {displayFindUsData.howToFindUs && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-[#3a3428] dark:text-white mb-4">
                  How to Find Us
                </h3>
                <p className="text-lg text-[#524a3a] dark:text-gray-300 leading-relaxed">
                  {displayFindUsData.howToFindUs}
                </p>
            </div>
            )}

            {/* Transport Options */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-[#3a3428] dark:text-white mb-4">
                How to Reach Us
              </h3>
              {displayFindUsData.howToReachUs && (
                <p className="text-lg text-[#524a3a] dark:text-gray-300 mb-6 leading-relaxed">
                  {displayFindUsData.howToReachUs}
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {transportOptions.map((option, index) => (
                  <div key={index} className="border border-[#e1d8c7] dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-[#f0e8d8] dark:bg-[#3a3428] p-2 rounded-lg">
                        {option.icon}
                      </div>
                      <h4 className="text-lg font-semibold text-[#3a3428] dark:text-white">
                        {option.type}
                      </h4>
                    </div>
                    <ul className="space-y-2">
                      {option.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start gap-2 text-[#6f6652] dark:text-gray-400">
                          <div className="w-1.5 h-1.5 bg-[#9d8c6b] rounded-full mt-2 flex-shrink-0"></div>
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
              <h3 className="text-2xl font-bold text-[#3a3428] dark:text-white mb-4">
                Nearby Landmarks
              </h3>
              <p className="text-[#6f6652] dark:text-gray-400 mb-6 text-sm">
                Our clinic at {displayContactInfo.address} is surrounded by some of London's most iconic locations:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {nearbyLandmarks.map((landmark, index) => (
                  <div key={index} className="border border-[#e1d8c7] dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-[#3a3428] dark:text-white text-sm">
                        {landmark.name}
                      </h4>
                      <span className="bg-[#f0e8d8] dark:bg-[#3a3428] text-[#6f6652] dark:text-[#d8c5a7] px-2 py-1 rounded-full text-[10px]">
                        {landmark.type}
                      </span>
                    </div>
                    <p className="text-xs text-[#6f6652] dark:text-gray-400">
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
                <div className="bg-[#f0e8d8] dark:bg-[#3a3428] p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Phone className="w-8 h-8 text-[#6f6652] dark:text-[#d8c5a7]" />
                </div>
                <h3 className="text-lg font-semibold text-[#3a3428] dark:text-white mb-2">
                  Call Us
                </h3>
                <p className="text-[#6f6652] dark:text-gray-400 mb-4">
                  {displayContactInfo.phone}
                </p>
                <button
                  onClick={handleCall}
                  className="w-full bg-[#3a3428] text-[#f5f1e9] py-2 rounded-lg hover:bg-[#2c261c] transition-all font-medium"
                >
                  Call Now
                </button>
              </div>

              {/* Email */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className="bg-[#f0e8d8] dark:bg-[#3a3428] p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-[#6f6652] dark:text-[#d8c5a7]" />
                </div>
                <h3 className="text-lg font-semibold text-[#3a3428] dark:text-white mb-2">
                  Email Us
                </h3>
                <p className="text-[#6f6652] dark:text-gray-400 mb-4 text-sm">
                  {displayContactInfo.email}
                </p>
                <button
                  onClick={handleEmail}
                  className="w-full bg-[#3a3428] text-[#f5f1e9] py-2 rounded-lg hover:bg-[#2c261c] transition-all font-medium"
                >
                  Send Email
                </button>
              </div>

              {/* WhatsApp */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className="bg-[#f0e8d8] dark:bg-[#3a3428] p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#6f6652] dark:text-[#d8c5a7]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#3a3428] dark:text-white mb-2">
                  WhatsApp
                </h3>
                <p className="text-[#6f6652] dark:text-gray-400 mb-4">
                  {displayContactInfo.whatsapp}
                </p>
                <button
                  onClick={handleWhatsApp}
                  className="w-full bg-[#3a3428] text-[#f5f1e9] py-2 rounded-lg hover:bg-[#2c261c] transition-all font-medium"
                >
                  Message Us
                </button>
              </div>

              {/* Address */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className="bg-[#f0e8d8] dark:bg-[#3a3428] p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-[#6f6652] dark:text-[#d8c5a7]" />
                </div>
                <h3 className="text-lg font-semibold text-[#3a3428] dark:text-white mb-2">
                  Visit Us
                </h3>
                <p className="text-[#6f6652] dark:text-gray-400 mb-4 text-sm">
                  {displayContactInfo.address}
                </p>
                <button
                  onClick={handleDirections}
                  className="w-full bg-[#3a3428] text-[#f5f1e9] py-2 rounded-lg hover:bg-[#2c261c] transition-all font-medium"
                >
                  Get Directions
                </button>
              </div>
            </div>

            {/* Quick Contact */}
            <div className="bg-[#3a3428] rounded-2xl shadow-lg p-8 text-[#f5f1e9]">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Need Immediate Assistance?
                </h3>
                <p className="text-[#d8c5a7] mb-6 text-lg">
                  For urgent bookings or consultations, please contact us directly
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleCall}
                    className="bg-white text-[#3a3428] px-8 py-3 rounded-lg font-semibold hover:bg-[#f0e8d8] transition-colors"
                  >
                    Call {displayContactInfo.phone}
                  </button>
                  <button
                    onClick={handleWhatsApp}
                    className="bg-[#b5ad9d] text-[#3a3428] px-8 py-3 rounded-lg font-semibold hover:bg-[#c9c1b0] transition-colors"
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
                <div className="bg-[#f0e8d8] dark:bg-[#3a3428] p-4 rounded-xl">
                  <Clock className="w-8 h-8 text-[#6f6652] dark:text-[#d8c5a7]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#3a3428] dark:text-white mb-2">
                    Opening Hours
                  </h2>
                  <p className="text-[#6f6652] dark:text-gray-400">
                    We're here to help you look and feel your best
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6f6652]"></div>
                  <p className="mt-4 text-[#6f6652] dark:text-gray-400">Loading opening hours...</p>
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(openingHours).map(([key, dayInfo]) => (
                  <div
                    key={key}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      dayInfo.isOpen
                        ? 'border-[#d8c5a7] dark:border-[#5c5442] bg-[#f7f1e5] dark:bg-[#3a3428]/60'
                        : 'border-[#c9c1b0] dark:border-[#4c4536] bg-[#ebe3d4] dark:bg-[#2a241a]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[#3a3428] dark:text-white">
                        {dayInfo.day}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          dayInfo.isOpen
                            ? 'bg-[#e8e1d4] dark:bg-[#3a3428] text-[#6f6652] dark:text-[#d8c5a7]'
                            : 'bg-[#dcd2c0] dark:bg-[#2f281e] text-[#544c3d] dark:text-[#d8c5a7]'
                        }`}
                      >
                        {dayInfo.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                    <p className="text-[#6f6652] dark:text-gray-400 mt-2">
                      {dayInfo.hours}
                    </p>
                  </div>
                ))}
              </div>
              )}
            </div>

            {/* Booking CTA */}
            <div className="bg-[#3a3428] rounded-2xl shadow-lg p-8 text-[#f5f1e9] text-center">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Book Your Appointment?
              </h3>
              <p className="text-[#d8c5a7] mb-6 text-lg">
                Schedule your consultation during our convenient hours
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/book"
                  className="bg-white text-[#3a3428] px-8 py-3 rounded-lg font-semibold hover:bg-[#f0e8d8] transition-colors"
                >
                  Book Online
                </Link>
                <button
                  onClick={handleCall}
                  className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#3a3428] transition-colors"
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

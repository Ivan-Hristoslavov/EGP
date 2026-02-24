"use client";

import { useState } from 'react';
import { siteConfig } from "@/config/site";
import { typography, layout, textColors } from "@/config/typography";
import { MapPin, Phone, Mail, Clock, Navigation, Car, Train, Bus, ArrowLeft, ExternalLink } from "lucide-react";
import Link from 'next/link';
import { useSiteData } from "@/contexts/SiteDataContext";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Tabs, Tab } from "@heroui/react";
import { Spinner } from "@heroui/react";

const defaultFindUsText = {
  howToFindUs: "Our clinic is located in the heart of London's medical district, easily accessible by public transport and car.",
  howToReachUs: "We are conveniently located near major transport links and landmarks.",
};

export default function FindUsPage() {
  const [activeTab, setActiveTab] = useState<'location' | 'contact' | 'hours'>('location');
  const { contactInfo, openingHours, findUsData, loading } = useSiteData();

  // Use default values if data is still loading or not available (from env or DB)
  const displayContactInfo = contactInfo || {
    address: process.env.NEXT_PUBLIC_ADDRESS_FULL || "London, UK",
    phone: process.env.NEXT_PUBLIC_PHONE_NUMBER || "07944 24 20 79",
    email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "info@egpaesthetics.co.uk",
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || process.env.NEXT_PUBLIC_PHONE_NUMBER || "07944 24 20 79",
    googleMapsAddress: process.env.NEXT_PUBLIC_GOOGLE_MAPS_ADDRESS || process.env.NEXT_PUBLIC_ADDRESS_FULL || "London, UK"
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

  // Use nearby landmarks from database - ensure it's always an array
  const nearbyLandmarks = Array.isArray(displayFindUsData.nearbyLandmarks) 
    ? displayFindUsData.nearbyLandmarks 
    : [];


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
    <div className="min-h-screen bg-[#f5f1e9] dark:bg-gray-900 pt-24 pb-16">
      <div className={layout.container}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            as={Link}
            href="/"
            variant="light"
            startContent={<ArrowLeft className="w-5 h-5" />}
          >
            Back to Home
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className={`${typography.headingPage} text-[#3a3428] dark:text-white mb-6 font-playfair`}>
            Find Us
          </h1>
          <p className={`${typography.lead} text-[#6f6652] dark:text-gray-300 font-montserrat font-light max-w-3xl mx-auto`}>
            Visit our clinic in Wandsworth, South West London
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center items-center mb-8 w-full">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as 'location' | 'contact' | 'hours')}
            color="primary"
            className="w-full max-w-2xl mx-auto"
            classNames={{
              base: "w-full flex flex-col items-center",
              tabList: "gap-2 w-full relative rounded-lg p-1 bg-default-100/50 justify-center",
              cursor: "w-full bg-[#3a3428] dark:bg-[#d8c5a7]",
              tab: "flex-1 justify-center px-4 h-12",
              tabContent: "group-data-[selected=true]:text-white flex items-center justify-center gap-2"
            }}
          >
            <Tab
              key="location"
              title={
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>Location & Directions</span>
                </div>
              }
            />
            <Tab
              key="contact"
              title={
                <div className="flex items-center justify-center gap-2">
                  <Phone className="w-5 h-5" />
                  <span>Contact Info</span>
                </div>
              }
            />
            <Tab
              key="hours"
              title={
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>Opening Hours</span>
                </div>
              }
            />
          </Tabs>
        </div>

        {/* Location & Directions Tab */}
        {activeTab === 'location' && (
          <div className="space-y-8">
            {/* Address Card */}
            <Card shadow="lg">
              <CardBody className="p-8">
              <div className="flex items-start gap-6">
                <div className="bg-[#e8e1d4] dark:bg-[#3a3428] p-4 rounded-xl">
                  <MapPin className="w-8 h-8 text-[#6f6652] dark:text-[#d8c5a7]" />
                </div>
                <div className="flex-1">
                    <h2 className={`${typography.headingCard} text-foreground mb-4`}>
                    Our Location
                  </h2>
                    <p className={`${typography.body} text-default-600 mb-4`}>
                    {displayContactInfo.address}
                  </p>
                    <Button
                      onPress={handleDirections}
                      color="primary"
                      className="bg-[#3a3428] text-[#f5f1e9]"
                      startContent={<Navigation className="w-5 h-5" />}
                      endContent={<ExternalLink className="w-4 h-4" />}
                    >
                    Get Directions
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Interactive Google Map */}
            <Card shadow="lg">
              <CardHeader className="pb-0">
                <h3 className={`${typography.headingCard} text-foreground`}>
                Interactive Map
              </h3>
              </CardHeader>
              <CardBody className="p-8">
                <div className="rounded-xl overflow-hidden h-96 shadow-lg border border-divider">
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
                  <Button
                    onPress={handleDirections}
                    color="primary"
                    className="bg-[#3a3428] text-[#f5f1e9]"
                    startContent={<ExternalLink className="w-4 h-4" />}
                  >
                    Open in Google Maps
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* How to Find Us - only show when real data exists */}
            {displayFindUsData.howToFindUs && displayFindUsData.howToFindUs !== defaultFindUsText.howToFindUs && (
              <Card shadow="lg">
                <CardHeader>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                    How to Find Us
                  </h3>
                </CardHeader>
                <CardBody>
                  <p className="text-base sm:text-lg text-default-600 leading-relaxed">
                    {displayFindUsData.howToFindUs}
                  </p>
                </CardBody>
              </Card>
            )}

            {/* Transport Options - only show when real data exists */}
            {(transportOptions.length > 0 || (displayFindUsData.howToReachUs && displayFindUsData.howToReachUs !== defaultFindUsText.howToReachUs)) && (
              <Card shadow="lg">
                <CardHeader>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                    How to Reach Us
                  </h3>
                </CardHeader>
                <CardBody>
                  {displayFindUsData.howToReachUs && displayFindUsData.howToReachUs !== defaultFindUsText.howToReachUs && (
                    <p className="text-base sm:text-lg text-default-600 mb-6 leading-relaxed">
                      {displayFindUsData.howToReachUs}
                    </p>
                  )}
                  {transportOptions.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      {transportOptions.map((option, index) => (
                        <Card key={index} shadow="sm" className="hover:shadow-md transition-shadow">
                          <CardBody className="p-4 sm:p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="bg-[#f0e8d8] dark:bg-[#3a3428] p-2 rounded-lg">
                                {option.icon}
                              </div>
                              <h4 className="text-base sm:text-lg font-semibold text-foreground">
                                {option.type}
                              </h4>
                            </div>
                            <ul className="space-y-2">
                              {option.details.map((detail, detailIndex) => (
                                <li key={detailIndex} className="flex items-start gap-2 text-default-500">
                                  <div className="w-1.5 h-1.5 bg-[#9d8c6b] rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-xs sm:text-sm">{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            )}

            {/* Nearby Landmarks - only show when real data exists */}
            {nearbyLandmarks.length > 0 && (
              <Card shadow="lg">
                <CardHeader>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                    Nearby Landmarks
                  </h3>
                </CardHeader>
                <CardBody>
                  <p className="text-default-500 mb-6 text-xs sm:text-sm">
                    Our clinic at {displayContactInfo.address} is surrounded by some of London&apos;s most iconic locations:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {nearbyLandmarks.map((landmark, index) => (
                      <Card key={index} shadow="sm" className="hover:shadow-md transition-shadow">
                        <CardBody className="p-3 sm:p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-foreground text-xs sm:text-sm">
                              {landmark.name}
                            </h4>
                            <Chip
                              size="sm"
                              variant="flat"
                              className="bg-[#f0e8d8] dark:bg-[#3a3428] text-[#6f6652] dark:text-[#d8c5a7]"
                            >
                              {landmark.type}
                            </Chip>
                          </div>
                          <p className="text-xs text-default-500">
                            {landmark.distance}
                          </p>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        )}

        {/* Contact Info Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-8">
            {/* Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Phone */}
              <Card shadow="lg" className="hover:shadow-xl transition-shadow">
                <CardBody className="text-center p-6">
                <div className="bg-[#f0e8d8] dark:bg-[#3a3428] p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Phone className="w-8 h-8 text-[#6f6652] dark:text-[#d8c5a7]" />
                </div>
                  <h3 className={`${typography.headingSmall} text-foreground mb-2`}>
                  Call Us
                </h3>
                  <p className={`${typography.small} mb-4`}>
                  {displayContactInfo.phone}
                </p>
                  <Button
                    onPress={handleCall}
                    color="primary"
                    className="w-full bg-[#3a3428] text-[#f5f1e9]"
                >
                  Call Now
                  </Button>
                </CardBody>
              </Card>

              {/* Email */}
              <Card shadow="lg" className="hover:shadow-xl transition-shadow">
                <CardBody className="text-center p-6">
                <div className="bg-[#f0e8d8] dark:bg-[#3a3428] p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-[#6f6652] dark:text-[#d8c5a7]" />
                </div>
                  <h3 className={`${typography.headingSmall} text-foreground mb-2`}>
                  Email Us
                </h3>
                  <p className={`${typography.small} mb-4`}>
                  {displayContactInfo.email}
                </p>
                  <Button
                    onPress={handleEmail}
                    color="primary"
                    className="w-full bg-[#3a3428] text-[#f5f1e9]"
                >
                  Send Email
                  </Button>
                </CardBody>
              </Card>

              {/* WhatsApp */}
              <Card shadow="lg" className="hover:shadow-xl transition-shadow">
                <CardBody className="text-center p-6">
                <div className="bg-[#f0e8d8] dark:bg-[#3a3428] p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#6f6652] dark:text-[#d8c5a7]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </div>
                  <h3 className={`${typography.headingSmall} text-foreground mb-2`}>
                  WhatsApp
                </h3>
                  <p className={`${typography.small} mb-4`}>
                  {displayContactInfo.whatsapp}
                </p>
                  <Button
                    onPress={handleWhatsApp}
                    color="primary"
                    className="w-full bg-[#3a3428] text-[#f5f1e9]"
                >
                  Message Us
                  </Button>
                </CardBody>
              </Card>

              {/* Address */}
              <Card shadow="lg" className="hover:shadow-xl transition-shadow">
                <CardBody className="text-center p-6">
                <div className="bg-[#f0e8d8] dark:bg-[#3a3428] p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-[#6f6652] dark:text-[#d8c5a7]" />
                </div>
                  <h3 className={`${typography.headingSmall} text-foreground mb-2`}>
                  Visit Us
                </h3>
                  <p className={`${typography.small} mb-4`}>
                  {displayContactInfo.address}
                </p>
                  <Button
                    onPress={handleDirections}
                    color="primary"
                    className="w-full bg-[#3a3428] text-[#f5f1e9]"
                >
                  Get Directions
                  </Button>
                </CardBody>
              </Card>
            </div>

            {/* Quick Contact */}
            <Card className="bg-[#3a3428] text-[#f5f1e9]">
              <CardBody className="text-center p-8">
                <h3 className={`${typography.headingCard} mb-4`}>
                  Need Immediate Assistance?
                </h3>
                <p className={`${typography.body} text-[#d8c5a7] mb-6`}>
                  For urgent bookings or consultations, please contact us directly
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onPress={handleCall}
                    className="bg-white text-[#3a3428] hover:bg-[#f0e8d8]"
                  >
                    Call {displayContactInfo.phone}
                  </Button>
                  <Button
                    onPress={handleWhatsApp}
                    variant="flat"
                    className="bg-[#b5ad9d] text-[#3a3428] hover:bg-[#c9c1b0]"
                  >
                    WhatsApp Us
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Opening Hours Tab */}
        {activeTab === 'hours' && (
          <div className="space-y-8">
            {/* Opening Hours */}
            <Card shadow="lg">
              <CardHeader>
                <div className="flex items-center gap-6">
                <div className="bg-[#f0e8d8] dark:bg-[#3a3428] p-4 rounded-xl">
                  <Clock className="w-8 h-8 text-[#6f6652] dark:text-[#d8c5a7]" />
                </div>
                <div>
                    <h2 className={`${typography.headingCard} text-foreground mb-2`}>
                    Opening Hours
                  </h2>
                    <p className={typography.small}>
                    We're here to help you look and feel your best
                  </p>
                </div>
              </div>
              </CardHeader>
              <CardBody>
              {loading ? (
                <div className="text-center py-12">
                    <Spinner size="md" color="primary" />
                    <p className="mt-4 text-default-500">Loading opening hours...</p>
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(openingHours).map(([key, dayInfo]) => (
                      <Card
                    key={key}
                        shadow="sm"
                        className={dayInfo.isOpen
                        ? 'border-[#d8c5a7] dark:border-[#5c5442] bg-[#f7f1e5] dark:bg-[#3a3428]/60'
                          : 'border-[#c9c1b0] dark:border-[#4c4536] bg-[#ebe3d4] dark:bg-[#2a241a]/60'}
                  >
                        <CardBody className="p-4">
                    <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-foreground">
                        {dayInfo.day}
                      </h3>
                            <Chip
                              size="sm"
                              variant="flat"
                              color={dayInfo.isOpen ? 'success' : 'default'}
                              className={dayInfo.isOpen
                            ? 'bg-[#e8e1d4] dark:bg-[#3a3428] text-[#6f6652] dark:text-[#d8c5a7]'
                                : 'bg-[#dcd2c0] dark:bg-[#2f281e] text-[#544c3d] dark:text-[#d8c5a7]'}
                      >
                        {dayInfo.isOpen ? 'Open' : 'Closed'}
                            </Chip>
                    </div>
                          <p className="text-default-500 mt-2">
                      {dayInfo.hours}
                    </p>
                        </CardBody>
                      </Card>
                ))}
              </div>
              )}
              </CardBody>
            </Card>

            {/* Booking CTA */}
            <Card className="bg-[#3a3428] text-[#f5f1e9]">
              <CardBody className="text-center p-8">
              <h3 className={`${typography.headingCard} mb-4`}>
                Ready to Book Your Appointment?
              </h3>
              <p className={`${typography.body} text-[#d8c5a7] mb-6`}>
                Schedule your consultation during our convenient hours
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    as={Link}
                  href="/book"
                    className="bg-white text-[#3a3428] hover:bg-[#f0e8d8]"
                >
                  Book Online
                  </Button>
                  <Button
                    onPress={handleCall}
                    variant="bordered"
                    className="border-2 border-white text-white hover:bg-white hover:text-[#3a3428]"
                >
                  Call to Book
                  </Button>
              </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

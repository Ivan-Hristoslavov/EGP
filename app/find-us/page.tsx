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

// Default transport and landmarks when DB has no data – ensures icons always show
const defaultTransportOptions = [
  { type: "Tube/Underground", icon: <Train className="w-5 h-5" />, details: ["Streatham Station (Southern Railway) – ~10 min walk", "Tooting Station (Northern line) – ~15 min walk / ~5 min bus", "Balham Station (Northern line) – ~15 min walk / ~5 min bus"] },
  { type: "Bus", icon: <Bus className="w-5 h-5" />, details: ["Bus routes 118, 250 – Hassocks Road stop – 2 min walk", "Bus routes 57, 159 – Streatham High Road stop – ~5 min walk", "Bus routes 118, 250, 333 – Tooting Bec stop – ~8 min walk"] },
  { type: "Car/Parking", icon: <Car className="w-5 h-5" />, details: ["On-street parking – Available on Hassocks Road and surrounding streets", "Nearby car parks – ~3–5 min walk – Various options in the area", "Residential parking – Please check parking restrictions"] },
  { type: "Walking", icon: <Navigation className="w-5 h-5" />, details: ["~10 minutes from Streatham High Road", "~8 minutes from Tooting Bec Common", "~12 minutes from Streatham Common"] },
];
const defaultNearbyLandmarks: Array<{ name: string; type: string; distance: string }> = [
  { name: "Streatham Common", type: "Park", distance: "~12 min walk" },
  { name: "Tooting Bec Common", type: "Park", distance: "~8 min walk" },
  { name: "Streatham High Road", type: "Shopping", distance: "~10 min walk" },
  { name: "Tooting Broadway", type: "Shopping", distance: "~15 min walk / ~5 min bus" },
  { name: "Balham", type: "Area", distance: "~15 min walk / ~5 min bus" },
  { name: "Norbury Park", type: "Park", distance: "~20 min walk / ~10 min bus" },
];

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

  // Use transport options – fall back to defaults when DB has no data
  const transportOptionsToShow = transportOptions.length > 0 ? transportOptions : defaultTransportOptions;

  // Use nearby landmarks from database – fall back to defaults when empty
  const nearbyLandmarks = Array.isArray(displayFindUsData.nearbyLandmarks) && displayFindUsData.nearbyLandmarks.length > 0
    ? displayFindUsData.nearbyLandmarks
    : defaultNearbyLandmarks;


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
    <div className="min-h-screen bg-[#f5f1e9] dark:bg-gray-900 pt-16 sm:pt-20 pb-6 sm:pb-10">
      <div className={layout.container}>
        {/* Header - Back on left, Find Us centered */}
        <div className="relative flex items-center justify-between mb-2 sm:mb-4">
          <Button
            as={Link}
            href="/"
            variant="light"
            size="sm"
            startContent={<ArrowLeft className="w-4 h-4" />}
            className="text-sm font-medium text-[#3a3428] dark:text-gray-200 flex-shrink-0 z-10"
          >
            Back
          </Button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-base sm:text-xl md:text-2xl font-bold text-[#3a3428] dark:text-white font-playfair">
            Find Us
          </h1>
          <div className="w-14 sm:w-16" aria-hidden />
        </div>
        <p className={`${typography.lead} text-[#6f6652] dark:text-gray-300 font-montserrat font-light max-w-3xl mx-auto text-xs sm:text-sm text-center mb-3 sm:mb-4`}>
          Visit our clinic in Wandsworth, South West London
        </p>

        {/* Tabs - compact */}
        <div className="flex justify-center items-center mb-3 sm:mb-5 w-full px-1">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as 'location' | 'contact' | 'hours')}
            color="primary"
            className="w-full max-w-2xl mx-auto"
            classNames={{
              base: "w-full flex flex-col items-center",
              tabList: "gap-1 w-full relative rounded-lg p-1 bg-default-100/50 justify-center",
              cursor: "w-full bg-[#3a3428] dark:bg-[#d8c5a7]",
              tab: "flex-1 justify-center px-2 sm:px-3 h-9 sm:h-10 min-w-0",
              tabContent: "group-data-[selected=true]:text-white flex items-center justify-center gap-1 text-xs sm:text-sm"
            }}
          >
            <Tab
              key="location"
              title={
                <div className="flex items-center justify-center gap-1 sm:gap-2 truncate">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">Location</span>
                </div>
              }
            />
            <Tab
              key="contact"
              title={
                <div className="flex items-center justify-center gap-1 sm:gap-2 truncate">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">Contact</span>
                </div>
              }
            />
            <Tab
              key="hours"
              title={
                <div className="flex items-center justify-center gap-1 sm:gap-2 truncate">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">Hours</span>
                </div>
              }
            />
          </Tabs>
        </div>

        {/* Location & Directions Tab */}
        {activeTab === 'location' && (
          <div className="space-y-2 sm:space-y-4">
            {/* How to Find Us */}
            <Card shadow="md">
              <CardHeader className="px-3 sm:px-4 py-2 sm:py-3 pb-0">
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  How to Find Us
                </h3>
              </CardHeader>
              <CardBody className="pt-1 sm:pt-2 px-3 sm:px-4 pb-3 sm:pb-4">
                <p className="text-xs sm:text-sm text-default-600 leading-snug">
                  {displayFindUsData.howToFindUs || defaultFindUsText.howToFindUs}
                </p>
              </CardBody>
            </Card>

            {/* How to Reach Us & Transport */}
            <Card shadow="md">
              <CardHeader className="px-3 sm:px-4 py-2 sm:py-3 pb-0">
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  How to Reach Us
                </h3>
              </CardHeader>
              <CardBody className="pt-1 sm:pt-2 px-3 sm:px-4 pb-3 sm:pb-4">
                <p className="text-xs sm:text-sm text-default-600 mb-2 sm:mb-4 leading-snug">
                  {displayFindUsData.howToReachUs || defaultFindUsText.howToReachUs}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-2 sm:mt-3">
                  {transportOptionsToShow.map((option, index) => (
                      <Card key={index} shadow="sm" className="hover:shadow-md transition-shadow">
                        <CardBody className="p-2 sm:p-4">
                          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                            <div className="bg-[#f0e8d8] dark:bg-[#3a3428] p-1.5 rounded-md flex-shrink-0">
                              {option.icon}
                            </div>
                            <h4 className="text-xs sm:text-sm font-semibold text-foreground">
                              {option.type}
                            </h4>
                          </div>
                          <ul className="space-y-0.5 sm:space-y-1">
                            {option.details.map((detail, detailIndex) => (
                              <li key={detailIndex} className="flex items-start gap-1.5 text-default-500">
                                <div className="w-1 h-1 bg-[#9d8c6b] rounded-full mt-1.5 flex-shrink-0"></div>
                                <span className="text-[11px] sm:text-xs leading-snug">{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </CardBody>
                      </Card>
                    ))}
                </div>
              </CardBody>
            </Card>

            {/* Nearby Landmarks */}
            <Card shadow="md">
              <CardHeader className="px-3 sm:px-4 py-2 sm:py-3 pb-0">
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  Nearby Landmarks
                </h3>
              </CardHeader>
              <CardBody className="pt-1 sm:pt-2 px-3 sm:px-4 pb-3 sm:pb-4">
                {nearbyLandmarks.length > 0 ? (
                  <>
                    <p className="text-default-500 mb-2 sm:mb-4 text-[11px] sm:text-xs leading-snug">
                      Our clinic at {displayContactInfo.address} is surrounded by some of London&apos;s most iconic locations:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                      {nearbyLandmarks.map((landmark, index) => (
                        <Card key={index} shadow="sm" className="hover:shadow-md transition-shadow">
                          <CardBody className="p-2 sm:p-3">
                            <div className="flex items-center justify-between gap-1 mb-0.5 sm:mb-1">
                              <h4 className="font-semibold text-foreground text-[11px] sm:text-xs leading-tight line-clamp-2">
                                {landmark.name}
                              </h4>
                              <Chip
                                size="sm"
                                variant="flat"
                                className="bg-[#f0e8d8] dark:bg-[#3a3428] text-[#6f6652] dark:text-[#d8c5a7] text-[10px]"
                              >
                                {landmark.type}
                              </Chip>
                            </div>
                            <p className="text-[10px] sm:text-[11px] text-default-500">
                              {landmark.distance}
                            </p>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-default-500">
                    Points of interest near our clinic will be listed here.
                  </p>
                )}
              </CardBody>
            </Card>

            {/* Address Card */}
            <Card shadow="md">
              <CardBody className="p-3 sm:p-5">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 text-center sm:text-left">
                  <div className="bg-[#e8e1d4] dark:bg-[#3a3428] p-2 sm:p-3 rounded-lg flex-shrink-0">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[#6f6652] dark:text-[#d8c5a7]" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm sm:text-base font-bold text-foreground mb-2">
                      Our Location
                    </h2>
                    <p className="text-xs sm:text-sm text-default-600 mb-3">
                      {displayContactInfo.address}
                    </p>
                    <Button
                      onPress={handleDirections}
                      color="primary"
                      size="sm"
                      className="bg-[#3a3428] text-[#f5f1e9]"
                      startContent={<Navigation className="w-4 h-4" />}
                      endContent={<ExternalLink className="w-3.5 h-3.5" />}
                    >
                      Get Directions
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Interactive Google Map */}
            <Card shadow="md">
              <CardHeader className="pb-0 px-3 sm:px-4 py-2 sm:py-3">
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  Interactive Map
                </h3>
              </CardHeader>
              <CardBody className="p-3 sm:p-5">
                <div className="rounded-lg overflow-hidden h-36 sm:h-72 shadow border border-divider">
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
                <div className="mt-2 flex justify-center">
                  <Button
                    onPress={handleDirections}
                    size="sm"
                    color="primary"
                    className="bg-[#3a3428] text-[#f5f1e9]"
                    startContent={<ExternalLink className="w-3.5 h-3.5" />}
                  >
                    Open in Google Maps
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Contact Info Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-3 sm:space-y-5 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              {/* Phone */}
              <Card shadow="sm" className="border border-[#e4d9c8] dark:border-gray-700 hover:shadow-md transition-shadow">
                <CardBody className="text-center p-3 sm:p-4">
                  <div className="bg-[#e8e1d4] dark:bg-[#3a3428] p-2 rounded-full w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1.5 flex items-center justify-center">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-[#6f6652] dark:text-[#d8c5a7]" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-0.5">Call Us</h3>
                  <p className="text-[11px] sm:text-xs text-default-600 mb-2 break-all">{displayContactInfo.phone}</p>
                  <Button size="sm" onPress={handleCall} className="bg-[#3a3428] text-[#f5f1e9] hover:bg-[#4a4438]">
                    Call Now
                  </Button>
                </CardBody>
              </Card>

              {/* Email */}
              <Card shadow="sm" className="border border-[#e4d9c8] dark:border-gray-700 hover:shadow-md transition-shadow">
                <CardBody className="text-center p-3 sm:p-4">
                  <div className="bg-[#e8e1d4] dark:bg-[#3a3428] p-2 rounded-full w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1.5 flex items-center justify-center">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-[#6f6652] dark:text-[#d8c5a7]" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-0.5">Email Us</h3>
                  <p className="text-[11px] sm:text-xs text-default-600 mb-2 break-all line-clamp-2">{displayContactInfo.email}</p>
                  <Button size="sm" onPress={handleEmail} className="bg-[#3a3428] text-[#f5f1e9] hover:bg-[#4a4438]">
                    Send Email
                  </Button>
                </CardBody>
              </Card>

              {/* WhatsApp */}
              <Card shadow="sm" className="border border-[#e4d9c8] dark:border-gray-700 hover:shadow-md transition-shadow">
                <CardBody className="text-center p-3 sm:p-4">
                  <div className="bg-[#e8e1d4] dark:bg-[#3a3428] p-2 rounded-full w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1.5 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#6f6652] dark:text-[#d8c5a7]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-0.5">WhatsApp</h3>
                  <p className="text-[11px] sm:text-xs text-default-600 mb-2">{displayContactInfo.whatsapp}</p>
                  <Button size="sm" onPress={handleWhatsApp} className="bg-[#3a3428] text-[#f5f1e9] hover:bg-[#4a4438]">
                    Message Us
                  </Button>
                </CardBody>
              </Card>

              {/* Address */}
              <Card shadow="sm" className="border border-[#e4d9c8] dark:border-gray-700 hover:shadow-md transition-shadow">
                <CardBody className="text-center p-3 sm:p-4">
                  <div className="bg-[#e8e1d4] dark:bg-[#3a3428] p-2 rounded-full w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1.5 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[#6f6652] dark:text-[#d8c5a7]" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-0.5">Visit Us</h3>
                  <p className="text-[11px] sm:text-xs text-default-600 mb-2">{displayContactInfo.address}</p>
                  <Button size="sm" onPress={handleDirections} className="bg-[#3a3428] text-[#f5f1e9] hover:bg-[#4a4438]">
                    Get Directions
                  </Button>
                </CardBody>
              </Card>
            </div>

            {/* Quick Contact */}
            <Card className="bg-[#3a3428] text-[#f5f1e9] shadow-sm">
              <CardBody className="text-center p-3 sm:p-5">
                <h3 className="text-sm sm:text-base font-bold mb-2">Need Immediate Assistance?</h3>
                <p className="text-[#d8c5a7] text-xs sm:text-sm mb-3">
                  For urgent bookings or consultations, please contact us directly
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button size="sm" onPress={handleCall} className="bg-white text-[#3a3428] hover:bg-[#f0e8d8]">
                    Call {displayContactInfo.phone}
                  </Button>
                  <Button size="sm" onPress={handleWhatsApp} className="bg-white text-[#3a3428] hover:bg-[#f0e8d8]">
                    WhatsApp Us
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Opening Hours Tab */}
        {activeTab === 'hours' && (
          <div className="space-y-3 sm:space-y-5 max-w-2xl mx-auto">
            <Card shadow="sm" className="border border-[#e4d9c8] dark:border-gray-700">
              <CardHeader className="flex flex-col items-center justify-center text-center pb-0 px-3 sm:px-4 py-2 sm:py-3">
                <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                  <div className="bg-[#e8e1d4] dark:bg-[#3a3428] p-2 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[#6f6652] dark:text-[#d8c5a7]" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-sm sm:text-base font-bold text-foreground">Opening Hours</h2>
                    <p className="text-[11px] sm:text-xs text-default-500 mt-0.5">We&apos;re here to help you look and feel your best</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-3 px-3 sm:px-4">
                {loading ? (
                  <div className="text-center py-6">
                    <Spinner size="sm" color="primary" />
                    <p className="mt-2 text-xs text-default-500">Loading opening hours...</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {Object.entries(openingHours).map(([key, dayInfo]) => (
                      <div
                        key={key}
                        className={`flex items-center justify-center gap-2 sm:gap-4 py-2 px-3 rounded-md ${
                          dayInfo.isOpen
                            ? "bg-[#f7f1e5] dark:bg-[#3a3428]/40"
                            : "bg-[#ebe3d4]/60 dark:bg-[#2a241a]/40"
                        }`}
                      >
                        <span className="font-medium text-foreground w-20 sm:w-24 text-center text-xs sm:text-sm">{dayInfo.day}</span>
                        <span className="text-xs text-default-600 text-center min-w-[7rem] sm:min-w-[8rem]">{dayInfo.hours}</span>
                        <Chip
                          size="sm"
                          variant="flat"
                          className={`flex-shrink-0 text-[10px] ${
                            dayInfo.isOpen
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {dayInfo.isOpen ? "Open" : "Closed"}
                        </Chip>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Booking CTA */}
            <Card className="bg-[#3a3428] text-[#f5f1e9] shadow-sm">
              <CardBody className="text-center p-3 sm:p-5">
                <h3 className="text-sm sm:text-base font-bold mb-2">Ready to Book Your Appointment?</h3>
                <p className="text-[#d8c5a7] text-xs sm:text-sm mb-3">
                  Schedule your consultation during our convenient hours
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button as={Link} href="/book" size="sm" className="bg-white text-[#3a3428] hover:bg-[#f0e8d8]">
                    Book Online
                  </Button>
                  <Button
                    size="sm"
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

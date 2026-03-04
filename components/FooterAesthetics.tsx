"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle,
  Instagram, 
  Facebook, 
  Youtube,
  Heart
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { useAdminProfile, useAdminProfileContext } from "@/components/AdminProfileContext";
import { useSocialLinks } from "@/hooks/useSocialLinks";

type WorkingHoursData = {
  [key: string]: {
    isOpen: boolean;
    open: string | null;
    close: string | null;
  };
};

export default function FooterAesthetics() {
  const currentYear = new Date().getFullYear();
  const [workingHours, setWorkingHours] = useState<WorkingHoursData | null>(null);
  const [loadingHours, setLoadingHours] = useState(true);
  const [isPressPageEnabled, setIsPressPageEnabled] = useState(true); // Default to true
  const adminProfile = useAdminProfile();
  const { loading: profileLoading } = useAdminProfileContext();
  const { socialLinks } = useSocialLinks();

  // Get contact info from admin profile, fallback to siteConfig
  const contactPhone = adminProfile?.phone || siteConfig.contact.phone;
  const contactEmail = adminProfile?.business_email || adminProfile?.email || siteConfig.contact.email;
  const contactWhatsapp = (adminProfile as { whatsapp?: string } | null)?.whatsapp || siteConfig.contact.whatsapp;
  const contactAddress = adminProfile?.company_address || siteConfig.contact.address.full || `${siteConfig.contact.address.city}, ${siteConfig.contact.address.country}`;

  useEffect(() => {
    // Fetch working hours from public API
    const fetchWorkingHours = async () => {
      try {
        const response = await fetch('/api/working-hours');
        if (response.ok) {
          const data = await response.json();
          if (data.normalized) {
            setWorkingHours(data.normalized);
          }
        }
      } catch (error) {
        console.error('Error fetching working hours:', error);
      } finally {
        setLoadingHours(false);
      }
    };

    fetchWorkingHours();
  }, []);

  // Fetch press page enabled setting
  useEffect(() => {
    const fetchPressPageSetting = async () => {
      try {
        const response = await fetch('/api/admin/press-settings');
        if (response.ok) {
          const data = await response.json();
          setIsPressPageEnabled(data.enabled !== false); // Default to true if not set
        }
      } catch (error) {
        console.error('Failed to fetch press page setting:', error);
        // Default to true on error
        setIsPressPageEnabled(true);
      }
    };

    fetchPressPageSetting();
  }, []);

  // Helper function to convert 24-hour time to 12-hour format
  const formatTime12Hour = (time24: string | null): string => {
    if (!time24) return "Closed";
    
    // Handle format like "10:00:00" or "10:00"
    const parts = time24.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1] ? parseInt(parts[1], 10) : 0;
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    // Always show minutes if they exist, otherwise just show hour
    if (minutes === 0) {
      return `${hours12}:00 ${period}`;
    }
    
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Helper function to format hours
  const formatHours = (day: string) => {
    if (!workingHours || !workingHours[day]) {
      // Fallback to siteConfig
      const dayConfig = siteConfig.businessHours[day as keyof typeof siteConfig.businessHours];
      if (dayConfig && dayConfig.isOpen) {
        return `${dayConfig.open} - ${dayConfig.close}`;
      }
      return "Closed";
    }

    const dayHours = workingHours[day];
    if (dayHours.isOpen && dayHours.open && dayHours.close) {
      const openTime = formatTime12Hour(dayHours.open);
      const closeTime = formatTime12Hour(dayHours.close);
      return `${openTime} - ${closeTime}`;
    }
    return "Closed";
  };

  // Helper to check if day is open
  const isDayOpen = (day: string) => {
    if (!workingHours || !workingHours[day]) {
      const dayConfig = siteConfig.businessHours[day as keyof typeof siteConfig.businessHours];
      return dayConfig?.isOpen || false;
    }
    return workingHours[day].isOpen;
  };

  // Helper function to get day name with proper capitalization
  const getDayName = (dayKey: string): string => {
    const dayNames: Record<string, string> = {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday'
    };
    return dayNames[dayKey] || dayKey;
  };

  // Function to group consecutive days with the same hours
  const getGroupedWorkingHours = () => {
    if (!workingHours) return [];

    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const groups: Array<{ days: string[], hours: string, isOpen: boolean }> = [];
    
    let currentGroup: { days: string[], hours: string, isOpen: boolean } | null = null;

    dayOrder.forEach((dayKey) => {
      const dayData = workingHours[dayKey];
      if (!dayData) return;

      const hours = formatHours(dayKey);
      const isOpen = !!(dayData.isOpen && dayData.open && dayData.close);

      // Check if this day matches the current group
      if (currentGroup && currentGroup.hours === hours && currentGroup.isOpen === isOpen) {
        // Add to current group
        currentGroup.days.push(dayKey);
      } else {
        // Start a new group
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = {
          days: [dayKey],
          hours,
          isOpen
        };
      }
    });

    // Add the last group
    if (currentGroup) {
      groups.push(currentGroup);
    }

    // Format day ranges
    return groups.map(group => {
      let dayLabel = '';
      if (group.days.length === 1) {
        dayLabel = getDayName(group.days[0]);
      } else if (group.days.length === 2) {
        dayLabel = `${getDayName(group.days[0])} - ${getDayName(group.days[1])}`;
      } else {
        // Format like "Monday - Wednesday"
        const firstDay = getDayName(group.days[0]);
        const lastDay = getDayName(group.days[group.days.length - 1]);
        dayLabel = `${firstDay} - ${lastDay}`;
      }

      return {
        label: dayLabel,
        hours: group.hours,
        isOpen: group.isOpen
      };
    });
  };

  const groupedHours = getGroupedWorkingHours();

  return (
    <footer className="relative bg-[#ddd5c3] dark:bg-gray-900 text-gray-900 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700">
      <div className="relative">
        {/* Main Footer Content - 6 sections: EGP, Contact Us, Opening Hours, Quick Links, Follow Us, Legal */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-6">
            {/* 1. EGP (site name, tagline, description from config) - first in order */}
            <div className="space-y-3 order-1 pb-6 border-b border-gray-300 dark:border-gray-600 sm:border-b-0 sm:pb-0">
              <h2 className="text-base font-bold text-gray-900 dark:text-white text-center">
                {siteConfig.shortName}
              </h2>
              <p className="text-xs text-gray-700 dark:text-gray-400 font-semibold text-center">
                {siteConfig.tagline}
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-400 leading-relaxed text-left">
                {siteConfig.description}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">
                  <div className="w-3 h-3 bg-green-500 rounded-full shrink-0" />
                  <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">Certified</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">
                  <div className="w-3 h-3 bg-blue-500 rounded-full shrink-0" />
                  <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">Insured</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">
                  <div className="w-3 h-3 bg-purple-500 rounded-full shrink-0" />
                  <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">Expert</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">
                  <div className="w-3 h-3 bg-amber-500 rounded-full shrink-0" />
                  <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">5★ Rated</span>
                </div>
              </div>
            </div>

            {/* 2. Contact Us - second */}
            <div className="space-y-3 order-2 pb-6 border-b border-gray-300 dark:border-gray-600 sm:border-b-0 sm:pb-0">
              <h3 className="text-base font-bold text-gray-900 dark:text-white text-center">
                Contact Us
              </h3>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-left">
                <li>
                  {profileLoading ? (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                      <div className="h-3 w-20 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                    </div>
                  ) : (
                    <a href={`tel:${contactPhone}`} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-400 hover:text-[#9d9585] dark:hover:text-[#c9c1b0]">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="break-all">{contactPhone}</span>
                    </a>
                  )}
                </li>
                <li>
                  {profileLoading ? (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                      <div className="h-3 w-24 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                    </div>
                  ) : (
                    <a href={`mailto:${contactEmail}`} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-400 hover:text-[#9d9585] dark:hover:text-[#c9c1b0]">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="break-all">{contactEmail}</span>
                    </a>
                  )}
                </li>
                <li>
                  {profileLoading ? (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                      <div className="h-3 w-16 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                    </div>
                  ) : (
                    <a href={`https://wa.me/${contactWhatsapp.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-400 hover:text-[#9d9585] dark:hover:text-[#c9c1b0]" aria-label="WhatsApp">
                      <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </li>
                <li className="col-span-2">
                  {profileLoading ? (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-400 mt-0.5" />
                      <div className="space-y-1">
                        <div className="h-3 w-28 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                        <div className="h-3 w-20 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-left text-xs text-gray-700 dark:text-gray-400">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        {contactAddress.split(',').map((part: string, i: number) => (
                          <div key={i}>{part.trim()}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              </ul>
            </div>

            {/* 3. Opening Hours */}
            <div className="space-y-3 order-3 pb-6 border-b border-gray-300 dark:border-gray-600 sm:border-b-0 sm:pb-0">
              <h3 className="text-base font-bold text-gray-900 dark:text-white text-center">
                Opening Hours
              </h3>
              <ul className="space-y-1 text-left text-xs text-gray-700 dark:text-gray-400">
                {loadingHours ? (
                  <li>Loading hours...</li>
                ) : groupedHours.length === 0 ? (
                  <li>No hours available</li>
                ) : (
                  groupedHours.map((group, i) => (
                    <li key={i} className="flex justify-between gap-3">
                      <span>{group.label}:</span>
                      <span className={`font-medium shrink-0 ${group.isOpen ? 'text-gray-900 dark:text-white' : ''}`}>{group.hours}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* 4. Quick Links - evenly distributed */}
            <div className="space-y-3 order-4 pb-6 border-b border-gray-300 dark:border-gray-600 sm:border-b-0 sm:pb-0">
              <h3 className="text-base font-bold text-gray-900 dark:text-white text-center">
                Quick Links
              </h3>
              <ul className="flex flex-wrap justify-evenly gap-x-4 gap-y-2.5 text-center sm:justify-between sm:gap-x-6">
                <li><Link href="/book" className="text-xs text-gray-700 dark:text-gray-400 hover:text-[#9d9585] dark:hover:text-[#c9c1b0]">Book Appointment</Link></li>
                <li><Link href="/services" className="text-xs text-gray-700 dark:text-gray-400 hover:text-[#9d9585] dark:hover:text-[#c9c1b0]">Our Services</Link></li>
                <li><Link href="/conditions" className="text-xs text-gray-700 dark:text-gray-400 hover:text-[#9d9585] dark:hover:text-[#c9c1b0]">Conditions We Treat</Link></li>
                <li><Link href="/about" className="text-xs text-gray-700 dark:text-gray-400 hover:text-[#9d9585] dark:hover:text-[#c9c1b0]">About Us</Link></li>
                <li><Link href="/blog" className="text-xs text-gray-700 dark:text-gray-400 hover:text-[#9d9585] dark:hover:text-[#c9c1b0]">Blog</Link></li>
                <li><Link href="/find-us" className="text-xs text-gray-700 dark:text-gray-400 hover:text-[#9d9585] dark:hover:text-[#c9c1b0]">Find Us</Link></li>
                {isPressPageEnabled && (
                  <li><Link href="/press" className="text-xs text-gray-700 dark:text-gray-400 hover:text-[#9d9585] dark:hover:text-[#c9c1b0]">Awards & Press</Link></li>
                )}
              </ul>
            </div>

            {/* 5. Follow Us */}
            <div className="space-y-3 order-5 pb-6 border-b border-gray-300 dark:border-gray-600 sm:border-b-0 sm:pb-0">
              <h3 className="text-base font-bold text-gray-900 dark:text-white text-center">
                Follow Us
              </h3>
              <div className="flex gap-2 flex-wrap justify-center">
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700" aria-label="Instagram">
                    <Instagram className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </a>
                )}
                {socialLinks.facebook && (
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700" aria-label="Facebook">
                    <Facebook className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </a>
                )}
                {socialLinks.youtube && (
                  <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700" aria-label="YouTube">
                    <Youtube className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </a>
                )}
                {socialLinks.tiktok && (
                  <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700" aria-label="TikTok">
                    <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* 6. Legal - last section before copyright */}
            <div className="space-y-3 order-6">
              <h3 className="text-base font-bold text-gray-900 dark:text-white text-center">
                Legal
              </h3>
              <p className="text-xs text-gray-700 dark:text-gray-400 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center">
                <Link href="/terms" className="hover:text-[#9d9585] dark:hover:text-[#c9c1b0]">Terms</Link>
                <span className="text-gray-400 dark:text-gray-500">·</span>
                <Link href="/privacy" className="hover:text-[#9d9585] dark:hover:text-[#c9c1b0]">Privacy</Link>
                <span className="text-gray-400 dark:text-gray-500">·</span>
                <Link href="/gdpr" className="hover:text-[#9d9585] dark:hover:text-[#c9c1b0]">GDPR</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar - copyright last on mobile */}
        <div className="border-t border-gray-400 dark:border-gray-700">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <p className="text-xs text-gray-600 dark:text-gray-500 text-center sm:order-2 sm:text-left order-1">
                Made with{" "}
                <Heart className="w-3 h-3 inline text-red-500 dark:text-red-400 animate-pulse" fill="currentColor" />{" "}
                for beautiful transformations
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-500 text-center sm:order-3 sm:text-right order-2">
                Developed by{" "}
                <a
                  href="https://serenity.rapid-frame.co.uk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#9d9585] dark:text-[#c9c1b0] hover:text-[#b5ad9d] dark:hover:text-[#ddd5c3] transition-colors font-semibold"
                >
                  Serenity Web Studio
                </a>
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-400 text-center sm:order-1 sm:text-left order-3">
                © {currentYear} <span className="font-bold text-gray-900 dark:text-white">{siteConfig.name}</span>. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

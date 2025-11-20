"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Instagram, 
  Facebook, 
  Youtube,
  Heart
} from "lucide-react";
import { siteConfig } from "@/config/site";

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
      return `${dayHours.open} - ${dayHours.close}`;
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

  // Get Monday-Friday hours (assuming they're the same)
  const mondayFridayHours = formatHours('monday');
  const saturdayHours = formatHours('saturday');
  const sundayHours = formatHours('sunday');
  const isSundayOpen = isDayOpen('sunday');

  return (
    <footer className="relative bg-[#ddd5c3] dark:bg-gray-900 text-gray-900 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700">
      <div className="relative">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Column 1: Brand & Description */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {siteConfig.shortName}
                </h2>
                <p className="text-sm text-gray-700 dark:text-gray-400 font-semibold">
                  {siteConfig.tagline}
                </p>
              </div>
              
              <p className="text-gray-700 dark:text-gray-400 text-sm leading-relaxed">
                Premier aesthetic clinic in London offering advanced facial treatments, 
                anti-wrinkle injections, dermal fillers, and body contouring.
              </p>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Certified</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Insured</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
                  <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Expert</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
                  <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">5★ Rated</span>
                </div>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Quick Links
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link 
                    href="/services" 
                    className="text-gray-700 dark:text-gray-400 hover:text-[#9d9585] dark:hover:text-[#c9c1b0] transition-colors text-sm"
                  >
                    All Treatments
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/services/face" 
                    className="text-gray-700 dark:text-gray-400 hover:text-[#9d9585] dark:hover:text-[#c9c1b0] transition-colors text-sm"
                  >
                    Face Treatments
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/services/anti-wrinkle" 
                    className="text-gray-700 dark:text-gray-400 hover:text-[#9d9585] dark:hover:text-[#c9c1b0] transition-colors text-sm"
                  >
                    Anti-Wrinkle Injections
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/services/fillers" 
                    className="text-gray-700 dark:text-gray-400 hover:text-[#9d9585] dark:hover:text-[#c9c1b0] transition-colors text-sm"
                  >
                    Dermal Fillers
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/services/body" 
                    className="text-gray-700 dark:text-gray-400 hover:text-[#9d9585] dark:hover:text-[#c9c1b0] transition-colors text-sm"
                  >
                    Body Treatments
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/about" 
                    className="text-gray-700 dark:text-gray-400 hover:text-[#9d9585] dark:hover:text-[#c9c1b0] transition-colors text-sm"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/blog" 
                    className="text-gray-700 dark:text-gray-400 hover:text-[#9d9585] dark:hover:text-[#c9c1b0] transition-colors text-sm"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Contact Us
              </h3>
              <ul className="space-y-3">
                <li>
                  <a 
                    href={`tel:${siteConfig.contact.phone}`}
                    className="flex items-center gap-3 text-gray-700 dark:text-gray-400 hover:text-[#9d9585] dark:hover:text-[#c9c1b0] transition-colors text-sm group"
                  >
                    <Phone className="w-5 h-5 flex-shrink-0 text-gray-600 dark:text-gray-500" />
                    <span>{siteConfig.contact.phone}</span>
                  </a>
                </li>
                <li>
                  <a 
                    href={`mailto:${siteConfig.contact.email}`}
                    className="flex items-center gap-3 text-gray-700 dark:text-gray-400 hover:text-[#9d9585] dark:hover:text-[#c9c1b0] transition-colors text-sm group"
                  >
                    <Mail className="w-5 h-5 flex-shrink-0 text-gray-600 dark:text-gray-500" />
                    <span>{siteConfig.contact.email}</span>
                  </a>
                </li>
                <li>
                  <div className="flex items-start gap-3 text-gray-700 dark:text-gray-400 text-sm">
                    <MapPin className="w-5 h-5 flex-shrink-0 text-gray-600 dark:text-gray-500 mt-0.5" />
                    <div>
                      {siteConfig.contact.address.street && <div>{siteConfig.contact.address.street}</div>}
                      {siteConfig.contact.address.postcode 
                        ? <div>{siteConfig.contact.address.city}, {siteConfig.contact.address.postcode}<br />{siteConfig.contact.address.country}</div>
                        : <div>{siteConfig.contact.address.city}, {siteConfig.contact.address.country}</div>
                      }
                    </div>
                  </div>
                </li>
              </ul>

              {/* Business Hours */}
              <div className="pt-4 border-t border-gray-400 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-gray-700 dark:text-gray-400" />
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Opening Hours</h4>
                </div>
                <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-400">
                  {loadingHours ? (
                    <li className="text-gray-500 dark:text-gray-500">Loading hours...</li>
                  ) : (
                    <>
                      <li className="flex justify-between">
                        <span>Monday - Friday:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {mondayFridayHours}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Saturday:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {saturdayHours}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Sunday:</span>
                        <span className="text-gray-700 dark:text-gray-400 font-medium">
                          {sundayHours}
                        </span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Column 4: Social & Newsletter */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Follow Us
                </h3>
                <div className="flex gap-3">
                  <a
                    href={siteConfig.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  </a>
                  <a
                    href={siteConfig.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  </a>
                  <a
                    href={siteConfig.social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  </a>
                  {siteConfig.social.tiktok && (
                    <a
                      href={siteConfig.social.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow"
                      aria-label="TikTok"
                    >
                      <svg
                        className="w-6 h-6 text-gray-700 dark:text-gray-300"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>

              {/* Legal Links */}
              <div className="pt-4 border-t border-gray-400 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Legal</h4>
                <ul className="space-y-2">
                  <li>
                    <Link 
                      href="/terms" 
                      className="text-xs text-gray-700 dark:text-gray-400 hover:text-[#9d9585] dark:hover:text-[#c9c1b0] transition-colors"
                    >
                      Terms & Conditions
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/privacy" 
                      className="text-xs text-gray-700 dark:text-gray-400 hover:text-[#9d9585] dark:hover:text-[#c9c1b0] transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-400 dark:border-gray-700">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-700 dark:text-gray-400 text-center sm:text-left">
                © {currentYear} <span className="font-bold text-gray-900 dark:text-white">{siteConfig.name}</span>. All rights reserved.
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-500 text-center sm:text-right">
                Made with{" "}
                <Heart className="w-3 h-3 inline text-red-500 dark:text-red-400 animate-pulse" fill="currentColor" />{" "}
                for beautiful transformations
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-500 text-center sm:text-right mt-2">
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
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

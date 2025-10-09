"use client";

import Link from "next/link";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Instagram, 
  Facebook, 
  Youtube,
  Heart,
  Shield,
  Award,
  Users
} from "lucide-react";
import { siteConfig } from "@/config/site";

export default function FooterAesthetics() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-black dark:via-gray-900 dark:to-black text-white">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none"></div>
      
      <div className="relative">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Column 1: Brand & Description */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {siteConfig.shortName}
                </h2>
                <p className="text-sm text-rose-300 font-semibold">
                  {siteConfig.tagline}
                </p>
              </div>
              
              <p className="text-gray-400 text-sm leading-relaxed">
                Premier aesthetic clinic in London offering advanced facial treatments, 
                anti-wrinkle injections, dermal fillers, and body contouring.
              </p>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-lg border border-rose-500/30">
                  <Shield className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-semibold text-rose-300">Certified</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-lg border border-purple-500/30">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-semibold text-purple-300">Award Winning</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-lg border border-pink-500/30">
                  <Users className="w-4 h-4 text-pink-400" />
                  <span className="text-xs font-semibold text-pink-300">5000+ Clients</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-lg border border-amber-500/30">
                  <Heart className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-300">5★ Rated</span>
                </div>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
                Quick Links
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link 
                    href="/services" 
                    className="text-gray-400 hover:text-rose-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 group-hover:scale-150 transition-transform"></span>
                    All Treatments
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/services/face" 
                    className="text-gray-400 hover:text-pink-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 group-hover:scale-150 transition-transform"></span>
                    Face Treatments
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/services/anti-wrinkle" 
                    className="text-gray-400 hover:text-purple-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 group-hover:scale-150 transition-transform"></span>
                    Anti-Wrinkle Injections
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/services/fillers" 
                    className="text-gray-400 hover:text-fuchsia-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 group-hover:scale-150 transition-transform"></span>
                    Dermal Fillers
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/services/body" 
                    className="text-gray-400 hover:text-rose-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 group-hover:scale-150 transition-transform"></span>
                    Body Treatments
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/about" 
                    className="text-gray-400 hover:text-amber-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:scale-150 transition-transform"></span>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/blog" 
                    className="text-gray-400 hover:text-violet-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 group-hover:scale-150 transition-transform"></span>
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                Contact Us
              </h3>
              <ul className="space-y-3">
                <li>
                  <a 
                    href={`tel:${siteConfig.contact.phone}`}
                    className="flex items-start gap-3 text-gray-400 hover:text-rose-400 transition-colors text-sm group"
                  >
                    <Phone className="w-5 h-5 flex-shrink-0 text-rose-500 group-hover:scale-110 transition-transform" />
                    <span>{siteConfig.contact.phone}</span>
                  </a>
                </li>
                <li>
                  <a 
                    href={`mailto:${siteConfig.contact.email}`}
                    className="flex items-start gap-3 text-gray-400 hover:text-pink-400 transition-colors text-sm group"
                  >
                    <Mail className="w-5 h-5 flex-shrink-0 text-pink-500 group-hover:scale-110 transition-transform" />
                    <span className="break-all">{siteConfig.contact.email}</span>
                  </a>
                </li>
                <li>
                  <div className="flex items-start gap-3 text-gray-400 text-sm">
                    <MapPin className="w-5 h-5 flex-shrink-0 text-purple-500" />
                    <span>
                      {siteConfig.contact.address.street}<br />
                      {siteConfig.contact.address.city}, {siteConfig.contact.address.postcode}<br />
                      {siteConfig.contact.address.country}
                    </span>
                  </div>
                </li>
              </ul>

              {/* Business Hours */}
              <div className="pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <h4 className="font-semibold text-amber-300 text-sm">Opening Hours</h4>
                </div>
                <ul className="space-y-1.5 text-xs text-gray-400">
                  <li className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span className="text-white font-medium">
                      {siteConfig.businessHours.monday.open} - {siteConfig.businessHours.monday.close}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Saturday:</span>
                    <span className="text-white font-medium">
                      {siteConfig.businessHours.saturday.open} - {siteConfig.businessHours.saturday.close}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sunday:</span>
                    <span className="text-rose-400 font-medium">
                      {siteConfig.businessHours.sunday.isOpen ? `${siteConfig.businessHours.sunday.open} - ${siteConfig.businessHours.sunday.close}` : "Closed"}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Column 4: Social & Newsletter */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mb-4">
                  Follow Us
                </h3>
                <div className="flex gap-3">
                  <a
                    href={siteConfig.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center hover:scale-110 transition-transform shadow-lg hover:shadow-pink-500/50"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-6 h-6 text-white" />
                  </a>
                  <a
                    href={siteConfig.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center hover:scale-110 transition-transform shadow-lg hover:shadow-blue-500/50"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-6 h-6 text-white" />
                  </a>
                  <a
                    href={siteConfig.social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center hover:scale-110 transition-transform shadow-lg hover:shadow-red-500/50"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-6 h-6 text-white" />
                  </a>
                </div>
              </div>

              {/* Newsletter Mini */}
              <div className="bg-gradient-to-br from-rose-500/10 to-purple-500/10 border-2 border-rose-500/30 rounded-xl p-4">
                <h4 className="font-bold text-white mb-2 text-sm">Get 10% Off!</h4>
                <p className="text-xs text-gray-400 mb-3">
                  Subscribe to our newsletter for exclusive offers
                </p>
                <Link
                  href="/#newsletter"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-semibold rounded-full hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl w-full justify-center"
                >
                  Subscribe Now
                </Link>
              </div>

              {/* Legal Links */}
              <div className="pt-4 border-t border-gray-700">
                <h4 className="text-sm font-semibold text-gray-400 mb-3">Legal</h4>
                <ul className="space-y-2">
                  <li>
                    <Link 
                      href="/terms" 
                      className="text-xs text-gray-500 hover:text-rose-400 transition-colors"
                    >
                      Terms & Conditions
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/privacy" 
                      className="text-xs text-gray-500 hover:text-pink-400 transition-colors"
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
        <div className="border-t border-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500 text-center sm:text-left">
                © {currentYear} <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent font-semibold">{siteConfig.name}</span>. All rights reserved.
              </p>
              <p className="text-xs text-gray-600 text-center sm:text-right">
                Made with{" "}
                <Heart className="w-3 h-3 inline text-rose-500 fill-rose-500" />{" "}
                for beautiful transformations
              </p>
              <p className="text-xs text-gray-600 text-center sm:text-right mt-2">
                Developed by{" "}
                <a
                  href="https://serenity.rapid-frame.co.uk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-400 hover:text-rose-300 transition-colors font-semibold"
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


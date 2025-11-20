"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminProfile } from "@/components/AdminProfileContext";

// Import navigation structure from NavigationNavbar
const navigation = [
  { name: "Home", href: "#home" },
  { name: "Services", href: "#services" },
  { 
    name: "About", 
    href: "#about",
    dropdown: [
      { name: "Our Story", href: "#our-story" },
      { name: "Service Areas", href: "#service-areas" },
      { name: "Gallery", href: "#gallery" }
    ]
  },
  { 
    name: "Support", 
    href: "#faq",
    dropdown: [
      { name: "FAQ", href: "#faq" },
      { name: "Reviews", href: "#reviews" },
    ]
  },
  { name: "Contact", href: "#contact" },
  { name: "Terms", href: "/terms" },
  { name: "Privacy", href: "/privacy" },
];

type ServiceArea = {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  slug: string;
};

export default function FooterMain() {
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("home");
  const pathname = usePathname();
  const router = useRouter();
  const adminProfile = useAdminProfile();

  // Get business data from admin profile
  const businessData = {
    businessName: adminProfile?.company_name || "EGP",
    businessEmail: adminProfile?.business_email || process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "",
    businessPhone: adminProfile?.phone || "+44 7541777225",
    businessAddress: adminProfile?.company_address || "London, UK",
    companyStatus: adminProfile?.company_status || ""
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch service areas
        const areasResponse = await fetch('/api/areas');
        if (areasResponse.ok) {
          const areas = await areasResponse.json();
          setServiceAreas(areas.filter((area: ServiceArea) => area.is_active));
        }
      } catch (error) {
        console.error('Error fetching footer data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Check if there's a hash in the URL on initial load
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.substring(1);
      if (["home", "services", "about", "our-story", "service-areas", "gallery", "pricing", "faq", "reviews", "contact"].includes(hash)) {
        setActiveSection(hash);
      }
    }

    // Listen for hash changes
    const handleHashChange = () => {
      if (typeof window !== "undefined" && window.location.hash) {
        const hash = window.location.hash.substring(1);
        if (["home", "services", "about", "our-story", "service-areas", "gallery", "pricing", "faq", "reviews", "contact"].includes(hash)) {
          setActiveSection(hash);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    // If it's an anchor link (starts with #), prevent default and scroll
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const element = document.getElementById(targetId);

      if (element) {
        // Update URL to reflect the section
        if (pathname === "/") {
          router.replace(`/#${targetId}`, { scroll: false });
        } else {
          router.push(`/#${targetId}`);
        }
        
        // Scroll to the element with offset for the navbar
        const yOffset = -80; // Adjust based on your navbar height
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
    // If it's a regular link (like /privacy, /terms), let it navigate normally
    // The default behavior will handle the navigation
  };

  return (
    <footer className="bg-white/40 dark:bg-gray-900/40 backdrop-blur shadow-lg border-t border-white/20 dark:border-gray-800/30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 md:grid-cols-${serviceAreas.length > 0 ? '4' : '3'} gap-8`}>
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <Link
              className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300"
              href="/"
            >
              {businessData.businessName.toUpperCase()}
              {businessData.companyStatus && (
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                  {businessData.companyStatus}
                </span>
              )}
            </Link>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300 max-w-md">
              Premier aesthetic treatments across South West London. Expert practitioners, 
              proven results.
            </p>
            <div className="mt-4 space-y-2">
              {isLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    📞 Contact: <span className="font-semibold text-blue-600 dark:text-blue-400">{businessData.businessPhone}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    📧 Email: <span className="font-semibold">{businessData.businessEmail}</span>
                  </p>
                </>
              )}
            </div>
            
            {/* Social Media Links */}
            <div className="mt-6 flex space-x-4">
              {process.env.NEXT_PUBLIC_SOCIAL_MEDIA_FACEBOOK && (
                <a
                  href={process.env.NEXT_PUBLIC_SOCIAL_MEDIA_FACEBOOK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                >
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
              )}
              {process.env.NEXT_PUBLIC_SOCIAL_MEDIA_INSTAGRAM && (
                <a
                  href={process.env.NEXT_PUBLIC_SOCIAL_MEDIA_INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-300"
                >
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              )}
              {process.env.NEXT_PUBLIC_SOCIAL_TIKTOK && (
                <a
                  href={process.env.NEXT_PUBLIC_SOCIAL_TIKTOK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-300"
                >
                  <span className="sr-only">TikTok</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider transition-colors duration-300">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-3">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={(e) => handleClick(e, item.href)}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                  >
                    {item.name}
                  </Link>
                  {item.dropdown && (
                    <ul className="mt-2 ml-4 space-y-2">
                      {item.dropdown.map((subItem) => (
                        <li key={subItem.name}>
                          <Link
                            href={subItem.href}
                            onClick={(e) => handleClick(e, subItem.href)}
                            className="text-xs text-gray-500 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                          >
                            {subItem.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas - Only show if areas are available */}
          {serviceAreas.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider transition-colors duration-300">
                Service Areas
              </h3>
              {isLoading ? (
                <div className="mt-4 animate-pulse space-y-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  ))}
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {serviceAreas.map((area) => (
                    <li key={area.id}>
                      <Link
                        href="#service-areas"
                        onClick={(e) => handleClick(e, "#service-areas")}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                      >
                        {area.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
              © {new Date().getFullYear()} {businessData.businessName}. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                Developed by{" "}
                <a
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  href="https://serenity.rapid-frame.co.uk/"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Serenity Web Studio
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

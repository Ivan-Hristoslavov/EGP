import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
// Removed Inter - using our custom fonts
import { SpeedInsights } from "@vercel/speed-insights/next";

import { Providers } from "./providers";
import { ToastProvider } from "@/components/Toast";
import HashNavigation from "@/components/HashNavigation";
import { AdminProfileProvider } from "@/components/AdminProfileContext";
import { FirstVisitDiscountFormWrapper } from "@/components/FirstVisitDiscountFormWrapper";

import LayoutMain from "@/components/LayoutMain";
import { getAdminProfile } from "@/lib/admin-profile";
import { createClient } from "@/lib/supabase/server";

// Using Gurmukhi MN font loaded via CSS @font-face

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getAdminProfile();
  const companyName = profile?.company_name || "EGP";
  
  // Ensure years_of_experience includes "Years" if not already present
  const yearsExperience = profile?.years_of_experience 
    ? (profile.years_of_experience.toLowerCase().includes('years') 
        ? profile.years_of_experience 
        : `${profile.years_of_experience} Years`)
    : "10+ Years";

  const responseTime = profile?.response_time || "45 minutes";
  // Normalize response time to avoid duplication (remove any existing "minute/minutes")
  const responseTimeNormalized = responseTime.replace(/\s+(minutes?|mins?)\s*/gi, '').trim();
  
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://egp.com'),
    title: {
      default: `${companyName} - Premium Aesthetic Treatments London | Clapham, Chelsea, Battersea`,
      template: `%s | ${companyName} - Aesthetic Clinic London`
    },
    description: `Premier aesthetic clinic in South West London. Expert treatments in Clapham, Balham, Chelsea, Battersea, Wandsworth, Streatham. ${responseTimeNormalized}-minute response time, ${yearsExperience} experience. Fully insured.`,
    keywords: [
      "aesthetic clinic London",
      "botox London",
      "dermal fillers London",
      "anti-wrinkle injections London",
      "aesthetic treatments Clapham",
      "aesthetic treatments Chelsea", 
      "aesthetic treatments Battersea",
      "aesthetic treatments Balham",
      "aesthetic treatments Wandsworth",
      "aesthetic treatments Streatham",
      "skin treatments London",
      "facial aesthetics London",
      "cosmetic clinic London",
      "beauty clinic London",
      "aesthetic practitioner London",
      "body contouring London",
      "skin rejuvenation London",
      "aesthetic clinic SW4",
      "aesthetic clinic SW12", 
      "aesthetic clinic SW3",
      "aesthetic clinic SW8",
      "aesthetic clinic SW18",
      "aesthetic clinic SW16",
      "egp",
      "egp aesthetics",
      "professional aesthetic treatments London"
    ],
    authors: [{ name: companyName }],
    creator: companyName,
    publisher: companyName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      ],
      shortcut: "/favicon.ico",
    },
    openGraph: {
      title: `${companyName} - Premium Aesthetic Clinic London`,
      description: `Premier aesthetic treatments in South West London with ${responseTimeNormalized}-minute response time. Fully insured.`,
      type: "website",
      locale: "en_GB",
      siteName: companyName,
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://egp.com',
      images: [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${companyName} - Premium Aesthetic Clinic London`,
      description: `Premier aesthetic treatments in South West London. Expert practitioners, proven results. ${responseTimeNormalized}-minute response time.`,
      images: [],
      creator: "@egp",
      site: "@egp",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_VERIFICATION,
    },
    other: {
      "geo.region": "GB-LND",
      "geo.placename": "London",
      "geo.position": "51.5074;-0.1278",
      "ICBM": "51.5074, -0.1278",
      "DC.title": `${companyName} - Premium Aesthetic Clinic London`,
      "DC.description": `Premier aesthetic treatments in South West London with ${responseTimeNormalized}-minute response time.`,
      "DC.subject": "Aesthetic Clinic London, Aesthetic Treatments, Facial Aesthetics",
      "DC.creator": companyName,
      "DC.publisher": companyName,
      "DC.contributor": companyName,
      "DC.date": new Date().toISOString(),
      "DC.type": "Service",
      "DC.format": "text/html",
      "DC.identifier": process.env.NEXT_PUBLIC_SITE_URL || 'https://egp.com',
      "DC.language": "en",
      "DC.coverage": "South West London",
      "DC.rights": `Copyright © ${new Date().getFullYear()} EGP. All rights reserved.`,
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch admin profile data once at the layout level
  const adminProfile = await getAdminProfile();
  
  // Fetch areas, pricing cards, and admin settings data for structured data
  const supabase = createClient();
  const { data: areas } = await supabase
    .from('admin_areas_cover')
    .select('*')
    .eq('is_active', true)
    .order('order', { ascending: true });
    
  const { data: pricingCards } = await supabase
    .from('pricing_cards')
    .select('*')
    .eq('is_enabled', true)
    .order('order', { ascending: true });
    
  const { data: adminSettings } = await supabase
    .from('admin_settings')
    .select('*');
    
  // Convert admin settings to object
  const settingsMap: { [key: string]: any } = {};
  adminSettings?.forEach((setting) => {
    try {
      settingsMap[setting.key] = JSON.parse(setting.value);
    } catch {
      settingsMap[setting.key] = setting.value;
    }
  });
  
  // Normalize response time to avoid duplication (remove any existing "minute/minutes")
  const responseTime = adminProfile?.response_time || "45 minutes";
  const responseTimeNormalized = responseTime.replace(/\s+(minutes?|mins?)\s*/gi, '').trim();
  
  // Create structured data for the business
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "MedicalBusiness", "HealthAndBeautyBusiness"],
    "@id": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://egp.com'}#business`,
    "name": adminProfile?.company_name || "EGP",
    "description": `Professional services platform - A skeleton template for building modern web applications.`,
    "url": process.env.NEXT_PUBLIC_SITE_URL || 'https://egp.com',
    "telephone": adminProfile?.phone || "123456789",
    "email": adminProfile?.business_email || "",
    "founder": {
      "@type": "Person",
      "name": adminProfile?.name || "Admin User"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": adminProfile?.company_address?.split(',')[1]?.trim() || "85 Hassocks Road",
      "addressLocality": settingsMap.businessCity || "London",
      "addressRegion": "South West London",
      "postalCode": settingsMap.businessPostcode || "SW16 5HA",
      "addressCountry": "GB"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 51.5074,
      "longitude": -0.1278
    },
    "areaServed": areas?.map(area => ({
      "@type": "City",
      "name": area.name,
      "postalCode": area.postcode
    })) || [],
    "serviceType": pricingCards?.map(card => card.title) || [],
    "openingHoursSpecification": settingsMap.workingDays?.map((day: string) => ({
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": day.charAt(0).toUpperCase() + day.slice(1),
      "opens": settingsMap.workingHoursStart || "08:00",
      "closes": settingsMap.workingHoursEnd || "18:00"
    })) || [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "08:00",
        "closes": "18:00"
      },
      {
        "@type": "OpeningHoursSpecification", 
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "17:00"
      }
    ],
    "priceRange": "££",
    "paymentAccepted": ["Cash", "Credit Card", "Bank Transfer"],
    "currenciesAccepted": "GBP",
    "vatNumber": settingsMap.vatNumber || "",
    "registrationNumber": settingsMap.registrationNumber || "",
    "gasSafeNumber": adminProfile?.gas_safe_number || settingsMap.gasSafeNumber || "",
    "mcsNumber": settingsMap.mcsNumber || "",
    "insuranceProvider": adminProfile?.insurance_provider || settingsMap.insuranceProvider || "",
    "yearsOfExperience": adminProfile?.years_of_experience || "10+",
    "specializations": adminProfile?.specializations?.split('. ') || [],
    "certifications": adminProfile?.certifications?.split('. ') || [],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Aesthetic Treatments",
      "itemListElement": pricingCards?.map(card => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": card.title,
          "description": card.subtitle || "Professional aesthetic treatment"
        }
      })) || []
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": 4.8,
      "reviewCount": 150,
      "itemReviewed": {
        "@id": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://egp.com'}#business`
      }
    },
    "sameAs": [],
    "bankDetails": {
      "@type": "BankAccount",
      "bankName": adminProfile?.bank_name || "",
      "accountNumber": adminProfile?.account_number || "",
      "sortCode": adminProfile?.sort_code || ""
    },
    "about": adminProfile?.about || ""
  };

  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="application-name" content="EGP" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EGP" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        
        {/* Google tag (gtag.js) */}
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-gurmukhi antialiased"
        )}
        suppressHydrationWarning
      >
        <ToastProvider>
          <Providers>
            <HashNavigation />
            <LayoutMain adminProfile={adminProfile}>{children}</LayoutMain>
            {/* First-visit discount popup (client) */}
            <FirstVisitDiscountFormWrapper />
          </Providers>
        </ToastProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}

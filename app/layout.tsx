import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { Providers } from "./providers";
import { ToastProvider } from "@/components/Toast";
import HashNavigation from "@/components/HashNavigation";
import { AdminProfileProvider } from "@/components/AdminProfileContext";

import { fontSans } from "@/config/fonts";
import LayoutMain from "@/components/LayoutMain";
import { getAdminProfile } from "@/lib/admin-profile";
import { createClient } from "@/lib/supabase/server";

const inter = Inter({ subsets: ["latin"] });

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
      default: `${companyName} - Emergency Plumber London | Same Day Service | Clapham, Chelsea, Battersea`,
      template: `%s | ${companyName} - Emergency Plumber London`
    },
    description: `Professional emergency plumber covering South West London. Same-day service in Clapham, Balham, Chelsea, Battersea, Wandsworth, Streatham. ${responseTimeNormalized}-minute response time, ${yearsExperience} experience. Gas Safe registered, fully insured.`,
    keywords: [
      "emergency plumber London",
      "plumber Clapham",
      "plumber Chelsea", 
      "plumber Battersea",
      "plumber Balham",
      "plumber Wandsworth",
      "plumber Streatham",
      "leak detection London",
      "same day plumber",
      "emergency callout London",
      "boiler repair London",
      "bathroom installation London",
      "kitchen plumbing London",
      "gas safe plumber London",
      "plumbing emergency London",
      "24 hour plumber London",
      "plumber SW4",
      "plumber SW12", 
      "plumber SW3",
      "plumber SW8",
      "plumber SW18",
      "plumber SW16",
      "egp",
      "emergency plumbing services",
      "professional plumber London"
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
      title: `${companyName} - Emergency Plumber London | Same Day Service`,
      description: `Professional emergency plumber covering South West London with ${responseTimeNormalized}-minute response time. Gas Safe registered, fully insured.`,
      type: "website",
      locale: "en_GB",
      siteName: companyName,
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://egp.com',
      images: [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${companyName} - Emergency Plumber London`,
      description: `Professional emergency plumber covering South West London with same-day service. ${responseTimeNormalized}-minute response time.`,
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
      "DC.title": `${companyName} - Emergency Plumber London`,
      "DC.description": `Professional emergency plumber covering South West London with ${responseTimeNormalized}-minute response time.`,
      "DC.subject": "Emergency Plumber London, Plumbing Services, Leak Detection",
      "DC.creator": companyName,
      "DC.publisher": companyName,
      "DC.contributor": companyName,
      "DC.date": new Date().toISOString(),
      "DC.type": "Service",
      "DC.format": "text/html",
      "DC.identifier": process.env.NEXT_PUBLIC_SITE_URL || 'https://egp.com',
      "DC.language": "en",
      "DC.coverage": "South West London",
      "DC.rights": "Copyright © 2024 EGP. All rights reserved.",
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
    "@type": ["LocalBusiness", "Plumber"],
    "@id": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://egp.com'}#business`,
    "name": adminProfile?.company_name || "EGP",
    "description": `Professional services platform - A skeleton template for building modern web applications.`,
    "url": process.env.NEXT_PUBLIC_SITE_URL || 'https://egp.com',
    "telephone": adminProfile?.phone || "07476 746635",
    "email": adminProfile?.business_email || "pzplumbingservices@gmail.com",
    "founder": {
      "@type": "Person",
      "name": adminProfile?.name || "Plamen Zhelev"
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
      "name": "Plumbing Services",
      "itemListElement": pricingCards?.map(card => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": card.title,
          "description": card.subtitle || "Professional plumbing service"
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
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable,
          inter.className
        )}
        suppressHydrationWarning
      >
        <Providers
          themeProps={{
            attribute: "class",
            defaultTheme: "light",
            enableSystem: true,
            themes: ["light", "dark"],
          }}
        >
          <ToastProvider>
            <AdminProfileProvider>
              <HashNavigation />
              <LayoutMain adminProfile={adminProfile}>{children}</LayoutMain>
            </AdminProfileProvider>
          </ToastProvider>
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}

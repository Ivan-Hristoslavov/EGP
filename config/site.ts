export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "EGP Aesthetics London",
  shortName: "EGP Aesthetics",
  tagline: "Transform Your Natural Beauty",
  description: "Premier aesthetic clinic in London offering advanced facial treatments, anti-wrinkle injections, dermal fillers, and body contouring. Expert practitioners, proven results.",
  
  // URLs
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://egpaesthetics.co.uk",
  
  // Contact Information
  contact: {
    phone: process.env.NEXT_PUBLIC_PHONE_NUMBER || "+44 XXXX XXXXXX",
    email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "info@egpaesthetics.co.uk",
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+44 XXXX XXXXXX",
    address: {
      street: process.env.NEXT_PUBLIC_ADDRESS_STREET || "",
      city: process.env.NEXT_PUBLIC_ADDRESS_CITY || "London",
      postcode: process.env.NEXT_PUBLIC_ADDRESS_POSTCODE || "",
      country: "United Kingdom",
      full: process.env.NEXT_PUBLIC_ADDRESS_FULL || "London, UK"
    }
  },
  
  // Social Media
  social: {
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || "https://instagram.com/egpaesthetics",
    facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || "https://facebook.com/egpaesthetics",
    youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE || "https://youtube.com/@egpaesthetics",
    tiktok: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK || "https://www.tiktok.com/@egpaesthetics_london",
    linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN || "",
    twitter: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || "",
  },
  
  // Business Hours (default - can be overridden by admin settings)
  businessHours: {
    monday: { open: "09:00", close: "19:00", isOpen: true },
    tuesday: { open: "09:00", close: "19:00", isOpen: true },
    wednesday: { open: "09:00", close: "19:00", isOpen: true },
    thursday: { open: "09:00", close: "19:00", isOpen: true },
    friday: { open: "09:00", close: "19:00", isOpen: true },
    saturday: { open: "10:00", close: "18:00", isOpen: true },
    sunday: { open: "10:00", close: "16:00", isOpen: true },
  },
  
  // Booking Configuration
  booking: {
    freeConsultationEnabled: false,
    consultationDuration: 30, // minutes
    minAdvanceBooking: 24, // hours
    maxAdvanceBooking: 90, // days
    bufferTime: 15, // minutes between appointments
    allowSameDayBooking: true,
  },
  
  // Newsletter Configuration
  newsletter: {
    welcomeDiscountPercent: 10,
    discountCodePrefix: "WELCOME10",
    discountValidDays: 30,
  },
  
  // Google Calendar Integration
  googleCalendar: {
    enabled: !!process.env.GOOGLE_CALENDAR_ID,
    calendarId: process.env.GOOGLE_CALENDAR_ID || "",
  },
  
  // Features Toggle
  features: {
    blog: true,
    membership: true,
    reviews: true,
    gallery: true,
    awards: true,
    multiLanguage: false, // Future: Bulgarian support
    onlinePayments: true,
    giftCards: false, // Future feature
  },
  
  // SEO Defaults
  seo: {
    titleTemplate: "%s | EGP Aesthetics London",
    defaultTitle: "EGP Aesthetics London - Premier Aesthetic Clinic",
    defaultDescription: "Expert aesthetic treatments in London. Botox, fillers, skin boosters, body contouring. Book your treatment now.",
    keywords: [
      "aesthetic clinic london",
      "botox london",
      "dermal fillers london",
      "anti-wrinkle injections",
      "skin treatments london",
      "facial aesthetics",
      "body contouring london",
      "aesthetic practitioner",
      "beauty clinic london",
      "cosmetic treatments"
    ],
    openGraph: {
      type: "website",
      locale: "en_GB",
      siteName: "EGP Aesthetics London",
    },
  },
  
  // Service Categories (for navigation)
  serviceCategories: [
    {
      id: "face",
      name: "Face Treatments",
      slug: "face",
      icon: "face",
      description: "Advanced facial treatments and skin rejuvenation"
    },
    {
      id: "anti-wrinkle",
      name: "Anti-wrinkle Injections",
      slug: "anti-wrinkle",
      icon: "syringe",
      description: "Botox and anti-wrinkle treatments"
    },
    {
      id: "fillers",
      name: "Dermal Fillers",
      slug: "fillers",
      icon: "droplet",
      description: "Volume restoration and enhancement"
    },
    {
      id: "body",
      name: "Body Treatments",
      slug: "body",
      icon: "body",
      description: "Body contouring and sculpting"
    },
  ],
  
  // Condition Categories (for navigation)
  conditionCategories: [
    {
      id: "face-conditions",
      name: "Face Concerns",
      slug: "face",
      description: "Facial skin and aesthetic concerns"
    },
    {
      id: "body-conditions",
      name: "Body Concerns",
      slug: "body",
      description: "Body contouring and skin concerns"
    },
  ],
  
  // Trust Indicators
  trust: {
    yearEstablished: process.env.NEXT_PUBLIC_YEAR_ESTABLISHED || "2020",
    treatmentsPerformed: process.env.NEXT_PUBLIC_TREATMENTS_COUNT || "1000+",
    satisfactionRate: process.env.NEXT_PUBLIC_SATISFACTION_RATE || "100%",
    certifications: [
      "Fully Insured",
      "Qualified Practitioners",
      "Safe & Clean Environment",
      "Professional Standards"
    ],
  },
  
  // Urgent Contact & Support
  urgentContact: {
    enabled: true,
    message: "For urgent bookings, please call us directly",
    phone: process.env.NEXT_PUBLIC_PHONE_NUMBER || "+44 XXXX XXXXXX",
  },
  
  // Analytics
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || "",
    facebookPixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID || "",
    googleAdsId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "",
  },
  
  // Legacy (keep for backward compatibility)
  links: {
    phone: process.env.NEXT_PUBLIC_PHONE_NUMBER || "+44 XXXX XXXXXX",
    email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "info@egpaesthetics.co.uk",
  },
  areas: [], // Will be populated from database
};

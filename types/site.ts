// Site Configuration Types for EGP Aesthetics London

export interface Address {
  street: string;
  city: string;
  postcode: string;
  country: string;
  full: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  whatsapp: string;
  address: Address;
}

export interface SocialMedia {
  instagram: string;
  facebook: string;
  youtube: string;
  tiktok?: string;
  linkedin?: string;
  twitter?: string;
}

export interface BusinessHour {
  open: string;
  close: string;
  isOpen: boolean;
}

export interface BusinessHours {
  monday: BusinessHour;
  tuesday: BusinessHour;
  wednesday: BusinessHour;
  thursday: BusinessHour;
  friday: BusinessHour;
  saturday: BusinessHour;
  sunday: BusinessHour;
}

export interface BookingConfig {
  freeConsultationEnabled: boolean;
  consultationDuration: number;
  minAdvanceBooking: number;
  maxAdvanceBooking: number;
  bufferTime: number;
  allowSameDayBooking: boolean;
}

export interface NewsletterConfig {
  welcomeDiscountPercent: number;
  discountCodePrefix: string;
  discountValidDays: number;
}

export interface GoogleCalendarConfig {
  enabled: boolean;
  calendarId: string;
}

export interface Features {
  blog: boolean;
  membership: boolean;
  reviews: boolean;
  gallery: boolean;
  awards: boolean;
  multiLanguage: boolean;
  onlinePayments: boolean;
  giftCards: boolean;
}

export interface SEOConfig {
  titleTemplate: string;
  defaultTitle: string;
  defaultDescription: string;
  keywords: string[];
  openGraph: {
    type: string;
    locale: string;
    siteName: string;
  };
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export interface ConditionCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface TrustIndicators {
  yearEstablished: string;
  treatmentsPerformed: string;
  satisfactionRate: string;
  certifications: string[];
}

export interface Emergency {
  enabled: boolean;
  message: string;
  phone: string;
}

export interface Analytics {
  googleAnalyticsId: string;
  facebookPixelId: string;
  googleAdsId: string;
}

export interface SiteConfig {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  url: string;
  contact: ContactInfo;
  social: SocialMedia;
  businessHours: BusinessHours;
  booking: BookingConfig;
  newsletter: NewsletterConfig;
  googleCalendar: GoogleCalendarConfig;
  features: Features;
  seo: SEOConfig;
  serviceCategories: ServiceCategory[];
  conditionCategories: ConditionCategory[];
  trust: TrustIndicators;
  emergency: Emergency;
  analytics: Analytics;
  links: {
    phone: string;
    email: string;
  };
  areas: any[];
}


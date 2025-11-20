"use client";

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";

interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  googleMapsAddress: string;
}

interface OpeningHours {
  [key: string]: {
    day: string;
    hours: string;
    isOpen: boolean;
  };
}

interface TransportOptions {
  tube?: Array<{ station: string; lines: string; distance: string }>;
  bus?: Array<{ route: string; stop: string; distance: string }>;
  car?: Array<{ parking: string; distance: string; notes: string }>;
  walking?: Array<{ from: string; distance: string }>;
}

interface NearbyLandmark {
  name: string;
  type: string;
  distance: string;
}

interface FindUsData {
  howToFindUs: string;
  howToReachUs: string;
  transportOptions: TransportOptions;
  nearbyLandmarks: NearbyLandmark[];
}

interface SiteDataContextType {
  contactInfo: ContactInfo | null;
  openingHours: OpeningHours;
  findUsData: FindUsData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const SiteDataContext = createContext<SiteDataContextType | undefined>(undefined);

const defaultContactInfo: ContactInfo = {
  address: "809 Wandsworth Road, SW8 3JH, London, UK",
  phone: "+44 20 7123 4567",
  email: "info@egpaesthetics.com",
  whatsapp: "+44 20 7123 4567",
  googleMapsAddress: "809 Wandsworth Road, SW8 3JH, London, UK"
};

const defaultOpeningHours: OpeningHours = {
  monday: { day: "Monday", hours: "9:00 AM - 7:00 PM", isOpen: true },
  tuesday: { day: "Tuesday", hours: "9:00 AM - 7:00 PM", isOpen: true },
  wednesday: { day: "Wednesday", hours: "9:00 AM - 7:00 PM", isOpen: true },
  thursday: { day: "Thursday", hours: "9:00 AM - 8:00 PM", isOpen: true },
  friday: { day: "Friday", hours: "9:00 AM - 7:00 PM", isOpen: true },
  saturday: { day: "Saturday", hours: "10:00 AM - 5:00 PM", isOpen: true },
  sunday: { day: "Sunday", hours: "Closed", isOpen: false }
};

function formatTime(time: string | null): string {
  if (!time) return "Closed";
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch {
    return time;
  }
}

const defaultFindUsData: FindUsData = {
  howToFindUs: "Our clinic is located in the heart of London's medical district, easily accessible by public transport and car.",
  howToReachUs: "We are conveniently located near major transport links and landmarks.",
  transportOptions: {},
  nearbyLandmarks: []
};

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [openingHours, setOpeningHours] = useState<OpeningHours>(defaultOpeningHours);
  const [findUsData, setFindUsData] = useState<FindUsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch contact info and opening hours in parallel
      const [profileResponse, hoursResponse] = await Promise.all([
        fetch('/api/admin/profile'),
        fetch('/api/working-hours')
      ]);

      // Fetch contact info and find-us data
      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        setContactInfo({
          address: profile.company_address || defaultContactInfo.address,
          phone: profile.phone || defaultContactInfo.phone,
          email: profile.business_email || profile.email || defaultContactInfo.email,
          whatsapp: profile.whatsapp || profile.phone || defaultContactInfo.whatsapp,
          googleMapsAddress: profile.google_maps_address || profile.company_address || defaultContactInfo.googleMapsAddress
        });
        
        // Set find-us data
        setFindUsData({
          howToFindUs: profile.how_to_find_us || defaultFindUsData.howToFindUs,
          howToReachUs: profile.how_to_reach_us || defaultFindUsData.howToReachUs,
          transportOptions: profile.transport_options || defaultFindUsData.transportOptions,
          nearbyLandmarks: profile.nearby_landmarks || defaultFindUsData.nearbyLandmarks
        });
      } else {
        setContactInfo(defaultContactInfo);
        setFindUsData(defaultFindUsData);
      }

      // Fetch opening hours
      if (hoursResponse.ok) {
        const data = await hoursResponse.json();
        const normalized = data.normalized || {};
        
        const dayNames: { [key: string]: string } = {
          monday: "Monday",
          tuesday: "Tuesday",
          wednesday: "Wednesday",
          thursday: "Thursday",
          friday: "Friday",
          saturday: "Saturday",
          sunday: "Sunday"
        };

        const formattedHours: OpeningHours = {};
        
        Object.keys(dayNames).forEach((dayKey) => {
          const dayData = normalized[dayKey];
          if (dayData) {
            const isOpen = dayData.isOpen && dayData.open && dayData.close;
            formattedHours[dayKey] = {
              day: dayNames[dayKey],
              hours: isOpen 
                ? `${formatTime(dayData.open)} - ${formatTime(dayData.close)}`
                : "Closed",
              isOpen: isOpen
            };
          } else {
            formattedHours[dayKey] = {
              day: dayNames[dayKey],
              hours: "Closed",
              isOpen: false
            };
          }
        });

        setOpeningHours(formattedHours);
      } else {
        setOpeningHours(defaultOpeningHours);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setContactInfo(defaultContactInfo);
      setOpeningHours(defaultOpeningHours);
      setFindUsData(defaultFindUsData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <SiteDataContext.Provider value={{ 
      contactInfo, 
      openingHours,
      findUsData,
      loading, 
      error, 
      refresh 
    }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  const context = useContext(SiteDataContext);
  if (context === undefined) {
    throw new Error('useSiteData must be used within a SiteDataProvider');
  }
  return context;
}


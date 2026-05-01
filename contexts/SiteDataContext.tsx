"use client";

import type { AdminProfile } from "@/lib/admin-profile";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

import { siteConfig } from "@/config/site";

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
  contactInfo: ContactInfo;
  openingHours: OpeningHours;
  findUsData: FindUsData;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const SiteDataContext = createContext<SiteDataContextType | undefined>(
  undefined,
);

const defaultContactInfo: ContactInfo = {
  address: siteConfig.contact.address.full,
  phone: siteConfig.contact.phone,
  email: siteConfig.contact.email,
  whatsapp: siteConfig.contact.whatsapp,
  googleMapsAddress:
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_ADDRESS ||
    siteConfig.contact.address.full,
};

const defaultOpeningHours: OpeningHours = {
  monday: { day: "Monday", hours: "9:00 AM - 7:00 PM", isOpen: true },
  tuesday: { day: "Tuesday", hours: "9:00 AM - 7:00 PM", isOpen: true },
  wednesday: { day: "Wednesday", hours: "9:00 AM - 7:00 PM", isOpen: true },
  thursday: { day: "Thursday", hours: "9:00 AM - 8:00 PM", isOpen: true },
  friday: { day: "Friday", hours: "9:00 AM - 7:00 PM", isOpen: true },
  saturday: { day: "Saturday", hours: "10:00 AM - 5:00 PM", isOpen: true },
  sunday: { day: "Sunday", hours: "Closed", isOpen: false },
};

function formatTime(time: string | null): string {
  if (!time) return "Closed";
  try {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minutes} ${ampm}`;
  } catch {
    return time;
  }
}

const defaultFindUsData: FindUsData = {
  howToFindUs:
    "Our clinic is located in the heart of London's medical district, easily accessible by public transport and car.",
  howToReachUs:
    "We are conveniently located near major transport links and landmarks.",
  transportOptions: {},
  nearbyLandmarks: [],
};

function buildSiteDataFromProfile(profile: AdminProfile | null): {
  contactInfo: ContactInfo;
  findUsData: FindUsData;
} {
  if (!profile) {
    return {
      contactInfo: defaultContactInfo,
      findUsData: defaultFindUsData,
    };
  }

  let transportOptions: TransportOptions = defaultFindUsData.transportOptions;
  let nearbyLandmarks: NearbyLandmark[] = defaultFindUsData.nearbyLandmarks;

  try {
    if (profile.transport_options) {
      let parsed: unknown = profile.transport_options;

      while (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        transportOptions = parsed as TransportOptions;
      }
    }
  } catch (e) {
    console.error("Error parsing transport_options:", e);
  }

  try {
    if (profile.nearby_landmarks) {
      let parsed: unknown = profile.nearby_landmarks;

      while (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }
      if (Array.isArray(parsed)) {
        nearbyLandmarks = parsed as NearbyLandmark[];
      }
    }
  } catch (e) {
    console.error("Error parsing nearby_landmarks:", e);
  }

  return {
    contactInfo: {
      address: profile.company_address || defaultContactInfo.address,
      phone: profile.phone || defaultContactInfo.phone,
      email:
        profile.business_email || profile.email || defaultContactInfo.email,
      whatsapp:
        profile.whatsapp || profile.phone || defaultContactInfo.whatsapp,
      googleMapsAddress:
        profile.google_maps_address ||
        profile.company_address ||
        defaultContactInfo.googleMapsAddress,
    },
    findUsData: {
      howToFindUs: profile.how_to_find_us || defaultFindUsData.howToFindUs,
      howToReachUs: profile.how_to_reach_us || defaultFindUsData.howToReachUs,
      transportOptions,
      nearbyLandmarks,
    },
  };
}

export function SiteDataProvider({
  children,
  initialProfile = null,
}: {
  children: ReactNode;
  initialProfile?: AdminProfile | null;
}) {
  const { contactInfo, findUsData } = useMemo(
    () => buildSiteDataFromProfile(initialProfile),
    [initialProfile],
  );

  const [openingHours, setOpeningHours] =
    useState<OpeningHours>(defaultOpeningHours);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchWorkingHours = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const hoursResponse = await fetch("/api/working-hours");

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
          sunday: "Sunday",
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
              isOpen,
            };
          } else {
            formattedHours[dayKey] = {
              day: dayNames[dayKey],
              hours: "Closed",
              isOpen: false,
            };
          }
        });

        setOpeningHours(formattedHours);
      } else {
        setOpeningHours(defaultOpeningHours);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setOpeningHours(defaultOpeningHours);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkingHours();
  }, [fetchWorkingHours, refreshTrigger]);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <SiteDataContext.Provider
      value={{
        contactInfo,
        openingHours,
        findUsData,
        loading,
        error,
        refresh,
      }}
    >
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  const context = useContext(SiteDataContext);

  if (context === undefined) {
    throw new Error("useSiteData must be used within a SiteDataProvider");
  }

  return context;
}

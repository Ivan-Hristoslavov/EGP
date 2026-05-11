"use client";

import { useEffect } from "react";

import {
  ANALYTICS_CONSENT_GRANTED_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
} from "@/lib/cookie-consent";

declare global {
  interface Window {
    __egpGtagLoaded?: boolean;
  }
}

function injectGoogleAnalytics(gaId: string) {
  if (typeof window === "undefined" || window.__egpGtagLoaded) return;
  window.__egpGtagLoaded = true;

  const external = document.createElement("script");

  external.async = true;
  external.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
  document.head.appendChild(external);

  const inline = document.createElement("script");

  inline.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', ${JSON.stringify(gaId)});
  `;
  document.head.appendChild(inline);
}

function hasAnalyticsConsent(): boolean {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);

    if (!raw) return false;
    const parsed = JSON.parse(raw) as { analytics?: boolean };

    return parsed.analytics === true;
  } catch {
    return false;
  }
}

export default function GoogleAnalyticsLoader() {
  useEffect(() => {
    const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ?? "";

    if (!gaId) return;

    function onConsentGranted() {
      injectGoogleAnalytics(gaId);
    }

    if (hasAnalyticsConsent()) {
      injectGoogleAnalytics(gaId);
    }

    window.addEventListener(ANALYTICS_CONSENT_GRANTED_EVENT, onConsentGranted);

    return () =>
      window.removeEventListener(
        ANALYTICS_CONSENT_GRANTED_EVENT,
        onConsentGranted,
      );
  }, []);

  return null;
}

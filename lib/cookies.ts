// Cookie utility functions for managing browser cookies

export const setCookie = (name: string, value: string, days: number = 365): void => {
  if (typeof document === 'undefined') return; // SSR safety
  
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null; // SSR safety
  
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const deleteCookie = (name: string): void => {
  if (typeof document === 'undefined') return; // SSR safety
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Specific cookie names for the application
export const COOKIE_NAMES = {
  DISCOUNT_SHOWN: 'egp_discount_shown',
  USER_PREFERENCES: 'egp_user_preferences',
  ANALYTICS_CONSENT: 'egp_analytics_consent',
} as const;



















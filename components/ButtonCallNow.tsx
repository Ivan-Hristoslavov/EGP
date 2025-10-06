"use client";

import { useAdminProfile } from "@/hooks/useAdminProfile";

export function ButtonCallNow() {
  const { profile, loading, error } = useAdminProfile();

  // Use fallback phone number if profile is not available
  const phone = profile?.phone || "0800 123 4567";

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-center">
      <a
        aria-label="Call Now"
        className="animate-pulse flex items-center justify-center w-16 h-16 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors group mb-2"
        href={`tel:${phone}`}
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      </a>
      <div className="text-center">
        <p className="rounded-full text-xs font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-2 py-1 shadow-lg border border-gray-200 dark:border-gray-700">
          10 Min Free <br /> Consultation
        </p>
      </div>
    </div>
  );
}

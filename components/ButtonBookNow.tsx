"use client";

import { Calendar } from "lucide-react";
import Link from "next/link";

interface ButtonBookNowProps {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcon?: boolean;
  serviceId?: string;
  conditionId?: string;
}

export default function ButtonBookNow({
  variant = "primary",
  size = "md",
  className = "",
  showIcon = true,
  serviceId,
  conditionId,
}: ButtonBookNowProps) {
  
  // Build booking URL with parameters
  const buildBookingUrl = () => {
    const baseUrl = "/book";
    const params = new URLSearchParams();
    
    if (serviceId) {
      params.append("service", serviceId);
    }
    if (conditionId) {
      params.append("condition", conditionId);
    }
    
    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 shadow-lg hover:shadow-xl";
      case "secondary":
        return "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700";
      case "outline":
        return "border-2 border-rose-500 text-rose-500 dark:text-rose-400 hover:bg-rose-500 hover:text-white dark:hover:text-white";
      default:
        return "bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 shadow-lg hover:shadow-xl";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-4 py-2 text-sm";
      case "lg":
        return "px-8 py-4 text-lg";
      default:
        return "px-6 py-3 text-base";
    }
  };

  const baseClasses = `
    inline-flex items-center justify-center gap-2 font-semibold rounded-full 
    transition-all duration-300 transform hover:scale-105 active:scale-95
    focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    ${getVariantClasses()} ${getSizeClasses()} ${className}
  `.trim();

  return (
    <Link
      href={buildBookingUrl()}
      className={baseClasses}
      aria-label="Book treatment now"
    >
      {showIcon && <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />}
      <span>Book Treatment Now</span>
    </Link>
  );
}
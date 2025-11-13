"use client";
import { useState } from "react";
import { Phone, Play, Calendar, MessageCircle, X, Menu, Minimize2 } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

type QuickAction = {
  id: string;
  labelDesktop: string;
  labelMobile: string;
  href: string;
  gradient: string;
  icon: typeof Calendar;
  external?: boolean;
};

export default function FloatingContactButtons() {
  const [isExpanded, setIsExpanded] = useState(false);
  const handleActionClick = () => setIsExpanded(false);

  const whatsappNumber = siteConfig.contact.whatsapp.replace(/\s/g, "").replace(/\+/g, "");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi! I'd like to book a treatment.")}`;

  const quickActions: QuickAction[] = [
    {
      id: "book",
      labelDesktop: "Book Treatment",
      labelMobile: "Book",
      href: "/book",
      gradient: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
      icon: Calendar,
    },
    {
      id: "call",
      labelDesktop: "Call Now",
      labelMobile: "Call",
      href: `tel:${siteConfig.contact.phone}`,
      gradient: "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700",
      icon: Phone,
    },
    {
      id: "whatsapp",
      labelDesktop: "WhatsApp",
      labelMobile: "WhatsApp",
      href: whatsappUrl,
      gradient: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
      icon: MessageCircle,
      external: true,
    },
    {
      id: "videos",
      labelDesktop: "Videos",
      labelMobile: "Videos",
      href: siteConfig.social.youtube,
      gradient: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
      icon: Play,
      external: true,
    },
  ];

  const renderAction = (action: QuickAction) => {
    const Icon = action.icon;
    const commonAnchorProps = action.external ? { target: "_blank", rel: "noopener noreferrer" } : undefined;

    const baseClasses = [
      "flex items-center justify-start sm:justify-between rounded-full text-white transition-all shadow-md sm:shadow-lg",
      "px-3 sm:px-4",
      "py-2 sm:py-2.5",
      "gap-2 sm:gap-3",
      "text-[12px] sm:text-sm",
      "active:scale-95 touch-manipulation",
      "sm:hover:shadow-xl sm:hover:scale-[1.02]",
    ].join(" ");

    const labelClass = `flex-1 text-left whitespace-nowrap font-medium`;
    const iconClass = `w-4 h-4 sm:w-5 sm:h-5 shrink-0`;

    const content = (
      <>
        <Icon className={iconClass} />
        <span className={labelClass}>
          <span className="sm:hidden">{action.labelMobile}</span>
          <span className="hidden sm:inline">{action.labelDesktop}</span>
        </span>
        {action.id === "whatsapp" && (
          <span className="hidden sm:inline-block ml-1 w-2 h-2 rounded-full bg-green-300 animate-pulse" />
        )}
      </>
    );

    if (action.href.startsWith("tel:")) {
      return (
        <a key={action.id} href={action.href} className={`${baseClasses} ${action.gradient}`}>
          {content}
        </a>
      );
    }

    if (action.external) {
      return (
        <a key={action.id} href={action.href} {...commonAnchorProps} className={`${baseClasses} ${action.gradient}`}>
          {content}
        </a>
      );
    }

    return (
      <Link key={action.id} href={action.href} className={`${baseClasses} ${action.gradient}`}>
        {content}
      </Link>
    );
  };

  return (
    <>
      {/* Expandable Floating Button - All Breakpoints */}
      <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50">
        <div className="relative flex flex-col items-end gap-3">
          {/* Expanded Options */}
          <div
            className={`transition-all duration-300 ${
              isExpanded ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            <div className="flex flex-col gap-1.5 sm:gap-2">
              {quickActions.map((action) => renderAction(action))}
            </div>
          </div>

          {/* Main Expandable Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-xl transition-all duration-300 hover:shadow-2xl ${
              isExpanded
                ? "bg-[#9d9585] dark:bg-[#b5ad9d]"
                : "bg-[#b5ad9d] hover:bg-[#9d9585] dark:bg-[#9d9585] dark:hover:bg-[#b5ad9d] hover:scale-110"
            } text-white`}
            aria-label={isExpanded ? "Close menu" : "Open contact menu"}
          >
            {isExpanded ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 rotate-0" />
            ) : (
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}

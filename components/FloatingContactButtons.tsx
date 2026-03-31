"use client";

import { useState } from "react";
import { Phone, Play, Calendar, MessageCircle, X, Menu, Instagram } from "lucide-react";
import Link from "next/link";
import { useAdminProfile } from "@/components/AdminProfileContext";
import { useSocialLinks } from "@/hooks/useSocialLinks";

type QuickAction = {
  id: string;
  labelDesktop: string;
  labelMobile: string;
  href: string;
  icon: typeof Calendar;
  external?: boolean;
  /** Subtle background + border, not loud gradient */
  style: "book" | "call" | "whatsapp" | "videos" | "instagram";
};

export default function FloatingContactButtons() {
  const [isExpanded, setIsExpanded] = useState(false);

  const adminProfile = useAdminProfile();
  const { socialLinks } = useSocialLinks();

  const contactPhone = adminProfile?.phone || "";
  const whatsappNumber = (adminProfile?.whatsapp || adminProfile?.phone || "").replace(/\s/g, "").replace(/\+/g, "");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi! I'd like to book a treatment.")}`;

  const quickActions: QuickAction[] = [
    {
      id: "book",
      labelDesktop: "Book Treatment",
      labelMobile: "Book",
      href: "/book",
      icon: Calendar,
      style: "book",
    },
    ...(contactPhone
      ? [{
          id: "call",
          labelDesktop: "Call Now",
          labelMobile: "Call",
          href: `tel:${contactPhone}`,
          icon: Phone,
          style: "call" as const,
        }]
      : []),
    ...(whatsappNumber
      ? [{
          id: "whatsapp",
          labelDesktop: "WhatsApp",
          labelMobile: "WhatsApp",
          href: whatsappUrl,
          icon: MessageCircle,
          external: true,
          style: "whatsapp" as const,
        }]
      : []),
    ...(socialLinks.youtube
      ? [{ id: "videos", labelDesktop: "Videos", labelMobile: "Videos", href: socialLinks.youtube, icon: Play, external: true, style: "videos" as const }]
      : []),
    ...(socialLinks.instagram
      ? [{ id: "instagram", labelDesktop: "Instagram", labelMobile: "Instagram", href: socialLinks.instagram, icon: Instagram, external: true, style: "instagram" as const }]
      : []),
  ];

  const styleClasses: Record<QuickAction["style"], string> = {
    book:
      "bg-slate-700 hover:bg-slate-800 text-white border border-slate-600/50 dark:bg-slate-600 dark:hover:bg-slate-500 dark:border-slate-500/50",
    call:
      "bg-rose-600/90 hover:bg-rose-600 text-white border border-rose-500/50 dark:bg-rose-700 dark:hover:bg-rose-600 dark:border-rose-600/50",
    whatsapp:
      "bg-emerald-600/90 hover:bg-emerald-600 text-white border border-emerald-500/50 dark:bg-emerald-700 dark:hover:bg-emerald-600 dark:border-emerald-600/50",
    videos:
      "bg-red-600/90 hover:bg-red-600 text-white border border-red-500/50 dark:bg-red-700 dark:hover:bg-red-600 dark:border-red-600/50",
    instagram:
      "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border border-violet-500/40 dark:border-fuchsia-500/40",
  };

  const renderAction = (action: QuickAction) => {
    const Icon = action.icon;
    const commonAnchorProps = action.external ? { target: "_blank", rel: "noopener noreferrer" } : undefined;
    const btnClass = [
      "flex items-center gap-3 w-full min-w-[140px] sm:min-w-[160px] rounded-xl py-2.5 px-3 sm:px-4",
      "text-[13px] sm:text-sm font-medium transition-all duration-200",
      "active:scale-[0.98] touch-manipulation",
      "shadow-sm hover:shadow-md",
      styleClasses[action.style],
    ].join(" ");

    const content = (
      <>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
          <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
        </span>
        <span className="flex-1 text-left truncate">
          <span className="sm:hidden">{action.labelMobile}</span>
          <span className="hidden sm:inline">{action.labelDesktop}</span>
        </span>
        {action.id === "whatsapp" && (
          <span className="h-2 w-2 shrink-0 rounded-full bg-white/80 animate-pulse" aria-hidden />
        )}
      </>
    );

    if (action.href.startsWith("tel:")) {
      return (
        <a key={action.id} href={action.href} className={btnClass} onClick={() => setIsExpanded(false)}>
          {content}
        </a>
      );
    }
    if (action.external) {
      return (
        <a key={action.id} href={action.href} {...commonAnchorProps} className={btnClass} onClick={() => setIsExpanded(false)}>
          {content}
        </a>
      );
    }
    return (
      <Link key={action.id} href={action.href} className={btnClass} onClick={() => setIsExpanded(false)}>
        {content}
      </Link>
    );
  };

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50">
      <div className="relative flex flex-col items-end gap-3">
        {/* Popup card - shown by default on every load */}
        <div
          className={`transition-all duration-300 ease-out ${
            isExpanded
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-3 pointer-events-none"
          }`}
        >
          <div className="rounded-2xl border border-white/30 dark:border-white/10 bg-white/55 dark:bg-gray-900/55 backdrop-blur-xl shadow-xl p-2.5 sm:p-3 flex flex-col gap-1.5 sm:gap-2">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-2 pb-0.5">
              Quick actions
            </p>
            {quickActions.map((action) => renderAction(action))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
            isExpanded
              ? "bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white"
              : "bg-[#9d9585] hover:bg-[#8a8272] dark:bg-[#b5ad9d] dark:hover:bg-[#9d9585] text-white shadow-lg hover:shadow-xl hover:scale-105"
          }`}
          aria-label={isExpanded ? "Close menu" : "Open contact menu"}
        >
          {isExpanded ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
        </button>
      </div>
    </div>
  );
}

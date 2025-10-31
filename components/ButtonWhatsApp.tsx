"use client";

import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";

interface ButtonWhatsAppProps {
  message?: string;
  className?: string;
  floating?: boolean;
}

export default function ButtonWhatsApp({ 
  message = "Hi! I'd like to book a treatment.",
  className = "",
  floating = false 
}: ButtonWhatsAppProps) {
  const whatsappNumber = siteConfig.contact.whatsapp.replace(/\s/g, "").replace(/\+/g, "");
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  if (floating) {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full shadow-2xl hover:scale-110 hover:shadow-3xl transition-all duration-300 group"
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
      </a>
    );
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md border-2 border-white/50 text-white font-semibold rounded-full hover:bg-white/30 hover:border-white/70 transition-all shadow-lg hover:shadow-xl hover:scale-105 ${className}`}
    >
      <MessageCircle className="w-5 h-5" />
      <span>WhatsApp Us</span>
    </a>
  );
}


import { Playfair_Display, Montserrat, Fira_Code as FontMono } from "next/font/google";

// Luxury serif font for headings
export const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

// Modern sans-serif for body text
export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

// Legacy exports for compatibility
export const fontSans = montserrat;

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});

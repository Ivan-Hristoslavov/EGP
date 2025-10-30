// EGP Aesthetics London - Luxury Color Palette
// Feminine, elegant, professional aesthetic clinic colors

export const aestheticsColors = {
  // Primary - Rose Gold & Pink
  primary: {
    light: "#fce7f3",      // Soft pink
    DEFAULT: "#ec4899",    // Rose pink
    dark: "#be185d",       // Deep rose
    gradient: "from-rose-400 via-pink-500 to-rose-600",
    gradientHover: "from-rose-500 via-pink-600 to-rose-700",
  },

  // Secondary - Lavender & Purple
  secondary: {
    light: "#f3e8ff",      // Soft lavender
    DEFAULT: "#a855f7",    // Purple
    dark: "#7e22ce",       // Deep purple
    gradient: "from-purple-400 via-violet-500 to-purple-600",
    gradientHover: "from-purple-500 via-violet-600 to-purple-700",
  },

  // Accent - Champagne Gold
  accent: {
    light: "#fef3c7",      // Light champagne
    DEFAULT: "#f59e0b",    // Gold
    dark: "#d97706",       // Deep gold
    gradient: "from-amber-400 via-yellow-500 to-amber-600",
    gradientHover: "from-amber-500 via-yellow-600 to-amber-700",
  },

  // Luxury - Rose Gold Metallic
  luxury: {
    gradient: "from-rose-300 via-pink-400 to-rose-500",
    gradientShine: "from-amber-200 via-rose-300 to-pink-400",
    metallic: "from-[#B76E79] via-[#E8B4B8] to-[#B76E79]",
  },

  // Neutrals - Soft & Warm (Warm Beige Theme)
  neutral: {
    lightest: "#f7f5f2",   // Warm beige lighter (#ddd5c3 variant)
    light: "#f0ede7",      // Warm beige light
    DEFAULT: "#ddd5c3",    // Warm beige (primary light theme color)
    dark: "#c9c1b0",       // Warm beige dark
  },

  // Category Colors (для различните услуги)
  categories: {
    face: {
      gradient: "from-pink-400 via-rose-400 to-pink-500",
      hover: "from-pink-500 via-rose-500 to-pink-600",
      bg: "#fdf2f8",         // Soft pink background
      text: "#9f1239",       // Rose text
    },
    antiWrinkle: {
      gradient: "from-purple-400 via-violet-400 to-purple-500",
      hover: "from-purple-500 via-violet-500 to-purple-600",
      bg: "#faf5ff",         // Soft purple background
      text: "#6b21a8",       // Purple text
    },
    fillers: {
      gradient: "from-fuchsia-400 via-pink-500 to-fuchsia-500",
      hover: "from-fuchsia-500 via-pink-600 to-fuchsia-600",
      bg: "#fdf4ff",         // Soft fuchsia background
      text: "#a21caf",       // Fuchsia text
    },
    body: {
      gradient: "from-rose-400 via-pink-400 to-rose-500",
      hover: "from-rose-500 via-pink-500 to-rose-600",
      bg: "#fff1f2",         // Soft rose background
      text: "#881337",       // Rose text
    },
  },

  // Buttons - Luxury Gradients
  buttons: {
    primary: "from-rose-500 via-pink-500 to-rose-600",
    primaryHover: "from-rose-600 via-pink-600 to-rose-700",
    secondary: "from-purple-500 via-violet-500 to-purple-600",
    secondaryHover: "from-purple-600 via-violet-600 to-purple-700",
    gold: "from-amber-400 via-yellow-500 to-amber-500",
    goldHover: "from-amber-500 via-yellow-600 to-amber-600",
    whatsapp: "from-emerald-500 to-green-600",
    whatsappHover: "from-emerald-600 to-green-700",
  },

  // Backgrounds
  backgrounds: {
    hero: "from-rose-600 via-pink-600 to-fuchsia-700",
    section: "from-pink-50 via-rose-50 to-purple-50",
    card: "from-white to-pink-50/30",
    luxury: "from-rose-100 via-pink-100 to-purple-100",
  },

  // Text Colors
  text: {
    primary: "#1f2937",       // Dark gray
    secondary: "#6b7280",     // Medium gray
    light: "#9ca3af",         // Light gray
    onDark: "#ffffff",        // White
    accent: "#be185d",        // Rose
  },

  // Trust & Success
  success: {
    light: "#d1fae5",
    DEFAULT: "#10b981",
    dark: "#059669",
  },

  // Status Colors
  status: {
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
    success: "#10b981",
  },
};

// Helper function to get category color
export function getCategoryColor(category: string) {
  const categoryMap: Record<string, any> = {
    face: aestheticsColors.categories.face,
    "anti-wrinkle": aestheticsColors.categories.antiWrinkle,
    fillers: aestheticsColors.categories.fillers,
    body: aestheticsColors.categories.body,
  };

  return categoryMap[category.toLowerCase()] || aestheticsColors.primary;
}

// Export color classes for Tailwind
export const colorClasses = {
  // Primary button
  btnPrimary: `bg-gradient-to-r ${aestheticsColors.buttons.primary} hover:${aestheticsColors.buttons.primaryHover}`,
  
  // Secondary button
  btnSecondary: `bg-gradient-to-r ${aestheticsColors.buttons.secondary} hover:${aestheticsColors.buttons.secondaryHover}`,
  
  // Gold/Luxury button
  btnGold: `bg-gradient-to-r ${aestheticsColors.buttons.gold} hover:${aestheticsColors.buttons.goldHover}`,
  
  // WhatsApp
  btnWhatsApp: `bg-gradient-to-r ${aestheticsColors.buttons.whatsapp} hover:${aestheticsColors.buttons.whatsappHover}`,

  // Hero section
  hero: `bg-gradient-to-br ${aestheticsColors.backgrounds.hero}`,
  
  // Section backgrounds
  section: `bg-gradient-to-b ${aestheticsColors.backgrounds.section}`,
};


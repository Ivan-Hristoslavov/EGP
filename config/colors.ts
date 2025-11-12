// EGP Aesthetics London - Luxury Color Palette
// Feminine, elegant, professional aesthetic clinic colors

export const aestheticsColors = {
  // Primary - Warm Beige Gradient (main brand tone)
  primary: {
    light: "#f5f1e9",      // Soft warm beige
    DEFAULT: "#ddd5c3",    // Main brand beige
    dark: "#9d9585",       // Rich warm taupe
    gradient: "from-[#9d9585] via-[#b5ad9d] to-[#ddd5c3]",
    gradientHover: "from-[#8c846f] via-[#aea693] to-[#c9c1b0]",
  },

  // Secondary - Deep Charcoal & Graphite
  secondary: {
    light: "#e5e7eb",      // Soft gray highlight
    DEFAULT: "#4b5563",    // Graphite
    dark: "#1f2937",       // Charcoal
    gradient: "from-[#4b5563] via-[#374151] to-[#1f2937]",
    gradientHover: "from-[#374151] via-[#1f2937] to-[#111827]",
  },

  // Accent - Brushed Champagne
  accent: {
    light: "#f6e8d4",
    DEFAULT: "#d8c5a7",
    dark: "#b59c74",
    gradient: "from-[#d8c5a7] via-[#c4b5a0] to-[#a68e6b]",
    gradientHover: "from-[#c4b5a0] via-[#b19775] to-[#8c744f]",
  },

  // Luxury - Soft Metallic Beige
  luxury: {
    gradient: "from-[#c9c1b0] via-[#ddd5c3] to-[#f0ede7]",
    gradientShine: "from-[#f5f1e9] via-[#e4d9c8] to-[#c9c1b0]",
    metallic: "from-[#b5a48c] via-[#d8cbb1] to-[#b5a48c]",
  },

  // Neutrals - Soft & Warm (Warm Beige Theme) - Main Brand Color
  neutral: {
    lightest: "#f7f5f2",   // Warm beige lighter (#ddd5c3 variant)
    light: "#f0ede7",      // Warm beige light
    DEFAULT: "#ddd5c3",    // Warm beige (PRIMARY MAIN COLOR - Main brand color)
    dark: "#c9c1b0",       // Warm beige dark
    darker: "#b5ad9d",     // Warm beige darker
    darkest: "#9d9585",    // Warm beige darkest
  },
  
  // Main Brand Color Palette (based on #ddd5c3)
  brand: {
    lightest: "#f5f2ec",   // Very light beige
    lighter: "#ebe8df",    // Light beige
    light: "#ddd5c3",      // Main brand color (same as neutral.DEFAULT)
    DEFAULT: "#ddd5c3",    // Main brand color
    dark: "#c9c1b0",       // Dark beige
    darker: "#b5ad9d",     // Darker beige
    accent: "#c4b5a0",     // Accent beige for hover states
  },

  // Category Colors (для различните услуги)
  categories: {
    face: {
      gradient: "from-[#b5ad9d] via-[#c9c1b0] to-[#ddd5c3]",
      hover: "from-[#a89f8f] via-[#c4b5a0] to-[#d8cbb1]",
      bg: "#f5f1e9",         // Soft beige background
      text: "#6b5f4b",       // Warm taupe text
    },
    antiWrinkle: {
      gradient: "from-purple-400 via-violet-400 to-purple-500",
      hover: "from-purple-500 via-violet-500 to-purple-600",
      bg: "#faf5ff",         // Soft purple background
      text: "#6b21a8",       // Purple text
    },
    fillers: {
      gradient: "from-[#d8c5a7] via-[#c4b5a0] to-[#b59c74]",
      hover: "from-[#c4b5a0] via-[#b19775] to-[#8c744f]",
      bg: "#f4ede1",
      text: "#725f43",
    },
    body: {
      gradient: "from-[#c9c1b0] via-[#ddd5c3] to-[#f0ede7]",
      hover: "from-[#b5ad9d] via-[#c4b5a0] to-[#e4d9c8]",
      bg: "#f7f2ea",
      text: "#5b5243",
    },
  },

  // Buttons - Luxury Gradients
  buttons: {
    primary: "from-[#9d9585] via-[#b5ad9d] to-[#ddd5c3]",
    primaryHover: "from-[#857d68] via-[#aea693] to-[#c9c1b0]",
    secondary: "from-[#4b5563] via-[#374151] to-[#1f2937]",
    secondaryHover: "from-[#374151] via-[#1f2937] to-[#111827]",
    gold: "from-[#d8c5a7] via-[#c4b5a0] to-[#b59c74]",
    goldHover: "from-[#c4b5a0] via-[#b19775] to-[#8c744f]",
    whatsapp: "from-emerald-500 to-green-600",
    whatsappHover: "from-emerald-600 to-green-700",
  },

  // Backgrounds
  backgrounds: {
    hero: "from-[#9d9585] via-[#b5ad9d] to-[#ddd5c3]",
    section: "from-[#f5f1e9] via-[#f0ede7] to-[#e4d9c8]",
    card: "from-white to-[#f5f1e9]/60",
    luxury: "from-[#d8c5a7] via-[#c4b5a0] to-[#b59c74]",
  },

  // Text Colors
  text: {
    primary: "#1f2937",       // Dark gray
    secondary: "#6b7280",     // Medium gray
    light: "#9ca3af",         // Light gray
    onDark: "#ffffff",        // White
    accent: "#8c846f",        // Warm taupe accent
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


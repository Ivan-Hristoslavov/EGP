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

  // Secondary - Green (Primary dark color for blocks and buttons)
  secondary: {
    light: "#e8f5e8",      // Light green background
    DEFAULT: "#464C45",    // Main green (rgb(70 76 69))
    dark: "#3a4039",       // Dark green
    darker: "#2d322c",     // Darker green for dark mode
    gradient: "from-[#3a4039] via-[#464C45] to-[#5a6259]",
    gradientHover: "from-[#2d322c] via-[#3a4039] to-[#464C45]",
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

  // Buttons - Beige + Green Palette
  buttons: {
    primary: "from-[#464C45] via-[#5a6259] to-[#464C45]", // Green gradient
    primaryHover: "from-[#3a4039] via-[#464C45] to-[#3a4039]",
    secondary: "from-[#ddd5c3] via-[#c9c1b0] to-[#ddd5c3]", // Beige gradient
    secondaryHover: "from-[#c9c1b0] via-[#b5ad9d] to-[#c9c1b0]",
    accent: "from-[#9d9585] via-[#b5ad9d] to-[#ddd5c3]", // Beige accent
    accentHover: "from-[#857d68] via-[#aea693] to-[#c9c1b0]",
    dark: "from-[#3a4039] via-[#464C45] to-[#2d322c]", // Dark green
    darkHover: "from-[#2d322c] via-[#3a4039] to-[#464C45]",
    whatsapp: "from-[#25D366] to-[#128C7E]", // WhatsApp green
    whatsappHover: "from-[#128C7E] to-[#075E54]",
  },

  // Backgrounds - Beige + Green Palette
  backgrounds: {
    hero: "from-[#9d9585] via-[#b5ad9d] to-[#ddd5c3]", // Beige gradient
    section: "from-[#f5f1e9] via-[#f0ede7] to-[#e4d9c8]", // Light beige
    sectionDark: "from-[#3a4039] via-[#464C45] to-[#2d322c]", // Green dark (replaces gray-900)
    card: "from-white to-[#f5f1e9]/60",
    cardDark: "from-[#464C45] to-[#3a4039]", // Green card (replaces gray-800)
    luxury: "from-[#d8c5a7] via-[#c4b5a0] to-[#b59c74]",
  },

  // Text Colors - Beige + Green Palette
  text: {
    primary: "#1f2937",       // Dark gray/charcoal
    secondary: "#6b7280",     // Medium gray
    light: "#9ca3af",         // Light gray
    onDark: "#ffffff",        // White text on dark backgrounds
    onGreen: "#ffffff",       // White text on green backgrounds
    accent: "#8c846f",        // Warm taupe accent
    green: "#464C45",          // Green text
    beige: "#9d9585",         // Beige text
  },

  // Trust & Success
  success: {
    light: "#d1fae5",
    DEFAULT: "#10b981",
    dark: "#059669",
  },

  // Green - Primary button/badge color (change this value to update all green buttons/badges)
  // RGB: rgb(70 76 69) = #464C45
  green: {
    DEFAULT: "#464C45",  // Main green color for buttons, badges, and accents (rgb(70 76 69))
    light: "#5a6259",   // Lighter variant
    dark: "#3a4039",    // Darker variant
    hover: "#3a4039",   // Hover state
    // Background variants for cards and sections
    bg: {
      light: "#f0f7f0",      // Very light green background
      DEFAULT: "#e8f5e8",    // Light green background
      dark: "#d1e8d1",      // Medium light green background
    },
    // Border variants
    border: {
      light: "#c3d9c3",      // Light green border
      DEFAULT: "#9fbf9f",    // Default green border
      dark: "#7a9f7a",      // Dark green border
    },
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
  // Primary button (Green) - Solid color, no gradient
  btnPrimary: `bg-egp-green hover:bg-egp-green-dark text-white`,
  
  // Secondary button (Beige) - Solid color, no gradient
  btnSecondary: `bg-egp-beige hover:bg-egp-beige-dark text-gray-900`,
  
  // Accent button (Beige) - Solid color, no gradient
  btnAccent: `bg-egp-beige-darkest hover:bg-egp-beige-darker text-white`,
  
  // Dark button (Dark green) - Solid color, no gradient
  btnDark: `bg-egp-green-darker hover:bg-egp-green-dark text-white`,
  
  // WhatsApp - Keep gradient for WhatsApp brand colors
  btnWhatsApp: `bg-gradient-to-r ${aestheticsColors.buttons.whatsapp} hover:${aestheticsColors.buttons.whatsappHover} text-white`,

  // Hero section
  hero: `bg-gradient-to-br ${aestheticsColors.backgrounds.hero}`,
  
  // Section backgrounds
  section: `bg-gradient-to-b ${aestheticsColors.backgrounds.section}`,
  sectionDark: `bg-gradient-to-b ${aestheticsColors.backgrounds.sectionDark} text-white`,
  
  // Card backgrounds
  card: `${aestheticsColors.backgrounds.card}`,
  cardDark: `bg-gradient-to-br ${aestheticsColors.backgrounds.cardDark} text-white`,
};

// Typography System
export const typography = {
  // Headings
  h1: "text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white",
  h2: "text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white",
  h3: "text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white",
  h4: "text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white",
  h5: "text-lg md:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white",
  h6: "text-base md:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white",
  
  // Body text
  body: "text-base text-gray-700 dark:text-gray-300",
  bodyLarge: "text-lg text-gray-700 dark:text-gray-300",
  bodySmall: "text-sm text-gray-600 dark:text-gray-400",
  
  // Text on colored backgrounds
  onDark: "text-white",
  onGreen: "text-white",
  onBeige: "text-gray-900",
  
  // Accent text
  accent: `text-[${aestheticsColors.text.accent}]`,
  green: `text-[${aestheticsColors.green.DEFAULT}]`,
  beige: `text-[${aestheticsColors.text.beige}]`,
};

// Form System
export const forms = {
  // Input fields
  input: "px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-[#464C45] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#464C45] focus:border-[#464C45] transition-all",
  inputError: "px-4 py-3 border border-red-500 rounded-xl bg-white dark:bg-[#464C45] text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500",
  
  // Labels
  label: "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",
  labelRequired: "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 after:content-['*'] after:ml-1 after:text-red-500",
  
  // Textarea
  textarea: "px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-[#464C45] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#464C45] focus:border-[#464C45] transition-all resize-none",
  
  // Select
  select: "px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-[#464C45] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#464C45] focus:border-[#464C45] transition-all",
};


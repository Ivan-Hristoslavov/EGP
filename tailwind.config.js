import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './contexts/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'warm-beige': {
          DEFAULT: '#ddd5c3',
          light: '#f0ede7',
          lighter: '#f7f5f2',
          dark: '#c9c1b0',
        },
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "system-ui", "sans-serif"],
        montserrat: ["var(--font-montserrat)", "sans-serif"],
        mono: ["var(--font-mono)"],
      },
      backgroundColor: {
        'light-theme': '#ddd5c3',
        'light-theme-light': '#f0ede7',
        'light-theme-lighter': '#f7f5f2',
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
}

module.exports = config;
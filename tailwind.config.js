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
          DEFAULT: '#E6DDD1',
          light: '#EFEAE3',
          lighter: '#FAF7F3',
          dark: '#D4C9BC',
        },
        'egp-green': {
          DEFAULT: '#464C45',
          light: '#5a6259',
          dark: '#3a4039',
          darker: '#2d322c',
        },
        'egp-beige': {
          DEFAULT: '#E6DDD1',
          light: '#EFEAE3',
          lighter: '#F5F1EC',
          dark: '#D4C9BC',
          darker: '#CFC4B6',
          darkest: '#B8A99A',
        },
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "system-ui", "sans-serif"],
        montserrat: ["var(--font-montserrat)", "sans-serif"],
        mono: ["var(--font-mono)"],
      },
      backgroundColor: {
        'light-theme': '#E6DDD1',
        'light-theme-light': '#EFEAE3',
        'light-theme-lighter': '#FAF7F3',
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
}

module.exports = config;
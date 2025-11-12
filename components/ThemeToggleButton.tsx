"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-2 rounded-full bg-white dark:bg-gray-800 border-2 border-[#ddd5c3] dark:border-[#b5ad9d] w-9 h-9" />
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full bg-white dark:bg-gray-800 border-2 border-[#ddd5c3] dark:border-[#b5ad9d] hover:border-[#c4b5a0] dark:hover:border-[#c9c1b0] transition-all shadow-md hover:shadow-lg active:scale-95"
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-[#857d68]" />
      ) : (
        <Sun className="w-5 h-5 text-[#d8c5a7]" />
      )}
    </button>
  );
}


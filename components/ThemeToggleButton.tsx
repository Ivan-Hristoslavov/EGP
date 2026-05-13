"use client";

import clsx from "clsx";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggleButton({
  className,
}: {
  className?: string;
} = {}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-2 rounded-full bg-white dark:bg-gray-800 border-2 border-[#E6DDD1] dark:border-[#CFC4B6] w-9 h-9" />
    );
  }

  return (
    <button
      aria-label={
        theme === "light" ? "Switch to dark mode" : "Switch to light mode"
      }
      className={clsx(
        "p-2 rounded-full bg-white dark:bg-gray-800 border-2 border-[#E6DDD1] dark:border-[#CFC4B6] hover:border-[#D4C9BC] dark:hover:border-[#E6DDD1] transition-all shadow-md hover:shadow-lg active:scale-95",
        className,
      )}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-gray-900 dark:text-[#d8c5a7]" />
      ) : (
        <Sun className="w-5 h-5 text-gray-900 dark:text-[#d8c5a7]" />
      )}
    </button>
  );
}

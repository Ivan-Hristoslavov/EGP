"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

interface ThemeToggleProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ThemeToggle({ size = "md", className = "" }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Размери за различните размери
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-12 h-12"
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`${sizes[size]} bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse ${className}`} />
    );
  }

  const toggleTheme = () => {
    // If current theme is system, switch to the opposite of resolved theme
    if (theme === "system") {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
    } else {
      setTheme(theme === "dark" ? "light" : "dark");
    }
  };

  // Use resolvedTheme to determine the actual theme being displayed
  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizes[size]} 
        relative 
        rounded-full 
        bg-gradient-to-r 
        from-yellow-400 
        to-orange-500 
        dark:from-blue-600 
        dark:to-purple-700
        shadow-lg 
        hover:shadow-xl 
        transition-all 
        duration-500 
        ease-in-out 
        transform 
        hover:scale-110 
        active:scale-95
        group
        ${className}
      `}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Слънце иконка - показва се когато темата е светла (за да покаже, че можеш да смениш на тъмна) */}
      <div className={`
        absolute 
        inset-0 
        flex 
        items-center 
        justify-center 
        text-white 
        transition-all 
        duration-500 
        ease-in-out
        ${!isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-180 scale-50"}
      `}>
        <svg 
          className={`${iconSizes[size]} drop-shadow-sm`} 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>
      </div>

      {/* Луна иконка - показва се когато темата е тъмна (за да покаже, че можеш да смениш на светла) */}
      <div className={`
        absolute 
        inset-0 
        flex 
        items-center 
        justify-center 
        text-white 
        transition-all 
        duration-500 
        ease-in-out
        ${isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-180 scale-50"}
      `}>
        <svg 
          className={`${iconSizes[size]} drop-shadow-sm`} 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            fillRule="evenodd" 
            d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" 
            clipRule="evenodd" 
          />
        </svg>
      </div>

      {/* Блестящ ефект при hover */}
      <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
      
      {/* Кръгов пулс ефект */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-blue-600 dark:to-purple-700 opacity-75 group-hover:animate-ping" />
    </button>
  );
} 
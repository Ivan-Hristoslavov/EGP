"use client";

import { useState, useRef, useEffect } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

export default function Tooltip({
  content,
  children,
  position = "top",
  delay = 200,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const scrollX =
          window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY =
          window.pageYOffset || document.documentElement.scrollTop;

        let x = rect.left + scrollX + rect.width / 2;
        let y = rect.top + scrollY;
        const offset = 4;

        switch (position) {
          case "top":
            y = rect.top + scrollY - offset;
            break;
          case "bottom":
            y = rect.bottom + scrollY + offset;
            break;
          case "left":
            x = rect.left + scrollX - offset;
            y = rect.top + scrollY + rect.height / 2;
            break;
          case "right":
            x = rect.right + scrollX + offset;
            y = rect.top + scrollY + rect.height / 2;
            break;
        }

        setTooltipPosition({ x, y });
      }
      setIsVisible(true);
      setTimeout(() => setShowTooltip(true), 10);
    }, delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setShowTooltip(false);
    setTimeout(() => setIsVisible(false), 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getTransformClasses = () => {
    switch (position) {
      case "top":
        return "transform -translate-x-1/2 -translate-y-full";
      case "bottom":
        return "transform -translate-x-1/2";
      case "left":
        return "transform -translate-x-full -translate-y-1/2";
      case "right":
        return "transform -translate-y-1/2";
      default:
        return "transform -translate-x-1/2 -translate-y-full";
    }
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {isVisible && (
        <div
          ref={tooltipRef}
          className={`fixed z-[9999] pointer-events-none ${getTransformClasses()} transition-all duration-150 ease-out ${
            showTooltip ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          {/* Tooltip Content */}
          <div className="bg-white text-gray-900 text-xs font-medium px-2 py-1 rounded-lg shadow-xl border border-gray-300 whitespace-nowrap backdrop-blur-sm">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}

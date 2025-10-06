import { useState, useEffect } from "react";

// Throttle function to limit how often the scroll handler runs
function throttle(func: () => void, delay: number) {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return () => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func();
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func();
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(
    null,
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Set isScrolled based on scroll position
      setIsScrolled(scrollY > 20);

      // Determine scroll direction
      if (scrollY > lastScrollY && scrollY > 100) {
        // Scrolling down and past threshold
        setScrollDirection("down");
      } else if (scrollY < lastScrollY || scrollY <= 100) {
        // Scrolling up or near top
        setScrollDirection("up");
      }

      setLastScrollY(scrollY);
    };

    // Throttle scroll handler to run at most every 200ms (increased from 100ms)
    const throttledHandleScroll = throttle(handleScroll, 200);

    window.addEventListener("scroll", throttledHandleScroll, { passive: true });

    return () => window.removeEventListener("scroll", throttledHandleScroll);
  }, [lastScrollY]);

  return { scrollDirection, isScrolled };
}

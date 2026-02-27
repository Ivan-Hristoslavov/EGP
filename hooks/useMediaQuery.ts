import { useState, useEffect } from "react";

/**
 * Returns true when viewport is >= the given breakpoint (default 768px, Tailwind md).
 * Use to show table/card toggle only on desktop, and force card view on mobile.
 */
export function useMediaQuery(query: string = "(min-width: 768px)"): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

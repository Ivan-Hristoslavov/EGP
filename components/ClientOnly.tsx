"use client";

import { useState, useEffect } from "react";

/**
 * Wraps children to only render on the client after mount.
 * Prevents React Aria/HeroUI useId hydration mismatches when server and
 * client render different component trees (e.g. due to loading states,
 * theme detection, or conditional content).
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

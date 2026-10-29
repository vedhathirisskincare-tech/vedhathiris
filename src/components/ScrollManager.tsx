"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ScrollHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Prevent browser from restoring scroll position to bottom on page refresh or back/forward
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Scroll smoothly or instantly to top on route or query change
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    // Also trigger on the next frame to catch any dynamic content/image paint layout shifts
    const rafId = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    });

    return () => cancelAnimationFrame(rafId);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Initial mount reset
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return null;
}

export default function ScrollManager() {
  return (
    <Suspense fallback={null}>
      <ScrollHandler />
    </Suspense>
  );
}


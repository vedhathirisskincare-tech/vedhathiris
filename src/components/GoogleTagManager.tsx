"use client";

import { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { GTM_ID, sendGTMEvent } from "@/utils/gtm";

function GTMPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Avoid duplicate page_view on initial render as GTM loads
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const search = searchParams?.toString();
    const url = pathname + (search ? `?${search}` : "");

    sendGTMEvent({
      event: "page_view",
      page_path: url,
      page_location: typeof window !== "undefined" ? window.location.href : url,
      page_title: typeof document !== "undefined" ? document.title : "",
    });
  }, [pathname, searchParams]);

  return null;
}

export default function GoogleTagManager() {
  return (
    <>
      {/* Route Change Tracker for SPA Navigation */}
      <Suspense fallback={null}>
        <GTMPageViewTracker />
      </Suspense>

      {/* Google Tag Manager / gtag dataLayer initialization */}
      <Script
        id="gtm-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
          `,
        }}
      />

      {/* Google Tag Manager Library Script */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
      />

      {/* Google Tag Manager (noscript fallback) */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
    </>
  );
}


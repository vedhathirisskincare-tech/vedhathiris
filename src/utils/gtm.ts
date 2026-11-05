// Google Tag Manager & Google Analytics (gtag) utility
export const GTM_ID = 'GTM-TBC4K8ML';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Push custom data or events into GTM dataLayer
 */
export function sendGTMEvent(data: Record<string, any>) {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(data);
  }
}

/**
 * Call gtag directly if configured
 */
export function gtag(...args: any[]) {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag === 'function') {
      window.gtag(...args);
    } else {
      window.dataLayer.push(arguments);
    }
  }
}


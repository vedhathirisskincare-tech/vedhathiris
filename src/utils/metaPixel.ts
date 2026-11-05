// Meta (Facebook) Pixel utility for ad campaigns and e-commerce tracking
export const FB_PIXEL_ID = '1792987858640033';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

/**
 * Track standard Meta Pixel event (e.g. PageView, ViewContent, AddToCart, InitiateCheckout, Purchase)
 */
export function trackMetaEvent(event: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    if (params) {
      window.fbq('track', event, params);
    } else {
      window.fbq('track', event);
    }
  }
}

/**
 * Track custom Meta Pixel event
 */
export function trackCustomMetaEvent(event: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    if (params) {
      window.fbq('trackCustom', event, params);
    } else {
      window.fbq('trackCustom', event);
    }
  }
}


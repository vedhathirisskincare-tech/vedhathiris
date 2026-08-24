/**
 * Resolves the public canonical site URL based on environment variables or production domain.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://vedhathiris.com')
).replace(/\/+$/, '');

export function getCanonicalUrl(path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath === '/' ? '' : cleanPath}`;
}

export function getLanguageAlternates(path: string = '') {
  const url = getCanonicalUrl(path);
  return {
    'en-IN': url,
    'en-US': url,
    'ta-IN': url,
    'x-default': url,
  };
}

import { site } from '@/content/site';

/**
 * The public origin used for canonical URLs, the sitemap, Open Graph and structured data.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://parsaalizadeh.com). On Vercel the
 * production domain is picked up automatically; content/site.ts is the last fallback.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
  site.url
).replace(/\/$/, '');

/** Absolute URL for a path ("/blog/x" → "https://domain/blog/x"). */
export const absoluteUrl = (path = '/'): string => (path.startsWith('http') ? path : `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`);

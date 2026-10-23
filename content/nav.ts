import { localePath, splitLocale, ui, type Locale } from '@/content/i18n';

/**
 * Multi-page site: every nav item is its own URL with its own title, description and
 * structured data. The home page keeps a short preview of each section that links to it.
 */
export const PAGES = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'work', label: 'Work', href: '/work' },
  { id: 'about', label: 'About', href: '/about' },
  { id: 'stack', label: 'Stack', href: '/stack' },
  { id: 'blog', label: 'Blog', href: '/blog' },
  { id: 'contact', label: 'Contact', href: '/contact' }
] as const;

export type PageId = (typeof PAGES)[number]['id'];

/** A page's URL in a language. */
export const pageHref = (id: PageId, locale: Locale = 'en'): string => localePath(locale, PAGES.find(p => p.id === id)?.href ?? '/');

/** The nav in a language. */
export const pagesFor = (locale: Locale): { id: PageId; label: string; href: string }[] =>
  PAGES.map(p => ({ id: p.id, label: ui[locale].nav[p.id], href: pageHref(p.id, locale) }));

/** Which nav item a path belongs to. Topic guides live under the blog. */
export const pageForPath = (pathname: string): PageId | null => {
  const { path } = splitLocale(pathname);
  if (path === '/') return 'home';
  if (path.startsWith('/topics/')) return 'blog';
  const hit = PAGES.find(p => p.href !== '/' && (path === p.href || path.startsWith(`${p.href}/`)));
  return hit?.id ?? null;
};

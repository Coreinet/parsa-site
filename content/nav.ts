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

export const pageHref = (id: PageId): string => PAGES.find(p => p.id === id)?.href ?? '/';

/** Which nav item a path belongs to. Topic guides live under the blog. */
export const pageForPath = (pathname: string): PageId | null => {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/topics/')) return 'blog';
  const hit = PAGES.find(p => p.href !== '/' && (pathname === p.href || pathname.startsWith(`${p.href}/`)));
  return hit?.id ?? null;
};

/**
 * Single-page site: every nav item is a section on the home page.
 * Case studies (/work/[slug]) and articles (/blog/[slug]) are the only other pages.
 */
export const SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'stack', label: 'Stack' },
  { id: 'blog', label: 'Blog' },
  { id: 'contact', label: 'Contact' }
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];

export const sectionHref = (id: SectionId): string => (id === 'home' ? '/#home' : `/#${id}`);

/** On a detail page, which section does it belong to? */
export const sectionForPath = (pathname: string): SectionId | null =>
  pathname.startsWith('/work/') ? 'work' : pathname.startsWith('/blog/') ? 'blog' : null;

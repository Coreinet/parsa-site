import type { MouseEvent } from 'react';
import type { SectionId } from '@/content/nav';

/**
 * Click handler for nav links to home-page sections. On the home page it scrolls itself:
 * Next.js ignores a link whose hash already matches the URL, so after one click on Home,
 * scrolling away and clicking Home again did nothing. Elsewhere the Link navigates as usual.
 */
export function scrollToSection(e: MouseEvent<HTMLAnchorElement>, id: SectionId): void {
  if (window.location.pathname !== '/' || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  if (id === 'home') window.scrollTo({ top: 0, behavior });
  else el.scrollIntoView({ behavior, block: 'start' });
  window.history.replaceState(window.history.state, '', `#${id}`);
}

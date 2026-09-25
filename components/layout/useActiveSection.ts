'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SECTIONS, sectionForPath, type SectionId } from '@/content/nav';

/**
 * Which nav item is current. On the home page: the section crossing a line 40% down the
 * viewport (scrollspy). On a case study or article: its parent section.
 */
export function useActiveSection(): SectionId | null {
  const pathname = usePathname();
  const [active, setActive] = useState<SectionId | null>(pathname === '/' ? 'home' : sectionForPath(pathname));

  useEffect(() => {
    if (pathname !== '/') {
      setActive(sectionForPath(pathname));
      return undefined;
    }
    const els = SECTIONS.map(s => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      entries => {
        const hit = entries.find(e => e.isIntersecting);
        if (hit) setActive(hit.target.id as SectionId);
      },
      { rootMargin: '-40% 0px -59% 0px' }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return active;
}

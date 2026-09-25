'use client';

/**
 * PillNav: adapted from React Bits (PillNav-TS-TW) for the Source & Signal system.
 * - desktop navigation for the single-page site; every item scrolls to a home-page section
 * - active item follows the section in view (scrollspy); on detail pages, the parent section
 * - hover AND keyboard focus get the rising fill (shared .fx-fill styles in globals.css)
 * - plain nav links with aria-current (the original's menubar roles promise arrow-key menus)
 */

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { SECTIONS, sectionHref } from '@/content/nav';
import { useActiveSection } from '@/components/layout/useActiveSection';
import { scrollToSection } from '@/components/layout/scrollToSection';

export default function PillNav() {
  const active = useActiveSection();

  return (
    <nav aria-label="Main" className="h-12 rounded-full border border-line-strong bg-surface/85 p-1 shadow-float backdrop-blur-md">
      <ul className="flex h-full items-stretch gap-1">
        {SECTIONS.map(s => {
          const on = active === s.id;
          return (
            <li key={s.id} className="relative flex">
              <Link
                href={sectionHref(s.id)}
                onClick={e => scrollToSection(e, s.id)}
                aria-current={on ? 'true' : undefined}
                style={{ '--fx-fill': 'var(--ink)', '--fx-text': 'var(--paper)' } as CSSProperties}
                className={`fx-fill inline-flex items-center rounded-full px-4 text-[15px] font-medium leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal ${
                  on ? 'bg-paper-2 text-ink' : 'text-ink-2'
                }`}
              >
                <span className="fx-label">
                  <span>{s.label}</span>
                  <span aria-hidden="true">{s.label}</span>
                </span>
              </Link>
              {on ? (
                <span aria-hidden="true" className="pointer-events-none absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-signal" />
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

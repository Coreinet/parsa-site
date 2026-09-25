'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode, type CSSProperties } from 'react';
import PillNav from '@/components/layout/PillNav';
import Monogram from '@/components/ui/Monogram';
import { scrollToSection } from '@/components/layout/scrollToSection';

/**
 * Floating header. Desktop (lg + fine pointer): monogram · PillNav · actions, hides on scroll down,
 * returns on scroll up. Phones: monogram + actions only; navigation lives in the bottom Dock.
 * `actions` takes the ⌘K button and ThemeToggle once they exist.
 */
export default function SiteHeader({ actions }: { actions?: ReactNode }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const onScroll = (): void => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        if (Math.abs(y - last) > 6) {
          setHidden(y > last && y > 120);
          last = y;
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header
      // Never hide while something inside has keyboard focus.
      onFocus={() => setHidden(false)}
      className={`sticky top-[calc(env(safe-area-inset-top,0px)+16px)] z-40 mt-[calc(env(safe-area-inset-top,0px)+16px)] mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-5 transition-transform duration-300 ease-out motion-reduce:transition-none sm:px-8 lg:px-12 ${
        hidden ? '-translate-y-[calc(100%+32px)]' : ''
      }`}
    >
      <Link
        href="/#home"
        onClick={e => scrollToSection(e, 'home')}
        aria-label="Parsa Alizadeh, home"
        style={{ '--fx-fill': 'var(--ink)' } as CSSProperties}
        className="fx-fill group grid size-11 place-items-center rounded-full border border-line-strong bg-surface/85 text-ink backdrop-blur-md transition-colors duration-300 hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
      >
        <Monogram />
      </Link>

      <div className="hidden desk:block">
        <PillNav />
      </div>

      <div className="flex items-center gap-2">{actions}</div>
    </header>
  );
}

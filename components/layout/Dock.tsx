'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { sectionHref, type SectionId } from '@/content/nav';
import { useActiveSection } from '@/components/layout/useActiveSection';
import { scrollToSection } from '@/components/layout/scrollToSection';
import SocialIcons from '@/components/ui/SocialIcons';

const Icon = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const ITEMS: { id: SectionId; label: string; icon: ReactNode }[] = [
  { id: 'home', label: 'Home', icon: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /> },
  { id: 'work', label: 'Work', icon: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18" /></> },
  { id: 'blog', label: 'Blog', icon: <><path d="M5 4h11l3 3v13H5z" /><path d="M9 10h7M9 14h7" /></> },
  { id: 'contact', label: 'Contact', icon: <><path d="M4 6h16v12H4z" /><path d="M4 7l8 6 8-6" /></> }
];

const MORE: { id: SectionId; label: string }[] = [
  { id: 'about', label: 'About' },
  { id: 'stack', label: 'Stack' }
];

/**
 * Phones and tablets: a floating dock where the thumb is, plus a "More" bottom sheet.
 * Every item scrolls to a home-page section. Hidden on desktop, where the PillNav takes over.
 */
export default function Dock() {
  const pathname = usePathname();
  const active = useActiveSection();
  const sheetRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    sheetRef.current?.close();
  }, [pathname]);

  const toggle = (): void => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    if (sheet.open) sheet.close();
    else sheet.showModal();
  };

  const moreActive = MORE.some(m => m.id === active);

  return (
    <>
      <nav aria-label="Main" className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom,0px)+12px)] z-50 desk:hidden">
        <ul className="mx-auto grid max-w-[440px] grid-cols-5 rounded-full border border-line-strong bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] p-1.5 shadow-float backdrop-blur-lg">
          {ITEMS.map(item => {
            const on = active === item.id;
            return (
              <li key={item.id}>
                <Link
                  href={sectionHref(item.id)}
                  onClick={e => scrollToSection(e, item.id)}
                  aria-current={on ? 'true' : undefined}
                  className={`grid justify-items-center gap-0.5 rounded-full py-1.5 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-signal ${
                    on ? 'bg-ink text-paper' : 'text-ink-3 hover:text-ink'
                  }`}
                >
                  <Icon>{item.icon}</Icon>
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              aria-haspopup="dialog"
              className={`grid w-full justify-items-center gap-0.5 rounded-full py-1.5 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-signal ${
                open || moreActive ? 'bg-ink text-paper' : 'text-ink-3 hover:text-ink'
              }`}
            >
              <Icon>{open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M5 8h14M5 12h14M5 16h14" />}</Icon>
              {open ? 'Close' : 'More'}
            </button>
          </li>
        </ul>
      </nav>

      <dialog
        ref={sheetRef}
        aria-label="More sections"
        onClose={() => setOpen(false)}
        onToggle={e => setOpen((e.currentTarget as HTMLDialogElement).open)}
        onClick={e => {
          if (e.target === sheetRef.current) sheetRef.current?.close();
        }}
        className="mb-0 mt-auto w-full max-w-none rounded-t-[22px] border-t border-line-strong bg-surface p-0 text-ink backdrop:bg-[rgb(18_20_22/.3)] open:animate-[sheet-in_.28s_cubic-bezier(.2,.8,.2,1)] desk:hidden"
      >
        <div className="mx-auto grid max-w-[520px] gap-1 px-6 pb-[calc(env(safe-area-inset-bottom,0px)+104px)] pt-3">
          <div className="mb-3 h-1 w-9 justify-self-center rounded-full bg-line-strong" aria-hidden="true" />
          {MORE.map(m => (
            <Link
              key={m.id}
              href={sectionHref(m.id)}
              onClick={e => {
                sheetRef.current?.close();
                scrollToSection(e, m.id);
              }}
              aria-current={active === m.id ? 'true' : undefined}
              className="flex items-baseline justify-between py-2 text-2xl font-semibold tracking-[-0.02em] aria-[current=true]:text-signal"
            >
              {m.label}
              <span className="font-mono text-xs font-normal text-ink-3">#{m.id}</span>
            </Link>
          ))}
          <div className="mt-4 border-t border-line pt-4">
            <SocialIcons />
          </div>
        </div>
      </dialog>
    </>
  );
}

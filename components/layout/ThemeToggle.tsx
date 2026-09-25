'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const ORDER = ['system', 'light', 'dark'] as const;
const LABEL = { system: 'Theme: system', light: 'Theme: light', dark: 'Theme: dark' } as const;

/** Cycles system → light → dark. The label always says the current choice. */
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const current = (mounted && (theme as (typeof ORDER)[number])) || 'system';
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`${LABEL[current]}. Switch to ${next}.`}
      title={LABEL[current]}
      className="grid size-11 place-items-center rounded-full border border-line-strong bg-surface/85 text-ink-2 backdrop-blur-md transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
    >
      <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {current === 'light' ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : current === 'dark' ? (
          <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="8" />
            <path d="M12 4v16" />
            <path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" stroke="none" />
          </>
        )}
      </svg>
    </button>
  );
}

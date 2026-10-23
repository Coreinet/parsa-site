'use client';

import { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  depth: 2 | 3;
}

/** "On this page": highlights the section being read. Sticky in the margin on desktop. */
export default function Toc({ headings, label = 'On this page' }: { headings: Heading[]; label?: string }) {
  const [active, setActive] = useState(headings[0]?.id ?? '');

  useEffect(() => {
    const els = headings.map(h => document.getElementById(h.id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      entries => {
        const hit = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav aria-label={label} className="grid gap-3">
      <span className="font-mono text-[11px] uppercase tracking-[.08em] text-ink-3">{label}</span>
      <ul className="grid gap-1.5 border-s border-line text-sm">
        {headings.map(h => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              aria-current={active === h.id ? 'location' : undefined}
              className={`-ms-px block border-s py-0.5 transition-colors ${h.depth === 3 ? 'ps-6' : 'ps-3'} ${
                active === h.id ? 'border-signal text-ink' : 'border-transparent text-ink-3 hover:text-ink'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

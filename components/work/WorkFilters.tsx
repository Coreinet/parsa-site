'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState, type ReactNode } from 'react';

export interface FilterableItem {
  key: string;
  type: string;
  node: ReactNode;
}

/**
 * Filter chips over the project grid. The choice is mirrored in the URL (?type=mobile) so a
 * filtered view can be shared; read on mount to keep the page statically generated.
 */
export default function WorkFilters({ types, items }: { types: { value: string; label: string; count: number }[]; items: FilterableItem[] }) {
  const [active, setActive] = useState('all');

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('type');
    if (t && types.some(x => x.value === t)) setActive(t);
  }, [types]);

  const choose = (value: string): void => {
    setActive(value);
    const url = new URL(window.location.href);
    if (value === 'all') url.searchParams.delete('type');
    else url.searchParams.set('type', value);
    window.history.replaceState(null, '', url);
  };

  const visible = items.filter(i => active === 'all' || i.type === active);
  const all = [{ value: 'all', label: 'All', count: items.length }, ...types];

  return (
    <div className="grid gap-8">
      <div
        role="group"
        aria-label="Filter projects by type"
        className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [mask-image:linear-gradient(to_right,transparent,#000_20px,#000_calc(100%-20px),transparent)] sm:mx-0 sm:flex-wrap sm:px-0 sm:[mask-image:none]"
      >
        {all.map(t => (
          <button
            key={t.value}
            type="button"
            aria-pressed={active === t.value}
            onClick={() => choose(t.value)}
            className={`h-10 flex-none rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal ${
              active === t.value ? 'border-ink bg-ink text-paper' : 'border-line-strong text-ink-2 hover:border-ink hover:text-ink'
            }`}
          >
            {t.label} <span className="font-mono text-[11px] opacity-70">{t.count}</span>
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {visible.length} {visible.length === 1 ? 'project' : 'projects'} shown
      </p>

      <motion.ul layout className="grid gap-x-8 gap-y-14 md:grid-cols-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map(item => (
            <motion.li
              key={item.key}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {item.node}
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {visible.length === 0 ? (
        <div className="grid justify-items-start gap-3 rounded-lg border border-dashed border-line-strong p-6">
          <p className="font-mono text-[13px] text-ink-3">$ ls /work?type={active}{'\n'}0 results</p>
          <p className="font-semibold">No {all.find(a => a.value === active)?.label.toLowerCase()} projects yet</p>
          <button type="button" onClick={() => choose('all')} className="h-10 rounded-full border border-line-strong px-4 text-sm font-semibold hover:border-ink">
            Show all work
          </button>
        </div>
      ) : null}
    </div>
  );
}

'use client';

import { useMemo, useState, type ReactNode } from 'react';

export interface IndexEntry {
  slug: string;
  year: string;
  category: string;
  search: string;
  node: ReactNode;
}

/** Blog archive on /blog: category chips + instant search, grouped under year headings. */
export default function BlogIndex({ entries, categories }: { entries: IndexEntry[]; categories: { value: string; label: string; count: number }[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hits = entries.filter(e => (category === 'all' || e.category === category) && (!q || e.search.includes(q)));
    const byYear = new Map<string, IndexEntry[]>();
    hits.forEach(e => byYear.set(e.year, [...(byYear.get(e.year) ?? []), e]));
    return [...byYear.entries()];
  }, [entries, query, category]);

  const count = groups.reduce((n, [, list]) => n + list.length, 0);
  const chips = [{ value: 'all', label: 'All', count: entries.length }, ...categories];

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
          {chips.map(c => (
            <button
              key={c.value}
              type="button"
              aria-pressed={category === c.value}
              onClick={() => setCategory(c.value)}
              className={`h-10 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal ${
                category === c.value ? 'border-ink bg-ink text-paper' : 'border-line-strong text-ink-2 hover:border-ink hover:text-ink'
              }`}
            >
              {c.label} <span className="ml-0.5 text-xs opacity-60">{c.count}</span>
            </button>
          ))}
        </div>
        <div className="relative w-full max-w-xs">
          <label htmlFor="blog-search" className="sr-only">
            Search articles
          </label>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-3">
            <circle cx="11" cy="11" r="6" />
            <path d="M20 20l-4.5-4.5" />
          </svg>
          <input
            id="blog-search"
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search articles"
            className="h-11 w-full rounded-full border border-line-strong bg-surface pl-11 pr-4 text-base text-ink transition-[border-color,box-shadow] placeholder:text-ink-3 focus:border-signal focus:shadow-[0_0_0_3px_var(--signal-soft)] focus:outline-none"
          />
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {count} {count === 1 ? 'article' : 'articles'} shown
      </p>

      {groups.length === 0 ? (
        <div className="grid justify-items-start gap-3 rounded-lg border border-dashed border-line-strong p-6">
          <p className="font-semibold">No articles match{query ? ` “${query}”` : ''}</p>
          <p className="text-sm text-ink-2">Try a broader word or another category.</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setCategory('all');
            }}
            className="h-10 rounded-full border border-line-strong px-4 text-sm font-semibold hover:border-ink"
          >
            Show all articles
          </button>
        </div>
      ) : (
        groups.map(([year, list]) => (
          <section key={year} aria-labelledby={`y-${year}`} className="grid gap-2">
            <h3 id={`y-${year}`} className="tabular font-mono text-sm text-ink-3">
              {year}
            </h3>
            <div className="border-b border-line">{list.map(e => <div key={e.slug}>{e.node}</div>)}</div>
          </section>
        ))
      )}
    </div>
  );
}

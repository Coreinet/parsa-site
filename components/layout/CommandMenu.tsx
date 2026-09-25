'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

export interface CommandEntry {
  group: 'Pages' | 'Work' | 'Blog';
  title: string;
  href: string;
  hint?: string;
}

/** ⌘K / Ctrl+K menu for pages, projects and articles. Native <dialog> handles focus and Escape. */
export default function CommandMenu({ entries }: { entries: CommandEntry[] }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(e => `${e.title} ${e.hint ?? ''} ${e.group}`.toLowerCase().includes(q));
  }, [entries, query]);

  const open = useCallback(() => {
    setQuery('');
    setActive(0);
    dialogRef.current?.showModal();
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const close = (): void => dialogRef.current?.close();

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (dialogRef.current?.open) close();
        else open();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (entry: CommandEntry | undefined): void => {
    if (!entry) return;
    close();
    router.push(entry.href);
  };

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(i => Math.min(results.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(i => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[active]);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="Search pages, work and articles"
        title="Search (Ctrl K)"
        className="grid size-11 place-items-center rounded-full border border-line-strong bg-surface/85 text-ink-2 backdrop-blur-md transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
      >
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="6" />
          <path d="M20 20l-4.5-4.5" />
        </svg>
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Search"
        onClick={e => {
          if (e.target === dialogRef.current) close(); // click on the backdrop
        }}
        className="m-auto mt-[12vh] w-[min(640px,calc(100vw-32px))] rounded-lg border border-line-strong bg-surface p-0 text-ink shadow-float backdrop:bg-[rgb(18_20_22/.35)] backdrop:backdrop-blur-[2px]"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true" className="flex-none text-ink-3">
            <circle cx="11" cy="11" r="6" />
            <path d="M20 20l-4.5-4.5" />
          </svg>
          <input
            ref={inputRef}
            id="command-input"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            placeholder="Search pages, projects, articles…"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
            className="h-14 w-full bg-transparent text-base outline-none placeholder:text-ink-3"
          />
          <kbd className="flex-none rounded-xs border border-line px-1.5 py-0.5 font-mono text-[11px] text-ink-3">Esc</kbd>
        </div>

        <ul id={listId} role="listbox" aria-label="Results" className="max-h-[min(420px,60vh)] overflow-y-auto p-2">
          {results.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-ink-2">
              Nothing matches “{query}”. Try a project name or a topic like “sync”.
            </li>
          ) : (
            results.map((entry, i) => (
              <li
                key={`${entry.group}-${entry.href}`}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseMove={() => setActive(i)}
                onClick={() => go(entry)}
                className={`flex cursor-pointer items-center justify-between gap-4 rounded-sm px-3 py-2.5 ${i === active ? 'bg-paper-2' : ''}`}
              >
                <span className="min-w-0 truncate font-medium">{entry.title}</span>
                <span className="flex-none font-mono text-[11px] text-ink-3">
                  {entry.hint ? `${entry.hint} · ` : ''}
                  {entry.group}
                </span>
              </li>
            ))
          )}
        </ul>
      </dialog>
    </>
  );
}

import Link from 'next/link';
import type { Project } from '@/lib/content';
import { PROJECT_TYPES } from '@/lib/content';
import { Status } from '@/components/work/ProjectCard';

/** Index of everything as open rows (no boxed table): year, name, type, stack, status, arrow. */
export default function ArchiveTable({ projects }: { projects: Project[] }) {
  return (
    <ul className="border-t border-line">
      {projects.map(p => (
        <li key={p.slug}>
          <Link
            href={`/work/${p.slug}`}
            className="group grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-b border-line py-5 transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-signal sm:px-3 md:grid-cols-[72px_minmax(0,2fr)_minmax(0,1fr)_minmax(0,2fr)_120px_32px]"
          >
            <span className="tabular font-mono text-[13px] text-ink-3">{p.year}</span>
            <span className="text-lg font-semibold tracking-[-0.01em] transition-colors group-hover:text-signal">{p.title}</span>
            <span className="hidden text-ink-2 md:block">{PROJECT_TYPES[p.type]}</span>
            <span className="col-start-2 truncate text-sm text-ink-3 md:col-start-auto md:text-[15px] md:text-ink-2">{p.stack.slice(0, 3).join(' · ')}</span>
            <Status status={p.status} className="row-start-1 col-start-3 justify-self-end md:row-start-auto md:col-start-auto md:justify-self-start" />
            <span
              aria-hidden="true"
              className="hidden size-8 place-items-center rounded-full border border-line-strong text-ink-3 transition-all duration-300 group-hover:-rotate-45 group-hover:border-ink group-hover:bg-ink group-hover:text-paper md:grid"
            >
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '@/lib/content';
import { ExampleBadge, Tag } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';

export const STATUS: Record<Project['status'], { label: string; mark: string; className: string }> = {
  live: { label: 'Live', mark: '●', className: 'text-ok' },
  repository: { label: 'Code on GitHub', mark: '◇', className: 'text-ink-2' },
  'in-progress': { label: 'In progress', mark: '◐', className: 'text-warn' },
  archived: { label: 'Archived', mark: '○', className: 'text-ink-3' }
};

export function Status({ status, className }: { status: Project['status']; className?: string }) {
  const s = STATUS[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[13px] font-medium', s.className, className)}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}

/** One link per card; the mock frame lifts and the arrow moves diagonally on hover. */
export function ProjectCard({ project, featured = false }: { project: Project; featured?: boolean }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group grid content-start gap-4 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border border-line bg-paper-2',
          featured ? 'aspect-[16/9]' : 'aspect-[4/3]'
        )}
      >
        <Image
          src={project.cover}
          alt=""
          fill
          sizes={featured ? '(min-width: 1200px) 1100px, 100vw' : '(min-width: 1024px) 560px, 100vw'}
          className="object-cover transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.015] motion-reduce:transition-none"
        />
        <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-3 py-1.5 text-[12.5px] font-medium text-ink-2 backdrop-blur">
          {project.year} · {project.platform}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-surface/90 px-3 py-1.5 backdrop-blur">
          <Status status={project.status} />
        </span>
      </div>
      <div className="grid gap-1.5">
        <h3 className={cn('flex items-baseline justify-between gap-3 font-semibold tracking-[-0.015em]', featured ? 'text-h2' : 'text-xl')}>
          <span className="transition-colors group-hover:text-signal">{project.title}</span>
          <span
            aria-hidden="true"
            className="grid size-9 flex-none place-items-center rounded-full border border-line-strong text-base text-ink-3 transition-all duration-300 group-hover:-rotate-45 group-hover:border-ink group-hover:bg-ink group-hover:text-paper"
          >
            →
          </span>
        </h3>
        <p className="text-ink-2">{project.summary}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {project.example ? <ExampleBadge /> : null}
        {project.stack.slice(0, featured ? 6 : 4).map(s => (
          <Tag key={s}>{s}</Tag>
        ))}
      </div>
    </Link>
  );
}

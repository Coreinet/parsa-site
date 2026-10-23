import type { Project } from '@/lib/content';
import { Status } from '@/components/work/ProjectCard';
import { pageText } from '@/content/pageText';

/** The datasheet at the top of a case study: the first thing a recruiter reads. */
export default function SpecSheet({ project }: { project: Project }) {
  const t = pageText[project.locale].project;
  const rows: [string, React.ReactNode][] = [
    [t.role, project.role],
    [t.year, project.year],
    [t.platform, project.platform],
    [t.stack, <span key="st" dir="ltr">{project.stack.join(' · ')}</span>],
    [t.status, <Status key="s" status={project.status} locale={project.locale} className="text-xs" />]
  ];
  const links = [
    project.links.live ? { label: t.liveSite, href: project.links.live } : null,
    project.links.repo ? { label: t.source, href: project.links.repo } : null
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <dl className="grid overflow-hidden rounded-md border border-line bg-surface font-mono text-[13px] sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 border-b border-line px-4 py-3 sm:odd:border-e">
          <dt className="text-ink-3">{label}</dt>
          <dd className="text-ink">{value}</dd>
        </div>
      ))}
      <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 border-b border-line px-4 py-3 sm:border-b-0">
        <dt className="text-ink-3">{t.links}</dt>
        <dd className="flex flex-wrap gap-x-4 gap-y-1">
          {links.length ? (
            links.map(l => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="text-signal underline underline-offset-2 hover:decoration-2">
                {l.label} ↗
              </a>
            ))
          ) : (
            <span className="text-ink-3">{t.private}</span>
          )}
        </dd>
      </div>
    </dl>
  );
}

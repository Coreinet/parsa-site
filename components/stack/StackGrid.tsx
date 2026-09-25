import Link from 'next/link';
import type { StackLayerData } from '@/content/stack';
import { StackIcon } from '@/components/stack/icons';
import { getProjects } from '@/lib/content';

/**
 * One layer's tools. Each tool links to the projects that use it, so the stack is evidence
 * ("used in Veyro, Gitech") rather than a self-assessment.
 */
export default function StackGrid({ layer }: { layer: StackLayerData }) {
  const projects = new Map(getProjects().map(p => [p.slug, p.title]));

  return (
    <div className="grid gap-5">
      <p className="text-ink-2">{layer.summary}</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {layer.items.map(item => {
          const used = item.usedIn.filter(slug => projects.has(slug));
          return (
            <li key={item.name} className="grid grid-cols-[28px_minmax(0,1fr)] items-start gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5">
              <StackIcon name={item.icon} className="mt-0.5 size-5 text-ink-2" />
              <div className="grid gap-1">
                <span className="font-semibold">{item.name}</span>
                <span className="text-sm text-ink-2">{item.note}</span>
                {used.length ? (
                  <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1 pt-1 text-[13px] text-ink-3">
                    Used in
                    {used.map((slug, i) => (
                      <span key={slug}>
                        <Link href={`/work/${slug}`} className="font-medium text-ink underline decoration-line-strong underline-offset-2 hover:text-signal hover:decoration-signal">
                          {projects.get(slug)}
                        </Link>
                        {i < used.length - 1 ? ',' : ''}
                      </span>
                    ))}
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

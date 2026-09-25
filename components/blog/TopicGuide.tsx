import Link from 'next/link';
import { topicsForArticle } from '@/content/topics';
import { getArticle, getProject } from '@/lib/content';

/**
 * "Part of a topic guide" box at the end of an article: the topic hub, the pillar (when this
 * isn't it), the sibling articles, and the projects where the topic shows up in practice.
 */
export default function TopicGuide({ slug }: { slug: string }) {
  const topics = topicsForArticle(slug);
  if (!topics.length) return null;

  return (
    <div className="grid gap-4">
      {topics.map(topic => {
        const siblings = [topic.pillar, ...topic.supporting]
          .filter(s => s !== slug)
          .map(s => ({ slug: s, article: getArticle(s), pillar: s === topic.pillar }))
          .filter(s => s.article);
        const projects = topic.projects.map(p => getProject(p)).filter(p => p !== undefined);
        return (
          <aside key={topic.id} aria-label={`Topic guide: ${topic.name}`} className="grid gap-4 rounded-2xl border border-line bg-surface p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold">
                Part of the topic guide{' '}
                <Link href={`/topics/${topic.id}`} className="text-signal hover:underline">
                  {topic.name}
                </Link>
              </p>
              <span className="font-mono text-[11px] uppercase tracking-[.08em] text-ink-3">{topic.pillar === slug ? 'Pillar article' : 'Supporting article'}</span>
            </div>
            {siblings.length ? (
              <ul className="grid gap-2 text-[15px]">
                {siblings.map(s => (
                  <li key={s.slug}>
                    <Link href={`/blog/${s.slug}`} className="text-ink-2 hover:text-ink">
                      {s.pillar ? <span className="mr-2 font-mono text-[11px] uppercase tracking-[.06em] text-signal">Start here</span> : null}
                      {s.article?.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
            {projects.length ? (
              <p className="text-[15px] text-ink-2">
                In practice:{' '}
                {projects.map((p, i) => (
                  <span key={p.slug}>
                    <Link href={`/work/${p.slug}`} className="font-semibold text-ink hover:text-signal">
                      {p.title}
                    </Link>
                    {i < projects.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </p>
            ) : null}
          </aside>
        );
      })}
    </div>
  );
}

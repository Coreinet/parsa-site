import Link from 'next/link';
import { localePath, type Locale } from '@/content/i18n';
import { fill, pageText } from '@/content/pageText';
import { localizeTopic, topicsForArticle } from '@/content/topics';
import { getArticle, getProject } from '@/lib/content';

/**
 * "Part of a topic guide" box at the end of an article: the topic hub, the pillar (when this
 * isn't it), the sibling articles, and the projects where the topic shows up in practice.
 */
export default function TopicGuide({ slug, locale = 'en' }: { slug: string; locale?: Locale }) {
  const t = pageText[locale].topic;
  const topics = topicsForArticle(slug).map(topic => localizeTopic(topic, locale));
  if (!topics.length) return null;

  return (
    <div className="grid gap-4">
      {topics.map(topic => {
        const siblings = [topic.pillar, ...topic.supporting]
          .filter(s => s !== slug)
          .map(s => ({ slug: s, article: getArticle(s, locale), pillar: s === topic.pillar }))
          .filter(s => s.article);
        const projects = topic.projects.map(p => getProject(p, locale)).filter(p => p !== undefined);
        return (
          <aside key={topic.id} aria-label={fill(t.guideLabel, { topic: topic.name })} className="grid gap-4 rounded-2xl border border-line bg-surface p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold">
                {t.partOf}{' '}
                <Link href={localePath(locale, `/topics/${topic.id}`)} className="text-signal hover:underline">
                  {topic.name}
                </Link>
              </p>
              <span className="font-mono text-[11px] uppercase tracking-[.08em] text-ink-3">{topic.pillar === slug ? t.pillar : t.supporting}</span>
            </div>
            {siblings.length ? (
              <ul className="grid gap-2 text-[15px]">
                {siblings.map(s => (
                  <li key={s.slug}>
                    <Link href={s.article?.href ?? `/blog/${s.slug}`} className="text-ink-2 hover:text-ink">
                      {s.pillar ? <span className="me-2 font-mono text-[11px] uppercase tracking-[.06em] text-signal">{t.startHere}</span> : null}
                      {s.article?.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
            {projects.length ? (
              <p className="text-[15px] text-ink-2">
                {t.inPractice}:{' '}
                {projects.map((p, i) => (
                  <span key={p.slug}>
                    <Link href={p.href} className="font-semibold text-ink hover:text-signal">
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

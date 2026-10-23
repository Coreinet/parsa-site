import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleRow } from '@/components/blog/ArticleRow';
import JsonLd from '@/components/seo/JsonLd';
import { Breadcrumb, Container, PathLabel } from '@/components/ui/primitives';
import { ProjectCard } from '@/components/work/ProjectCard';
import { copy, localePath, ui, type Locale } from '@/content/i18n';
import { fill, pageText } from '@/content/pageText';
import { site } from '@/content/site';
import { localizeTopic, topicById, topics } from '@/content/topics';
import { getArticle, getProject } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';
import { breadcrumbSchema, graph, topicSchema } from '@/lib/schema';

/** /topics/[id] in every language: the pillar article, the deeper ones and the projects. */

export const topicParams = () => topics.map(t => ({ id: t.id }));

function resolve(id: string, locale: Locale) {
  const found = topicById(id);
  if (!found) return null;
  const topic = localizeTopic(found, locale);
  const pillar = getArticle(topic.pillar, locale);
  const supporting = topic.supporting.map(s => getArticle(s, locale)).filter(a => a !== undefined);
  const projects = topic.projects.map(s => getProject(s, locale)).filter(p => p !== undefined);
  return { topic, pillar, supporting, projects };
}

export function topicMetadata(id: string, locale: Locale): Metadata {
  const data = resolve(id, locale);
  if (!data) return {};
  const t = pageText[locale].topic;
  return pageMetadata({
    title: fill(t.metaTitle, { topic: data.topic.name }),
    description: `${data.topic.definition} ${t.metaSuffix}`,
    path: localePath(locale, `/topics/${data.topic.id}`)
  });
}

export default function TopicView({ id, locale }: { id: string; locale: Locale }) {
  const data = resolve(id, locale);
  if (!data) notFound();
  const { topic, pillar, supporting, projects } = data;
  const articles = [pillar, ...supporting].filter(a => a !== undefined);
  const t = pageText[locale].topic;
  const nav = ui[locale].nav;
  const path = localePath(locale, `/topics/${topic.id}`);

  return (
    <>
      <JsonLd
        data={graph(
          topicSchema(topic, articles, projects, locale),
          breadcrumbSchema([
            { name: nav.home, path: localePath(locale) },
            { name: topic.name, path }
          ])
        )}
      />
      <Container as="header" className="grid max-w-[920px] gap-5 pb-10 pt-[clamp(40px,7vw,88px)]">
        <Breadcrumb
          items={[
            { name: nav.home, href: localePath(locale) },
            { name: nav.blog, href: localePath(locale, '/blog') },
            { name: topic.name, href: path }
          ]}
        />
        <PathLabel path={path} />
        <h1 className="text-display font-semibold">{topic.name}</h1>
        <p className="max-w-[60ch] text-body-lg text-ink-2">{topic.definition}</p>
        <p className="text-[15px] text-ink-3">
          {t.guideBy}{' '}
          <Link href={localePath(locale, '/about')} rel="author" className="font-semibold text-ink hover:text-signal">
            {locale === 'fa' ? copy.fa.name : site.name}
          </Link>
          {t.guideRest}
        </p>
      </Container>

      <Container className="grid max-w-[920px] gap-14 pb-24">
        {pillar ? (
          <section aria-labelledby="start-h" className="grid gap-3">
            <h2 id="start-h" className="text-h2 font-semibold">
              {t.startHere}
            </h2>
            <div className="border-b border-line">
              <ArticleRow article={pillar} thumb />
            </div>
          </section>
        ) : null}

        <section aria-labelledby="deeper-h" className="grid gap-3">
          <h2 id="deeper-h" className="text-h2 font-semibold">
            {t.goDeeper}
          </h2>
          {supporting.length ? (
            <div className="border-b border-line">
              {supporting.map(a => (
                <ArticleRow key={a.slug} article={a} thumb />
              ))}
            </div>
          ) : (
            <p className="text-ink-2">{t.morePlanned}</p>
          )}
        </section>

        {projects.length ? (
          <section aria-labelledby="practice-h" className="grid gap-6">
            <h2 id="practice-h" className="text-h2 font-semibold">
              {t.inPractice}
            </h2>
            <ul className="grid gap-x-8 gap-y-12 md:grid-cols-2">
              {projects.map(p => (
                <li key={p.slug}>
                  <ProjectCard project={p} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <nav aria-label={t.otherTopics} className="grid gap-3 border-t border-line pt-8">
          <h2 className="font-mono text-xs uppercase tracking-[.08em] text-ink-3">{t.otherTopics}</h2>
          <ul className="flex flex-wrap gap-2">
            {topics
              .filter(other => other.id !== topic.id)
              .map(other => localizeTopic(other, locale))
              .map(other => (
                <li key={other.id}>
                  <Link
                    href={localePath(locale, `/topics/${other.id}`)}
                    className="inline-flex h-10 items-center rounded-full border border-line-strong px-4 text-sm font-medium text-ink-2 transition-colors hover:border-ink hover:text-ink"
                  >
                    {other.name}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      </Container>
    </>
  );
}

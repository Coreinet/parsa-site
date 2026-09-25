import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleRow } from '@/components/blog/ArticleRow';
import JsonLd from '@/components/seo/JsonLd';
import { ProjectCard } from '@/components/work/ProjectCard';
import { Container, PathLabel } from '@/components/ui/primitives';
import { site } from '@/content/site';
import { topicById, topics } from '@/content/topics';
import { getArticle, getProject } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';
import { breadcrumbSchema, graph, topicSchema } from '@/lib/schema';

export const dynamicParams = false;

export function generateStaticParams() {
  return topics.map(t => ({ id: t.id }));
}

function resolve(id: string) {
  const topic = topicById(id);
  if (!topic) return null;
  const pillar = getArticle(topic.pillar);
  const supporting = topic.supporting.map(s => getArticle(s)).filter(a => a !== undefined);
  const projects = topic.projects.map(s => getProject(s)).filter(p => p !== undefined);
  return { topic, pillar, supporting, projects };
}

export async function generateMetadata(props: PageProps<'/topics/[id]'>): Promise<Metadata> {
  const { id } = await props.params;
  const data = resolve(id);
  if (!data) return {};
  return pageMetadata({
    title: `${data.topic.name} – articles and projects by ${site.name}`,
    description: `${data.topic.definition} Articles and projects by ${site.name}.`,
    path: `/topics/${data.topic.id}`
  });
}

export default async function TopicPage(props: PageProps<'/topics/[id]'>) {
  const { id } = await props.params;
  const data = resolve(id);
  if (!data) notFound();
  const { topic, pillar, supporting, projects } = data;
  const articles = [pillar, ...supporting].filter(a => a !== undefined);

  return (
    <>
      <JsonLd
        data={graph(
          topicSchema(topic, articles, projects),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: topic.name, path: `/topics/${topic.id}` }
          ])
        )}
      />
      <Container as="header" className="grid max-w-[920px] gap-5 pb-10 pt-[clamp(40px,7vw,88px)]">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 font-mono text-xs text-ink-3">
            <li>
              <Link href="/" className="hover:text-ink">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/#blog" className="hover:text-ink">
                Blog
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-signal">
              {topic.name}
            </li>
          </ol>
        </nav>
        <PathLabel path={`/topics/${topic.id}`} />
        <h1 className="text-display font-semibold">{topic.name}</h1>
        <p className="max-w-[60ch] text-body-lg text-ink-2">{topic.definition}</p>
        <p className="text-[15px] text-ink-3">
          A topic guide by{' '}
          <Link href="/about" rel="author" className="font-semibold text-ink hover:text-signal">
            {site.name}
          </Link>
          : one article to start with, deeper articles, and the projects where it comes up in real work.
        </p>
      </Container>

      <Container className="grid max-w-[920px] gap-14 pb-24">
        {pillar ? (
          <section aria-labelledby="start-h" className="grid gap-3">
            <h2 id="start-h" className="text-h2 font-semibold">
              Start here
            </h2>
            <div className="border-b border-line">
              <ArticleRow article={pillar} thumb />
            </div>
          </section>
        ) : null}

        <section aria-labelledby="deeper-h" className="grid gap-3">
          <h2 id="deeper-h" className="text-h2 font-semibold">
            Go deeper
          </h2>
          {supporting.length ? (
            <div className="border-b border-line">
              {supporting.map(a => (
                <ArticleRow key={a.slug} article={a} thumb />
              ))}
            </div>
          ) : (
            <p className="text-ink-2">More articles on this topic are planned.</p>
          )}
        </section>

        {projects.length ? (
          <section aria-labelledby="practice-h" className="grid gap-6">
            <h2 id="practice-h" className="text-h2 font-semibold">
              In practice
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

        <nav aria-label="Other topics" className="grid gap-3 border-t border-line pt-8">
          <h2 className="font-mono text-xs uppercase tracking-[.08em] text-ink-3">Other topics</h2>
          <ul className="flex flex-wrap gap-2">
            {topics
              .filter(t => t.id !== topic.id)
              .map(t => (
                <li key={t.id}>
                  <Link href={`/topics/${t.id}`} className="inline-flex h-10 items-center rounded-full border border-line-strong px-4 text-sm font-medium text-ink-2 transition-colors hover:border-ink hover:text-ink">
                    {t.name}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      </Container>
    </>
  );
}

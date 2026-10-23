import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleRow } from '@/components/blog/ArticleRow';
import Mdx from '@/components/blog/Mdx';
import Toc from '@/components/blog/Toc';
import JsonLd from '@/components/seo/JsonLd';
import { Container, ExampleBadge, PathLabel } from '@/components/ui/primitives';
import Gallery from '@/components/work/Gallery';
import ProjectCover from '@/components/work/ProjectCover';
import ProjectLinks from '@/components/work/ProjectLinks';
import SpecSheet from '@/components/work/SpecSheet';
import { copy, localePath, ui, type Locale } from '@/content/i18n';
import { fill, pageText } from '@/content/pageText';
import { site } from '@/content/site';
import { localizeTopic, topicsForProject } from '@/content/topics';
import { getArticle, getProject, getProjects, localesOf, slugify } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';
import { breadcrumbSchema, graph, projectSchema } from '@/lib/schema';

/** /work/[slug] in every language: spec sheet, cover, case study, outcomes, screens and related writing. */

export const projectParams = (locale: Locale) => getProjects(locale).map(p => ({ slug: p.slug }));

export function projectMetadata(slug: string, locale: Locale): Metadata {
  const project = getProject(slug, locale);
  if (!project) return {};
  const t = pageText[locale].project;
  return pageMetadata({
    title: fill(t.metaTitle, { title: project.title }),
    description: fill(t.metaDescription, { summary: project.summary, role: project.role, stack: project.stack.slice(0, 4).join(', ') }),
    path: project.href,
    locales: localesOf('work', slug),
    image: { url: project.cover, alt: project.coverAlt ?? project.title }
  });
}

export default function ProjectView({ slug, locale }: { slug: string; locale: Locale }) {
  const project = getProject(slug, locale);
  if (!project) notFound();
  const t = pageText[locale].project;
  const nav = ui[locale].nav;
  const work = localePath(locale, '/work');

  const all = getProjects(locale);
  const next = all[(all.findIndex(p => p.slug === slug) + 1) % all.length];
  const projectTopics = topicsForProject(project.slug).map(topic => ({
    topic: localizeTopic(topic, locale),
    articles: [topic.pillar, ...topic.supporting].map(s => getArticle(s, locale)).filter(a => a !== undefined)
  }));
  const sections = project.body
    .split('\n')
    .map(l => /^##\s+(.+)$/.exec(l))
    .filter((m): m is RegExpExecArray => !!m)
    .map(m => ({ id: slugify(m[1]), text: m[1], depth: 2 as const }));

  return (
    <article>
      <JsonLd
        data={graph(
          projectSchema(project),
          breadcrumbSchema([
            { name: nav.home, path: localePath(locale) },
            { name: nav.work, path: work },
            { name: project.title, path: project.href }
          ])
        )}
      />
      <Container as="header" className="grid gap-6 pb-12 pt-[clamp(32px,6vw,72px)]">
        <div className="flex flex-wrap items-center gap-3">
          <Link href={work} className="font-mono text-xs text-ink-3 hover:text-ink">
            <span aria-hidden="true" className="inline-block rtl:-scale-x-100">
              ←
            </span>{' '}
            {t.allWork}
          </Link>
          <PathLabel path={project.href} />
          {project.example ? <ExampleBadge /> : null}
        </div>
        <h1 className="text-display font-semibold">{project.title}</h1>
        <p className="max-w-[48ch] text-body-lg text-ink-2">{project.summary}</p>
        <p className="text-[15px] text-ink-3">
          {t.builtBy}{' '}
          <Link href={localePath(locale, '/about')} rel="author" className="font-semibold text-ink hover:text-signal">
            {locale === 'fa' ? copy.fa.name : site.name}
          </Link>
        </p>
        <ProjectLinks project={project} />
        <SpecSheet project={project} />
      </Container>

      <ProjectCover src={project.cover} alt={project.coverAlt ?? `${project.title}: ${project.summary}`} caption={`${project.title} · ${project.platform}`} />

      <Container className="grid grid-cols-[minmax(0,1fr)] gap-12 py-[clamp(56px,8vw,112px)] lg:grid-cols-[minmax(0,8fr)_minmax(0,3fr)] lg:gap-16">
        <div className="grid min-w-0 content-start gap-10">
          <div className="prose min-w-0">
            <Mdx source={project.body} />
          </div>
          {project.links.live ? (
            <div className="grid gap-4 rounded-md border border-line bg-surface p-6 sm:flex sm:items-center sm:justify-between">
              <p className="text-body-lg font-semibold">{fill(t.seeLive, { title: project.title })}</p>
              <ProjectLinks project={project} />
            </div>
          ) : null}
        </div>
        <aside className="hidden lg:block">
          <div className="sticky top-28 grid gap-6">
            <Toc headings={sections} label={pageText[locale].article.onThisPage} />
          </div>
        </aside>
      </Container>

      {project.outcomes.length ? (
        <Container as="section" className="grid gap-6 pb-20">
          <PathLabel path={`${project.href}/outcomes`} />
          <dl className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {project.outcomes.map(o => (
              <div key={o.label} className="grid content-start gap-2 bg-surface p-6">
                <dd className="tabular text-h1 font-semibold">{o.value}</dd>
                <dt className="text-ink-2">{o.label}</dt>
              </div>
            ))}
          </dl>
        </Container>
      ) : null}

      {project.screens.length ? (
        <Container as="section" className="grid gap-6 pb-20">
          <PathLabel path={`${project.href}/screens`} />
          <Gallery
            title={project.title}
            screens={project.screens}
            label={fill(t.screens, { title: project.title })}
            alt={fill(t.screen, { title: project.title, n: '{n}' })}
          />
        </Container>
      ) : null}

      {projectTopics.length ? (
        <Container as="section" aria-labelledby="related-h" className="grid gap-5 pb-20">
          <h2 id="related-h" className="text-h2 font-semibold">
            {t.relatedWriting}
          </h2>
          {projectTopics.map(({ topic, articles }) => (
            <div key={topic.id} className="grid gap-2">
              <p className="text-[15px] text-ink-2">
                {t.topic}{' '}
                <Link href={localePath(locale, `/topics/${topic.id}`)} className="font-semibold text-signal hover:underline">
                  {topic.name}
                </Link>
              </p>
              {articles.length ? (
                <div className="border-b border-line">
                  {articles.map(a => (
                    <ArticleRow key={a.slug} article={a} />
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </Container>
      ) : null}

      {next && next.slug !== project.slug ? (
        <Link
          href={next.href}
          className="group block border-t border-line py-[clamp(48px,8vw,96px)] transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-signal"
        >
          <Container className="grid gap-2">
            <span className="font-mono text-xs text-ink-3">{t.next}</span>
            <span className="flex items-baseline justify-between gap-4 text-display font-semibold">
              <span className="transition-colors group-hover:text-signal">{next.title}</span>
              <span
                aria-hidden="true"
                className="font-mono text-h2 text-ink-3 transition-transform group-hover:translate-x-2 group-hover:text-signal rtl:-scale-x-100 rtl:group-hover:-translate-x-2"
              >
                →
              </span>
            </span>
          </Container>
        </Link>
      ) : null}
    </article>
  );
}

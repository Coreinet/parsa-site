import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Mdx from '@/components/blog/Mdx';
import Toc from '@/components/blog/Toc';
import Gallery from '@/components/work/Gallery';
import ProjectCover from '@/components/work/ProjectCover';
import SpecSheet from '@/components/work/SpecSheet';
import { Container, ExampleBadge, PathLabel } from '@/components/ui/primitives';
import JsonLd from '@/components/seo/JsonLd';
import { site } from '@/content/site';
import { ArticleRow } from '@/components/blog/ArticleRow';
import { topicsForProject } from '@/content/topics';
import { getArticle, getProject, getProjects, slugify } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';
import { breadcrumbSchema, graph, projectSchema } from '@/lib/schema';

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map(p => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<'/work/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProject(slug);
  if (!project) return {};
  return pageMetadata({
    title: project.title + ' – Case study by ' + site.name,
    description: project.summary + ' Role: ' + project.role + '. Built with ' + project.stack.slice(0, 4).join(', ') + '.',
    path: '/work/' + project.slug,
    image: { url: project.cover, alt: project.coverAlt ?? project.title + ' project cover' }
  });
}

export default async function ProjectPage(props: PageProps<'/work/[slug]'>) {
  const { slug } = await props.params;
  const project = getProject(slug);
  if (!project) notFound();

  const all = getProjects();
  const next = all[(all.findIndex(p => p.slug === slug) + 1) % all.length];
  const projectTopics = topicsForProject(project.slug).map(topic => ({
    topic,
    articles: [topic.pillar, ...topic.supporting].map(s => getArticle(s)).filter(a => a !== undefined)
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
            { name: 'Home', path: '/' },
            { name: 'Work', path: '/work' },
            { name: project.title, path: `/work/${project.slug}` }
          ])
        )}
      />
      <Container as="header" className="grid gap-6 pb-12 pt-[clamp(32px,6vw,72px)]">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/work" className="font-mono text-xs text-ink-3 hover:text-ink">
            ← All work
          </Link>
          <PathLabel path={`/work/${project.slug}`} />
          {project.example ? <ExampleBadge /> : null}
        </div>
        <h1 className="text-display font-semibold">{project.title}</h1>
        <p className="max-w-[48ch] text-body-lg text-ink-2">{project.summary}</p>
        <p className="text-[15px] text-ink-3">
          Built by{' '}
          <Link href="/about" rel="author" className="font-semibold text-ink hover:text-signal">
            {site.name}
          </Link>
        </p>
        <SpecSheet project={project} />
      </Container>

      <ProjectCover src={project.cover} alt={project.coverAlt ?? `${project.title}: ${project.summary}`} caption={`${project.title} · ${project.platform}`} />

      <Container className="grid grid-cols-[minmax(0,1fr)] gap-12 py-[clamp(56px,8vw,112px)] lg:grid-cols-[minmax(0,8fr)_minmax(0,3fr)] lg:gap-16">
        <div className="prose min-w-0">
          <Mdx source={project.body} />
        </div>
        <aside className="hidden lg:block">
          <div className="sticky top-28 grid gap-6">
            <Toc headings={sections} />
          </div>
        </aside>
      </Container>

      {project.outcomes.length ? (
        <Container as="section" className="grid gap-6 pb-20">
          <PathLabel path={`/work/${project.slug}/outcomes`} />
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
          <PathLabel path={`/work/${project.slug}/screens`} />
          <Gallery title={project.title} screens={project.screens} />
        </Container>
      ) : null}

      {projectTopics.length ? (
        <Container as="section" aria-labelledby="related-h" className="grid gap-5 pb-20">
          <h2 id="related-h" className="text-h2 font-semibold">
            Related writing
          </h2>
          {projectTopics.map(({ topic, articles }) => (
            <div key={topic.id} className="grid gap-2">
              <p className="text-[15px] text-ink-2">
                Topic:{' '}
                <Link href={`/topics/${topic.id}`} className="font-semibold text-signal hover:underline">
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
          href={`/work/${next.slug}`}
          className="group block border-t border-line py-[clamp(48px,8vw,96px)] transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-signal"
        >
          <Container className="grid gap-2">
            <span className="font-mono text-xs text-ink-3">Next project</span>
            <span className="flex items-baseline justify-between gap-4 text-display font-semibold">
              <span className="transition-colors group-hover:text-signal">{next.title}</span>
              <span aria-hidden="true" className="font-mono text-h2 text-ink-3 transition-transform group-hover:translate-x-2 group-hover:text-signal">
                →
              </span>
            </span>
          </Container>
        </Link>
      ) : null}
    </article>
  );
}

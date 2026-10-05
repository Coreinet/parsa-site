import Link from 'next/link';
import Changelog from '@/components/about/Changelog';
import { ArticleRow } from '@/components/blog/ArticleRow';
import JsonLd from '@/components/seo/JsonLd';
import PortraitCard from '@/components/ui/PortraitCard';
import SocialIcons from '@/components/ui/SocialIcons';
import { ButtonLink, Container, ExampleBadge, PathLabel, Tag } from '@/components/ui/primitives';
import { about } from '@/content/about';
import { site } from '@/content/site';
import { stack } from '@/content/stack';
import { topics } from '@/content/topics';
import { getArticles, getProjects, SHOW_EXAMPLES } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';
import { breadcrumbSchema, graph, personSchema, profilePageSchema } from '@/lib/schema';

export const metadata = pageMetadata({
  title: `About ${site.name} – Software Developer`,
  description: `${site.name} is a freelance software developer working on web and mobile applications and artificial intelligence, programming since 2021. Profile, skills, projects and links.`,
  path: '/about',
  type: 'profile'
});

export default function AboutPage() {
  const projects = getProjects();
  const articles = getArticles();
  const github = site.socials.find(s => s.label === 'GitHub');
  // Last real content change, not the build time.
  const modified = [...articles.map(a => a.updated ?? a.date)].sort((a, b) => b.getTime() - a.getTime())[0]?.toISOString().slice(0, 10) ?? '2026-09-19';

  return (
    <>
      <JsonLd
        data={graph(
          profilePageSchema('/about', modified),
          personSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' }
          ])
        )}
      />

      <Container as="header" className="grid gap-12 pb-12 pt-[clamp(40px,7vw,88px)] lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-16">
        <div className="grid content-start gap-6">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 font-mono text-xs text-ink-3">
              <li>
                <Link href="/" className="hover:text-ink">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-signal">
                About
              </li>
            </ol>
          </nav>
          <h1 className="text-display font-semibold">{site.name}</h1>
          <p className="font-mono text-[13px] text-ink-2">
            {site.jobTitle} · Web, mobile and AI
          </p>
          <div className="grid max-w-[60ch] gap-4 text-body-lg text-ink-2">
            {about.bio.map(p => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
            <p>I speak Persian, English and Turkish.</p>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink href="/contact" label="Get in touch" />
            <ButtonLink href="/work" intent="secondary" label="See my work" />
          </div>
        </div>
        <PortraitCard
          src={site.portrait.src}
          alt={site.portrait.alt}
          name={site.name}
          status={site.available ? site.availability : 'Not taking new projects'}
          available={site.available}
          caption={site.name}
          priority
          className="mx-auto w-full max-w-[380px]"
        />
      </Container>

      <Container className="grid gap-16 pb-24">
        {SHOW_EXAMPLES ? (
          <section aria-labelledby="story-h" className="grid gap-4 rounded-2xl border border-dashed border-line-strong p-5">
            <ExampleBadge className="w-max" />
            <h2 id="story-h" className="text-h2 font-semibold">
              Background
            </h2>
            <div className="grid max-w-[60ch] gap-4 text-ink-2">
              {about.example.story.map(p => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </section>
        ) : null}

        <section aria-labelledby="who-h" className="grid gap-4">
          <h2 id="who-h" className="text-h2 font-semibold">
            Who is {site.name}?
          </h2>
          <div className="grid max-w-[64ch] gap-3 text-body-lg text-ink-2">
            <p>
              {site.name} is a freelance software developer who works on web development, mobile development and artificial
              intelligence. {site.name} started learning programming in 2021 and has been taking on projects as a freelance developer
              since 2024.
            </p>
            {projects.length ? (
              <p>
                {site.name}&apos;s projects include{' '}
                {projects.map((p, i) => (
                  <span key={p.slug}>
                    <Link href={`/work/${p.slug}`} className="font-semibold text-ink hover:text-signal">
                      {p.title}
                    </Link>
                    {i < projects.length - 2 ? ', ' : i === projects.length - 2 ? ' and ' : ''}
                  </span>
                ))}
                , built with {[...new Set(projects.flatMap(p => p.stack))].join(', ')}.
              </p>
            ) : null}
            <p>
              {site.name} writes about{' '}
              {topics.map((t, i) => (
                <span key={t.id}>
                  <Link href={`/topics/${t.id}`} className="font-semibold text-ink hover:text-signal">
                    {t.name.toLowerCase()}
                  </Link>
                  {i < topics.length - 2 ? ', ' : i === topics.length - 2 ? ' and ' : ''}
                </span>
              ))}
              , with every article citing its sources.
            </p>
          </div>
          <dl className="grid max-w-[64ch] gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {[
              ['Name', site.name],
              ['Role', 'Freelance software developer'],
              ['Experience', 'Programming since 2021, freelance since 2024'],
              ['Works on', 'Web development, mobile development, AI'],
              ['Languages', 'Persian, English, Turkish'],
              ['Code', `github.com/${site.socials.find(s => s.label === 'GitHub')?.handle ?? ''}`],
              ['Contact', site.email]
            ].map(([k, v]) => (
              <div key={k} className="grid content-start gap-1 bg-surface p-4">
                <dt className="font-mono text-[11px] uppercase tracking-[.08em] text-ink-3">{k}</dt>
                <dd className="break-words font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="timeline-h" className="grid gap-5">
          <h2 id="timeline-h" className="text-h2 font-semibold">
            Timeline
          </h2>
          <Changelog entries={about.timeline} heading="h3" />
        </section>

        <section aria-labelledby="skills-h" className="grid gap-6">
          <PathLabel path="/about/skills" />
          <h2 id="skills-h" className="text-h2 font-semibold">
            Skills and tools
          </h2>
          <dl className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2">
            {stack.map(layer => (
              <div key={layer.id} className="grid content-start gap-3 bg-surface p-5">
                <dt className="font-semibold">{layer.name}</dt>
                <dd className="flex flex-wrap gap-2">
                  {layer.items.map(item => (
                    <Tag key={item.name}>{item.name}</Tag>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-ink-2">
            Which projects use each tool is shown on the <Link href="/stack" className="font-semibold text-ink underline underline-offset-4 hover:text-signal">stack page</Link>.
          </p>
        </section>

        <section aria-labelledby="interests-h" className="grid gap-4">
          <h2 id="interests-h" className="text-h2 font-semibold">
            Professional interests
          </h2>
          <ul className="flex flex-wrap gap-2">
            {about.interests.map(i => (
              <li key={i}>
                <Tag>{i}</Tag>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="projects-h" className="grid gap-4">
          <h2 id="projects-h" className="text-h2 font-semibold">
            Projects
          </h2>
          {projects.length ? (
            <ul className="grid border-t border-line">
              {projects.map(p => (
                <li key={p.slug} className="border-b border-line">
                  <Link href={`/work/${p.slug}`} className="group flex flex-wrap items-baseline justify-between gap-2 py-4">
                    <span className="text-lg font-semibold group-hover:text-signal">{p.title}</span>
                    <span className="text-ink-2">{p.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-2">
              Case studies are being written. My code is on{' '}
              <a href={github?.href} target="_blank" rel="noreferrer" className="font-semibold text-ink underline underline-offset-4 hover:text-signal">
                GitHub ({github?.handle})
              </a>
              .
            </p>
          )}
        </section>

        {articles.length ? (
          <section id="writing" aria-labelledby="writing-h" className="grid scroll-mt-24 gap-6">
            <h2 id="writing-h" className="text-h2 font-semibold">
              All articles by {site.name}
            </h2>
            {topics.map(topic => {
              const inTopic = [topic.pillar, ...topic.supporting].map(s => articles.find(a => a.slug === s)).filter(a => a !== undefined);
              if (!inTopic.length) return null;
              return (
                <div key={topic.id} className="grid gap-2">
                  <h3 className="text-lg font-semibold">
                    <Link href={`/topics/${topic.id}`} className="hover:text-signal">
                      {topic.name}
                    </Link>
                  </h3>
                  <div className="border-b border-line">
                    {inTopic.map(a => (
                      <ArticleRow key={a.slug} article={a} heading="h4" />
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        ) : null}

        <section aria-labelledby="profiles-h" className="grid gap-5">
          <h2 id="profiles-h" className="text-h2 font-semibold">
            Profiles and contact
          </h2>
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {site.socials.map(s => (
              <li key={s.label} className="bg-surface">
                <a href={s.href} target="_blank" rel="noreferrer me" className="flex items-baseline justify-between gap-3 p-4 hover:bg-paper-2">
                  <span className="font-semibold">{s.label}</span>
                  <span className="truncate font-mono text-[13px] text-ink-2">{s.href.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, '')} ↗</span>
                </a>
              </li>
            ))}
            <li className="bg-surface">
              <a href={`mailto:${site.email}`} className="flex items-baseline justify-between gap-3 p-4 hover:bg-paper-2">
                <span className="font-semibold">Email</span>
                <span className="truncate font-mono text-[13px] text-ink-2">{site.email}</span>
              </a>
            </li>
          </ul>
          <SocialIcons />
        </section>
      </Container>
    </>
  );
}

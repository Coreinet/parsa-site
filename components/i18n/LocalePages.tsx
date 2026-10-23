import { ArticleRow } from '@/components/blog/ArticleRow';
import Changelog from '@/components/about/Changelog';
import ContactForm from '@/components/contact/ContactForm';
import CopyEmail from '@/components/contact/CopyEmail';
import ContactBand from '@/components/home/ContactBand';
import LocaleHero from '@/components/i18n/LocaleHero';
import JsonLd from '@/components/seo/JsonLd';
import PortraitCard from '@/components/ui/PortraitCard';
import SocialIcons from '@/components/ui/SocialIcons';
import { Breadcrumb, ButtonLink, Container, PathLabel, Section, Tag, TextLink } from '@/components/ui/primitives';
import { ProjectCard } from '@/components/work/ProjectCard';
import { copy, localePath, ui, type Translated } from '@/content/i18n';
import { site } from '@/content/site';
import { getArticles, getProjects } from '@/lib/content';
import { breadcrumbSchema, graph, personSchema, translatedPageSchema } from '@/lib/schema';

/**
 * Home, about, work and contact of the Persian and Turkish sites, written from the same
 * confirmed facts as the English pages. Projects and articles are their translated copies.
 */

const divider = <div className="border-t border-line" />;

function Projects({ locale, home = false }: { locale: Translated; home?: boolean }) {
  const projects = getProjects(locale);
  const featured = projects.find(p => p.featured) ?? projects[0];
  const rest = projects.filter(p => p !== featured);
  const others = home ? rest.slice(0, 4) : rest;
  return (
    <>
      {featured ? <ProjectCard project={featured} featured /> : null}
      <ul className="grid gap-x-8 gap-y-14 md:grid-cols-2">
        {others.map(p => (
          <li key={p.slug}>
            <ProjectCard project={p} />
          </li>
        ))}
      </ul>
    </>
  );
}

function Facts({ locale }: { locale: Translated }) {
  return (
    <dl className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
      {copy[locale].facts.map(f => (
        <div key={f.label} className="grid content-start gap-1 bg-surface p-4">
          <dt className="font-mono text-[11px] uppercase tracking-[.08em] text-ink-3">{f.label}</dt>
          <dd className="font-medium">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Contact({ locale, page = false }: { locale: Translated; page?: boolean }) {
  const c = copy[locale];
  const t = ui[locale];
  const Heading = page ? 'h1' : 'h2';
  return (
    <section id={page ? undefined : 'contact'} className={page ? 'pt-[clamp(40px,7vw,88px)]' : 'scroll-mt-20 pt-[clamp(48px,8vw,96px)]'}>
      {page ? null : <ContactBand lines={c.contactBand} />}
      <Container className="grid gap-12 py-[clamp(56px,9vw,112px)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="grid content-start gap-6">
          {page ? (
            <Breadcrumb
              items={[
                { name: t.nav.home, href: localePath(locale) },
                { name: t.nav.contact, href: localePath(locale, '/contact') }
              ]}
            />
          ) : (
            <PathLabel path={localePath(locale, '/contact')} />
          )}
          <Heading className="text-display font-semibold">{page ? c.contactTitle : c.contactHome}</Heading>
          <p className="max-w-[44ch] text-body-lg text-ink-2">{c.contactText}</p>
          <CopyEmail email={site.email} labels={{ copy: t.copyEmail, copied: t.emailCopied }} />
          <SocialIcons withEmail={false} className="pt-2" />
        </div>
        <div className="rounded-[24px] border border-line bg-surface p-5 sm:p-8">
          <h2 className="sr-only">{c.formTitle}</h2>
          <ContactForm email={site.email} locale={locale} />
        </div>
      </Container>
      {page ? <ContactBand lines={c.contactBand} /> : null}
    </section>
  );
}

export function LocaleHome({ locale }: { locale: Translated }) {
  const c = copy[locale];
  const meta = c.meta['/'];
  return (
    <>
      <JsonLd data={graph(translatedPageSchema('WebPage', locale, '/', meta.title, meta.description), personSchema())} />
      <LocaleHero locale={locale} />

      <Section
        id="work"
        path={localePath(locale, '/work')}
        title={c.selectedWork}
        intro={c.workIntro}
        action={<TextLink href={localePath(locale, '/work')}>{c.allProjects}</TextLink>}
      >
        <Projects locale={locale} home />
      </Section>
      {divider}

      <Section id="about" path={localePath(locale, '/about')} title={c.statement} action={<TextLink href={localePath(locale, '/about')}>{c.fullProfile}</TextLink>}>
        {/* Same layout as the English home (components/sections/AboutSection.tsx). */}
        <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-16">
          <div className="grid content-start gap-10">
            <div className="grid max-w-[60ch] gap-4 text-body-lg text-ink-2">
              {c.bio.map(p => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
            <div className="grid gap-3">
              <h3 className="font-mono text-[11px] uppercase tracking-[.08em] text-ink-3">{c.interestsTitle}</h3>
              <ul className="flex flex-wrap gap-2">
                {c.interests.map(i => (
                  <li key={i}>
                    <Tag>{i}</Tag>
                  </li>
                ))}
              </ul>
            </div>
            <Facts locale={locale} />
            <div className="grid gap-5">
              <h3 className="text-h2 font-semibold">{c.timelineTitle}</h3>
              <Changelog entries={c.timeline} />
            </div>
          </div>
          <div>
            <div className="lg:sticky lg:top-28">
              <PortraitCard
                src={site.portrait.src}
                alt={c.portraitAlt}
                name={c.name}
                status={c.availability}
                available={site.available}
                contactHref={localePath(locale, '/contact')}
                contactLabel={ui[locale].nav.contact}
                caption={c.name}
                className="mx-auto w-full max-w-[380px]"
              />
            </div>
          </div>
        </div>
      </Section>
      {divider}

      <Section
        id="blog"
        path={localePath(locale, '/blog')}
        title={c.writingTitle}
        intro={c.writingText}
        action={<TextLink href={localePath(locale, '/blog')}>{c.readBlog}</TextLink>}
      >
        <ul className="border-b border-line">
          {getArticles(locale)
            .slice(0, 3)
            .map(a => (
              <li key={a.slug}>
                <ArticleRow article={a} thumb />
              </li>
            ))}
        </ul>
      </Section>

      <Contact locale={locale} />
    </>
  );
}

export function LocaleAbout({ locale }: { locale: Translated }) {
  const c = copy[locale];
  const t = ui[locale];
  const meta = c.meta['/about'];
  return (
    <>
      <JsonLd
        data={graph(
          translatedPageSchema('ProfilePage', locale, '/about', meta.title, meta.description),
          personSchema(),
          breadcrumbSchema([
            { name: t.nav.home, path: localePath(locale) },
            { name: t.nav.about, path: localePath(locale, '/about') }
          ])
        )}
      />
      <Container as="header" className="grid gap-12 pb-12 pt-[clamp(40px,7vw,88px)] lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-16">
        <div className="grid content-start gap-6">
          <Breadcrumb
            items={[
              { name: t.nav.home, href: localePath(locale) },
              { name: t.nav.about, href: localePath(locale, '/about') }
            ]}
          />
          <h1 className="text-display font-semibold">{c.name}</h1>
          {locale === 'fa' ? (
            <p lang="en" dir="ltr" className="-mt-3 justify-self-start font-mono text-[15px] text-ink-2">
              {site.name}
            </p>
          ) : null}
          <p className="font-mono text-[13px] text-ink-2">{c.roles}</p>
          <div className="grid max-w-[60ch] gap-4 text-body-lg text-ink-2">
            {c.bio.map(p => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ButtonLink href={localePath(locale, '/contact')} label={c.startProject} />
            <ButtonLink href={localePath(locale, '/work')} intent="secondary" label={c.seeWork} />
          </div>
          <SocialIcons className="pt-2" />
        </div>
        <div>
          <div className="lg:sticky lg:top-28">
            <PortraitCard
              src={site.portrait.src}
              alt={c.portraitAlt}
              name={c.name}
              status={c.availability}
              available={site.available}
              contactHref={localePath(locale, '/contact')}
              contactLabel={t.nav.contact}
              caption={c.name}
              className="mx-auto w-full max-w-[380px]"
            />
          </div>
        </div>
      </Container>

      <Container className="grid gap-12 pb-[clamp(64px,8vw,112px)]">
        <div className="grid gap-3">
          <h2 className="font-mono text-[11px] uppercase tracking-[.08em] text-ink-3">{c.interestsTitle}</h2>
          <ul className="flex flex-wrap gap-2">
            {c.interests.map(i => (
              <li key={i}>
                <Tag>{i}</Tag>
              </li>
            ))}
          </ul>
        </div>
        <Facts locale={locale} />
        <div className="grid gap-5">
          <h2 className="text-h2 font-semibold">{c.timelineTitle}</h2>
          <Changelog entries={c.timeline} heading="h3" />
        </div>
      </Container>
    </>
  );
}

export function LocaleWork({ locale }: { locale: Translated }) {
  const c = copy[locale];
  const t = ui[locale];
  const meta = c.meta['/work'];
  return (
    <>
      <JsonLd
        data={graph(
          translatedPageSchema('CollectionPage', locale, '/work', meta.title, meta.description),
          personSchema(),
          breadcrumbSchema([
            { name: t.nav.home, path: localePath(locale) },
            { name: t.nav.work, path: localePath(locale, '/work') }
          ])
        )}
      />
      <Section
        path={localePath(locale, '/work')}
        page={t.nav.work}
        home={{ name: t.nav.home, href: localePath(locale) }}
        title={c.workTitle}
        intro={c.workIntro}
      >
        <Projects locale={locale} />
      </Section>
    </>
  );
}

export function LocaleContact({ locale }: { locale: Translated }) {
  const c = copy[locale];
  const t = ui[locale];
  const meta = c.meta['/contact'];
  return (
    <>
      <JsonLd
        data={graph(
          translatedPageSchema('ContactPage', locale, '/contact', meta.title, meta.description),
          personSchema(),
          breadcrumbSchema([
            { name: t.nav.home, path: localePath(locale) },
            { name: t.nav.contact, path: localePath(locale, '/contact') }
          ])
        )}
      />
      <Contact locale={locale} page />
    </>
  );
}

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleRow } from '@/components/blog/ArticleRow';
import Mdx from '@/components/blog/Mdx';
import ReadingProgress from '@/components/blog/ReadingProgress';
import Toc from '@/components/blog/Toc';
import TopicGuide from '@/components/blog/TopicGuide';
import JsonLd from '@/components/seo/JsonLd';
import SocialIcons from '@/components/ui/SocialIcons';
import { Container, ExampleBadge, Tag } from '@/components/ui/primitives';
import { copy, localePath, ui, type Locale } from '@/content/i18n';
import { fill, pageText } from '@/content/pageText';
import { site } from '@/content/site';
import { formatDate, getArticle, getArticles, getRelated, localesOf } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';
import { articleSchema, breadcrumbSchema, graph } from '@/lib/schema';

/** /blog/[slug] in every language: the article, its contents, author box and related articles. */

export const articleParams = (locale: Locale) => getArticles(locale).map(a => ({ slug: a.slug }));

export function articleMetadata(slug: string, locale: Locale): Metadata {
  const article = getArticle(slug, locale);
  if (!article) return {};
  return pageMetadata({
    title: `${article.seoTitle ?? article.title} – ${site.name}`,
    description: article.description,
    path: article.href,
    locales: localesOf('blog', slug),
    type: 'article',
    image: { url: article.cover, alt: article.coverAlt ?? article.title },
    article: {
      publishedTime: article.date.toISOString(),
      modifiedTime: (article.updated ?? article.date).toISOString(),
      tags: article.tags,
      section: pageText[locale].categories[article.category]
    }
  });
}

export default function ArticleView({ slug, locale }: { slug: string; locale: Locale }) {
  const article = getArticle(slug, locale);
  if (!article) notFound();
  const related = getRelated(article);
  const t = pageText[locale];
  const nav = ui[locale].nav;
  const blog = localePath(locale, '/blog');
  const about = localePath(locale, '/about');
  // The author's own sentence in this language: the English intro, or the translated one.
  const intro = locale === 'en' ? site.intro : copy[locale].intro;

  return (
    <>
      <JsonLd
        data={graph(
          articleSchema(article),
          breadcrumbSchema([
            { name: nav.home, path: localePath(locale) },
            { name: nav.blog, path: blog },
            { name: article.title, path: article.href }
          ])
        )}
      />
      <ReadingProgress targetId="article-body" />
      <article>
        <Container as="header" className="grid max-w-[920px] gap-5 pb-10 pt-[clamp(32px,6vw,72px)]">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={blog} className="me-2 font-mono text-xs text-ink-3 hover:text-ink">
              <span aria-hidden="true" className="inline-block rtl:-scale-x-100">
                ←
              </span>{' '}
              {nav.blog}
            </Link>
            <Link href={blog}>
              <Tag category>{t.categories[article.category]}</Tag>
            </Link>
            {article.example ? <ExampleBadge /> : null}
          </div>
          <h1 className="text-h1 font-semibold sm:text-[clamp(2.25rem,1.6rem+2.4vw,3.75rem)]">{article.title}</h1>
          <p className="max-w-[56ch] text-body-lg text-ink-2">{article.description}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-line py-3">
            <div className="flex items-center gap-2.5">
              <span className="relative size-8 overflow-hidden rounded-full border border-line bg-paper-2">
                <Image src={site.portrait.src} alt="" fill sizes="32px" className="object-cover object-[50%_42%]" />
              </span>
              <Link href={about} rel="author" className="font-semibold hover:text-signal">
                {locale === 'fa' ? copy.fa.name : site.name}
              </Link>
            </div>
            <span className="tabular font-mono text-xs text-ink-3">
              <time dateTime={formatDate(article.date)}>{formatDate(article.date)}</time>
              {article.updated ? (
                <>
                  {' '}
                  · {t.article.updated} <time dateTime={formatDate(article.updated)}>{formatDate(article.updated)}</time>
                </>
              ) : null}{' '}
              · {fill(t.article.minRead, { n: article.readingMinutes })}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {article.tags.map(tag => (
              <Tag key={tag}>#{tag}</Tag>
            ))}
          </div>
        </Container>

        <Container className="max-w-[1100px] pb-12">
          <figure className="grid gap-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-paper-2 sm:aspect-[21/9]">
              <Image src={article.cover} alt={article.coverAlt ?? article.title} fill preload sizes="(min-width: 1100px) 1000px, 100vw" className="object-cover" />
            </div>
          </figure>
        </Container>

        <Container className="grid max-w-[1100px] grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-16">
          {/* Phones and tablets: collapsible contents above the text */}
          {article.headings.length > 1 ? (
            <details className="rounded-md border border-line bg-surface px-4 py-3 lg:hidden">
              <summary className="cursor-pointer font-mono text-xs uppercase tracking-[.08em] text-ink-2">{t.article.onThisPage}</summary>
              <ul className="mt-3 grid gap-1.5 text-sm">
                {article.headings.map(h => (
                  <li key={h.id} className={h.depth === 3 ? 'ps-4' : ''}>
                    <a href={`#${h.id}`} className="text-ink-2 hover:text-ink">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}

          <div id="article-body" className="prose min-w-0">
            <Mdx source={article.body} />
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <Toc headings={article.headings} label={t.article.onThisPage} />
            </div>
          </aside>
        </Container>

        <Container className="max-w-[1100px] pt-16">
          <TopicGuide slug={article.slug} locale={locale} />
        </Container>

        <Container className="max-w-[1100px] py-8">
          <div className="grid gap-4 rounded-2xl border border-line bg-surface p-6 sm:grid-cols-[64px_minmax(0,1fr)] sm:items-center">
            <span className="relative size-16 overflow-hidden rounded-full border border-line bg-paper-2">
              <Image src={site.portrait.src} alt="" fill sizes="64px" className="object-cover object-[50%_42%]" />
            </span>
            <div className="grid gap-1">
              <p className="font-semibold">
                {t.article.writtenBy}{' '}
                <Link href={about} rel="author" className="hover:text-signal">
                  {locale === 'fa' ? copy.fa.name : site.name}
                </Link>
              </p>
              <p className="text-[15px] text-ink-2">{intro}</p>
              <p className="text-[15px]">
                <Link href={about} className="font-semibold text-signal hover:underline">
                  {t.article.moreAboutMe}
                </Link>
                <span className="text-ink-3"> · </span>
                <Link href={blog} className="font-semibold text-signal hover:underline">
                  {t.blog.all}
                </Link>
                <span className="text-ink-3"> · </span>
                <Link href={localePath(locale, '/contact')} className="font-semibold text-signal hover:underline">
                  {t.article.workWithMe}
                </Link>
              </p>
              <SocialIcons withEmail={false} className="pt-2" />
            </div>
          </div>
        </Container>
      </article>

      {related.length ? (
        <Container as="section" className="max-w-[1100px] pb-24">
          <h2 className="mb-4 text-h2 font-semibold">{t.article.related}</h2>
          <div className="border-b border-line">
            {related.map(a => (
              <ArticleRow key={a.slug} article={a} thumb />
            ))}
          </div>
        </Container>
      ) : null}
    </>
  );
}

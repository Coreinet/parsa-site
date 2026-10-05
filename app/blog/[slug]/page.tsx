import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleRow } from '@/components/blog/ArticleRow';
import Mdx from '@/components/blog/Mdx';
import ReadingProgress from '@/components/blog/ReadingProgress';
import Toc from '@/components/blog/Toc';
import { Container, ExampleBadge, Tag } from '@/components/ui/primitives';
import { site } from '@/content/site';
import JsonLd from '@/components/seo/JsonLd';
import TopicGuide from '@/components/blog/TopicGuide';
import SocialIcons from '@/components/ui/SocialIcons';
import { CATEGORIES, formatDate, getArticle, getArticles, getRelated } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';
import { articleSchema, breadcrumbSchema, graph } from '@/lib/schema';

export const dynamicParams = false;

export function generateStaticParams() {
  return getArticles().map(a => ({ slug: a.slug }));
}

export async function generateMetadata(props: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const article = getArticle(slug);
  if (!article) return {};
  return pageMetadata({
    title: `${article.seoTitle ?? article.title} – ${site.name}`,
    description: article.description,
    path: `/blog/${article.slug}`,
    type: 'article',
    image: { url: article.cover, alt: article.coverAlt ?? article.title },
    article: {
      publishedTime: article.date.toISOString(),
      modifiedTime: (article.updated ?? article.date).toISOString(),
      tags: article.tags,
      section: CATEGORIES[article.category]
    }
  });
}

export default async function ArticlePage(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params;
  const article = getArticle(slug);
  if (!article) notFound();
  const related = getRelated(article);

  return (
    <>
      <JsonLd
        data={graph(
          articleSchema(article),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: article.title, path: `/blog/${article.slug}` }
          ])
        )}
      />
      <ReadingProgress targetId="article-body" />
      <article>
        <Container as="header" className="grid max-w-[920px] gap-5 pb-10 pt-[clamp(32px,6vw,72px)]">
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/blog" className="mr-2 font-mono text-xs text-ink-3 hover:text-ink">
              ← Blog
            </Link>
            <Link href="/blog">
              <Tag category>{CATEGORIES[article.category]}</Tag>
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
              <Link href="/about" rel="author" className="font-semibold hover:text-signal">
                {site.name}
              </Link>
            </div>
            <span className="tabular font-mono text-xs text-ink-3">
              <time dateTime={formatDate(article.date)}>{formatDate(article.date)}</time>
              {article.updated ? (
                <>
                  {' '}· updated <time dateTime={formatDate(article.updated)}>{formatDate(article.updated)}</time>
                </>
              ) : null}
              {' '}· {article.readingMinutes} min read
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {article.tags.map(t => (
              <Tag key={t}>#{t}</Tag>
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
              <summary className="cursor-pointer font-mono text-xs uppercase tracking-[.08em] text-ink-2">On this page</summary>
              <ul className="mt-3 grid gap-1.5 text-sm">
                {article.headings.map(h => (
                  <li key={h.id} className={h.depth === 3 ? 'pl-4' : ''}>
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
              <Toc headings={article.headings} />
            </div>
          </aside>
        </Container>

        <Container className="max-w-[1100px] pt-16">
          <TopicGuide slug={article.slug} />
        </Container>

        <Container className="max-w-[1100px] py-8">
          <div className="grid gap-4 rounded-2xl border border-line bg-surface p-6 sm:grid-cols-[64px_minmax(0,1fr)] sm:items-center">
            <span className="relative size-16 overflow-hidden rounded-full border border-line bg-paper-2">
              <Image src={site.portrait.src} alt="" fill sizes="64px" className="object-cover object-[50%_42%]" />
            </span>
            <div className="grid gap-1">
              <p className="font-semibold">
                Written by{' '}
                <Link href="/about" rel="author" className="hover:text-signal">
                  {site.name}
                </Link>
              </p>
              <p className="text-[15px] text-ink-2">{site.intro}</p>
              <p className="text-[15px]">
                <Link href="/about" className="font-semibold text-signal hover:underline">
                  More about me
                </Link>
                <span className="text-ink-3"> · </span>
                <Link href="/about#writing" className="font-semibold text-signal hover:underline">
                  All articles
                </Link>
                <span className="text-ink-3"> · </span>
                <Link href="/contact" className="font-semibold text-signal hover:underline">
                  Work with me
                </Link>
              </p>
              <SocialIcons withEmail={false} className="pt-2" />
            </div>
          </div>
        </Container>
      </article>

      {related.length ? (
        <Container as="section" className="max-w-[1100px] pb-24">
          <h2 className="mb-4 text-h2 font-semibold">Related articles</h2>
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

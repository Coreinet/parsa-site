import { ArticleRow } from '@/components/blog/ArticleRow';
import BlogIndex from '@/components/blog/BlogIndex';
import { Section, TextLink } from '@/components/ui/primitives';
import Link from 'next/link';
import { localePath, ui, type Locale } from '@/content/i18n';
import { pageText } from '@/content/pageText';
import { localizeTopic, topics } from '@/content/topics';
import { CATEGORIES, getArticles } from '@/lib/content';

const HOME_LIMIT = 3;

/** Home: the latest articles, linking to /blog. Page: topic guides plus the searchable archive. */
export default function BlogSection({ page = false, locale = 'en' }: { page?: boolean; locale?: Locale }) {
  const t = pageText[locale];
  const path = localePath(locale, '/blog');
  const articles = getArticles(locale);
  const categories = (Object.keys(CATEGORIES) as (keyof typeof CATEGORIES)[])
    .map(value => ({ value, label: t.categories[value], count: articles.filter(a => a.category === value).length }))
    .filter(c => c.count > 0);

  return (
    <Section
      id={page ? undefined : 'blog'}
      path={path}
      page={page ? ui[locale].nav.blog : undefined}
      home={{ name: ui[locale].nav.home, href: localePath(locale) }}
      title={page ? t.blog.title : t.blog.homeTitle}
      intro={page ? t.blog.intro : t.blog.homeIntro}
      action={page || !articles.length ? undefined : <TextLink href={path}>{t.blog.all}</TextLink>}
    >
      {page ? (
        <nav aria-label={t.blog.topicGuides} className="grid gap-3">
          <h2 className="font-mono text-[11px] uppercase tracking-[.08em] text-ink-3">{t.blog.topicGuides}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {topics.map(topic => localizeTopic(topic, locale)).map(topic => (
              <li key={topic.id}>
                <Link
                  href={localePath(locale, `/topics/${topic.id}`)}
                  className="group grid h-full gap-1 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-ink"
                >
                  <span className="font-semibold transition-colors group-hover:text-signal">
                    {topic.name}{' '}
                    <span aria-hidden="true" className="inline-block rtl:-scale-x-100">
                      →
                    </span>
                  </span>
                  <span className="text-sm text-ink-2">{topic.definition}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {!articles.length ? (
        <p className="text-ink-2">{t.blog.empty}</p>
      ) : page ? (
        <BlogIndex
          t={t.index}
          categories={categories}
          entries={articles.map(a => ({
            slug: a.slug,
            year: String(a.date.getUTCFullYear()),
            category: a.category,
            search: `${a.title} ${a.description} ${a.tags.join(' ')} ${a.category}`.toLowerCase(),
            node: <ArticleRow article={a} thumb heading="h4" />
          }))}
        />
      ) : (
        <ul className="border-b border-line">
          {articles.slice(0, HOME_LIMIT).map(a => (
            <li key={a.slug}>
              <ArticleRow article={a} thumb />
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

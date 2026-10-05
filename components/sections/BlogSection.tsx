import { ArticleRow } from '@/components/blog/ArticleRow';
import BlogIndex from '@/components/blog/BlogIndex';
import { Section, TextLink } from '@/components/ui/primitives';
import Link from 'next/link';
import { site } from '@/content/site';
import { topics } from '@/content/topics';
import { CATEGORIES, getArticles } from '@/lib/content';

const HOME_LIMIT = 3;

/** Home: the latest articles, linking to /blog. Page: topic guides plus the searchable archive. */
export default function BlogSection({ page = false }: { page?: boolean }) {
  const articles = getArticles();
  const categories = Object.entries(CATEGORIES)
    .map(([value, label]) => ({ value, label, count: articles.filter(a => a.category === value).length }))
    .filter(c => c.count > 0);

  return (
    <Section
      id={page ? undefined : 'blog'}
      path="/blog"
      page={page ? 'Blog' : undefined}
      title={page ? `Blog by ${site.name}` : 'Blog'}
      intro={
        page
          ? `Articles by ${site.name} on building for the web, mobile and AI: what worked, what broke, and why. Every article cites its sources.`
          : 'Notes on building for the web, mobile and AI: what worked, what broke, and why.'
      }
      action={page || !articles.length ? undefined : <TextLink href="/blog">All articles</TextLink>}
    >
      {page ? (
        <nav aria-label="Topic guides" className="grid gap-3">
          <h2 className="font-mono text-[11px] uppercase tracking-[.08em] text-ink-3">Topic guides</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {topics.map(t => (
              <li key={t.id}>
                <Link href={`/topics/${t.id}`} className="group grid h-full gap-1 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-ink">
                  <span className="font-semibold transition-colors group-hover:text-signal">{t.name} <span aria-hidden="true">→</span></span>
                  <span className="text-sm text-ink-2">{t.definition}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {!articles.length ? (
        <p className="text-ink-2">No articles yet. The first one is being written.</p>
      ) : page ? (
        <BlogIndex
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

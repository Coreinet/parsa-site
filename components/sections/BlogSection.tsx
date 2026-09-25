import { ArticleRow } from '@/components/blog/ArticleRow';
import BlogIndex from '@/components/blog/BlogIndex';
import { Section } from '@/components/ui/primitives';
import Link from 'next/link';
import { topics } from '@/content/topics';
import { CATEGORIES, getArticles } from '@/lib/content';

export default function BlogSection() {
  const articles = getArticles();
  const categories = Object.entries(CATEGORIES)
    .map(([value, label]) => ({ value, label, count: articles.filter(a => a.category === value).length }))
    .filter(c => c.count > 0);

  return (
    <Section id="blog" path="/blog" title="Blog" intro="Notes on building for the web, mobile and AI: what worked, what broke, and why.">
      <nav aria-label="Topic guides" className="grid gap-3">
        <h3 className="font-mono text-[11px] uppercase tracking-[.08em] text-ink-3">Topic guides</h3>
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

      {articles.length ? (
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
        <p className="text-ink-2">No articles yet. The first one is being written.</p>
      )}
    </Section>
  );
}

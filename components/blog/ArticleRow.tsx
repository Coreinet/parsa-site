import Image from 'next/image';
import Link from 'next/link';
import { CATEGORIES, formatDate, type Article } from '@/lib/content';
import { ExampleBadge, Tag } from '@/components/ui/primitives';

/** Articles are a dated index, not cards: a journal's table of contents. */
export function ArticleRow({ article, thumb = false, heading: H = 'h3' }: { article: Article; thumb?: boolean; heading?: 'h3' | 'h4' }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group grid grid-cols-[minmax(0,1fr)] gap-3 border-t border-line py-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal sm:grid-cols-[104px_minmax(0,1fr)] sm:gap-4"
    >
      <time dateTime={formatDate(article.date)} className="tabular pt-1 font-mono text-xs text-ink-3">
        {formatDate(article.date)}
      </time>
      <div className={thumb ? 'grid gap-4 sm:grid-cols-[minmax(0,1fr)_120px]' : ''}>
        <div className="grid content-start gap-1.5">
          <div className="flex flex-wrap gap-1.5">
            <Tag category>{CATEGORIES[article.category]}</Tag>
            <Tag>{article.readingMinutes} min</Tag>
            {article.example ? <ExampleBadge /> : null}
          </div>
          <H className="text-[19px] font-semibold leading-snug tracking-[-0.01em] transition-colors group-hover:text-signal">{article.title}</H>
          <p className="text-[15px] text-ink-2">{article.description}</p>
        </div>
        {thumb ? (
          <div className="relative hidden aspect-[4/3] overflow-hidden rounded-md border border-line sm:block">
            <Image src={article.cover} alt="" fill sizes="120px" className="object-cover" />
          </div>
        ) : null}
      </div>
    </Link>
  );
}

export function FeaturedArticle({ article }: { article: Article }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group grid content-start gap-5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-line bg-paper-2">
        <Image
          src={article.cover}
          alt=""
          fill
          sizes="(min-width: 1024px) 720px, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none"
        />
      </div>
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Tag category>{CATEGORIES[article.category]}</Tag>
          <span className="tabular font-mono text-xs text-ink-3">
            {formatDate(article.date)} · {article.readingMinutes} min read
          </span>
          {article.example ? <ExampleBadge /> : null}
        </div>
        <h2 className="text-h1 font-semibold transition-colors group-hover:text-signal">{article.title}</h2>
        <p className="text-body-lg text-ink-2">{article.description}</p>
      </div>
    </Link>
  );
}

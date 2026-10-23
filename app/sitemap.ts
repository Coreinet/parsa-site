import type { MetadataRoute } from 'next';
import { languageAlternates, LOCALES, localePath, type Locale } from '@/content/i18n';
import { site } from '@/content/site';
import { topics } from '@/content/topics';
import { getArticle, getArticles, getProjects, localesOf } from '@/lib/content';
import { absoluteUrl } from '@/lib/site-url';

type Entry = MetadataRoute.Sitemap[number];

/**
 * Every indexable URL in every language, each listing its translations as hreflang
 * alternates, with image entries (image sitemap) for the portrait and the covers.
 * Example content is excluded in production by getArticles/getProjects.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getArticles();
  const projects = getProjects();
  // Real content dates only: a lastmod that changes on every deploy teaches crawlers to ignore it.
  const latest = [...articles.map(a => a.updated ?? a.date)].sort((a, b) => b.getTime() - a.getTime())[0];
  const lastModified = latest ? { lastModified: latest } : {};
  const portrait = [absoluteUrl(site.portrait.src)];

  /** One entry per language the page exists in, all pointing at each other; `entry` may differ per language. */
  const everyLanguage = (
    path: string,
    entry: Omit<Entry, 'url'> | ((locale: Locale) => Omit<Entry, 'url'>),
    locales: readonly Locale[] = LOCALES
  ): Entry[] => {
    const alternates = { languages: Object.fromEntries(Object.entries(languageAlternates(path, locales)).map(([lang, p]) => [lang, absoluteUrl(p)])) };
    return locales.map(locale => ({ ...(typeof entry === 'function' ? entry(locale) : entry), url: absoluteUrl(localePath(locale, path)), alternates }));
  };
  // Each language's copy of an article has its own cover (public/images/blog/<lang>).
  const coverOf = (slug: string, locale: Locale): string => getArticle(slug, locale)?.cover ?? `/images/blog/${slug}.png`;

  return [
    ...everyLanguage('/', { ...lastModified, changeFrequency: 'weekly', priority: 1, images: portrait }),
    ...everyLanguage('/about', { ...lastModified, changeFrequency: 'monthly', priority: 0.9, images: portrait }),
    ...everyLanguage('/work', { changeFrequency: 'monthly', priority: 0.9, images: projects.map(p => absoluteUrl(p.cover)) }),
    ...everyLanguage('/blog', { ...lastModified, changeFrequency: 'weekly', priority: 0.9 }),
    ...everyLanguage('/stack', { changeFrequency: 'monthly', priority: 0.6 }),
    ...everyLanguage('/contact', { changeFrequency: 'yearly', priority: 0.7 }),
    ...topics.flatMap(t => everyLanguage(`/topics/${t.id}`, { ...lastModified, changeFrequency: 'monthly', priority: 0.7 })),
    ...projects.flatMap(p =>
      everyLanguage(
        `/work/${p.slug}`,
        { changeFrequency: 'yearly', priority: 0.7, images: [p.cover, ...p.screens].map(src => absoluteUrl(src)) },
        localesOf('work', p.slug)
      )
    ),
    ...articles.flatMap(a =>
      everyLanguage(
        `/blog/${a.slug}`,
        locale => ({ lastModified: a.updated ?? a.date, changeFrequency: 'monthly', priority: 0.8, images: [absoluteUrl(coverOf(a.slug, locale))] }),
        localesOf('blog', a.slug)
      )
    )
  ];
}

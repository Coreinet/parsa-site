import type { MetadataRoute } from 'next';
import { languageAlternates, localePath, TRANSLATED_PATHS, type TranslatedPath } from '@/content/i18n';
import { site } from '@/content/site';
import { topics } from '@/content/topics';
import { getArticles, getProjects } from '@/lib/content';
import { absoluteUrl } from '@/lib/site-url';

/**
 * Every indexable URL, with image entries (image sitemap) for the portrait, article covers
 * and project covers. Example content is excluded in production by getArticles/getProjects.
 * Pages that exist in English, Persian and Turkish list each other as hreflang alternates.
 */

const alternates = (path: TranslatedPath) => ({
  languages: Object.fromEntries(Object.entries(languageAlternates(path)).map(([lang, p]) => [lang, absoluteUrl(p)]))
});
export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getArticles();
  const projects = getProjects();
  // Real content dates only: a lastmod that changes on every deploy teaches crawlers to ignore it.
  const latest = [...articles.map(a => a.updated ?? a.date)].sort((a, b) => b.getTime() - a.getTime())[0];

  return [
    {
      url: absoluteUrl('/'),
      ...(latest ? { lastModified: latest } : {}),
      changeFrequency: 'weekly',
      priority: 1,
      images: [absoluteUrl(site.portrait.src)],
      alternates: alternates('/')
    },
    {
      url: absoluteUrl('/about'),
      ...(latest ? { lastModified: latest } : {}),
      changeFrequency: 'monthly',
      priority: 0.9,
      images: [absoluteUrl(site.portrait.src)],
      alternates: alternates('/about')
    },
    {
      url: absoluteUrl('/work'),
      changeFrequency: 'monthly',
      priority: 0.9,
      images: projects.map(p => absoluteUrl(p.cover)),
      alternates: alternates('/work')
    },
    {
      url: absoluteUrl('/blog'),
      ...(latest ? { lastModified: latest } : {}),
      changeFrequency: 'weekly',
      priority: 0.9
    },
    { url: absoluteUrl('/stack'), changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl('/contact'), changeFrequency: 'yearly', priority: 0.7, alternates: alternates('/contact') },
    ...(['fa', 'tr'] as const).flatMap(locale =>
      TRANSLATED_PATHS.map(path => ({
        url: absoluteUrl(localePath(locale, path)),
        changeFrequency: 'monthly' as const,
        priority: path === '/' ? 0.9 : 0.7,
        ...(path === '/' || path === '/about' ? { images: [absoluteUrl(site.portrait.src)] } : {}),
        alternates: alternates(path)
      }))
    ),
    ...topics.map(t => ({
      url: absoluteUrl(`/topics/${t.id}`),
      ...(latest ? { lastModified: latest } : {}),
      changeFrequency: 'monthly' as const,
      priority: 0.7
    })),
    ...projects.map(p => ({
      url: absoluteUrl(`/work/${p.slug}`),
      changeFrequency: 'yearly' as const,
      priority: 0.7,
      images: [p.cover, ...p.screens].map(src => absoluteUrl(src))
    })),
    ...articles.map(a => ({
      url: absoluteUrl(`/blog/${a.slug}`),
      lastModified: a.updated ?? a.date,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      images: [absoluteUrl(a.cover)]
    }))
  ];
}

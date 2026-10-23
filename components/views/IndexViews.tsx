import BlogSection from '@/components/sections/BlogSection';
import StackSection from '@/components/sections/StackSection';
import JsonLd from '@/components/seo/JsonLd';
import { localePath, ui, type Locale } from '@/content/i18n';
import { pageText } from '@/content/pageText';
import { getArticles } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';
import { blogSchema, breadcrumbSchema, collectionPageSchema, graph, personSchema } from '@/lib/schema';

/** /blog and /stack in every language. */

export const blogMetadata = (locale: Locale) => {
  const t = pageText[locale].blog;
  return pageMetadata({ title: t.metaTitle, description: t.metaDescription, path: localePath(locale, '/blog') });
};

export function BlogView({ locale }: { locale: Locale }) {
  const t = pageText[locale].blog;
  const articles = getArticles(locale);
  const path = localePath(locale, '/blog');
  return (
    <>
      <JsonLd
        data={graph(
          collectionPageSchema(
            path,
            t.title,
            t.metaDescription,
            articles.map(a => ({ name: a.title, path: a.href }))
          ),
          // The Blog entity is the English archive; translated archives list their own articles above.
          ...(locale === 'en' ? [blogSchema(articles)] : []),
          personSchema(),
          breadcrumbSchema([
            { name: ui[locale].nav.home, path: localePath(locale) },
            { name: ui[locale].nav.blog, path }
          ])
        )}
      />
      <BlogSection page locale={locale} />
    </>
  );
}

export const stackMetadata = (locale: Locale) => {
  const t = pageText[locale].stack;
  return pageMetadata({ title: t.metaTitle, description: t.metaDescription, path: localePath(locale, '/stack') });
};

export function StackView({ locale }: { locale: Locale }) {
  const t = pageText[locale].stack;
  const path = localePath(locale, '/stack');
  return (
    <>
      <JsonLd
        data={graph(
          collectionPageSchema(path, t.title, t.metaDescription, []),
          personSchema(),
          breadcrumbSchema([
            { name: ui[locale].nav.home, path: localePath(locale) },
            { name: ui[locale].nav.stack, path }
          ])
        )}
      />
      <StackSection page locale={locale} />
    </>
  );
}

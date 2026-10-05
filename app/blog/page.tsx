import BlogSection from '@/components/sections/BlogSection';
import JsonLd from '@/components/seo/JsonLd';
import { site } from '@/content/site';
import { getArticles } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';
import { blogSchema, breadcrumbSchema, collectionPageSchema, graph, personSchema } from '@/lib/schema';

const description = `Articles by ${site.name} on web development, mobile development, AI engineering and search, with sources for every claim.`;

export const metadata = pageMetadata({
  title: `Blog – ${site.name}`,
  description,
  path: '/blog'
});

export default function BlogPage() {
  const articles = getArticles();
  return (
    <>
      <JsonLd
        data={graph(
          collectionPageSchema(
            '/blog',
            `Blog by ${site.name}`,
            description,
            articles.map(a => ({ name: a.title, path: `/blog/${a.slug}` }))
          ),
          blogSchema(articles),
          personSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' }
          ])
        )}
      />
      <BlogSection page />
    </>
  );
}

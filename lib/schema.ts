import { site } from '@/content/site';
import type { Topic } from '@/content/topics';
import { topicsForArticle } from '@/content/topics';
import type { Article, Project } from '@/lib/content';
import { absoluteUrl, SITE_URL } from '@/lib/site-url';

/**
 * Schema.org builders. One Person entity with a stable @id is the anchor. Every other node
 * references it by @id, so search engines can connect the site, its author, the articles,
 * the projects and the external profiles (sameAs) as the same person. Only confirmed facts.
 *
 *   WebSite ──publisher/author──▶ Person ◀──mainEntity── ProfilePage (/about)
 *   Blog ──author──▶ Person        BlogPosting ──author──▶ Person, ──isPartOf──▶ Blog
 *   SoftwareSourceCode/CreativeWork ──author──▶ Person
 *   CollectionPage (/work, /blog, /stack, /topics/x) ──mainEntity──▶ ItemList of pages
 *   ContactPage (/contact) ──about──▶ Person
 */

export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const BLOG_ID = `${SITE_URL}/#blog`;
export const PROFILE_URL = absoluteUrl('/about');
export const PROFILE_PAGE_ID = `${PROFILE_URL}#profilepage`;

type Json = Record<string, unknown>;

const authorRef = (): Json => ({ '@type': 'Person', '@id': PERSON_ID, name: site.name, url: PROFILE_URL });

export function personSchema(): Json {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: site.name,
    givenName: site.firstName,
    familyName: site.lastName,
    url: SITE_URL,
    mainEntityOfPage: { '@id': PROFILE_PAGE_ID },
    image: {
      '@type': 'ImageObject',
      '@id': `${SITE_URL}/#portrait`,
      url: absoluteUrl(site.portrait.src),
      width: site.portrait.width,
      height: site.portrait.height,
      caption: site.portrait.alt
    },
    email: `mailto:${site.email}`,
    jobTitle: site.jobTitle,
    // Shown on the About page: freelance since 2024.
    hasOccupation: { '@type': 'Occupation', name: 'Freelance software developer' },
    description: site.description,
    knowsAbout: [...site.knowsAbout],
    // Shown on the page as "Languages: Persian, English, Turkish" (content/site.ts facts).
    knowsLanguage: [
      { '@type': 'Language', name: 'Persian', alternateName: 'fa' },
      { '@type': 'Language', name: 'English', alternateName: 'en' },
      { '@type': 'Language', name: 'Turkish', alternateName: 'tr' }
    ],
    sameAs: site.socials.map(s => s.href)
  };
}

export function websiteSchema(): Json {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: site.name,
    description: site.description,
    inLanguage: 'en',
    publisher: { '@id': PERSON_ID },
    author: { '@id': PERSON_ID }
  };
}

export function blogSchema(articles: Article[]): Json {
  return {
    '@type': 'Blog',
    '@id': BLOG_ID,
    url: absoluteUrl('/blog'),
    name: `Blog – ${site.name}`,
    description: 'Articles on web development, mobile development, AI engineering and search, with sources.',
    inLanguage: 'en',
    isPartOf: { '@id': WEBSITE_ID },
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
    blogPost: articles.map(a => ({ '@id': `${absoluteUrl(`/blog/${a.slug}`)}#article` }))
  };
}

export function profilePageSchema(path: string, dateModified: string): Json {
  return {
    '@type': 'ProfilePage',
    '@id': PROFILE_PAGE_ID,
    url: absoluteUrl(path),
    name: `About ${site.name}`,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': PERSON_ID },
    mainEntity: { '@id': PERSON_ID },
    primaryImageOfPage: { '@id': `${SITE_URL}/#portrait` },
    dateModified,
    inLanguage: 'en'
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}

export function articleSchema(article: Article): Json {
  const url = absoluteUrl(`/blog/${article.slug}`);
  return {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: article.title,
    description: article.description,
    url,
    mainEntityOfPage: url,
    image: [absoluteUrl(article.cover)],
    datePublished: article.date.toISOString(),
    dateModified: (article.updated ?? article.date).toISOString(),
    author: authorRef(),
    publisher: { '@id': PERSON_ID },
    isPartOf: [{ '@id': BLOG_ID }, { '@id': WEBSITE_ID }],
    about: topicsForArticle(article.slug).map(t => ({ '@type': 'Thing', name: t.name, url: absoluteUrl(`/topics/${t.id}`) })),
    articleSection: article.category,
    keywords: article.tags.join(', '),
    wordCount: article.body.split(/\s+/).filter(Boolean).length,
    inLanguage: 'en'
  };
}

/**
 * Projects with public source become SoftwareSourceCode linked to the repository; a live
 * deployment is described as the WebApplication it produces. Others are CreativeWork.
 */
export function projectSchema(project: Project): Json {
  const url = absoluteUrl(`/work/${project.slug}`);
  const base = {
    '@id': `${url}#work`,
    name: project.title,
    description: project.summary,
    url,
    image: absoluteUrl(project.cover),
    dateCreated: String(project.year),
    author: { '@id': PERSON_ID },
    creator: { '@id': PERSON_ID },
    keywords: project.stack.join(', ')
  };
  if (project.links.repo) {
    return {
      '@type': 'SoftwareSourceCode',
      ...base,
      codeRepository: project.links.repo,
      ...(project.links.live
        ? { targetProduct: { '@type': 'WebApplication', name: project.title, url: project.links.live, applicationCategory: 'WebApplication', operatingSystem: 'Web browser' } }
        : {})
    };
  }
  // Client work without public source: link the project page to the live product.
  return { '@type': 'CreativeWork', ...base, ...(project.links.live ? { sameAs: project.links.live } : {}) };
}

export function topicSchema(topic: Topic, articles: Article[], projects: Project[]): Json {
  const url = absoluteUrl(`/topics/${topic.id}`);
  const parts = [
    ...articles.map(a => ({ url: absoluteUrl(`/blog/${a.slug}`), name: a.title })),
    ...projects.map(p => ({ url: absoluteUrl(`/work/${p.slug}`), name: p.title }))
  ];
  return {
    '@type': 'CollectionPage',
    '@id': `${url}#page`,
    url,
    name: topic.name,
    description: topic.definition,
    isPartOf: { '@id': WEBSITE_ID },
    author: { '@id': PERSON_ID },
    about: { '@type': 'Thing', name: topic.name },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: parts.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: p.url, name: p.name }))
    },
    inLanguage: 'en'
  };
}

/** Index pages (/work, /blog, /stack): a CollectionPage whose main entity lists its items. */
export function collectionPageSchema(path: string, name: string, description: string, items: { name: string; path: string }[]): Json {
  const url = absoluteUrl(path);
  return {
    '@type': 'CollectionPage',
    '@id': `${url}#page`,
    url,
    name,
    description,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': PERSON_ID },
    author: { '@id': PERSON_ID },
    ...(items.length
      ? {
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, url: absoluteUrl(item.path), name: item.name }))
          }
        }
      : {}),
    inLanguage: 'en'
  };
}

export function contactPageSchema(description: string): Json {
  const url = absoluteUrl('/contact');
  return {
    '@type': 'ContactPage',
    '@id': `${url}#page`,
    url,
    name: `Contact ${site.name}`,
    description,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': PERSON_ID },
    mainEntity: { '@id': PERSON_ID },
    inLanguage: 'en'
  };
}

/** Wraps nodes in a single @graph document. */
export const graph = (...nodes: Json[]): Json => ({ '@context': 'https://schema.org', '@graph': nodes });

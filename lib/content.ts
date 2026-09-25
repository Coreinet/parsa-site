import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';

const ROOT = path.join(process.cwd(), 'content');

/**
 * Placeholder content (frontmatter `example: true`) shows in development only. Production
 * builds leave it out entirely (no pages, no sitemap entries, no structured data), so nothing
 * invented is ever published as a fact about Parsa. Override with SHOW_EXAMPLE_CONTENT=true.
 */
export const SHOW_EXAMPLES = process.env.NODE_ENV !== 'production' || process.env.SHOW_EXAMPLE_CONTENT === 'true';

// ---------- Schemas: a missing field fails the build, not the page ----------

const projectSchema = z.object({
  title: z.string(),
  summary: z.string(),
  year: z.coerce.number(),
  role: z.string(),
  platform: z.string(),
  type: z.enum(['web', 'mobile', 'ai', 'open-source']),
  stack: z.array(z.string()),
  /** live: deployed and public · repository: source is public, no deployment · in-progress · archived */
  status: z.enum(['live', 'repository', 'in-progress', 'archived']),
  featured: z.boolean().default(false),
  order: z.number().default(99),
  cover: z.string(),
  /** Describes the cover image for search and screen readers. */
  coverAlt: z.string().optional(),
  screens: z.array(z.string()).default([]),
  links: z.object({ live: z.string().optional(), repo: z.string().optional() }).default({}),
  outcomes: z.array(z.object({ label: z.string(), value: z.coerce.string() })).default([]),
  example: z.boolean().default(false)
});

const articleSchema = z.object({
  title: z.string(),
  /** Shorter <title> for search results (aim for about 60 characters with the name). Defaults to title. */
  seoTitle: z.string().optional(),
  description: z.string(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  category: z.enum(['web', 'mobile', 'ai', 'engineering', 'notes']),
  tags: z.array(z.string()).default([]),
  cover: z.string(),
  coverAlt: z.string().optional(),
  example: z.boolean().default(false)
});

export type Project = z.infer<typeof projectSchema> & { slug: string; body: string };
export type Article = z.infer<typeof articleSchema> & {
  slug: string;
  body: string;
  readingMinutes: number;
  headings: { id: string; text: string; depth: 2 | 3 }[];
};

export const CATEGORIES: Record<Article['category'], string> = {
  web: 'Web',
  mobile: 'Mobile',
  ai: 'AI',
  engineering: 'Engineering',
  notes: 'Notes'
};

export const PROJECT_TYPES: Record<Project['type'], string> = {
  web: 'Web',
  mobile: 'Mobile',
  ai: 'AI',
  'open-source': 'Open source'
};

// ---------- Helpers ----------

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/(^-|-$)/g, '');

function readDir(dir: string): { slug: string; data: unknown; body: string }[] {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter(f => f.endsWith('.mdx'))
    .map(file => {
      const { data, content } = matter(fs.readFileSync(path.join(full, file), 'utf8'));
      return { slug: file.replace(/\.mdx$/, ''), data, body: content };
    });
}

function parse<T>(schema: z.ZodType<T>, data: unknown, where: string): T {
  const result = schema.safeParse(data);
  if (!result.success) throw new Error(`Invalid frontmatter in ${where}:\n${z.prettifyError(result.error)}`);
  return result.data;
}

const readingMinutes = (body: string): number => {
  const words = body.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;
  const codeLines = (body.match(/```[\s\S]*?```/g) ?? []).join('\n').split('\n').length;
  return Math.max(1, Math.round(words / 230 + codeLines / 60));
};

const extractHeadings = (body: string): Article['headings'] =>
  body
    .replace(/```[\s\S]*?```/g, '')
    .split('\n')
    .map(line => /^(#{2,3})\s+(.+)$/.exec(line))
    .filter((m): m is RegExpExecArray => m !== null)
    .map(m => ({ depth: m[1].length as 2 | 3, text: m[2].trim(), id: slugify(m[2].trim()) }));

// ---------- Projects ----------

export function getProjects(): Project[] {
  return readDir('work')
    .map(({ slug, data, body }) => ({ ...parse(projectSchema, data, `content/work/${slug}.mdx`), slug, body }))
    .filter(p => SHOW_EXAMPLES || !p.example)
    .sort((a, b) => a.order - b.order || b.year - a.year);
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find(p => p.slug === slug);
}

// ---------- Articles ----------

export function getArticles(): Article[] {
  return readDir('blog')
    .map(({ slug, data, body }) => ({
      ...parse(articleSchema, data, `content/blog/${slug}.mdx`),
      slug,
      body,
      readingMinutes: readingMinutes(body),
      headings: extractHeadings(body)
    }))
    .filter(a => SHOW_EXAMPLES || !a.example)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function getArticle(slug: string): Article | undefined {
  return getArticles().find(a => a.slug === slug);
}

/** Related by shared tags, then same category, newest first. */
export function getRelated(article: Article, limit = 3): Article[] {
  return getArticles()
    .filter(a => a.slug !== article.slug)
    .map(a => ({
      a,
      score: a.tags.filter(t => article.tags.includes(t)).length * 2 + (a.category === article.category ? 1 : 0)
    }))
    .sort((x, y) => y.score - x.score || y.a.date.getTime() - x.a.date.getTime())
    .slice(0, limit)
    .map(x => x.a);
}

export const formatDate = (d: Date): string => d.toISOString().slice(0, 10);

import { site } from '@/content/site';
import { topics } from '@/content/topics';
import { getArticles, getProjects } from '@/lib/content';
import { absoluteUrl } from '@/lib/site-url';

export const dynamic = 'force-static';

/**
 * /llms.txt: a plain-text map of the site for AI tools that read it (the llms.txt proposal).
 * It is optional and not a ranking signal for search engines; it repeats only what the
 * pages themselves say, generated from the same content, so it can never drift from them.
 */
export function GET() {
  const projects = getProjects();
  const articles = getArticles();

  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    `${site.name} is a freelance software developer (programming since 2021, freelance since 2024) working on web development, mobile development and artificial intelligence. Languages: Persian, English, Turkish.`,
    '',
    '## Profile',
    '',
    `- [About ${site.name}](${absoluteUrl('/about')}): biography, timeline, skills, projects and links`,
    ...site.socials.map(s => `- [${s.label}](${s.href})`),
    `- Email: ${site.email}`,
    '',
    '## Projects',
    '',
    ...projects.map(p => `- [${p.title}](${absoluteUrl(`/work/${p.slug}`)}): ${p.summary}`),
    '',
    '## Topics',
    '',
    ...topics.map(t => `- [${t.name}](${absoluteUrl(`/topics/${t.id}`)}): ${t.definition}`),
    '',
    '## Articles',
    '',
    ...articles.map(a => `- [${a.title}](${absoluteUrl(`/blog/${a.slug}`)}): ${a.description}`),
    ''
  ];

  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

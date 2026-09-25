import { site } from '@/content/site';
import { getArticles } from '@/lib/content';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function GET() {
  const items = getArticles()
    .map(
      a => `    <item>
      <title>${esc(a.title)}</title>
      <link>${SITE_URL}/blog/${a.slug}</link>
      <guid>${SITE_URL}/blog/${a.slug}</guid>
      <pubDate>${a.date.toUTCString()}</pubDate>
      <description>${esc(a.description)}</description>
    </item>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Blog · ${esc(site.name)}</title>
    <link>${SITE_URL}/#blog</link>
    <description>Notes on building for the web, mobile and AI.</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}

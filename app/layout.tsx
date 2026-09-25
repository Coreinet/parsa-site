import type { Metadata, Viewport } from 'next';
import { Familjen_Grotesk, JetBrains_Mono, Newsreader } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import CommandMenu, { type CommandEntry } from '@/components/layout/CommandMenu';
import Dock from '@/components/layout/Dock';
import Footer from '@/components/layout/Footer';
import SiteHeader from '@/components/layout/SiteHeader';
import ThemeToggle from '@/components/layout/ThemeToggle';
import { getArticles, getProjects } from '@/lib/content';
import { SECTIONS, sectionHref } from '@/content/nav';
import { site } from '@/content/site';
import { DEFAULT_OG_IMAGE } from '@/lib/metadata';
import { SITE_URL } from '@/lib/site-url';
import './globals.css';

const display = Familjen_Grotesk({ subsets: ['latin'], variable: '--font-familjen', display: 'swap' });
const prose = Newsreader({ subsets: ['latin'], variable: '--font-newsreader', style: ['normal', 'italic'], display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${site.name} – Software, Web & Mobile Developer`, template: `%s – ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: SITE_URL }],
  creator: site.name,
  publisher: site.name,
  // Canonical URLs are set per page (lib/metadata.ts), so error pages never inherit one.
  alternates: {
    types: { 'application/rss+xml': [{ url: '/blog/rss.xml', title: `Blog – ${site.name}` }] }
  },
  openGraph: { type: 'website', siteName: site.name, locale: 'en_US', url: '/', images: [DEFAULT_OG_IMAGE] },
  twitter: { card: 'summary_large_image', images: [DEFAULT_OG_IMAGE.url] },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 }
  },
  formatDetection: { telephone: false, email: false, address: false },
  // Google Search Console HTML-tag verification: set GOOGLE_SITE_VERIFICATION to the code only.
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {})
};

export const viewport: Viewport = {
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F1F2EE' },
    { media: '(prefers-color-scheme: dark)', color: '#0F1112' }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const entries: CommandEntry[] = [
    ...SECTIONS.map(s => ({ group: 'Pages' as const, title: s.label, href: sectionHref(s.id) })),
    ...getProjects().map(p => ({ group: 'Work' as const, title: p.title, href: `/work/${p.slug}`, hint: String(p.year) })),
    ...getArticles().map(a => ({ group: 'Blog' as const, title: a.title, href: `/blog/${a.slug}`, hint: a.category }))
  ];

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning className={`${display.variable} ${prose.variable} ${mono.variable}`}>
      <body className="min-h-svh">
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange>
          <a
            href="#main"
            className="fixed left-4 top-4 z-[60] -translate-y-24 rounded-sm bg-ink px-4 py-2 font-semibold text-paper focus:translate-y-0"
          >
            Skip to content
          </a>
          <SiteHeader
              actions={
                <>
                  <CommandMenu entries={entries} />
                  <ThemeToggle />
                </>
              }
          />
          <main id="main" className="min-h-[60svh]">
            {children}
          </main>
          <Footer />
          <Dock />
        </ThemeProvider>
      </body>
    </html>
  );
}

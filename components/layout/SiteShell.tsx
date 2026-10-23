import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import CommandMenu, { type CommandEntry } from '@/components/layout/CommandMenu';
import Dock from '@/components/layout/Dock';
import Footer from '@/components/layout/Footer';
import LanguageSwitch from '@/components/layout/LanguageSwitch';
import SiteHeader from '@/components/layout/SiteHeader';
import ThemeToggle from '@/components/layout/ThemeToggle';
import { LOCALE_META, ui, type Locale } from '@/content/i18n';
import { PAGES } from '@/content/nav';
import { getArticles, getProjects } from '@/lib/content';
import { fontVariables } from '@/lib/fonts';
import '@/app/globals.css';

/**
 * The document for one language: <html lang dir>, theme, header, footer and dock. Each
 * language's root layout (app/(en), app/fa, app/tr) and the global 404 render through it.
 */
export default function SiteShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  // The command menu searches the English pages, articles and projects in every language.
  const entries: CommandEntry[] = [
    ...PAGES.map(s => ({ group: 'Pages' as const, title: s.label, href: s.href })),
    ...getProjects().map(p => ({ group: 'Work' as const, title: p.title, href: `/work/${p.slug}`, hint: String(p.year) })),
    ...getArticles().map(a => ({ group: 'Blog' as const, title: a.title, href: `/blog/${a.slug}`, hint: a.category }))
  ];

  return (
    <html lang={locale} dir={LOCALE_META[locale].dir} data-scroll-behavior="smooth" suppressHydrationWarning className={fontVariables}>
      <body className="min-h-svh">
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange>
          <a
            href="#main"
            className="fixed start-4 top-4 z-[60] -translate-y-24 rounded-sm bg-ink px-4 py-2 font-semibold text-paper focus:translate-y-0"
          >
            {ui[locale].skip}
          </a>
          <SiteHeader
            locale={locale}
            actions={
              <>
                <LanguageSwitch />
                <CommandMenu entries={entries} />
                <ThemeToggle />
              </>
            }
          />
          <main id="main" className="min-h-[60svh]">
            {children}
          </main>
          <Footer locale={locale} />
          <Dock locale={locale} />
        </ThemeProvider>
      </body>
    </html>
  );
}

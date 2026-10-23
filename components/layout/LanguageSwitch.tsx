'use client';

import { usePathname } from 'next/navigation';
import { isTranslated, LOCALE_META, LOCALES, localePath, splitLocale, ui } from '@/content/i18n';
import { cn } from '@/lib/cn';

/**
 * EN · فا · TR. Each link goes to the same page in that language when it exists (home, about,
 * work, contact), otherwise to the closest one: a case study goes to Work, anything else home.
 * Plain links: each language has its own root layout, so switching is a full page load anyway.
 */
export default function LanguageSwitch({ className }: { className?: string }) {
  const { locale: current, path } = splitLocale(usePathname());
  const target = isTranslated(path) ? path : path.startsWith('/work/') ? '/work' : '/';

  return (
    <nav aria-label={ui[current].language} className={cn('h-11 rounded-full border border-line-strong bg-surface/85 p-1 backdrop-blur-md', className)}>
      <ul className="flex h-full items-stretch gap-0.5">
        {LOCALES.map(locale => {
          const on = locale === current;
          return (
            <li key={locale} className="flex">
              <a
                href={localePath(locale, target)}
                hrefLang={locale}
                lang={locale}
                aria-current={on ? 'true' : undefined}
                title={LOCALE_META[locale].name}
                className={cn(
                  'inline-grid min-w-8 place-items-center rounded-full px-2 text-[12.5px] font-semibold leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
                  on ? 'bg-ink text-paper' : 'text-ink-3 hover:text-ink'
                )}
              >
                <span className="sr-only">{LOCALE_META[locale].name}</span>
                <span aria-hidden="true">{LOCALE_META[locale].short}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

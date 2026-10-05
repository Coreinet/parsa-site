import Link from 'next/link';
import type { CSSProperties } from 'react';
import Monogram from '@/components/ui/Monogram';
import SocialIcons from '@/components/ui/SocialIcons';
import { Container } from '@/components/ui/primitives';
import { PAGES } from '@/content/nav';
import { site } from '@/content/site';

const BUILD_DATE = process.env.NEXT_PUBLIC_BUILD_DATE ?? '';
const BUILD_SHA = process.env.NEXT_PUBLIC_BUILD_SHA ?? '';

/** One compact bar: identity, page links, profiles, build stamp. */
export default function Footer() {
  return (
    <footer className="border-t border-line pb-[calc(env(safe-area-inset-bottom,0px)+112px)] pt-10 desk:pb-10">
      <Container className="grid gap-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3 font-semibold hover:text-signal">
            <span
              style={{ '--fx-fill': 'var(--ink)' } as CSSProperties}
              className="fx-fill group grid size-11 place-items-center rounded-full border border-line-strong text-ink transition-colors duration-300 hover:border-ink"
            >
              <Monogram />
            </span>
            {site.name}
          </Link>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
              {PAGES.filter(s => s.id !== 'home').map(s => (
                <li key={s.id}>
                  <Link href={s.href} className="text-ink-2 transition-colors hover:text-ink">
                    {s.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href="/blog/rss.xml" className="text-ink-2 transition-colors hover:text-ink">
                  RSS
                </a>
              </li>
            </ul>
          </nav>

          <SocialIcons />
        </div>

        <div className="flex flex-wrap justify-between gap-2 border-t border-line pt-5 text-[13px] text-ink-3">
          <span>
            © {new Date().getFullYear()} {site.name}
          </span>
          <span className="tabular font-mono text-[11px]">
            built with Next.js
            {BUILD_DATE ? ` · last deploy ${BUILD_DATE}` : ''}
            {BUILD_SHA ? ` · ${BUILD_SHA}` : ''}
          </span>
        </div>
      </Container>
    </footer>
  );
}

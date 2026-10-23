import Image from 'next/image';
import NameLockup from '@/components/home/NameLockup';
import StatusPill from '@/components/home/StatusPill';
import Lattice from '@/components/three/Lattice';
import SocialIcons from '@/components/ui/SocialIcons';
import { ButtonLink, Container } from '@/components/ui/primitives';
import { copy, localePath, type Translated } from '@/content/i18n';
import { site } from '@/content/site';
import { displayYear } from '@/lib/content';

/**
 * The home hero of the Persian and Turkish sites. Turkish uses the Latin name lockup; Persian
 * writes the name in Persian script as plain text, because the per-letter fold animation
 * would break the joins between Persian letters, and keeps the Latin name right below it.
 * The second word is muted rather than outlined: an outline shows the seams where Persian letters join.
 * Layout uses logical sides, so the portrait sits at the start corner in both directions.
 */
export default function LocaleHero({ locale }: { locale: Translated }) {
  const c = copy[locale];
  const [first, last] = c.name.split(' ');

  return (
    <Container as="section" id="home" className="grid scroll-mt-24 gap-10 pb-6 pt-[clamp(40px,8vw,96px)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center lg:gap-6">
      <div className="grid content-start gap-7">
        {locale === 'fa' ? (
          <div className="grid gap-3">
            <h1 className="font-display text-display-xl font-bold">
              <span className="block">{first}</span>{' '}
              <span className="block ps-[0.42em] text-ink-3">{last}</span>
            </h1>
            <p lang="en" dir="ltr" className="justify-self-start font-mono text-[15px] text-ink-2">
              {site.name}
            </p>
          </div>
        ) : (
          <NameLockup />
        )}
        <p className="font-mono text-[13px] tracking-[.02em] text-ink-2">{c.roles}</p>
        <p className="max-w-[52ch] text-body-lg text-ink-2">{c.intro}</p>
        <StatusPill available={site.available} label={c.availability} timeZone={site.timeZone} timeLabel={c.localTime} />
        <div className="flex flex-wrap items-center gap-3">
          <ButtonLink href={localePath(locale, '/contact')} label={c.startProject} />
          <ButtonLink href={localePath(locale, '/work')} intent="secondary" label={c.seeWork} />
        </div>
        <SocialIcons className="pt-2" />
      </div>

      <div className="relative mx-auto w-full max-w-[520px] max-lg:-mt-12 max-lg:pb-24 lg:max-w-none">
        <Lattice className="ms-auto opacity-90 max-lg:w-[92%]" />
        <figure className="group absolute bottom-0 start-0 z-10 w-[50%] max-w-[260px] lg:-start-[6%] lg:bottom-[-4%] lg:w-[46%] lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-line bg-paper-2 shadow-float">
            <Image
              src={site.portrait.src}
              alt={c.portraitAlt}
              fill
              preload
              sizes="(min-width: 1024px) 260px, 50vw"
              className="origin-[50%_50%] scale-[1.35] object-cover object-[50%_48%] grayscale transition-[filter] duration-700 group-hover:grayscale-0 motion-reduce:transition-none"
            />
          </div>
          <figcaption className="mt-2 font-mono text-[11px] text-ink-3">
            {c.name} · {displayYear(new Date(), locale)}
          </figcaption>
        </figure>
      </div>
    </Container>
  );
}

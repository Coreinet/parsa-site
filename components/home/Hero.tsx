import Image from 'next/image';
import NameLockup from '@/components/home/NameLockup';
import StatusPill from '@/components/home/StatusPill';
import Lattice from '@/components/three/Lattice';
import SocialIcons from '@/components/ui/SocialIcons';
import { ButtonLink, Container } from '@/components/ui/primitives';
import { site } from '@/content/site';

export default function Hero() {
  return (
    <Container as="section" id="home" className="grid scroll-mt-24 gap-10 pb-6 pt-[clamp(40px,8vw,96px)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center lg:gap-6">
      <div className="grid content-start gap-7">
        <NameLockup />
        <p className="font-mono text-[13px] tracking-[.02em] text-ink-2">
          {site.roles.join(' · ')} <span className="text-ink-3">developer</span>
        </p>
        <p className="max-w-[52ch] text-body-lg text-ink-2">{site.intro}</p>
        <StatusPill available={site.available} label={site.available ? site.availability : 'Not taking new projects'} timeZone={site.timeZone} />
        <div className="flex flex-wrap items-center gap-3">
          <ButtonLink href="/contact" label="Start a project" />
          <ButtonLink href="/work" intent="secondary" label="See my work" />
        </div>
        <SocialIcons className="pt-2" />
      </div>

      {/* Lattice with the portrait card overlapping its lower-left corner */}
      <div className="relative mx-auto w-full max-w-[520px] max-lg:-mt-12 max-lg:pb-24 lg:max-w-none">
        <Lattice className="ml-auto opacity-90 max-lg:w-[92%]" />
        <figure className="group absolute bottom-0 left-0 z-10 w-[50%] max-w-[260px] lg:bottom-[-4%] lg:left-[-6%] lg:w-[46%] lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-line bg-paper-2 shadow-float">
            <Image
              src={site.portrait.src}
              alt={site.portrait.alt}
              fill
              preload
              sizes="(min-width: 1024px) 260px, 50vw"
              className="origin-[50%_50%] scale-[1.35] object-cover object-[50%_48%] grayscale transition-[filter] duration-700 group-hover:grayscale-0 motion-reduce:transition-none"
            />
          </div>
          <figcaption className="mt-2 font-mono text-[11px] text-ink-3">
            {site.name} · {new Date().getFullYear()}
          </figcaption>
        </figure>
      </div>
    </Container>
  );
}

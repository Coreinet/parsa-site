import Changelog from '@/components/about/Changelog';
import PortraitCard from '@/components/ui/PortraitCard';
import { ExampleBadge, Section, Tag, TextLink } from '@/components/ui/primitives';
import { about } from '@/content/about';
import { site } from '@/content/site';
import { SHOW_EXAMPLES } from '@/lib/content';

export default function AboutSection() {
  return (
    <Section id="about" path="/about" title={about.statement} action={<TextLink href="/about">Full profile</TextLink>}>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-16">
        <div className="grid content-start gap-10">
          <div className="grid max-w-[60ch] gap-4 text-body-lg text-ink-2">
            {about.bio.map(p => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>

          <div className="grid gap-3">
            <h3 className="font-mono text-[11px] uppercase tracking-[.08em] text-ink-3">Interests</h3>
            <ul className="flex flex-wrap gap-2">
              {about.interests.map(i => (
                <li key={i}>
                  <Tag>{i}</Tag>
                </li>
              ))}
            </ul>
          </div>

          <dl className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
            {site.facts.map(f => (
              <div key={f.label} className="grid content-start gap-1 bg-surface p-4">
                <dt className="font-mono text-[11px] uppercase tracking-[.08em] text-ink-3">{f.label}</dt>
                <dd className="font-medium">{f.value}</dd>
              </div>
            ))}
          </dl>

          <div className="grid gap-5">
            <h3 className="text-h2 font-semibold">Timeline</h3>
            <Changelog entries={about.timeline} />
          </div>

          {/* Placeholder story: development only, never published. */}
          {SHOW_EXAMPLES ? (
            <div className="grid gap-5 rounded-2xl border border-dashed border-line-strong p-5">
              <ExampleBadge className="w-max" />
              <div className="grid max-w-[60ch] gap-4 text-ink-2">
                {about.example.story.map(p => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div>
          <div className="lg:sticky lg:top-28">
            <PortraitCard
              src={site.portrait.src}
              alt={site.portrait.alt}
              name={site.name}
              status={site.available ? site.availability : 'Not taking new projects'}
              available={site.available}
              caption={site.name}
              className="mx-auto w-full max-w-[380px]"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}

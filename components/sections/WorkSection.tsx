import { ProjectCard } from '@/components/work/ProjectCard';
import WorkFilters from '@/components/work/WorkFilters';
import { Section } from '@/components/ui/primitives';
import { site } from '@/content/site';
import { getProjects, PROJECT_TYPES } from '@/lib/content';

const github = site.socials.find(s => s.label === 'GitHub');

export default function WorkSection() {
  const projects = getProjects();
  const featured = projects.find(p => p.featured) ?? projects[0];
  const others = projects.filter(p => p !== featured);
  const types = (Object.keys(PROJECT_TYPES) as (keyof typeof PROJECT_TYPES)[])
    .map(value => ({ value, label: PROJECT_TYPES[value], count: others.filter(p => p.type === value).length }))
    .filter(t => t.count > 0);

  return (
    <Section id="work" path="/work" title="Selected work" intro={projects.length ? 'A few projects, each with a short case study: the problem, the approach, and what changed.' : undefined}>
      {projects.length === 0 ? (
        <div className="grid justify-items-start gap-3 rounded-2xl border border-dashed border-line-strong p-6 sm:p-8">
          <p className="text-lg font-semibold">Case studies are being written.</p>
          <p className="max-w-[56ch] text-ink-2">In the meantime, my code and experiments are on GitHub.</p>
          <a
            href={github?.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center rounded-full border border-line-strong px-4 text-sm font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-paper"
          >
            github.com/{github?.handle} ↗
          </a>
        </div>
      ) : null}
      {featured ? <ProjectCard project={featured} featured /> : null}
      {others.length > 4 ? (
        // Filters only earn their place once there is enough work to filter.
        <WorkFilters types={types} items={others.map(p => ({ key: p.slug, type: p.type, node: <ProjectCard project={p} /> }))} />
      ) : (
        <ul className="grid gap-x-8 gap-y-14 md:grid-cols-2">
          {others.map(p => (
            <li key={p.slug}>
              <ProjectCard project={p} />
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

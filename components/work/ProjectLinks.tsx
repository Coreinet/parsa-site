import type { Project } from '@/lib/content';
import { ButtonLink } from '@/components/ui/primitives';
import { pageText } from '@/content/pageText';

/** The calls to action of a case study: open the live product, and the source when it is public. */
export default function ProjectLinks({ project }: { project: Project }) {
  const { live, repo } = project.links;
  if (!live && !repo) return null;
  const t = pageText[project.locale].project;
  return (
    <div className="flex flex-wrap gap-3">
      {live ? <ButtonLink href={live} target="_blank" rel="noopener" label={t.visit} /> : null}
      {repo ? <ButtonLink href={repo} target="_blank" rel="noopener" intent="secondary" label={t.viewSource} /> : null}
    </div>
  );
}

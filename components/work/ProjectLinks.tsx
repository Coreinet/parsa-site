import type { Project } from '@/lib/content';
import { ButtonLink } from '@/components/ui/primitives';

/** The calls to action of a case study: open the live product, and the source when it is public. */
export default function ProjectLinks({ project }: { project: Project }) {
  const { live, repo } = project.links;
  if (!live && !repo) return null;
  return (
    <div className="flex flex-wrap gap-3">
      {live ? <ButtonLink href={live} target="_blank" rel="noopener" label="Visit website" /> : null}
      {repo ? <ButtonLink href={repo} target="_blank" rel="noopener" intent="secondary" label="View source" /> : null}
    </div>
  );
}

import StackGrid from '@/components/stack/StackGrid';
import StackLayers from '@/components/stack/StackLayers';
import { Section, TextLink } from '@/components/ui/primitives';
import { site } from '@/content/site';
import { stack } from '@/content/stack';

export default function StackSection({ page = false }: { page?: boolean }) {
  return (
    <Section
      id={page ? undefined : 'stack'}
      path="/stack"
      page={page ? 'Stack' : undefined}
      title={page ? `${site.name}'s tech stack` : 'The stack'}
      intro={
        page
          ? `The languages, frameworks and tools ${site.name} builds with, grouped by layer from the screen down to deployment.`
          : 'The tools I build with, grouped by layer from the screen down to deployment.'
      }
      action={page ? undefined : <TextLink href="/stack">Full stack</TextLink>}
    >
      <StackLayers layers={stack.map(layer => ({ id: `stack-${layer.id}`, name: layer.name, content: <StackGrid layer={layer} /> }))} />
    </Section>
  );
}

import StackGrid from '@/components/stack/StackGrid';
import StackLayers from '@/components/stack/StackLayers';
import { Section } from '@/components/ui/primitives';
import { stack } from '@/content/stack';

export default function StackSection() {
  return (
    <Section id="stack" path="/stack" title="The stack" intro="The tools I build with, grouped by layer from the screen down to deployment.">
      <StackLayers layers={stack.map(layer => ({ id: `stack-${layer.id}`, name: layer.name, content: <StackGrid layer={layer} /> }))} />
    </Section>
  );
}

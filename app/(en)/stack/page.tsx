import StackSection from '@/components/sections/StackSection';
import JsonLd from '@/components/seo/JsonLd';
import { site } from '@/content/site';
import { pageMetadata } from '@/lib/metadata';
import { breadcrumbSchema, collectionPageSchema, graph, personSchema } from '@/lib/schema';

const description = `The tech stack ${site.name} builds with: TypeScript, React, Next.js, Tailwind CSS, AI and computer vision tools, Node.js and deployment, grouped by layer.`;

export const metadata = pageMetadata({
  title: `Tech Stack & Skills – ${site.name}`,
  description,
  path: '/stack'
});

export default function StackPage() {
  return (
    <>
      <JsonLd
        data={graph(
          collectionPageSchema('/stack', `${site.name}'s tech stack`, description, []),
          personSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Stack', path: '/stack' }
          ])
        )}
      />
      <StackSection page />
    </>
  );
}

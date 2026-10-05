import WorkSection from '@/components/sections/WorkSection';
import JsonLd from '@/components/seo/JsonLd';
import { site } from '@/content/site';
import { getProjects } from '@/lib/content';
import { pageMetadata } from '@/lib/metadata';
import { breadcrumbSchema, collectionPageSchema, graph, personSchema, projectSchema } from '@/lib/schema';

const description = `Projects by ${site.name}, freelance software developer: web, mobile and AI work, each with a case study covering the problem, the approach and the result.`;

export const metadata = pageMetadata({
  title: `Work & Projects – ${site.name}`,
  description,
  path: '/work'
});

export default function WorkPage() {
  const projects = getProjects();
  return (
    <>
      <JsonLd
        data={graph(
          collectionPageSchema(
            '/work',
            `Work by ${site.name}`,
            description,
            projects.map(p => ({ name: p.title, path: `/work/${p.slug}` }))
          ),
          personSchema(),
          ...projects.map(projectSchema),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Work', path: '/work' }
          ])
        )}
      />
      <WorkSection page />
    </>
  );
}

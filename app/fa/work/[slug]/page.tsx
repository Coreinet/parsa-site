import type { Metadata } from 'next';
import ProjectView, { projectMetadata, projectParams } from '@/components/views/ProjectView';

export const dynamicParams = false;

export const generateStaticParams = () => projectParams('fa');

export async function generateMetadata(props: PageProps<'/fa/work/[slug]'>): Promise<Metadata> {
  return projectMetadata((await props.params).slug, 'fa');
}

export default async function ProjectPage(props: PageProps<'/fa/work/[slug]'>) {
  return <ProjectView slug={(await props.params).slug} locale="fa" />;
}

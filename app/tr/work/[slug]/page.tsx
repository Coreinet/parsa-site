import type { Metadata } from 'next';
import ProjectView, { projectMetadata, projectParams } from '@/components/views/ProjectView';

export const dynamicParams = false;

export const generateStaticParams = () => projectParams('tr');

export async function generateMetadata(props: PageProps<'/tr/work/[slug]'>): Promise<Metadata> {
  return projectMetadata((await props.params).slug, 'tr');
}

export default async function ProjectPage(props: PageProps<'/tr/work/[slug]'>) {
  return <ProjectView slug={(await props.params).slug} locale="tr" />;
}

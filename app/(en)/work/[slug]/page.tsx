import type { Metadata } from 'next';
import ProjectView, { projectMetadata, projectParams } from '@/components/views/ProjectView';

export const dynamicParams = false;

export const generateStaticParams = () => projectParams('en');

export async function generateMetadata(props: PageProps<'/work/[slug]'>): Promise<Metadata> {
  return projectMetadata((await props.params).slug, 'en');
}

export default async function ProjectPage(props: PageProps<'/work/[slug]'>) {
  return <ProjectView slug={(await props.params).slug} locale="en" />;
}

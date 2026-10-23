import type { Metadata } from 'next';
import TopicView, { topicMetadata, topicParams } from '@/components/views/TopicView';

export const dynamicParams = false;

export const generateStaticParams = topicParams;

export async function generateMetadata(props: PageProps<'/fa/topics/[id]'>): Promise<Metadata> {
  return topicMetadata((await props.params).id, 'fa');
}

export default async function TopicPage(props: PageProps<'/fa/topics/[id]'>) {
  return <TopicView id={(await props.params).id} locale="fa" />;
}

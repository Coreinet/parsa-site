import type { Metadata } from 'next';
import ArticleView, { articleMetadata, articleParams } from '@/components/views/ArticleView';

export const dynamicParams = false;

export const generateStaticParams = () => articleParams('fa');

export async function generateMetadata(props: PageProps<'/fa/blog/[slug]'>): Promise<Metadata> {
  return articleMetadata((await props.params).slug, 'fa');
}

export default async function ArticlePage(props: PageProps<'/fa/blog/[slug]'>) {
  return <ArticleView slug={(await props.params).slug} locale="fa" />;
}

import type { Metadata } from 'next';
import ArticleView, { articleMetadata, articleParams } from '@/components/views/ArticleView';

export const dynamicParams = false;

export const generateStaticParams = () => articleParams('en');

export async function generateMetadata(props: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  return articleMetadata((await props.params).slug, 'en');
}

export default async function ArticlePage(props: PageProps<'/blog/[slug]'>) {
  return <ArticleView slug={(await props.params).slug} locale="en" />;
}

import type { Metadata } from 'next';
import ArticleView, { articleMetadata, articleParams } from '@/components/views/ArticleView';

export const dynamicParams = false;

export const generateStaticParams = () => articleParams('tr');

export async function generateMetadata(props: PageProps<'/tr/blog/[slug]'>): Promise<Metadata> {
  return articleMetadata((await props.params).slug, 'tr');
}

export default async function ArticlePage(props: PageProps<'/tr/blog/[slug]'>) {
  return <ArticleView slug={(await props.params).slug} locale="tr" />;
}

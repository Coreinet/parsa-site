import { blogMetadata, BlogView } from '@/components/views/IndexViews';

export const metadata = blogMetadata('tr');

export default function BlogPage() {
  return <BlogView locale="tr" />;
}

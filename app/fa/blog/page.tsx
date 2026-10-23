import { blogMetadata, BlogView } from '@/components/views/IndexViews';

export const metadata = blogMetadata('fa');

export default function BlogPage() {
  return <BlogView locale="fa" />;
}

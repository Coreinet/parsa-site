import { blogMetadata, BlogView } from '@/components/views/IndexViews';

export const metadata = blogMetadata('en');

export default function BlogPage() {
  return <BlogView locale="en" />;
}

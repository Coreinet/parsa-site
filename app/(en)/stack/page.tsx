import { stackMetadata, StackView } from '@/components/views/IndexViews';

export const metadata = stackMetadata('en');

export default function StackPage() {
  return <StackView locale="en" />;
}

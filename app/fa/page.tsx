import { LocaleHome } from '@/components/i18n/LocalePages';
import { translatedMetadata } from '@/lib/metadata';

export const metadata = translatedMetadata('fa', '/');

export default function Page() {
  return <LocaleHome locale="fa" />;
}

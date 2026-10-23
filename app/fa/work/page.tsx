import { LocaleWork } from '@/components/i18n/LocalePages';
import { translatedMetadata } from '@/lib/metadata';

export const metadata = translatedMetadata('fa', '/work');

export default function Page() {
  return <LocaleWork locale="fa" />;
}

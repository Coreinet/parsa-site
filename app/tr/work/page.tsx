import { LocaleWork } from '@/components/i18n/LocalePages';
import { translatedMetadata } from '@/lib/metadata';

export const metadata = translatedMetadata('tr', '/work');

export default function Page() {
  return <LocaleWork locale="tr" />;
}

import { LocaleContact } from '@/components/i18n/LocalePages';
import { translatedMetadata } from '@/lib/metadata';

export const metadata = translatedMetadata('tr', '/contact');

export default function Page() {
  return <LocaleContact locale="tr" />;
}

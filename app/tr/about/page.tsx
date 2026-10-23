import { LocaleAbout } from '@/components/i18n/LocalePages';
import { translatedMetadata } from '@/lib/metadata';

export const metadata = translatedMetadata('tr', '/about', 'profile');

export default function Page() {
  return <LocaleAbout locale="tr" />;
}

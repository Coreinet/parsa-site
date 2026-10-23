import { LocaleAbout } from '@/components/i18n/LocalePages';
import { translatedMetadata } from '@/lib/metadata';

export const metadata = translatedMetadata('fa', '/about', 'profile');

export default function Page() {
  return <LocaleAbout locale="fa" />;
}

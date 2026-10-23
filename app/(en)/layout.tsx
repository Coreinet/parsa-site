import SiteShell from '@/components/layout/SiteShell';
import { site } from '@/content/site';
import { baseMetadata, siteViewport } from '@/lib/metadata';

export const metadata = baseMetadata('en', `${site.name} – Software, Web & Mobile Developer`, site.description);
export const viewport = siteViewport;

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell locale="en">{children}</SiteShell>;
}

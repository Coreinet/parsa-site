import SiteShell from '@/components/layout/SiteShell';
import { copy } from '@/content/i18n';
import { baseMetadata, siteViewport } from '@/lib/metadata';

const meta = copy.fa.meta['/'];

export const metadata = baseMetadata('fa', meta.title, meta.description);
export const viewport = siteViewport;

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SiteShell locale="fa">{children}</SiteShell>;
}

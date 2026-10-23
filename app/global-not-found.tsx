import type { Metadata } from 'next';
import NotFoundView from '@/components/layout/NotFoundView';
import SiteShell from '@/components/layout/SiteShell';
import { site } from '@/content/site';
import { siteViewport } from '@/lib/metadata';
import { SITE_URL } from '@/lib/site-url';

/** 404 for URLs that match no route. Each language has its own root layout, so there is no single one to render inside. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `Page not found – ${site.name}`,
  robots: { index: false, follow: true }
};
export const viewport = siteViewport;

export default function GlobalNotFound() {
  return (
    <SiteShell locale="en">
      <NotFoundView />
    </SiteShell>
  );
}

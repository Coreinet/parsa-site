import type { MetadataRoute } from 'next';
import { site } from '@/content/site';

/** Web app manifest: name, colours and icons used when the site is saved to a home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} – ${site.jobTitle}`,
    short_name: site.name,
    description: site.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#F1F2EE',
    theme_color: '#121416',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  };
}

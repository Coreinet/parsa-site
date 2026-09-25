import DriftWall, { type DriftWallItem } from '@/components/effects/DriftWall';

interface WorkWallProps {
  /** one entry per project screenshot; several per project is fine */
  shots: DriftWallItem[];
}

/**
 * /work header visual: a tilted, drifting wall of real project screenshots.
 * Desktop only (renders nothing below 1024px); decorative, the project list below is the real index.
 * Needs ~15+ screenshots to fill 5 columns without obvious repeats.
 */
export default function WorkWall({ shots }: WorkWallProps) {
  if (shots.length < 6) return null;
  return <DriftWall items={shots} columns={5} speed={18} grayscale dim={0.6} className="-mx-12 mb-4" />;
}

// Usage in app/work/page.tsx, between the header and the featured project:
// <WorkWall shots={projects.flatMap(p => p.screens.map(image => ({ image, title: p.title, href: `/work/${p.slug}` })))} />

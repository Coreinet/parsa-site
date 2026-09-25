import ScrollExpand from '@/components/effects/ScrollExpand';

interface ProjectCoverProps {
  src: string;
  alt: string;
  mediaType?: 'image' | 'video';
  poster?: string;
  /** one-line caption shown once the cover is fully open, e.g. what the screen shows */
  caption?: string;
}

/**
 * Case-study cover on /work/[slug], placed after the title and spec sheet.
 * Desktop: framed window that opens to full bleed on scroll. Phones / reduced motion: static 4:3.
 * Render it outside the page Container so the open frame can reach the viewport edges.
 */
export default function ProjectCover({ src, alt, mediaType, poster, caption }: ProjectCoverProps) {
  return (
    <div className="px-5 sm:px-8 desk:px-0 motion-reduce:px-5 sm:motion-reduce:px-8">
      <ScrollExpand
        src={src}
        alt={alt}
        mediaType={mediaType}
        poster={poster}
        priority
        sizes="(min-width: 1024px) 100vw, calc(100vw - 40px)"
      >
        {caption ? <p className="font-mono text-xs text-white/80">{caption}</p> : null}
      </ScrollExpand>
    </div>
  );
}

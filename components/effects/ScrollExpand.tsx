'use client';

/**
 * ScrollExpand: adapted from React Bits (ScrollExpand-TS-TW) for the Source & Signal system.
 * Changes from the original:
 * - window scroll only (nested scroll areas are awkward on touch)
 * - CSS decides the layout from first paint: pinned at ≥1024px with a fine pointer and motion
 *   allowed, otherwise a static rounded figure. No layout shift after hydration.
 * - stage height is CSS 100svh, so mobile address-bar resizes don't cause jumps
 * - next/image instead of <img>; video autoplays only when allowed and pauses offscreen
 * - typed props (the original spread `[key: string]: unknown` onto the root)
 * - shorter default pin distance, so the case study isn't delayed
 */

import Image from 'next/image';
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

const PIN_QUERY = '(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v);
const smoothstep = (e0: number, e1: number, x: number): number => {
  const t = clamp((x - e0) / (e1 - e0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
};

export interface ScrollExpandProps {
  src: string;
  alt: string;
  mediaType?: 'image' | 'video';
  poster?: string;
  /** optional caption over the media once it is fully open */
  children?: ReactNode;
  /** % of the stage the frame starts at */
  startWidth?: number;
  startHeight?: number;
  startRadius?: number;
  endRadius?: number;
  mediaZoom?: number;
  /** viewport heights of scroll that drive the expansion */
  scrollDistance?: number;
  /** viewport heights the open frame stays pinned afterwards */
  holdDistance?: number;
  /** 0 = follow scroll exactly; higher = softer catch-up */
  smoothing?: number;
  overlayScrim?: number;
  /** aspect ratio of the static layout (phones, tablets, reduced motion) */
  fallbackAspect?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
}

const STYLES = `
.se{position:relative;width:100%;aspect-ratio:var(--se-aspect);overflow:hidden;border-radius:var(--radius-lg,16px);border:1px solid var(--line)}
.se-stage{position:absolute;inset:0}
.se-frame,.se-media{position:absolute;inset:0}
.se-scrim{position:absolute;inset:0;pointer-events:none;background:linear-gradient(to top,rgb(0 0 0/.7),transparent 55%)}
@media ${PIN_QUERY}{
  .se{aspect-ratio:auto;height:calc(100svh * var(--se-total));overflow:visible;border:0;border-radius:0}
  .se-stage{position:sticky;top:0;height:100svh;overflow:hidden}
  .se-frame{clip-path:inset(var(--se-iy) var(--se-ix) round var(--se-r));will-change:clip-path}
  .se-media{transform:scale(var(--se-zoom));will-change:transform}
  .se-scrim{opacity:0;background:linear-gradient(to top,rgb(0 0 0/.75),rgb(0 0 0/.1) 45%,rgb(0 0 0/.3))}
  .se-overlay{opacity:0}
}`;

export default function ScrollExpand({
  src,
  alt,
  mediaType = 'image',
  poster,
  children,
  startWidth = 56,
  startHeight = 64,
  startRadius = 16,
  endRadius = 0,
  mediaZoom = 1.2,
  scrollDistance = 0.8,
  holdDistance = 0.2,
  smoothing = 0.08,
  overlayScrim = 0.4,
  fallbackAspect = '4 / 3',
  sizes = '100vw',
  priority = false,
  className = '',
  style
}: ScrollExpandProps) {
  const trackRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Video: autoplay only when motion is allowed, and only while on screen.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void video.play().catch(() => {});
      else video.pause();
    });
    io.observe(video);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    const frame = frameRef.current;
    const media = mediaRef.current;
    if (!track || !frame || !media) return undefined;

    const query = window.matchMedia(PIN_QUERY);
    let raf = 0;
    let current = 0;
    let target = 0;

    const apply = (p: number): void => {
      const e = smoothstep(0, 1, p);
      track.style.setProperty('--se-ix', `${(100 - (startWidth + (100 - startWidth) * e)) / 2}%`);
      track.style.setProperty('--se-iy', `${(100 - (startHeight + (100 - startHeight) * e)) / 2}%`);
      track.style.setProperty('--se-r', `${startRadius + (endRadius - startRadius) * e}px`);
      track.style.setProperty('--se-zoom', `${mediaZoom + (1 - mediaZoom) * e}`);
      if (scrimRef.current) scrimRef.current.style.opacity = `${overlayScrim * smoothstep(0.6, 1, p)}`;
      if (overlayRef.current) {
        const inn = smoothstep(0.7, 1, p);
        overlayRef.current.style.opacity = `${inn}`;
        overlayRef.current.style.transform = `translate3d(0, ${16 * (1 - inn)}px, 0)`;
      }
    };

    const read = (): number => {
      const span = window.innerHeight * Math.max(0.01, scrollDistance);
      return clamp(-track.getBoundingClientRect().top / span, 0, 1);
    };

    const tick = (): void => {
      const k = smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * smoothing));
      current += (target - current) * k;
      if (Math.abs(target - current) < 0.0004) current = target;
      apply(current);
      raf = current === target ? 0 : requestAnimationFrame(tick);
    };

    const onScroll = (): void => {
      target = read();
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const attach = (): void => {
      current = target = read();
      apply(current);
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
    };

    const detach = (): void => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      // Clear inline styles so the static layout shows scrim and caption as designed.
      scrimRef.current?.style.removeProperty('opacity');
      overlayRef.current?.style.removeProperty('opacity');
      overlayRef.current?.style.removeProperty('transform');
    };

    const sync = (): void => (query.matches ? attach() : detach());
    sync();
    query.addEventListener('change', sync);
    return () => {
      query.removeEventListener('change', sync);
      detach();
    };
  }, [startWidth, startHeight, startRadius, endRadius, mediaZoom, scrollDistance, smoothing, overlayScrim]);

  const vars = {
    '--se-aspect': fallbackAspect,
    '--se-total': 1 + scrollDistance + holdDistance,
    '--se-ix': `${(100 - startWidth) / 2}%`,
    '--se-iy': `${(100 - startHeight) / 2}%`,
    '--se-r': `${startRadius}px`,
    '--se-zoom': mediaZoom,
    ...style
  } as CSSProperties;

  return (
    <figure ref={trackRef} className={`se m-0 ${className}`.trim()} style={vars}>
      <style href="scroll-expand" precedence="default">{STYLES}</style>
      <div className="se-stage">
        <div ref={frameRef} className="se-frame">
          <div ref={mediaRef} className="se-media">
            {mediaType === 'video' ? (
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover"
                src={src}
                poster={poster}
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={alt}
              />
            ) : (
              <Image src={src} alt={alt} fill sizes={sizes} preload={priority} className="object-cover" draggable={false} />
            )}
          </div>
          {children ? (
            <>
              <div ref={scrimRef} className="se-scrim" />
              <figcaption
                ref={overlayRef}
                className="se-overlay absolute inset-x-0 bottom-0 grid gap-2 p-[clamp(20px,4vw,48px)] text-white"
              >
                {children}
              </figcaption>
            </>
          ) : null}
        </div>
      </div>
    </figure>
  );
}

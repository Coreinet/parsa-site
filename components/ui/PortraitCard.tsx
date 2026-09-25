'use client';

/**
 * PortraitCard: rebuilt from React Bits (ProfileCard-TS-TW) for the Source & Signal system.
 * Kept: pointer tilt with eased follow, a glare that tracks the pointer, a bottom info strip.
 * Removed: holographic rainbow layers, behind-glow, gradient text, infinite background animation,
 * device-orientation permission prompt, module-level style injection.
 * Fixed: the original's rAF loop never stopped while the window had focus; touch-none blocked
 * page scroll on phones; placeholder strings were used as image URLs; contact was a button.
 * Behaviour: grayscale at rest, colour on hover/focus (and after 1.2s in view on touch devices).
 * Tilt and glare only with a fine pointer and motion allowed.
 */

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';

export interface PortraitCardProps {
  src: string;
  alt: string;
  name: string;
  /** short line under the name, e.g. "Available for new projects" */
  status?: string;
  available?: boolean;
  contactHref?: string;
  /** mono caption under the card */
  caption?: string;
  /** max tilt in degrees */
  maxTilt?: number;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

const clamp = (v: number, a: number, b: number): number => Math.min(Math.max(v, a), b);

export default function PortraitCard({
  src,
  alt,
  name,
  status,
  available = false,
  contactHref = '/#contact',
  caption,
  maxTilt = 6,
  priority = false,
  sizes = '(min-width: 1024px) 400px, 90vw',
  className = ''
}: PortraitCardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [inViewColor, setInViewColor] = useState(false);

  // Touch devices can't hover: reveal colour once the card has been in view for 1.2s.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || window.matchMedia('(hover: hover)').matches) return undefined;
    let timer = 0;
    const io = new IntersectionObserver(([entry]) => {
      window.clearTimeout(timer);
      if (entry.isIntersecting) timer = window.setTimeout(() => setInViewColor(true), 1200);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  // Tilt: eased follow toward the pointer; the loop stops as soon as it settles.
  useEffect(() => {
    const root = rootRef.current;
    const card = cardRef.current;
    if (!root || !card) return undefined;
    const ok = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    if (!ok.matches) return undefined;

    const cur = { x: 0.5, y: 0.5, a: 0 };
    const tgt = { x: 0.5, y: 0.5, a: 0 };
    let raf = 0;
    let last = 0;

    const write = (): void => {
      card.style.setProperty('--px', `${(cur.x * 100).toFixed(2)}%`);
      card.style.setProperty('--py', `${(cur.y * 100).toFixed(2)}%`);
      card.style.setProperty('--rx', `${((0.5 - cur.y) * 2 * maxTilt).toFixed(3)}deg`);
      card.style.setProperty('--ry', `${((cur.x - 0.5) * 2 * maxTilt).toFixed(3)}deg`);
      card.style.setProperty('--glare', cur.a.toFixed(3));
    };

    const frame = (t: number): void => {
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016;
      last = t;
      const k = 1 - Math.exp(-dt / 0.14);
      cur.x += (tgt.x - cur.x) * k;
      cur.y += (tgt.y - cur.y) * k;
      cur.a += (tgt.a - cur.a) * k;
      write();
      const far = Math.abs(tgt.x - cur.x) + Math.abs(tgt.y - cur.y) + Math.abs(tgt.a - cur.a) > 0.002;
      raf = far ? requestAnimationFrame(frame) : 0;
      if (!raf) last = 0;
    };
    const kick = (): void => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent): void => {
      const r = card.getBoundingClientRect();
      tgt.x = clamp((e.clientX - r.left) / r.width, 0, 1);
      tgt.y = clamp((e.clientY - r.top) / r.height, 0, 1);
      tgt.a = 1;
      kick();
    };
    const onLeave = (): void => {
      tgt.x = 0.5;
      tgt.y = 0.5;
      tgt.a = 0;
      kick();
    };

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    return () => {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [maxTilt]);

  return (
    <figure ref={rootRef} className={`group m-0 grid gap-3 [perspective:900px] ${className}`.trim()}>
      <div
        ref={cardRef}
        data-color={inViewColor || undefined}
        className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-line bg-paper-2 shadow-[0_18px_40px_-24px_rgb(18_20_22/.45)] [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] [transform-style:preserve-3d]"
        style={{ '--px': '50%', '--py': '50%', '--glare': 0 } as CSSProperties}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          preload={priority}
          className="object-cover grayscale transition-[filter] duration-500 ease-out group-hover:grayscale-0 group-focus-within:grayscale-0 [[data-color]_&]:grayscale-0 motion-reduce:transition-none"
        />

        {/* Glare: a soft light that follows the pointer */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 mix-blend-soft-light [background:radial-gradient(farthest-corner_circle_at_var(--px)_var(--py),rgb(255_255_255/.55)_0%,rgb(255_255_255/0)_55%)] [opacity:var(--glare)]"
        />

        {/* Info strip */}
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-md border border-white/15 bg-black/35 px-3.5 py-3 text-white backdrop-blur-md">
          <div className="grid min-w-0 gap-1">
            <span className="truncate text-[15px] font-semibold leading-none">{name}</span>
            {status ? (
              <span className="flex items-center gap-1.5 truncate font-mono text-[11px] leading-none text-white/75">
                {available ? <span className="size-1.5 flex-none rounded-full bg-[#5CC98E]" aria-hidden="true" /> : null}
                {status}
              </span>
            ) : null}
          </div>
          <Link
            href={contactHref}
            className="flex-none rounded-sm border border-white/25 px-3 py-2 text-[13px] font-semibold transition-colors hover:border-white/60 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Contact →
          </Link>
        </div>
      </div>
      {caption ? <figcaption className="font-mono text-xs text-ink-3">{caption}</figcaption> : null}
    </figure>
  );
}

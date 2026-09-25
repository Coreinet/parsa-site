'use client';

/**
 * LogoLoop: adapted from React Bits (LogoLoop-TS-TW) for the Source & Signal system.
 * Changes from the original:
 * - pause/play button (WCAG 2.2.2: moving content longer than 5s must be pausable)
 * - pauses on hover and on keyboard focus; stops offscreen and in hidden tabs
 * - duplicate copies are `inert`, so Tab visits each link once
 * - reduced motion renders a static wrapped row instead of a frozen, clipped strip
 * - edge fade is a mask, so it works on any background in both themes
 * - labels shown next to icons by default; horizontal only; typed, no `any`
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

export interface LogoItem {
  /** icon node, e.g. <SiReact /> */
  node?: ReactNode;
  /** or an image logo */
  src?: string;
  title: string;
  href?: string;
}

export interface LogoLoopProps {
  logos: LogoItem[];
  /** px per second; negative reverses */
  speed?: number;
  logoHeight?: number;
  gap?: number;
  showLabels?: boolean;
  fadeOut?: boolean;
  ariaLabel: string;
  className?: string;
  style?: CSSProperties;
}

const MIN_COPIES = 2;
const SMOOTH_TAU = 0.25;

export default function LogoLoop({
  logos,
  speed = 32,
  logoHeight = 22,
  gap = 40,
  showLabels = true,
  fadeOut = true,
  ariaLabel,
  className = '',
  style
}: LogoLoopProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef<HTMLUListElement>(null);

  const [seqWidth, setSeqWidth] = useState(0);
  const [copies, setCopies] = useState(MIN_COPIES);
  const [userPaused, setUserPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [reduced, setReduced] = useState(false);

  // Reduced motion: static layout.
  useEffect(() => {
    const q = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = (): void => setReduced(q.matches);
    update();
    q.addEventListener('change', update);
    return () => q.removeEventListener('change', update);
  }, []);

  const measure = useCallback(() => {
    const root = rootRef.current;
    const seq = seqRef.current;
    if (!root || !seq) return;
    const w = Math.ceil(seq.getBoundingClientRect().width);
    if (w > 0) {
      setSeqWidth(w);
      setCopies(Math.max(MIN_COPIES, Math.ceil(root.clientWidth / w) + 2));
    }
  }, []);

  useEffect(() => {
    if (reduced) return undefined;
    const ro = new ResizeObserver(measure);
    if (rootRef.current) ro.observe(rootRef.current);
    if (seqRef.current) ro.observe(seqRef.current);
    measure();
    return () => ro.disconnect();
  }, [measure, reduced, logos, gap, logoHeight]);

  // Animation: eases to a stop when paused, sleeps when offscreen or hidden.
  const stateRef = useRef({ offset: 0, velocity: 0, last: 0, raf: 0, visible: true });
  const paused = userPaused || interacting;

  useEffect(() => {
    const track = trackRef.current;
    const root = rootRef.current;
    if (!track || !root || reduced || seqWidth <= 0) return undefined;
    const s = stateRef.current;

    const frame = (t: number): void => {
      const dt = s.last ? Math.min(0.1, (t - s.last) / 1000) : 0;
      s.last = t;
      const target = paused ? 0 : speed;
      s.velocity += (target - s.velocity) * (1 - Math.exp(-dt / SMOOTH_TAU));
      s.offset = (((s.offset + s.velocity * dt) % seqWidth) + seqWidth) % seqWidth;
      track.style.transform = `translate3d(${-s.offset}px,0,0)`;
      const settled = paused && Math.abs(s.velocity) < 0.5;
      s.raf = settled || !s.visible || document.hidden ? 0 : requestAnimationFrame(frame);
      if (!s.raf) s.last = 0;
    };

    const kick = (): void => {
      if (!s.raf && s.visible && !document.hidden) s.raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([entry]) => {
      s.visible = entry.isIntersecting;
      kick();
    });
    io.observe(root);
    document.addEventListener('visibilitychange', kick);
    kick();

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', kick);
      if (s.raf) cancelAnimationFrame(s.raf);
      s.raf = 0;
      s.last = 0;
    };
  }, [paused, speed, seqWidth, reduced]);

  const renderItem = (item: LogoItem, key: string): ReactNode => {
    const content = (
      <span className="inline-flex items-center gap-2.5 text-ink-2 transition-colors duration-150 hover:text-ink">
        {item.node ? (
          <span className="inline-flex text-[length:var(--ll-h)]" aria-hidden="true">
            {item.node}
          </span>
        ) : item.src ? (
          // eslint-disable-next-line @next/next/no-img-element -- small SVG/PNG logos, sized by height
          <img src={item.src} alt="" className="h-[var(--ll-h)] w-auto" loading="lazy" decoding="async" draggable={false} />
        ) : null}
        <span className={showLabels ? 'text-[15px] font-medium' : 'sr-only'}>{item.title}</span>
      </span>
    );

    return (
      <li key={key} className="flex-none">
        {item.href ? (
          <a
            href={item.href}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex rounded-xs focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
          >
            {content}
          </a>
        ) : (
          content
        )}
      </li>
    );
  };

  const vars = { '--ll-gap': `${gap}px`, '--ll-h': `${logoHeight}px`, ...style } as CSSProperties;

  if (reduced) {
    return (
      <div className={className} style={vars} role="region" aria-label={ariaLabel}>
        <ul className="flex flex-wrap items-center gap-x-[var(--ll-gap)] gap-y-4">
          {logos.map((item, i) => renderItem(item, `s-${i}`))}
        </ul>
      </div>
    );
  }

  return (
    <div className={`flex w-full min-w-0 items-center gap-4 ${className}`.trim()} style={vars} role="region" aria-label={ariaLabel}>
      <div
        ref={rootRef}
        className={`relative min-w-0 flex-1 overflow-hidden py-1 ${
          fadeOut
            ? '[mask-image:linear-gradient(to_right,transparent,#000_clamp(24px,8%,96px),#000_calc(100%-clamp(24px,8%,96px)),transparent)]'
            : ''
        }`}
        onPointerEnter={() => setInteracting(true)}
        onPointerLeave={() => setInteracting(false)}
        onFocus={() => setInteracting(true)}
        onBlur={e => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setInteracting(false);
        }}
      >
        <div ref={trackRef} className="flex w-max will-change-transform">
          {Array.from({ length: copies }, (_, c) => (
            <ul
              key={c}
              ref={c === 0 ? seqRef : undefined}
              className="flex items-center gap-[var(--ll-gap)] pr-[var(--ll-gap)]"
              aria-hidden={c > 0 || undefined}
              inert={c > 0 || undefined}
            >
              {logos.map((item, i) => renderItem(item, `${c}-${i}`))}
            </ul>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setUserPaused(p => !p)}
        aria-pressed={userPaused}
        aria-label={userPaused ? 'Play logo strip' : 'Pause logo strip'}
        className="grid size-11 flex-none place-items-center rounded-full border border-line-strong text-ink-3 transition-colors hover:border-ink hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          {userPaused ? <path d="M8 5l11 7-11 7z" /> : <path d="M9 5v14M15 5v14" />}
        </svg>
      </button>
    </div>
  );
}

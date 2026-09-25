'use client';

/**
 * DriftWall: adapted from React Bits (DriftWall-TS-TW) for the Source & Signal system.
 * Changes from the original:
 * - desktop only: not mounted below 1024px / coarse pointers, so its images never download on phones
 * - decorative for assistive tech: aria-hidden, tiles skipped by Tab (the same links exist in the list)
 * - hover state toggled on the DOM, not React state (the original re-rendered every tile per hover)
 * - pause button (WCAG 2.2.2); loop sleeps offscreen, in hidden tabs, and when paused and settled
 * - reduced motion: still wall, no parallax
 * - next/image, theme tokens instead of hardcoded dark colors, typed
 */

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react';

export interface DriftWallItem {
  image: string;
  title: string;
  href?: string;
}

export interface DriftWallProps {
  items: DriftWallItem[];
  columns?: number;
  tileWidth?: number;
  tileHeight?: number;
  gap?: number;
  radius?: number;
  tilt?: number;
  turn?: number;
  perspective?: number;
  depth?: number;
  /** px per second */
  speed?: number;
  variance?: number;
  parallax?: number;
  lift?: number;
  fade?: number;
  dim?: number;
  grayscale?: boolean;
  className?: string;
  style?: CSSProperties;
}

const DESKTOP_QUERY = '(min-width: 1024px) and (hover: hover) and (pointer: fine)';

const columnFactor = (index: number, variance: number): number =>
  1 + variance * ((((index * 0.6180339887 + 0.35) % 1) * 2) - 1);

export default function DriftWall(props: DriftWallProps) {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const q = window.matchMedia(DESKTOP_QUERY);
    const update = (): void => setDesktop(q.matches);
    update();
    q.addEventListener('change', update);
    return () => q.removeEventListener('change', update);
  }, []);

  // Reserve the height on desktop from first paint so mounting later causes no layout shift.
  return (
    <div className={`relative hidden h-[480px] lg:block ${props.className ?? ''}`.trim()} style={props.style}>
      {desktop ? <Wall {...props} /> : null}
    </div>
  );
}

function Wall({
  items,
  columns = 5,
  tileWidth = 220,
  tileHeight = 146,
  gap = 18,
  radius = 10,
  tilt = 16,
  turn = -14,
  perspective = 1200,
  depth = 120,
  speed = 18,
  variance = 0.45,
  parallax = 0.5,
  lift = 56,
  fade = 0.6,
  dim = 0.6,
  grayscale = true
}: DriftWallProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeTileRef = useRef<HTMLElement | null>(null);
  const hoveredColRef = useRef(-1);
  const pointerRef = useRef({ x: 0, y: 0 });
  const kickRef = useRef<() => void>(() => {});
  // Column offsets persist across effect restarts (pause, resize), so the wall never jumps.
  const offsetsRef = useRef<number[]>([]);

  const [height, setHeight] = useState(480);
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const q = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = (): void => setReduced(q.matches);
    update();
    q.addEventListener('change', update);
    return () => q.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height || 480));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const columnItems = useMemo(() => {
    const cols: DriftWallItem[][] = Array.from({ length: columns }, () => []);
    items.forEach((item, i) => cols[i % columns].push(item));
    return cols.map(col => (col.length ? col : items.slice(0, 1)));
  }, [items, columns]);

  const columnMeta = useMemo(() => {
    const unit = tileHeight + gap;
    return columnItems.map(col => {
      const copyHeight = Math.max(unit, col.length * unit);
      return { copyHeight, copies: Math.max(2, Math.ceil((height * 1.6) / copyHeight) + 1) };
    });
  }, [columnItems, tileHeight, gap, height]);

  const baseVelocities = useMemo(
    () => columnItems.map((_, c) => speed * columnFactor(c, variance) * (c % 2 === 0 ? 1 : -1)),
    [columnItems, speed, variance]
  );

  useEffect(() => {
    const plane = planeRef.current;
    const container = containerRef.current;
    if (!plane || !container) return undefined;

    if (offsetsRef.current.length !== columnMeta.length) {
      offsetsRef.current = columnMeta.map((m, c) => m.copyHeight * ((c * 0.37) % 1));
    }
    const offsets = offsetsRef.current;
    const velocities = columnMeta.map(() => 0);
    const damped = { x: 0, y: 0 };
    let raf = 0;
    let last = 0;
    let visible = true;

    const place = (): void => {
      plane.style.transform =
        `translate(-50%, -50%) scale(1.18) rotateX(${tilt + damped.y}deg) ` +
        `rotateY(${turn + damped.x}deg) translateZ(${-depth}px)`;
      trackRefs.current.forEach((el, c) => {
        if (el) el.style.transform = `translate3d(0, ${-offsets[c]}px, 0)`;
      });
    };

    const frame = (t: number): void => {
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
      last = t;
      const maxTilt = reduced ? 0 : parallax * 8;
      const damp = 1 - Math.exp(-dt / 0.12);
      damped.x += (pointerRef.current.x * maxTilt - damped.x) * damp;
      damped.y += (-pointerRef.current.y * maxTilt - damped.y) * damp;

      let moving = Math.abs(damped.x - pointerRef.current.x * maxTilt) > 0.01;
      columnMeta.forEach((meta, c) => {
        const target = reduced || paused || hoveredColRef.current === c ? 0 : baseVelocities[c];
        velocities[c] += (target - velocities[c]) * (1 - Math.exp(-dt / (target === 0 ? 0.16 : 0.28)));
        offsets[c] = (((offsets[c] + velocities[c] * dt) % meta.copyHeight) + meta.copyHeight) % meta.copyHeight;
        if (target !== 0 || Math.abs(velocities[c]) > 0.2) moving = true;
      });

      place();
      raf = moving && visible && !document.hidden ? requestAnimationFrame(frame) : 0;
      if (!raf) last = 0;
    };

    const kick = (): void => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };
    kickRef.current = kick;

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      kick();
    });
    io.observe(container);
    document.addEventListener('visibilitychange', kick);
    place();
    kick();

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', kick);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [columnMeta, baseVelocities, reduced, paused, parallax, tilt, turn, depth]);

  const setActive = useCallback((tile: HTMLElement | null): void => {
    if (activeTileRef.current === tile) return;
    activeTileRef.current?.classList.remove('is-active');
    tile?.classList.add('is-active');
    activeTileRef.current = tile;
    hoveredColRef.current = tile ? Number(tile.dataset.col) : -1;
    kickRef.current();
  }, []);

  const onPointerMove = (e: PointerEvent<HTMLDivElement>): void => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current = { x: (e.clientX - rect.left) / rect.width - 0.5, y: (e.clientY - rect.top) / rect.height - 0.5 };
    setActive((e.target as HTMLElement).closest<HTMLElement>('[data-col]'));
    kickRef.current();
  };

  const onPointerLeave = (): void => {
    pointerRef.current = { x: 0, y: 0 };
    setActive(null);
  };

  const mask =
    'radial-gradient(ellipse 78% 82% at 50% 46%, #000 var(--dw-edge), transparent 100%), ' +
    'linear-gradient(to top, #000 var(--dw-edge), transparent 100%)';

  const vars = {
    '--dw-tile-w': `${tileWidth}px`,
    '--dw-tile-h': `${tileHeight}px`,
    '--dw-gap': `${gap}px`,
    '--dw-radius': `${radius}px`,
    '--dw-lift': `${lift}px`,
    '--dw-dim': dim,
    '--dw-edge': `${Math.max(0, (1 - fade) * 100)}%`,
    perspective: `${perspective}px`,
    WebkitMaskImage: mask,
    maskImage: mask,
    WebkitMaskComposite: 'source-in',
    maskComposite: 'intersect'
  } as CSSProperties;

  const ease = 'duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]';

  return (
    <>
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-hidden"
        style={vars}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        aria-hidden="true"
      >
        <div
          ref={planeRef}
          className="absolute left-1/2 top-1/2 flex [transform-style:preserve-3d] will-change-transform"
        >
          {columnItems.map((col, c) => (
            <div key={c} className="relative w-[calc(var(--dw-tile-w)+var(--dw-gap))] [transform-style:preserve-3d]">
              <div
                ref={el => {
                  trackRefs.current[c] = el;
                }}
                className="flex flex-col [transform-style:preserve-3d] will-change-transform"
              >
                {Array.from({ length: columnMeta[c].copies }, (_, copy) =>
                  col.map((item, i) => {
                    const inner = (
                      <span
                        className={`pointer-events-none absolute inset-[calc(var(--dw-gap)/2)] block overflow-hidden rounded-[var(--dw-radius)] border border-line bg-paper-2 opacity-[var(--dw-dim)] transition-[transform,opacity,box-shadow] ${ease} group-[.is-active]/tile:opacity-100 group-[.is-active]/tile:shadow-float group-[.is-active]/tile:[transform:translateZ(var(--dw-lift))]`}
                      >
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          sizes={`${tileWidth}px`}
                          draggable={false}
                          className={`object-cover transition-[filter] ${ease} ${grayscale ? 'grayscale' : ''} group-[.is-active]/tile:grayscale-0`}
                        />
                        <span
                          className={`absolute inset-x-0 bottom-0 translate-y-1 bg-[linear-gradient(to_top,rgb(0_0_0/.7),transparent)] px-3 pb-2 pt-6 font-mono text-xs text-white opacity-0 transition ${ease} group-[.is-active]/tile:translate-y-0 group-[.is-active]/tile:opacity-100`}
                        >
                          {item.title}
                        </span>
                      </span>
                    );
                    const common = {
                      className: 'group/tile relative block h-[calc(var(--dw-tile-h)+var(--dw-gap))] w-full [transform-style:preserve-3d]',
                      'data-col': c
                    };
                    return item.href ? (
                      <Link key={`${copy}-${i}`} href={item.href} tabIndex={-1} {...common} className={`${common.className} cursor-pointer`}>
                        {inner}
                      </Link>
                    ) : (
                      <div key={`${copy}-${i}`} {...common}>
                        {inner}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {!reduced && (
        <button
          type="button"
          onClick={() => setPaused(p => !p)}
          aria-pressed={paused}
          aria-label={paused ? 'Play project wall' : 'Pause project wall'}
          className="absolute bottom-3 right-3 z-10 grid size-11 place-items-center rounded-sm border border-line bg-surface/85 text-ink-2 backdrop-blur transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
            {paused ? <path d="M8 5l11 7-11 7z" /> : <path d="M9 5v14M15 5v14" />}
          </svg>
        </button>
      )}
    </>
  );
}

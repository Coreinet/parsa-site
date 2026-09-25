'use client';

/**
 * OptionWheel: adapted from React Bits (OptionWheel-TS-TW) for the Source & Signal system.
 * Changes from the original:
 * - controlled mode (`selected`) so page scroll can drive it (scrollspy)
 * - `captureWheel` opt-in: by default the mouse wheel scrolls the page, not the wheel
 * - layout is computed during render too, so the first paint isn't a pile of overlapping labels
 * - aria-activedescendant, Home/End keys, configurable label
 * - token colors and real Familjen weights (the original used font-extralight, which it lacks)
 * Note: dragging sets touch-action: none on the wheel; use it where touch dragging won't fight
 * page scroll (the /stack wheel is desktop only).
 */

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';

type Side = 'left' | 'right';

export interface OptionWheelProps {
  items: string[];
  label: string;
  /** controlled selection; omit for uncontrolled */
  selected?: number;
  defaultSelected?: number;
  onChange?: (index: number, item: string) => void;
  side?: Side;
  /** rem */
  fontSize?: number;
  spacing?: number;
  curve?: number;
  tilt?: number;
  blur?: number;
  fade?: number;
  minOpacity?: number;
  /** ms time constant of the easing */
  smoothing?: number;
  /** px from the side */
  inset?: number;
  loop?: boolean;
  draggable?: boolean;
  /** let the mouse wheel / touchpad turn the wheel (blocks page scroll while hovered) */
  captureWheel?: boolean;
  className?: string;
}

interface Layout {
  rowH: number;
  curve: number;
  tilt: number;
  blur: number;
  fade: number;
  minOpacity: number;
  side: Side;
  loop: boolean;
  count: number;
}

const ROOT_PX = 16;

// Pure layout for one option at distance d from the current position.
// Options sit on a circle whose arc length between neighbours equals one row height.
function place(d: number, l: Layout): { transform: string; opacity: string; filter: string; p: string } {
  const dist = Math.abs(d);
  const mirror = l.side === 'right' ? -1 : 1;
  const tiltRad = (l.tilt * Math.PI) / 180;
  const R = tiltRad > 0.0005 ? l.rowH / tiltRad : 0;
  let x = 0;
  let y = d * l.rowH;
  let rot = 0;
  if (R > 0) {
    const ang = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, d * tiltRad));
    y = R * Math.sin(ang);
    x = -mirror * R * (1 - Math.cos(ang)) * l.curve;
    rot = (mirror * ang * 180) / Math.PI;
  }
  return {
    transform: `translate(${x.toFixed(2)}px, calc(${y.toFixed(2)}px - 50%)) rotate(${rot.toFixed(3)}deg)`,
    opacity: String(Math.max(l.minOpacity, 1 - dist * l.fade)),
    filter: l.blur > 0 ? `blur(${(dist * l.blur).toFixed(2)}px)` : 'none',
    p: Math.max(0, 1 - Math.min(dist, 1)).toFixed(4)
  };
}

function distance(i: number, pos: number, l: Layout): number {
  let d = i - pos;
  if (l.loop && l.count > 1) {
    d = ((d % l.count) + l.count) % l.count;
    if (d > l.count / 2) d -= l.count;
  }
  return d;
}

export default function OptionWheel({
  items,
  label,
  selected,
  defaultSelected = 0,
  onChange,
  side = 'left',
  fontSize = 2.25,
  spacing = 1.35,
  curve = 1,
  tilt = 6,
  blur = 1.5,
  fade = 0.22,
  minOpacity = 0.08,
  smoothing = 200,
  inset = 0,
  loop = false,
  draggable = true,
  captureWheel = false,
  className = ''
}: OptionWheelProps) {
  const id = useId();
  const initial = selected ?? defaultSelected;
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const posRef = useRef(initial);
  const targetRef = useRef(initial);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);
  const selectedRef = useRef(initial);
  const onChangeRef = useRef(onChange);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragRef = useRef<{ y: number; start: number; id: number } | null>(null);
  const dragMovedRef = useRef(false);
  const [selectedIndex, setSelectedIndex] = useState(initial);
  const [dragging, setDragging] = useState(false);

  onChangeRef.current = onChange;
  const layout: Layout = {
    rowH: Math.max(fontSize * spacing * ROOT_PX, 1),
    curve,
    tilt,
    blur,
    fade,
    minOpacity,
    side,
    loop,
    count: items.length
  };
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  const frame = useCallback((now: number) => {
    const l = layoutRef.current;
    const dt = Math.min((now - lastRef.current) / 1000, 0.05);
    lastRef.current = now;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const k = reduce ? 1 : 1 - Math.exp(-dt / (Math.max(smoothing, 1) / 1000));
    let next = posRef.current + (targetRef.current - posRef.current) * k;
    const settled = Math.abs(targetRef.current - next) < 0.001;
    if (settled) next = targetRef.current;
    posRef.current = next;

    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const s = place(distance(i, next, l), l);
      el.style.transform = s.transform;
      el.style.opacity = s.opacity;
      el.style.filter = s.filter;
      el.style.setProperty('--ow-p', s.p);
    });

    rafRef.current = settled ? null : requestAnimationFrame(frame);
  }, [smoothing]);

  const run = useCallback(() => {
    if (rafRef.current != null) return;
    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(frame);
  }, [frame]);

  const select = useCallback(
    (value: number, snap: boolean, notify = true) => {
      const l = layoutRef.current;
      let v = l.loop ? value : Math.min(Math.max(value, 0), Math.max(l.count - 1, 0));
      if (snap) v = Math.round(v);
      targetRef.current = v;
      const idx = ((Math.round(v) % l.count) + l.count) % l.count;
      if (idx !== selectedRef.current) {
        selectedRef.current = idx;
        setSelectedIndex(idx);
        if (notify) onChangeRef.current?.(idx, items[idx]);
      }
      run();
    },
    [items, run]
  );

  // Controlled: follow the prop without echoing onChange back.
  useEffect(() => {
    if (selected === undefined || selected === selectedRef.current) return;
    select(selected, true, false);
  }, [selected, select]);

  useEffect(() => {
    if (!captureWheel) return undefined;
    const el = rootRef.current;
    if (!el) return undefined;
    const onWheel = (e: WheelEvent): void => {
      e.preventDefault();
      const delta = e.deltaMode === 1 ? e.deltaY * 24 : e.deltaY;
      select(targetRef.current + Math.max(-1, Math.min(1, delta / layoutRef.current.rowH)), false);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(() => select(targetRef.current, true), 140);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [captureWheel, select]);

  useEffect(() => () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>): void => {
    if (!draggable) return;
    dragRef.current = { y: e.clientY, start: targetRef.current, id: e.pointerId };
    dragMovedRef.current = false;
    setDragging(true);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current;
    if (!drag) return;
    const dy = e.clientY - drag.y;
    if (!dragMovedRef.current && Math.abs(dy) > 4) {
      dragMovedRef.current = true;
      rootRef.current?.setPointerCapture(drag.id); // only once a real drag starts, so clicks still land
    }
    if (dragMovedRef.current) select(drag.start - dy / layoutRef.current.rowH, false);
  };

  const onPointerEnd = (): void => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setDragging(false);
    if (dragMovedRef.current) select(targetRef.current, true);
  };

  const onItemClick = (index: number): void => {
    if (dragMovedRef.current) return;
    const l = layoutRef.current;
    const cur = targetRef.current;
    let d = index - (((cur % l.count) + l.count) % l.count);
    if (l.loop && l.count > 1) {
      if (d > l.count / 2) d -= l.count;
      else if (d < -l.count / 2) d += l.count;
    }
    select(cur + d, true);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    const cur = Math.round(targetRef.current);
    const map: Record<string, number> = {
      ArrowUp: cur - 1,
      ArrowLeft: cur - 1,
      ArrowDown: cur + 1,
      ArrowRight: cur + 1,
      Home: 0,
      End: items.length - 1
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    select(map[e.key], true);
  };

  return (
    <div
      ref={rootRef}
      role="listbox"
      tabIndex={0}
      aria-label={label}
      aria-activedescendant={`${id}-opt-${selectedIndex}`}
      className={`relative h-full w-full select-none overflow-hidden rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal ${
        draggable ? `[touch-action:none] ${dragging ? 'cursor-grabbing' : 'cursor-grab'}` : ''
      } ${className}`.trim()}
      style={{ '--ow-size': `${fontSize}rem`, '--ow-inset': `${inset}px` } as CSSProperties}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onKeyDown={onKeyDown}
    >
      {items.map((item, i) => {
        const s = place(distance(i, initial, layout), layout);
        return (
          <div
            key={`${item}-${i}`}
            id={`${id}-opt-${i}`}
            ref={el => {
              itemRefs.current[i] = el;
            }}
            role="option"
            aria-selected={selectedIndex === i}
            onClick={() => onItemClick(i)}
            style={{ transform: s.transform, opacity: s.opacity, filter: s.filter, '--ow-p': s.p } as CSSProperties}
            className={`absolute top-1/2 cursor-pointer whitespace-nowrap font-display leading-none tracking-[-0.02em] will-change-[transform,opacity] [font-size:var(--ow-size)] [color:color-mix(in_srgb,var(--ink)_calc(var(--ow-p,0)*100%),var(--ink-3))] ${
              side === 'right' ? 'right-[var(--ow-inset)] origin-right' : 'left-[var(--ow-inset)] origin-left'
            } ${selectedIndex === i ? 'font-semibold' : 'font-normal'}`}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
}

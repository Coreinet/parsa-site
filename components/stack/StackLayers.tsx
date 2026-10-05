'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import OptionWheel from '@/components/ui/OptionWheel';

export interface StackLayer {
  id: string;
  name: string;
  /** the layer's StackItem grid */
  content: ReactNode;
}

/**
 * /stack body. Desktop: a sticky OptionWheel of layer names on the left follows the layer
 * being read (scrollspy); turning or clicking it scrolls to that layer.
 * Phones: a sticky chip bar replaces the wheel, and each layer shows its own heading.
 */
export default function StackLayers({ layers }: { layers: StackLayer[] }) {
  const [active, setActive] = useState(0);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const jumpingRef = useRef(false);
  const chipsRef = useRef<HTMLUListElement>(null);

  // Keep the active chip visible in the horizontally scrolling bar.
  useEffect(() => {
    const bar = chipsRef.current;
    const chip = bar?.querySelector<HTMLElement>(`[data-chip="${active}"]`);
    if (!bar || !chip || !bar.offsetParent) return;
    const offset = chip.getBoundingClientRect().left - bar.getBoundingClientRect().left;
    bar.scrollTo({ left: bar.scrollLeft + offset - (bar.clientWidth - chip.offsetWidth) / 2, behavior: 'smooth' });
  }, [active]);

  // Scrollspy: the layer crossing a line 35% from the top is active.
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => {
        if (jumpingRef.current) return;
        const hit = entries.find(e => e.isIntersecting);
        if (hit) setActive(Number((hit.target as HTMLElement).dataset.index));
      },
      { rootMargin: '-35% 0px -64% 0px' }
    );
    sectionRefs.current.forEach(el => el && io.observe(el));
    return () => io.disconnect();
  }, [layers.length]);

  const jumpTo = (index: number): void => {
    setActive(index);
    jumpingRef.current = true;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    sectionRefs.current[index]?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    window.setTimeout(() => (jumpingRef.current = false), reduce ? 50 : 700);
  };

  return (
    <div className="grid gap-12 desk:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] desk:gap-16">
      <div className="hidden desk:block">
        <div className="sticky top-[calc(env(safe-area-inset-top,0px)+96px)] h-[min(60svh,420px)]">
          <OptionWheel
            items={layers.map(l => l.name)}
            label="Stack layers"
            selected={active}
            onChange={jumpTo}
            fontSize={1.75}
            spacing={1.6}
            tilt={4}
            curve={1}
            blur={0}
            fade={0.08}
            minOpacity={0.8}
            inset={40}
          />
        </div>
      </div>

      {/* Phones and tablets: a sticky chip bar stands in for the wheel and follows the same scrollspy. */}
      <nav aria-label="Stack layers" className="sticky top-[calc(env(safe-area-inset-top,0px)+12px)] z-30 -mx-5 -mb-6 px-5 desk:hidden">
        <ul ref={chipsRef} className="flex gap-1 overflow-x-auto rounded-full border border-line-strong bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] p-1 shadow-float backdrop-blur-lg [scrollbar-width:none]">
          {layers.map((layer, i) => (
            <li key={layer.id} className="shrink-0">
              <button
                type="button"
                data-chip={i}
                onClick={() => jumpTo(i)}
                aria-current={active === i ? 'true' : undefined}
                className={`h-9 whitespace-nowrap rounded-full px-4 text-[13px] font-medium transition-colors ${active === i ? 'bg-ink text-paper' : 'text-ink-2'}`}
              >
                {layer.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="grid gap-[clamp(48px,8vw,96px)]">
        {layers.map((layer, i) => (
          <section
            key={layer.id}
            id={layer.id}
            data-index={i}
            ref={el => {
              sectionRefs.current[i] = el;
            }}
            className="scroll-mt-24 grid gap-6"
            aria-labelledby={`${layer.id}-h`}
          >
            <h3 id={`${layer.id}-h`} className="text-h2 font-semibold desk:sr-only">
              {layer.name}
            </h3>
            {layer.content}
          </section>
        ))}
      </div>
    </div>
  );
}

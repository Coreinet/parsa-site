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
 * Phones: the wheel is hidden and each layer shows its own heading above its items.
 */
export default function StackLayers({ layers }: { layers: StackLayer[] }) {
  const [active, setActive] = useState(0);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const jumpingRef = useRef(false);

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

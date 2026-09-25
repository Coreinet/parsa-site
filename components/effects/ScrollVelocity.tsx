'use client';

/**
 * ScrollVelocity: adapted from React Bits (ScrollVelocity-TS-TW) for the Source & Signal system.
 * Changes from the original:
 * - still at rest by default (baseVelocity 0): rows move only while the page scrolls
 * - VelocityRow is a top-level component (the original was redefined every render and remounted)
 * - copies are aria-hidden; the text is read once
 * - width measured with ResizeObserver, so font loading doesn't break the loop point
 * - frame loop skips work offscreen and when reduced motion is on
 * - typography comes from className; no hardcoded sizes or drop shadow
 */

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity
} from 'motion/react';

interface VelocityMapping {
  input: [number, number];
  output: [number, number];
}

export interface ScrollVelocityProps {
  texts: ReactNode[];
  /** text read by screen readers; defaults to the string entries of `texts` */
  label?: string;
  /** px per second when the page is still; 0 keeps rows at rest (system default) */
  baseVelocity?: number;
  /** px per second added per unit of scroll speed factor */
  scrollVelocity?: number;
  damping?: number;
  stiffness?: number;
  numCopies?: number;
  velocityMapping?: VelocityMapping;
  scrollContainerRef?: RefObject<HTMLElement>;
  className?: string;
  rowClassName?: string;
  style?: CSSProperties;
}

interface VelocityRowProps extends Omit<ScrollVelocityProps, 'texts' | 'className' | 'style'> {
  children: ReactNode;
  direction: 1 | -1;
}

const wrap = (min: number, max: number, v: number): number => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

function VelocityRow({
  children,
  direction,
  baseVelocity = 0,
  scrollVelocity = 60,
  damping = 50,
  stiffness = 400,
  numCopies = 4,
  velocityMapping = { input: [0, 1000], output: [0, 5] },
  scrollContainerRef,
  rowClassName = ''
}: VelocityRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLSpanElement>(null);
  const [copyWidth, setCopyWidth] = useState(0);
  const inView = useInView(rowRef, { margin: '100px 0px' });
  const reduceMotion = useReducedMotion();

  const baseX = useMotionValue(0);
  const { scrollY } = useScroll(scrollContainerRef ? { container: scrollContainerRef } : undefined);
  const smoothVelocity = useSpring(useVelocity(scrollY), { damping, stiffness });
  const velocityFactor = useTransform(smoothVelocity, velocityMapping.input, velocityMapping.output, { clamp: false });
  const x = useTransform(baseX, v => (copyWidth ? `${wrap(-copyWidth, 0, v)}px` : '0px'));

  useEffect(() => {
    const el = copyRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => setCopyWidth(el.offsetWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    if (!inView || reduceMotion || !copyWidth) return;
    const factor = velocityFactor.get();
    // Scrolling down moves rows in their own direction; scrolling up reverses them.
    const scrollSign = factor < 0 ? -1 : 1;
    const speed = baseVelocity + Math.abs(factor) * scrollVelocity;
    if (speed < 0.01) return;
    baseX.set(baseX.get() + direction * scrollSign * speed * (delta / 1000));
  });

  return (
    <div ref={rowRef} className="relative overflow-hidden">
      <motion.div className={`flex whitespace-nowrap ${rowClassName}`} style={{ x }} aria-hidden="true">
        {Array.from({ length: numCopies }, (_, i) => (
          <span className="shrink-0 pr-[0.5em]" key={i} ref={i === 0 ? copyRef : undefined}>
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function ScrollVelocity({ texts, label, className = '', style, ...rowProps }: ScrollVelocityProps) {
  return (
    <div className={`min-w-0 max-w-full overflow-hidden ${className}`} style={style}>
      <p className="sr-only">{label ?? texts.filter(t => typeof t === 'string').join(' ')}</p>
      {texts.map((text, index) => (
        <VelocityRow key={index} direction={index % 2 === 0 ? -1 : 1} {...rowProps}>
          {text}
        </VelocityRow>
      ))}
    </div>
  );
}

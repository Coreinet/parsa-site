'use client';

/**
 * ScrollReveal: adapted from React Bits (ScrollReveal-TS-TW) for the Source & Signal system.
 * Changes from the original:
 * - no GSAP: one CSS variable (--p, 0→1 scroll progress) drives every word via calc()
 * - scroll listener only runs while the element is on screen (IntersectionObserver)
 * - text already on screen at load stays fully lit; reduced motion and no-JS show it lit
 * - accepts rich children (strings, <strong>, <em>…); only text nodes are split into words
 * - valid markup via `as` (was <p> inside <h2>); blur off by default (costly per frame)
 * - cleanup only removes its own listeners (the original killed every ScrollTrigger on the page)
 */

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactElement,
  type ReactNode
} from 'react';

export interface ScrollRevealProps {
  children: ReactNode;
  as?: ElementType;
  /** opacity of words not yet revealed; keep ≥ 0.15 so the text never vanishes */
  baseOpacity?: number;
  /** degrees the block starts rotated; 0 disables */
  baseRotation?: number;
  /** px of blur on unrevealed words; 0 disables (costly on phones) */
  blurStrength?: number;
  /** how many words ahead of the reading line are partly lit */
  softness?: number;
  className?: string;
  style?: CSSProperties;
}

const STYLES = `
.sr{--p:1;transform-origin:0% 50%;transform:rotate(calc((1 - var(--p)) * var(--sr-rot)))}
.sr-w{display:inline;opacity:clamp(var(--sr-base),calc(var(--p) * (var(--sr-n) + var(--sr-soft)) - var(--i)) / var(--sr-soft),1)}
.sr[data-blur] .sr-w{filter:blur(calc((1 - clamp(0,calc(var(--p) * (var(--sr-n) + var(--sr-soft)) - var(--i)) / var(--sr-soft),1)) * var(--sr-blur)))}
@media (prefers-reduced-motion:reduce){.sr{--p:1!important;transform:none}.sr[data-blur] .sr-w{filter:none}}`;

// Wraps each word of every text node in a span carrying its index (--i).
function splitWords(node: ReactNode, counter: { n: number }): ReactNode {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
      .split(/(\s+)/)
      .map((part, k) =>
        !part || /^\s+$/.test(part) ? (
          part
        ) : (
          <span className="sr-w" key={`w${counter.n}-${k}`} style={{ '--i': counter.n++ } as CSSProperties}>
            {part}
          </span>
        )
      );
  }
  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>;
    return cloneElement(el, undefined, splitWords(el.props.children, counter));
  }
  if (Array.isArray(node)) return Children.map(node, child => splitWords(child, counter));
  return node;
}

const ScrollReveal = ({
  children,
  as: Tag = 'p',
  baseOpacity = 0.18,
  baseRotation = 0,
  blurStrength = 0,
  softness = 4,
  className = '',
  style
}: ScrollRevealProps) => {
  const ref = useRef<HTMLElement | null>(null);
  const counter = { n: 0 };
  const content = splitWords(children, counter);
  const wordCount = counter.n;

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    // Progress runs from the block's top at 90% of the viewport to its bottom at 55%.
    const progress = (): number => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.9;
      const end = vh * 0.55 - r.height;
      return Math.min(1, Math.max(0, (start - r.top) / (start - end)));
    };

    // Already on screen at load: treat as read, never dim what the reader is looking at.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) return undefined;

    let frame: number | null = null;
    const update = (): void => {
      frame = null;
      const p = progress();
      el.style.setProperty('--p', p.toFixed(4));
      if (p >= 1) stop();
    };
    const onScroll = (): void => {
      if (frame === null) frame = requestAnimationFrame(update);
    };
    const start = (): void => {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      onScroll();
    };
    function stop(): void {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      io.disconnect();
    }

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
      else {
        update(); // settle the final value when scrolled past quickly
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      }
    });

    el.style.setProperty('--p', '0');
    io.observe(el);

    return () => {
      stop();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [wordCount]);

  const vars = {
    '--sr-n': wordCount,
    '--sr-base': baseOpacity,
    '--sr-soft': Math.max(1, softness),
    '--sr-rot': `${baseRotation}deg`,
    '--sr-blur': `${blurStrength}px`,
    ...style
  } as CSSProperties;

  return (
    <Tag ref={ref} className={`sr ${className}`.trim()} style={vars} data-blur={blurStrength > 0 ? '' : undefined}>
      <style href="scroll-reveal" precedence="default">{STYLES}</style>
      {content}
    </Tag>
  );
};

export default ScrollReveal;

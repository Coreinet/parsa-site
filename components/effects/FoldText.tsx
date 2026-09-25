'use client';

/**
 * FoldText: adapted from React Bits (FoldText-TS-TW) for the Source & Signal system.
 * Changes from the original:
 * - pure CSS keyframes instead of GSAP + ScrollTrigger (no animation library, ~40KB saved)
 * - the mount animation starts on first paint, before hydration, so the text never flashes
 * - `playOnce` skips the animation on later client-side visits in the same page load
 * - `delay` lets several FoldTexts chain into one sequence (e.g. "Parsa" then "Alizadeh")
 * - color, size, weight and tracking come from the parent / Tailwind classes, not props
 * - no infinite loop trigger; `as` renders a semantic element
 */

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from 'react';

type SplitBy = 'char' | 'word';
type Hinge = 'top' | 'bottom' | 'left' | 'right';
type Trigger = 'mount' | 'scroll' | 'hover';

export interface FoldTextProps {
  text: string;
  as?: ElementType;
  splitBy?: SplitBy;
  hinge?: Hinge;
  trigger?: Trigger;
  /** seconds per piece */
  duration?: number;
  /** seconds between pieces */
  stagger?: number;
  /** seconds before the first piece starts */
  delay?: number;
  perspective?: number;
  /** 0–1; use 0 for outlined or transparent text */
  creaseShading?: number;
  /** id for "play once per page load"; later client-side mounts render static */
  playOnce?: string;
  /**
   * true (default): a visually hidden copy carries the text and the animated letters are
   * aria-hidden. false: the animated letters ARE the text (no duplicate in the DOM), for
   * headings whose exact text matters to search engines; label the heading with aria-label.
   */
  srCopy?: boolean;
  className?: string;
  style?: CSSProperties;
}

const HINGE: Record<Hinge, { origin: string; rx: number; ry: number }> = {
  top: { origin: '50% 0%', rx: -92, ry: 0 },
  bottom: { origin: '50% 100%', rx: 92, ry: 0 },
  left: { origin: '0% 50%', rx: 0, ry: 92 },
  right: { origin: '100% 50%', rx: 0, ry: -92 }
};

const CREASE_DIR: Record<Hinge, string> = { top: '180deg', bottom: '0deg', left: '90deg', right: '270deg' };

// Module scope survives client-side navigation but resets on a full reload.
// Only written in an effect, so the server never marks anything as played.
const played = new Set<string>();

const STYLES = `
.fold{display:inline-block;white-space:pre-wrap}
.fold-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.fold-seg{display:inline-block;perspective:var(--fold-persp);transform-style:preserve-3d;vertical-align:baseline}
.fold-piece{position:relative;display:inline-block;transform-origin:var(--fold-origin);transform-style:preserve-3d;backface-visibility:hidden}
.fold-piece::after{content:"";position:absolute;inset:-.08em -.02em;pointer-events:none;opacity:0;mix-blend-mode:multiply;border-radius:.08em;
  background:linear-gradient(var(--fold-crease-dir),rgb(0 0 0/.58) 0%,rgb(0 0 0/.22) 42%,rgb(255 255 255/.26) 100%)}
.fold[data-state=play] .fold-piece{animation:fold-in var(--fold-dur) var(--fold-ease) both;animation-delay:calc(var(--fold-delay) + var(--i) * var(--fold-stagger))}
.fold[data-state=play] .fold-piece::after{animation:fold-crease var(--fold-dur) var(--fold-ease) both;animation-delay:inherit}
.fold[data-state=wait] .fold-piece{opacity:0}
@keyframes fold-in{from{opacity:0;transform:rotateX(var(--fold-rx)) rotateY(var(--fold-ry))}to{opacity:1;transform:none}}
@keyframes fold-crease{from{opacity:var(--fold-crease)}to{opacity:0}}
@media (prefers-reduced-motion:reduce){
  .fold[data-state] .fold-piece{animation:none!important;opacity:1!important;transform:none!important}
  .fold-piece::after{display:none}
}`;

const FoldText = ({
  text,
  as: Tag = 'span',
  splitBy = 'char',
  hinge = 'top',
  trigger = 'mount',
  duration = 0.55,
  stagger = 0.035,
  delay = 0,
  perspective = 700,
  creaseShading = 0.35,
  playOnce,
  srCopy = true,
  className = '',
  style
}: FoldTextProps) => {
  const rootRef = useRef<HTMLElement | null>(null);
  const skip = typeof window !== 'undefined' && !!playOnce && played.has(playOnce);
  const initial = skip ? 'static' : trigger === 'mount' ? 'play' : trigger === 'scroll' ? 'wait' : 'static';
  const [state, setState] = useState<'static' | 'wait' | 'play'>(initial);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    if (playOnce) played.add(playOnce);
  }, [playOnce]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || state !== 'wait') return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState('play');
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -18% 0px' }
    );
    io.observe(root);
    return () => io.disconnect();
  }, [state]);

  const replay = (): void => {
    if (trigger !== 'hover') return;
    setState('play');
    setRunId(n => n + 1); // new key remounts the pieces so the CSS animation restarts
  };

  const segments = useMemo(() => {
    let i = 0;
    const piece = (content: string, key: string): ReactNode => (
      <span className="fold-seg" key={key}>
        <span className="fold-piece" style={{ '--i': i++ } as CSSProperties}>
          {content}
        </span>
      </span>
    );

    if (splitBy === 'word') {
      return text.split(/(\s+)/).map((part, index) =>
        !part ? null : /^\s+$/.test(part) ? <span key={`ws-${index}`}>{part}</span> : piece(part, `w-${index}`)
      );
    }

    return Array.from(text).map((char, index) =>
      char === '\n' ? <br key={`br-${index}`} /> : piece(char === ' ' ? ' ' : char, `c-${index}`)
    );
  }, [text, splitBy]);

  const h = HINGE[hinge];
  const vars = {
    '--fold-persp': `${Math.max(120, perspective)}px`,
    '--fold-origin': h.origin,
    '--fold-rx': `${h.rx}deg`,
    '--fold-ry': `${h.ry}deg`,
    '--fold-dur': `${duration}s`,
    '--fold-stagger': `${stagger}s`,
    '--fold-delay': `${delay}s`,
    '--fold-ease': 'cubic-bezier(.215,.61,.355,1)', // ≈ power3.out
    '--fold-crease': Math.min(1, Math.max(0, creaseShading)),
    '--fold-crease-dir': CREASE_DIR[hinge],
    ...style
  } as CSSProperties;

  return (
    <Tag
      ref={rootRef}
      className={`fold ${className}`.trim()}
      data-state={state}
      style={vars}
      onMouseEnter={trigger === 'hover' ? replay : undefined}
    >
      <style href="fold-text" precedence="default">{STYLES}</style>
      {srCopy ? <span className="fold-sr">{text}</span> : null}
      <span aria-hidden={srCopy ? true : undefined} key={runId}>
        {segments}
      </span>
    </Tag>
  );
};

export default FoldText;

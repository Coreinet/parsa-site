'use client';

// Component created by Dominik Koch
// https://x.com/dominikkoch
// From React Bits (OrbitImages-TS-TW). Fixes: pauses offscreen, in hidden tabs and with reduced
// motion; stable keys for duplicate image URLs; `alt` per image (decorative by default).

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react';

type OrbitShape = 'ellipse' | 'circle' | 'square' | 'rectangle' | 'triangle' | 'star' | 'heart' | 'infinity' | 'wave' | 'custom';

export interface OrbitImagesProps {
  images?: string[];
  altPrefix?: string;
  /** true when the images carry meaning; false (default) hides the orbit from assistive tech */
  meaningful?: boolean;
  shape?: OrbitShape;
  customPath?: string;
  baseWidth?: number;
  radiusX?: number;
  radiusY?: number;
  radius?: number;
  starPoints?: number;
  starInnerRatio?: number;
  rotation?: number;
  duration?: number;
  itemSize?: number;
  direction?: 'normal' | 'reverse';
  fill?: boolean;
  width?: number | '100%';
  height?: number | 'auto';
  className?: string;
  showPath?: boolean;
  pathColor?: string;
  pathWidth?: number;
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  paused?: boolean;
  centerContent?: ReactNode;
  responsive?: boolean;
}

interface OrbitItemProps {
  item: ReactNode;
  index: number;
  totalItems: number;
  path: string;
  itemSize: number;
  rotation: number;
  progress: MotionValue<number>;
  fill: boolean;
}

const ellipse = (cx: number, cy: number, rx: number, ry: number): string =>
  `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;

const square = (cx: number, cy: number, size: number): string => {
  const h = size / 2;
  return `M ${cx - h} ${cy - h} L ${cx + h} ${cy - h} L ${cx + h} ${cy + h} L ${cx - h} ${cy + h} Z`;
};

const rectangle = (cx: number, cy: number, w: number, h: number): string => {
  const hw = w / 2;
  const hh = h / 2;
  return `M ${cx - hw} ${cy - hh} L ${cx + hw} ${cy - hh} L ${cx + hw} ${cy + hh} L ${cx - hw} ${cy + hh} Z`;
};

const triangle = (cx: number, cy: number, size: number): string => {
  const height = (size * Math.sqrt(3)) / 2;
  const hs = size / 2;
  return `M ${cx} ${cy - height / 1.5} L ${cx + hs} ${cy + height / 3} L ${cx - hs} ${cy + height / 3} Z`;
};

const star = (cx: number, cy: number, outerR: number, innerR: number, points: number): string => {
  const step = Math.PI / points;
  let path = '';
  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    path += `${i === 0 ? 'M' : ' L'} ${cx + r * Math.cos(angle)} ${cy + r * Math.sin(angle)}`;
  }
  return `${path} Z`;
};

const heart = (cx: number, cy: number, size: number): string => {
  const s = size / 30;
  return `M ${cx} ${cy + 12 * s} C ${cx - 20 * s} ${cy - 5 * s}, ${cx - 12 * s} ${cy - 18 * s}, ${cx} ${cy - 8 * s} C ${cx + 12 * s} ${cy - 18 * s}, ${cx + 20 * s} ${cy - 5 * s}, ${cx} ${cy + 12 * s}`;
};

const infinity = (cx: number, cy: number, w: number, h: number): string => {
  const hw = w / 2;
  const hh = h / 2;
  return `M ${cx} ${cy} C ${cx + hw * 0.5} ${cy - hh}, ${cx + hw} ${cy - hh}, ${cx + hw} ${cy} C ${cx + hw} ${cy + hh}, ${cx + hw * 0.5} ${cy + hh}, ${cx} ${cy} C ${cx - hw * 0.5} ${cy + hh}, ${cx - hw} ${cy + hh}, ${cx - hw} ${cy} C ${cx - hw} ${cy - hh}, ${cx - hw * 0.5} ${cy - hh}, ${cx} ${cy}`;
};

const wave = (cx: number, cy: number, w: number, amplitude: number, waves: number): string => {
  const pts: string[] = [];
  const segs = waves * 20;
  const hw = w / 2;
  for (let i = 0; i <= segs; i++) {
    const x = cx - hw + (w * i) / segs;
    pts.push(`${i === 0 ? 'M' : 'L'} ${x} ${cy + Math.sin((i / segs) * waves * 2 * Math.PI) * amplitude}`);
  }
  for (let i = segs; i >= 0; i--) {
    const x = cx - hw + (w * i) / segs;
    pts.push(`L ${x} ${cy - Math.sin((i / segs) * waves * 2 * Math.PI) * amplitude}`);
  }
  return `${pts.join(' ')} Z`;
};

function OrbitItem({ item, index, totalItems, path, itemSize, rotation, progress, fill }: OrbitItemProps) {
  const itemOffset = fill ? (index / totalItems) * 100 : 0;
  const offsetDistance = useTransform(progress, (p: number) => `${(((p + itemOffset) % 100) + 100) % 100}%`);

  return (
    <motion.div
      className="absolute select-none will-change-transform"
      style={{
        width: itemSize,
        height: itemSize,
        offsetPath: `path("${path}")`,
        offsetRotate: '0deg',
        offsetAnchor: 'center center',
        offsetDistance
      }}
    >
      <div style={{ transform: `rotate(${-rotation}deg)` }}>{item}</div>
    </motion.div>
  );
}

export default function OrbitImages({
  images = [],
  altPrefix = 'Orbiting image',
  meaningful = false,
  shape = 'ellipse',
  customPath,
  baseWidth = 1400,
  radiusX = 700,
  radiusY = 170,
  radius = 300,
  starPoints = 5,
  starInnerRatio = 0.5,
  rotation = -8,
  duration = 40,
  itemSize = 64,
  direction = 'normal',
  fill = true,
  width = 100,
  height = 100,
  className = '',
  showPath = false,
  pathColor = 'rgba(0,0,0,0.1)',
  pathWidth = 2,
  easing = 'linear',
  paused = false,
  centerContent,
  responsive = false
}: OrbitImagesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);
  const inView = useInView(containerRef, { margin: '100px' });
  const reduceMotion = useReducedMotion();
  const [pageVisible, setPageVisible] = useState(true);

  const c = baseWidth / 2;

  const path = useMemo(() => {
    switch (shape) {
      case 'circle':
        return ellipse(c, c, radius, radius);
      case 'square':
        return square(c, c, radius * 2);
      case 'rectangle':
        return rectangle(c, c, radiusX * 2, radiusY * 2);
      case 'triangle':
        return triangle(c, c, radius * 2);
      case 'star':
        return star(c, c, radius, radius * starInnerRatio, starPoints);
      case 'heart':
        return heart(c, c, radius * 2);
      case 'infinity':
        return infinity(c, c, radiusX * 2, radiusY * 2);
      case 'wave':
        return wave(c, c, radiusX * 2, radiusY, 3);
      case 'custom':
        return customPath || ellipse(c, c, radius, radius);
      default:
        return ellipse(c, c, radiusX, radiusY);
    }
  }, [shape, customPath, c, radiusX, radiusY, radius, starPoints, starInnerRatio]);

  useLayoutEffect(() => {
    if (!responsive || !containerRef.current) return undefined;
    const el = containerRef.current;
    const update = (): void => setScale(el.clientWidth / baseWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [responsive, baseWidth]);

  useEffect(() => {
    const onVis = (): void => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const progress = useMotionValue(0);
  const running = !paused && !reduceMotion && inView && pageVisible;

  useEffect(() => {
    if (!running) return undefined;
    // Continue from the current position instead of restarting at 0 after each pause.
    const from = progress.get();
    const to = from + (direction === 'reverse' ? -100 : 100);
    const controls = animate(progress, [from, to], { duration, ease: easing, repeat: Infinity, repeatType: 'loop' });
    return () => controls.stop();
  }, [progress, duration, easing, direction, running]);

  const containerWidth = responsive ? '100%' : typeof width === 'number' ? width : '100%';
  const containerHeight = responsive ? 'auto' : typeof height === 'number' ? height : typeof width === 'number' ? width : 'auto';

  const items = images.map((src, index) => (
    // eslint-disable-next-line @next/next/no-img-element -- small orbit thumbnails, possibly remote
    <img
      key={`${index}-${src}`}
      src={src}
      alt={meaningful ? `${altPrefix} ${index + 1}` : ''}
      draggable={false}
      loading="lazy"
      decoding="async"
      className="h-full w-full object-contain"
    />
  ));

  return (
    <div
      ref={containerRef}
      className={`relative mx-auto ${className}`}
      style={{ width: containerWidth, height: containerHeight, aspectRatio: responsive ? '1 / 1' : undefined }}
      aria-hidden={meaningful ? undefined : true}
    >
      <div
        className={responsive ? 'absolute left-1/2 top-1/2' : 'relative h-full w-full'}
        style={{
          width: responsive ? baseWidth : '100%',
          height: responsive ? baseWidth : '100%',
          transform: responsive && scale !== null ? `translate(-50%, -50%) scale(${scale})` : undefined,
          visibility: responsive && scale === null ? 'hidden' : undefined,
          transformOrigin: 'center center'
        }}
      >
        <div className="relative h-full w-full" style={{ transform: `rotate(${rotation}deg)`, transformOrigin: 'center center' }}>
          {showPath && (
            <svg width="100%" height="100%" viewBox={`0 0 ${baseWidth} ${baseWidth}`} className="pointer-events-none absolute inset-0">
              <path d={path} fill="none" stroke={pathColor} strokeWidth={pathWidth / (scale ?? 1)} />
            </svg>
          )}
          {items.map((item, index) => (
            <OrbitItem
              key={index}
              item={item}
              index={index}
              totalItems={items.length}
              path={path}
              itemSize={itemSize}
              rotation={rotation}
              progress={progress}
              fill={fill}
            />
          ))}
        </div>
      </div>

      {centerContent && <div className="absolute inset-0 z-10 flex items-center justify-center">{centerContent}</div>}
    </div>
  );
}

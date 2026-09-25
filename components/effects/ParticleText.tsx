'use client';

/**
 * ParticleText: adapted from React Bits (ParticleText-TS-TW) for the Source & Signal system.
 * Changes from the original:
 * - colors and font accept CSS values incl. var(--token); re-sampled on theme change
 * - accent is a small share of particles (highlightRatio), not a gradient across the text
 * - render loop pauses offscreen / in hidden tabs and sleeps once settled
 * - touch-pan-y instead of touch-none, so phones can still scroll over it
 * - glow off by default (per-particle shadowBlur is expensive)
 * - `as` renders the real text in a semantic element for screen readers
 */

import { useEffect, useRef, type CSSProperties, type ElementType } from 'react';

export interface ParticleTextProps {
  text?: string;
  as?: ElementType;
  particleSize?: number;
  density?: number;
  color?: string;
  highlightColor?: string;
  highlightRatio?: number;
  scatter?: number;
  gatherDuration?: number;
  stagger?: number;
  pointerRepel?: number;
  repelRadius?: number;
  idleDrift?: number;
  trigger?: 'mount' | 'hover' | 'click';
  fontSize?: number | string;
  fontWeight?: number | string;
  fontFamily?: string;
  glow?: boolean;
  className?: string;
  style?: CSSProperties;
}

type Rgb = { r: number; g: number; b: number };
type Target = { x: number; y: number; alpha: number };
type Particle = {
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
  seed: number;
  depth: number;
  delay: number;
};

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

// Resolves any CSS value (hex, rgb(), var(--token), clamp()) through a hidden probe element.
const withProbe = <T,>(container: HTMLElement, apply: (s: CSSStyleDeclaration) => void, read: (c: CSSStyleDeclaration) => T): T => {
  const probe = document.createElement('span');
  probe.textContent = 'M';
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  apply(probe.style);
  container.appendChild(probe);
  const value = read(window.getComputedStyle(probe));
  probe.remove();
  return value;
};

const parseRgb = (css: string): Rgb | null => {
  const m = css.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  return m ? { r: +m[1], g: +m[2], b: +m[3] } : null;
};

const resolveColor = (value: string, container: HTMLElement): string => {
  const rgb = parseRgb(withProbe(container, s => (s.color = value), c => c.color));
  return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : value;
};

const resolveFontSize = (value: number | string, container: HTMLElement): number => {
  if (typeof value === 'number') return value;
  return parseFloat(withProbe(container, s => (s.fontSize = value), c => c.fontSize)) || 96;
};

const resolveFontFamily = (value: string, container: HTMLElement): string =>
  withProbe(container, s => (s.fontFamily = value), c => c.fontFamily) || 'sans-serif';

const waitForFonts = async (font: string): Promise<void> => {
  if (!('fonts' in document)) return;
  try {
    await document.fonts.load(font);
  } catch {}
  await document.fonts.ready;
};

const ParticleText = ({
  text = 'Parsa Alizadeh',
  as: Tag = 'span',
  particleSize = 2,
  density = 4,
  color = 'var(--ink)',
  highlightColor = 'var(--signal)',
  highlightRatio = 0.06,
  scatter = 180,
  gatherDuration = 1400,
  stagger = 380,
  pointerRepel = 36,
  repelRadius = 110,
  idleDrift = 0.6,
  trigger = 'mount',
  fontSize = 'var(--text-display-xl)',
  fontWeight = 700,
  fontFamily = 'var(--font-display)',
  glow = false,
  className = '',
  style
}: ParticleTextProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let particles: Particle[] = [];
    let animationFrame: number | null = null;
    let resizeFrame: number | null = null;
    let buildId = 0;
    let gathering = false;
    let gatherStart = 0;
    let inView = true;
    let reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    let width = 0;
    let height = 0;
    let resolvedHighlight = highlightColor;

    const pointer = { active: false, x: 0, y: 0, smoothX: 0, smoothY: 0 };

    const canRun = (): boolean => inView && document.visibilityState === 'visible';
    // Idle drift and pointer repel need continuous frames; a settled, still field does not.
    const needsFrames = (): boolean =>
      gathering || (!reducedMotion && (idleDrift > 0 || pointer.active));

    const startGather = (fromScatter = true): void => {
      if (!particles.length) return;
      const spread = reducedMotion ? 0 : scatter;

      particles.forEach(particle => {
        if (fromScatter) {
          const angle = particle.seed * Math.PI * 2;
          const distance = spread * (0.35 + particle.depth * 0.75);
          particle.x = particle.targetX + Math.cos(angle) * distance + (particle.depth - 0.5) * spread * 0.55;
          particle.y = particle.targetY + Math.sin(angle) * distance + (particle.seed - 0.5) * spread * 0.55;
        }
        particle.startX = particle.x;
        particle.startY = particle.y;
        particle.delay = reducedMotion ? 0 : particle.seed * stagger;
      });

      gatherStart = performance.now();
      gathering = true;
      ensureRenderLoop();
    };

    const drawParticle = (particle: Particle): void => {
      const size = particle.size;
      ctx.fillStyle = particle.color;
      if (size <= 2.1) {
        ctx.fillRect(particle.x - size / 2, particle.y - size / 2, size, size);
        return;
      }
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    };

    const render = (now: number): void => {
      animationFrame = null;
      ctx.clearRect(0, 0, width, height);

      if (glow && !reducedMotion) {
        ctx.shadowBlur = particleSize * 3;
        ctx.shadowColor = resolvedHighlight;
      } else {
        ctx.shadowBlur = 0;
      }

      pointer.smoothX += (pointer.x - pointer.smoothX) * 0.18;
      pointer.smoothY += (pointer.y - pointer.smoothY) * 0.18;

      let complete = true;

      particles.forEach(particle => {
        let baseX = particle.targetX;
        let baseY = particle.targetY;
        let progress = 1;

        if (gathering) {
          const local = (now - gatherStart - particle.delay) / Math.max(1, reducedMotion ? 1 : gatherDuration);
          progress = clamp(local, 0, 1);
          const eased = easeOutCubic(progress);
          baseX = particle.startX + (particle.targetX - particle.startX) * eased;
          baseY = particle.startY + (particle.targetY - particle.startY) * eased;
          if (progress < 1) complete = false;
        } else if (!reducedMotion && idleDrift > 0) {
          const driftTime = now * 0.001;
          baseX += Math.sin(driftTime * 0.9 + particle.seed * 10) * idleDrift * particle.depth;
          baseY += Math.cos(driftTime * 0.75 + particle.depth * 10) * idleDrift * particle.depth;
        }

        if (pointer.active && !reducedMotion && pointerRepel > 0 && repelRadius > 0) {
          const dx = baseX - pointer.smoothX;
          const dy = baseY - pointer.smoothY;
          const distance = Math.hypot(dx, dy);
          if (distance > 0 && distance < repelRadius) {
            const force = Math.pow(1 - distance / repelRadius, 2) * pointerRepel;
            baseX += (dx / distance) * force;
            baseY += (dy / distance) * force;
          }
        }

        const follow = reducedMotion ? 1 : 0.22;
        particle.x += (baseX - particle.x) * follow;
        particle.y += (baseY - particle.y) * follow;

        ctx.globalAlpha = clamp(0.35 + progress * 0.65, 0, 1);
        drawParticle(particle);
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      if (gathering && complete) gathering = false;
      if (needsFrames()) ensureRenderLoop();
    };

    function ensureRenderLoop(): void {
      if (animationFrame === null && canRun()) {
        animationFrame = window.requestAnimationFrame(render);
      }
    }

    const sampleText = async (): Promise<void> => {
      const currentBuild = ++buildId;
      const rect = container.getBoundingClientRect();
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);
      if (width <= 0 || height <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const resolvedFamily = resolveFontFamily(fontFamily, container);
      const baseColor = resolveColor(color, container);
      resolvedHighlight = resolveColor(highlightColor, container);
      let resolvedSize = resolveFontSize(fontSize, container);
      let font = `${fontWeight} ${resolvedSize}px ${resolvedFamily}`;

      await waitForFonts(font);
      if (currentBuild !== buildId) return;

      const offscreen = document.createElement('canvas');
      const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
      if (!offCtx) return;

      const content = String(text || ' ');
      const maxTextWidth = width * 0.92;
      offCtx.font = font;
      let metrics = offCtx.measureText(content);
      const measuredWidth = Math.max(1, metrics.width);
      if (measuredWidth > maxTextWidth) {
        resolvedSize = Math.max(18, resolvedSize * (maxTextWidth / measuredWidth));
        font = `${fontWeight} ${resolvedSize}px ${resolvedFamily}`;
        await waitForFonts(font);
        if (currentBuild !== buildId) return;
        offCtx.font = font;
        metrics = offCtx.measureText(content);
      }

      const left = Math.ceil(metrics.actualBoundingBoxLeft || 0);
      const right = Math.ceil(metrics.actualBoundingBoxRight || metrics.width);
      const ascent = Math.ceil(metrics.actualBoundingBoxAscent || resolvedSize * 0.78);
      const descent = Math.ceil(metrics.actualBoundingBoxDescent || resolvedSize * 0.22);
      const padding = Math.max(12, Math.ceil(resolvedSize * 0.08));

      offscreen.width = Math.max(1, left + right) + padding * 2;
      offscreen.height = Math.max(1, ascent + descent) + padding * 2;
      offCtx.font = font;
      offCtx.textAlign = 'left';
      offCtx.textBaseline = 'alphabetic';
      offCtx.fillStyle = '#ffffff';
      offCtx.fillText(content, padding - left, padding + ascent);

      const imageData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height);
      const targets: Target[] = [];
      const step = Math.max(2, Math.floor(density));

      for (let y = 0; y < offscreen.height; y += step) {
        for (let x = 0; x < offscreen.width; x += step) {
          const alpha = imageData.data[(y * offscreen.width + x) * 4 + 3];
          if (alpha > 40) {
            targets.push({
              x: width / 2 - offscreen.width / 2 + x,
              y: height / 2 - offscreen.height / 2 + y,
              alpha: alpha / 255
            });
          }
        }
      }

      const maxParticles = Math.max(900, Math.min(5200, Math.floor((width * height) / 90)));
      const stride = Math.max(1, Math.ceil(targets.length / maxParticles));
      const selected = targets.filter((_, index) => index % stride === 0);

      particles = selected.map((target, index) => {
        const seed = ((index * 9301 + 49297) % 233280) / 233280;
        const depth = 0.45 + (((index * 233 + 97) % 1000) / 1000) * 0.9;
        // Deterministic sprinkle: roughly `highlightRatio` of particles carry the accent.
        const accentRoll = ((index * 7919 + 104729) % 1000) / 1000;
        const angle = seed * Math.PI * 2;
        const distance = (reducedMotion ? 0 : scatter) * (0.35 + depth * 0.75);
        const startX = target.x + Math.cos(angle) * distance + (seed - 0.5) * scatter * 0.45;
        const startY = target.y + Math.sin(angle) * distance + (depth - 0.9) * scatter * 0.45;

        return {
          x: reducedMotion ? target.x : startX,
          y: reducedMotion ? target.y : startY,
          startX,
          startY,
          targetX: target.x,
          targetY: target.y,
          size: Math.max(0.6, particleSize * (0.75 + target.alpha * 0.45)),
          color: accentRoll < highlightRatio ? resolvedHighlight : baseColor,
          seed,
          depth,
          delay: seed * stagger
        };
      });

      pointer.x = pointer.smoothX = width / 2;
      pointer.y = pointer.smoothY = height / 2;

      if (reducedMotion) {
        particles.forEach(particle => {
          particle.x = particle.startX = particle.targetX;
          particle.y = particle.startY = particle.targetY;
          particle.delay = 0;
        });
        gathering = false;
        ensureRenderLoop();
      } else {
        startGather(false);
      }
    };

    // Re-read colors when the theme changes, without replaying the gather.
    const recolor = (): void => {
      const baseColor = resolveColor(color, container);
      resolvedHighlight = resolveColor(highlightColor, container);
      particles.forEach((p, index) => {
        const accentRoll = ((index * 7919 + 104729) % 1000) / 1000;
        p.color = accentRoll < highlightRatio ? resolvedHighlight : baseColor;
      });
      ensureRenderLoop();
    };

    const queueSample = (): void => {
      if (resizeFrame !== null) window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = null;
        void sampleText();
      });
    };

    const handlePointerMove = (event: PointerEvent): void => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
      ensureRenderLoop();
    };

    const handlePointerLeave = (): void => {
      pointer.active = false;
      ensureRenderLoop();
    };

    const handlePointerEnter = (event: PointerEvent): void => {
      handlePointerMove(event);
      if (trigger === 'hover') startGather(true);
    };

    const handleClick = (): void => {
      if (trigger === 'click') startGather(true);
    };

    const handleVisibility = (): void => ensureRenderLoop();

    const reduceMotionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const handleReduceMotionChange = (event: MediaQueryListEvent): void => {
      reducedMotion = event.matches;
      void sampleText();
    };

    const colorSchemeQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    const themeObserver = new MutationObserver(recolor);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });

    const intersection = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      ensureRenderLoop();
    });
    intersection.observe(container);

    reduceMotionQuery?.addEventListener('change', handleReduceMotionChange);
    colorSchemeQuery?.addEventListener('change', recolor);
    document.addEventListener('visibilitychange', handleVisibility);
    canvas.addEventListener('pointerenter', handlePointerEnter);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    canvas.addEventListener('pointercancel', handlePointerLeave);
    canvas.addEventListener('click', handleClick);

    const resizeObserver = new ResizeObserver(queueSample);
    resizeObserver.observe(container);

    return () => {
      buildId += 1;
      resizeObserver.disconnect();
      intersection.disconnect();
      themeObserver.disconnect();
      reduceMotionQuery?.removeEventListener('change', handleReduceMotionChange);
      colorSchemeQuery?.removeEventListener('change', recolor);
      document.removeEventListener('visibilitychange', handleVisibility);
      canvas.removeEventListener('pointerenter', handlePointerEnter);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('pointercancel', handlePointerLeave);
      canvas.removeEventListener('click', handleClick);
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      if (resizeFrame !== null) window.cancelAnimationFrame(resizeFrame);
    };
  }, [
    text, particleSize, density, color, highlightColor, highlightRatio, scatter, gatherDuration,
    stagger, pointerRepel, repelRadius, idleDrift, trigger, fontSize, fontWeight, fontFamily, glow
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative block h-full min-h-[240px] w-full touch-pan-y overflow-hidden ${className}`}
      style={style}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />
      <Tag className="sr-only">{text}</Tag>
    </div>
  );
};

export default ParticleText;

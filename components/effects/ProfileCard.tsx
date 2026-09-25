'use client';

// From React Bits (ProfileCard-TS-TW), holographic look kept. Fixes:
// - the tilt loop no longer runs forever while the window has focus (it stopped only on blur)
// - no touch-none on the card, so phones can scroll over it
// - avatarUrl is required; icon/grain are optional (placeholder strings were fetched as URLs)
// - keyframes via React 19 <style>, not injected into <head> at import time
// - holo background animation stops with reduced motion; tilt is off with reduced motion
// - optional contactHref renders a real link (onContactClick still supported)
// - next/image for the portrait
// For the site's own portrait, see components/ui/PortraitCard.tsx (the photo-print version).

import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

const DEFAULT_INNER_GRADIENT = 'linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)';

const ANIMATION_CONFIG = {
  INITIAL_DURATION: 1200,
  INITIAL_X_OFFSET: 70,
  INITIAL_Y_OFFSET: 60,
  DEVICE_BETA_OFFSET: 20,
  ENTER_TRANSITION_MS: 180
} as const;

const clamp = (v: number, min = 0, max = 100): number => Math.min(Math.max(v, min), max);
const round = (v: number, precision = 3): number => parseFloat(v.toFixed(precision));
const adjust = (v: number, fMin: number, fMax: number, tMin: number, tMax: number): number =>
  round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));

const STYLES = `
@keyframes pc-holo-bg {
  0% { background-position: 0 var(--background-y), 0 0, center; }
  100% { background-position: 0 var(--background-y), 90% 90%, center; }
}
.pc-shine { animation: pc-holo-bg 18s linear infinite; }
@media (prefers-reduced-motion: reduce) { .pc-shine { animation: none; } }`;

export interface ProfileCardProps {
  avatarUrl: string;
  iconUrl?: string;
  grainUrl?: string;
  innerGradient?: string;
  behindGlowEnabled?: boolean;
  behindGlowColor?: string;
  behindGlowSize?: string;
  className?: string;
  enableTilt?: boolean;
  enableMobileTilt?: boolean;
  mobileTiltSensitivity?: number;
  miniAvatarUrl?: string;
  name?: string;
  title?: string;
  handle?: string;
  status?: string;
  contactText?: string;
  contactHref?: string;
  showUserInfo?: boolean;
  onContactClick?: () => void;
}

interface TiltEngine {
  setImmediate: (x: number, y: number) => void;
  setTarget: (x: number, y: number) => void;
  toCenter: () => void;
  beginInitial: (durationMs: number) => void;
  getCurrent: () => { x: number; y: number; tx: number; ty: number };
  cancel: () => void;
}

const ProfileCardComponent: React.FC<ProfileCardProps> = ({
  avatarUrl,
  iconUrl,
  grainUrl,
  innerGradient,
  behindGlowEnabled = true,
  behindGlowColor,
  behindGlowSize,
  className = '',
  enableTilt = true,
  enableMobileTilt = false,
  mobileTiltSensitivity = 5,
  miniAvatarUrl,
  name = 'Parsa Alizadeh',
  title = 'Software Developer',
  handle = 'parsa',
  status = 'Online',
  contactText = 'Contact',
  contactHref,
  showUserInfo = true,
  onContactClick
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const enterTimerRef = useRef<number | null>(null);
  const leaveRafRef = useRef<number | null>(null);

  const tiltEngine = useMemo<TiltEngine | null>(() => {
    if (!enableTilt) return null;

    let rafId: number | null = null;
    let running = false;
    let lastTs = 0;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    const DEFAULT_TAU = 0.14;
    const INITIAL_TAU = 0.6;
    let initialUntil = 0;

    const setVarsFromXY = (x: number, y: number): void => {
      const shell = shellRef.current;
      const wrap = wrapRef.current;
      if (!shell || !wrap) return;
      const percentX = clamp((100 / (shell.clientWidth || 1)) * x);
      const percentY = clamp((100 / (shell.clientHeight || 1)) * y);
      const centerX = percentX - 50;
      const centerY = percentY - 50;
      const properties: Record<string, string> = {
        '--pointer-x': `${percentX}%`,
        '--pointer-y': `${percentY}%`,
        '--background-x': `${adjust(percentX, 0, 100, 35, 65)}%`,
        '--background-y': `${adjust(percentY, 0, 100, 35, 65)}%`,
        '--pointer-from-center': `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
        '--pointer-from-top': `${percentY / 100}`,
        '--pointer-from-left': `${percentX / 100}`,
        '--rotate-x': `${round(-(centerX / 5))}deg`,
        '--rotate-y': `${round(centerY / 4)}deg`
      };
      for (const [k, v] of Object.entries(properties)) wrap.style.setProperty(k, v);
    };

    const step = (ts: number): void => {
      if (!running) return;
      if (lastTs === 0) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;
      const k = 1 - Math.exp(-dt / (ts < initialUntil ? INITIAL_TAU : DEFAULT_TAU));
      currentX += (targetX - currentX) * k;
      currentY += (targetY - currentY) * k;
      setVarsFromXY(currentX, currentY);

      // Keep going only while there is distance to cover (the original also continued
      // whenever document.hasFocus(), i.e. forever).
      const stillFar = Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05;
      if (stillFar || ts < initialUntil) {
        rafId = requestAnimationFrame(step);
      } else {
        running = false;
        lastTs = 0;
        rafId = null;
      }
    };

    const start = (): void => {
      if (running) return;
      running = true;
      lastTs = 0;
      rafId = requestAnimationFrame(step);
    };

    return {
      setImmediate(x, y) {
        currentX = x;
        currentY = y;
        setVarsFromXY(currentX, currentY);
      },
      setTarget(x, y) {
        targetX = x;
        targetY = y;
        start();
      },
      toCenter() {
        const shell = shellRef.current;
        if (!shell) return;
        this.setTarget(shell.clientWidth / 2, shell.clientHeight / 2);
      },
      beginInitial(durationMs) {
        initialUntil = performance.now() + durationMs;
        start();
      },
      getCurrent() {
        return { x: currentX, y: currentY, tx: targetX, ty: targetY };
      },
      cancel() {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        running = false;
        lastTs = 0;
      }
    };
  }, [enableTilt]);

  const getOffsets = (evt: PointerEvent, el: HTMLElement): { x: number; y: number } => {
    const rect = el.getBoundingClientRect();
    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
  };

  const handlePointerMove = useCallback(
    (event: PointerEvent): void => {
      const shell = shellRef.current;
      if (!shell || !tiltEngine) return;
      const { x, y } = getOffsets(event, shell);
      tiltEngine.setTarget(x, y);
    },
    [tiltEngine]
  );

  const handlePointerEnter = useCallback(
    (event: PointerEvent): void => {
      const shell = shellRef.current;
      if (!shell || !tiltEngine) return;
      shell.classList.add('active', 'entering');
      if (enterTimerRef.current) window.clearTimeout(enterTimerRef.current);
      enterTimerRef.current = window.setTimeout(() => shell.classList.remove('entering'), ANIMATION_CONFIG.ENTER_TRANSITION_MS);
      const { x, y } = getOffsets(event, shell);
      tiltEngine.setTarget(x, y);
    },
    [tiltEngine]
  );

  const handlePointerLeave = useCallback((): void => {
    const shell = shellRef.current;
    if (!shell || !tiltEngine) return;
    tiltEngine.toCenter();
    const checkSettle = (): void => {
      const { x, y, tx, ty } = tiltEngine.getCurrent();
      if (Math.hypot(tx - x, ty - y) < 0.6) {
        shell.classList.remove('active');
        leaveRafRef.current = null;
      } else {
        leaveRafRef.current = requestAnimationFrame(checkSettle);
      }
    };
    if (leaveRafRef.current) cancelAnimationFrame(leaveRafRef.current);
    leaveRafRef.current = requestAnimationFrame(checkSettle);
  }, [tiltEngine]);

  const handleDeviceOrientation = useCallback(
    (event: DeviceOrientationEvent): void => {
      const shell = shellRef.current;
      if (!shell || !tiltEngine) return;
      const { beta, gamma } = event;
      if (beta == null || gamma == null) return;
      const x = clamp(shell.clientWidth / 2 + gamma * mobileTiltSensitivity, 0, shell.clientWidth);
      const y = clamp(
        shell.clientHeight / 2 + (beta - ANIMATION_CONFIG.DEVICE_BETA_OFFSET) * mobileTiltSensitivity,
        0,
        shell.clientHeight
      );
      tiltEngine.setTarget(x, y);
    },
    [tiltEngine, mobileTiltSensitivity]
  );

  useEffect(() => {
    if (!enableTilt || !tiltEngine) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const shell = shellRef.current;
    if (!shell) return undefined;

    const onMove = handlePointerMove as EventListener;
    const onEnter = handlePointerEnter as EventListener;
    const onLeave = handlePointerLeave as EventListener;
    const onOrientation = handleDeviceOrientation as EventListener;

    shell.addEventListener('pointerenter', onEnter);
    shell.addEventListener('pointermove', onMove);
    shell.addEventListener('pointerleave', onLeave);

    const handleClick = (): void => {
      if (!enableMobileTilt || location.protocol !== 'https:') return;
      const motionEvent = window.DeviceMotionEvent as typeof DeviceMotionEvent & {
        requestPermission?: () => Promise<string>;
      };
      if (motionEvent && typeof motionEvent.requestPermission === 'function') {
        motionEvent
          .requestPermission()
          .then(state => {
            if (state === 'granted') window.addEventListener('deviceorientation', onOrientation);
          })
          .catch(() => {});
      } else {
        window.addEventListener('deviceorientation', onOrientation);
      }
    };
    shell.addEventListener('click', handleClick);

    tiltEngine.setImmediate((shell.clientWidth || 0) - ANIMATION_CONFIG.INITIAL_X_OFFSET, ANIMATION_CONFIG.INITIAL_Y_OFFSET);
    tiltEngine.toCenter();
    tiltEngine.beginInitial(ANIMATION_CONFIG.INITIAL_DURATION);

    return () => {
      shell.removeEventListener('pointerenter', onEnter);
      shell.removeEventListener('pointermove', onMove);
      shell.removeEventListener('pointerleave', onLeave);
      shell.removeEventListener('click', handleClick);
      window.removeEventListener('deviceorientation', onOrientation);
      if (enterTimerRef.current) window.clearTimeout(enterTimerRef.current);
      if (leaveRafRef.current) cancelAnimationFrame(leaveRafRef.current);
      tiltEngine.cancel();
      shell.classList.remove('entering');
    };
  }, [enableTilt, enableMobileTilt, tiltEngine, handlePointerMove, handlePointerEnter, handlePointerLeave, handleDeviceOrientation]);

  const cardRadius = '30px';

  const cardStyle = useMemo(
    () => ({
      '--icon': iconUrl ? `url(${iconUrl})` : 'none',
      '--grain': grainUrl ? `url(${grainUrl})` : 'none',
      '--inner-gradient': innerGradient ?? DEFAULT_INNER_GRADIENT,
      '--behind-glow-color': behindGlowColor ?? 'rgba(125, 190, 255, 0.67)',
      '--behind-glow-size': behindGlowSize ?? '50%',
      '--pointer-x': '50%',
      '--pointer-y': '50%',
      '--pointer-from-center': '0',
      '--pointer-from-top': '0.5',
      '--pointer-from-left': '0.5',
      '--card-opacity': '0',
      '--rotate-x': '0deg',
      '--rotate-y': '0deg',
      '--background-x': '50%',
      '--background-y': '50%',
      '--card-radius': cardRadius,
      '--sunpillar-1': 'hsl(2, 100%, 73%)',
      '--sunpillar-2': 'hsl(53, 100%, 69%)',
      '--sunpillar-3': 'hsl(93, 100%, 69%)',
      '--sunpillar-4': 'hsl(176, 100%, 76%)',
      '--sunpillar-5': 'hsl(228, 100%, 74%)',
      '--sunpillar-6': 'hsl(283, 100%, 73%)',
      '--sunpillar-clr-1': 'var(--sunpillar-1)',
      '--sunpillar-clr-2': 'var(--sunpillar-2)',
      '--sunpillar-clr-3': 'var(--sunpillar-3)',
      '--sunpillar-clr-4': 'var(--sunpillar-4)',
      '--sunpillar-clr-5': 'var(--sunpillar-5)',
      '--sunpillar-clr-6': 'var(--sunpillar-6)'
    }),
    [iconUrl, grainUrl, innerGradient, behindGlowColor, behindGlowSize]
  );

  const shineStyle: React.CSSProperties = {
    maskImage: 'var(--icon)',
    maskMode: 'luminance',
    maskRepeat: 'repeat',
    maskSize: '150%',
    maskPosition: 'top calc(200% - (var(--background-y) * 5)) left calc(100% - var(--background-x))',
    filter: 'brightness(0.66) contrast(1.33) saturate(0.33) opacity(0.5)',
    mixBlendMode: 'color-dodge',
    transform: 'translate3d(0, 0, 1px)',
    overflow: 'hidden',
    zIndex: 3,
    background: 'transparent',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundImage: `repeating-linear-gradient(0deg, var(--sunpillar-clr-1) 5%, var(--sunpillar-clr-2) 10%, var(--sunpillar-clr-3) 15%, var(--sunpillar-clr-4) 20%, var(--sunpillar-clr-5) 25%, var(--sunpillar-clr-6) 30%, var(--sunpillar-clr-1) 35%), repeating-linear-gradient(-45deg, #0e152e 0%, hsl(180, 10%, 60%) 3.8%, hsl(180, 29%, 66%) 4.5%, hsl(180, 10%, 60%) 5.2%, #0e152e 10%, #0e152e 12%), radial-gradient(farthest-corner circle at var(--pointer-x) var(--pointer-y), hsla(0, 0%, 0%, 0.1) 12%, hsla(0, 0%, 0%, 0.15) 20%, hsla(0, 0%, 0%, 0.25) 120%)`,
    gridArea: '1 / -1',
    borderRadius: cardRadius,
    pointerEvents: 'none'
  };

  const glareStyle: React.CSSProperties = {
    transform: 'translate3d(0, 0, 1.1px)',
    overflow: 'hidden',
    backgroundImage:
      'radial-gradient(farthest-corner circle at var(--pointer-x) var(--pointer-y), hsl(248, 25%, 80%) 12%, hsla(207, 40%, 30%, 0.8) 90%)',
    mixBlendMode: 'overlay',
    filter: 'brightness(0.8) contrast(1.2)',
    zIndex: 4,
    gridArea: '1 / -1',
    borderRadius: cardRadius,
    pointerEvents: 'none'
  };

  const gradientText = (to: string): React.CSSProperties => ({
    backgroundImage: `linear-gradient(to bottom, #fff, ${to})`,
    backgroundSize: '1em 1.5em',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text'
  });

  const contactClasses =
    'block cursor-pointer rounded-lg border border-white/10 px-4 py-3 text-xs font-semibold text-white/90 backdrop-blur-[10px] transition-all duration-200 ease-out hover:-translate-y-px hover:border-white/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

  return (
    <div
      ref={wrapRef}
      className={`relative ${className}`.trim()}
      style={{ perspective: '500px', transform: 'translate3d(0, 0, 0.1px)', ...cardStyle } as React.CSSProperties}
    >
      <style href="profile-card" precedence="default">{STYLES}</style>
      {behindGlowEnabled && (
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-200 ease-out"
          style={{
            background: 'radial-gradient(circle at var(--pointer-x) var(--pointer-y), var(--behind-glow-color) 0%, transparent var(--behind-glow-size))',
            filter: 'blur(50px) saturate(1.1)',
            opacity: 'calc(0.8 * var(--card-opacity))'
          }}
        />
      )}
      <div ref={shellRef} className="group relative z-[1]">
        <section
          className="relative grid overflow-hidden"
          style={{
            height: '80svh',
            maxHeight: '540px',
            aspectRatio: '0.718',
            borderRadius: cardRadius,
            backgroundBlendMode: 'color-dodge, normal, normal, normal',
            boxShadow:
              'rgba(0, 0, 0, 0.8) calc((var(--pointer-from-left) * 10px) - 3px) calc((var(--pointer-from-top) * 20px) - 6px) 20px -5px',
            transition: 'transform 1s ease',
            transform: 'translateZ(0) rotateX(0deg) rotateY(0deg)',
            background: 'rgba(0, 0, 0, 0.9)',
            backfaceVisibility: 'hidden'
          }}
          onMouseEnter={e => {
            if (!enableTilt) return;
            e.currentTarget.style.transition = 'none';
            e.currentTarget.style.transform = 'translateZ(0) rotateX(var(--rotate-y)) rotateY(var(--rotate-x))';
          }}
          onMouseLeave={e => {
            const entering = shellRef.current?.classList.contains('entering');
            e.currentTarget.style.transition = entering ? 'transform 180ms ease-out' : 'transform 1s ease';
            e.currentTarget.style.transform = 'translateZ(0) rotateX(0deg) rotateY(0deg)';
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'var(--inner-gradient)',
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              borderRadius: cardRadius,
              display: 'grid',
              gridArea: '1 / -1'
            }}
          >
            <div className="pc-shine" style={shineStyle} />
            <div style={glareStyle} />

            <div
              className="overflow-visible"
              style={{
                mixBlendMode: 'luminosity',
                transform: 'translateZ(2px)',
                gridArea: '1 / -1',
                borderRadius: cardRadius,
                pointerEvents: 'none',
                backfaceVisibility: 'hidden'
              }}
            >
              <Image
                src={avatarUrl}
                alt={`${name} portrait`}
                width={600}
                height={836}
                sizes="(min-width: 768px) 390px, 80vw"
                className="absolute bottom-[-1px] left-1/2 w-full will-change-transform transition-transform duration-[120ms] ease-out"
                style={{
                  transformOrigin: '50% 100%',
                  transform:
                    'translateX(calc(-50% + (var(--pointer-from-left) - 0.5) * 6px)) translateZ(0) scaleY(calc(1 + (var(--pointer-from-top) - 0.5) * 0.02)) scaleX(calc(1 + (var(--pointer-from-left) - 0.5) * 0.01))',
                  borderRadius: cardRadius,
                  backfaceVisibility: 'hidden'
                }}
              />
              {showUserInfo && (
                <div
                  className="pointer-events-auto absolute z-[2] flex items-center justify-between border border-white/10 backdrop-blur-[30px]"
                  style={{
                    bottom: 20,
                    left: 20,
                    right: 20,
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 'calc(max(0px, var(--card-radius) - 20px + 6px))',
                    padding: '12px 14px'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-12 flex-shrink-0 overflow-hidden rounded-full border border-white/10">
                      <Image
                        src={miniAvatarUrl || avatarUrl}
                        alt=""
                        width={48}
                        height={48}
                        className="block h-full w-full rounded-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col items-start gap-1.5">
                      <div className="text-sm font-medium leading-none text-white/90">@{handle}</div>
                      <div className="text-sm leading-none text-white/70">{status}</div>
                    </div>
                  </div>
                  {contactHref ? (
                    <Link href={contactHref} className={contactClasses} onClick={onContactClick}>
                      {contactText}
                    </Link>
                  ) : (
                    <button type="button" className={contactClasses} onClick={onContactClick}>
                      {contactText}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div
              className="relative z-[5] max-h-full overflow-hidden text-center"
              style={{
                transform:
                  'translate3d(calc(var(--pointer-from-left) * -6px + 3px), calc(var(--pointer-from-top) * -6px + 3px), 0.1px)',
                mixBlendMode: 'luminosity',
                gridArea: '1 / -1',
                borderRadius: cardRadius,
                pointerEvents: 'none'
              }}
            >
              <div className="absolute flex w-full flex-col" style={{ top: '3em' }}>
                <p className="m-0 font-semibold" style={{ fontSize: 'min(5svh, 3em)', ...gradientText('#6f6fbe') }}>
                  {name}
                </p>
                <p
                  className="relative mx-auto w-min whitespace-nowrap font-semibold"
                  style={{ top: -12, fontSize: 16, ...gradientText('#4a4ac0') }}
                >
                  {title}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const ProfileCard = React.memo(ProfileCardComponent);
export default ProfileCard;

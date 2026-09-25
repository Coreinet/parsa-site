'use client';

import { useEffect, useRef } from 'react';

/** 2px signal line across the top of the viewport showing how far through the article you are. */
export default function ReadingProgress({ targetId }: { targetId: string }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = document.getElementById(targetId);
    const bar = barRef.current;
    if (!target || !bar) return undefined;
    let raf = 0;
    const update = (): void => {
      raf = 0;
      const r = target.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
      bar.style.transform = `scaleX(${p})`;
    };
    const onScroll = (): void => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [targetId]);

  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[55] h-0.5">
      <div ref={barRef} className="h-full origin-left scale-x-0 bg-signal" />
    </div>
  );
}

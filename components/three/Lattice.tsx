'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

const LatticeCanvas = dynamic(() => import('./LatticeCanvas'), { ssr: false });

const QUERY = '(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

function canRunWebGL(): boolean {
  if (!window.matchMedia(QUERY).matches) return false;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return false;
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
}

/**
 * The home hero's one 3D moment. The static poster renders first (and stays on phones, with
 * reduced motion, Save-Data or no WebGL 2); the WebGL canvas loads only on desktop and fades
 * in over the poster once its first frame is drawn, so layout never moves.
 */
export default function Lattice({ className = '' }: { className?: string }) {
  const [run, setRun] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRun(canRunWebGL());
  }, []);

  const onReady = useCallback(() => setReady(true), []);

  return (
    <div className={`relative aspect-square w-full ${className}`.trim()} aria-hidden="true">
      <div className={`absolute inset-0 transition-opacity duration-500 ${ready ? 'opacity-0' : 'opacity-100'}`}>
        <Image src="/images/lattice-light.webp" alt="" fill sizes="560px" className="object-contain dark:hidden" />
        <Image src="/images/lattice-dark.webp" alt="" fill sizes="560px" className="hidden object-contain dark:block" />
      </div>
      {run ? (
        <div className={`absolute inset-0 transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}>
          <LatticeCanvas onReady={onReady} />
        </div>
      ) : null}
    </div>
  );
}

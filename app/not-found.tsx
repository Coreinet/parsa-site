'use client';

import { useEffect, useState } from 'react';
import ParticleText from '@/components/effects/ParticleText';
import { ButtonLink } from '@/components/ui/primitives';
import { site } from '@/content/site';

export default function NotFound() {
  // Read after mount: the page is prerendered once, so the server can't know the requested path.
  const [path, setPath] = useState('');
  useEffect(() => {
    setPath(window.location.pathname);
    // Only global-not-found can export metadata; this page is noindex, so the tab title is all that matters.
    document.title = `Page not found – ${site.name}`;
  }, []);

  return (
    <div className="mx-auto grid max-w-[1200px] gap-8 px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
      <ParticleText
        as="h1"
        text="404"
        className="h-[clamp(220px,38vw,420px)]"
        fontSize="clamp(9rem, 34vw, 22rem)"
        particleSize={2.2}
        density={4}
        scatter={220}
        gatherDuration={1400}
        stagger={380}
        idleDrift={0}
        pointerRepel={36}
        repelRadius={110}
      />

      <div className="grid gap-4">
        <p className="min-h-5 font-mono text-sm text-ink-3">
          {path ? (
            <>
              GET {path} → <span className="text-err">404</span>
            </>
          ) : null}
        </p>
        <h2 className="text-h1 font-semibold">This page doesn&apos;t exist.</h2>
        <p className="max-w-[60ch] text-body-lg text-ink-2">The link may be old, or have a typo. Everything else lives on the home page:</p>
        <nav aria-label="Suggested sections" className="flex flex-wrap gap-3 pt-2">
          <ButtonLink href="/#home" label="Go home" />
          <ButtonLink href="/#work" intent="secondary" label="See work" />
          <ButtonLink href="/#blog" intent="secondary" label="Read the blog" />
        </nav>
      </div>
    </div>
  );
}

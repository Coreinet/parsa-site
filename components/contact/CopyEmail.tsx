'use client';

import { useState } from 'react';

/** Copy the address in one tap; a toast confirms. Falls back to a mailto link. */
export default function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <div className="grid justify-items-start gap-3">
      <a
        href={`mailto:${email}`}
        className="max-w-full break-all text-[clamp(22px,3.4vw,34px)] font-semibold leading-tight tracking-[-0.025em] text-signal underline decoration-1 underline-offset-[6px] hover:decoration-2"
      >
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-line-strong px-4 text-sm font-semibold text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V5a1 1 0 0 1 1-1h9" />
        </svg>
        Copy email
      </button>
      <div role="status" aria-live="polite" className="h-0">
        {copied ? (
          <span className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+96px)] left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-sm text-paper shadow-float desk:bottom-8">
            <span className="text-ok">✓</span> Email copied
          </span>
        ) : null}
      </div>
    </div>
  );
}

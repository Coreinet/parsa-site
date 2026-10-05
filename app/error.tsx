'use client';

import { Button, ButtonLink, Container } from '@/components/ui/primitives';

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <Container className="grid justify-items-start gap-5 py-[clamp(64px,12vw,160px)]">
      <p className="font-mono text-sm text-err">✕ {error.digest ? `error ${error.digest}` : 'render error'}</p>
      <h1 className="text-h1 font-semibold">This page failed to load.</h1>
      <p className="max-w-[52ch] text-body-lg text-ink-2">
        Something broke while rendering it. Trying again usually works; if it doesn&apos;t, the rest of the site is fine.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={retry} label="Try again" />
        <ButtonLink href="/" intent="secondary" label="Go home" />
      </div>
    </Container>
  );
}

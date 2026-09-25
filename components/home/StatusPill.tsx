'use client';

import { useEffect, useState } from 'react';

/** Availability line: a status dot, the label, and local time (rendered after mount). */
export default function StatusPill({ available, label, timeZone }: { available: boolean; label: string; timeZone: string }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone });
    const tick = (): void => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [timeZone]);

  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px]">
      <span className="relative grid size-3 place-items-center" aria-hidden="true">
        <span className={`absolute inset-0 rounded-full opacity-25 ${available ? 'bg-ok' : 'bg-ink-3'}`} />
        <span className={`size-1.5 rounded-full ${available ? 'bg-ok' : 'bg-ink-3'}`} />
      </span>
      <span className="font-medium text-ink">{label}</span>
      {time ? <span className="tabular text-ink-3">{time} local time</span> : null}
    </p>
  );
}

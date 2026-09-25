/** Career as a version history, newest first. The version numbers are a real sequence. */
export default function Changelog({
  entries,
  heading: H = 'h4'
}: {
  entries: { version: string; year: string; title: string; text: string }[];
  heading?: 'h3' | 'h4';
}) {
  return (
    <ol className="relative grid gap-0 border-l border-line-strong pl-0">
      {entries.map((e, i) => (
        <li key={e.version} className="relative grid gap-1 pb-9 pl-7 last:pb-0 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-6">
          <span
            aria-hidden="true"
            className={`absolute -left-[5px] top-1.5 size-[9px] rounded-full border-2 ${i === 0 ? 'border-signal bg-signal' : 'border-line-strong bg-paper'}`}
          />
          <div className="flex items-baseline gap-3 font-mono text-[13px] sm:grid sm:content-start sm:gap-0.5">
            <span className={i === 0 ? 'font-medium text-signal' : 'text-ink'}>{e.version}</span>
            <span className="tabular text-ink-3">{e.year}</span>
          </div>
          <div className="grid gap-1">
            <H className="text-lg font-semibold leading-snug">{e.title}</H>
            <p className="text-ink-2">{e.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

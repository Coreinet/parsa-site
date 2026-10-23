import Image from 'next/image';

/** Screens from the project: a grid on desktop, a swipeable scroll-snap row on phones. */
/** `label` names the list and `alt` each screen ({n} is its number). */
export default function Gallery({
  title,
  screens,
  label = `${title} screens`,
  alt = `${title}, screen {n}`
}: {
  title: string;
  screens: string[];
  label?: string;
  alt?: string;
}) {
  if (!screens.length) return null;
  return (
    <ul
      aria-label={label}
      className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0"
    >
      {screens.map((src, i) => (
        <li key={src} className="relative aspect-[3/2] w-[85%] flex-none snap-center overflow-hidden rounded-lg border border-line bg-paper-2 sm:w-auto">
          <Image src={src} alt={alt.replace('{n}', String(i + 1))} fill sizes="(min-width: 640px) 50vw, 85vw" className="object-cover" />
        </li>
      ))}
    </ul>
  );
}

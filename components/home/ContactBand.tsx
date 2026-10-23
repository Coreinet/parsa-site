import ScrollVelocity from '@/components/effects/ScrollVelocity';

/** Opens the Contact section: a type strip that moves only while the page scrolls. */
export default function ContactBand({ lines = ['Have something to build?', "Let's talk."] }: { lines?: [string, string] }) {
  return (
    <div className="overflow-hidden border-y border-line py-10">
      <ScrollVelocity
        texts={[
          lines[0],
          <span key="talk" className="text-transparent [-webkit-text-stroke:1.5px_var(--ink)]">
            {lines[1]}
          </span>
        ]}
        label={`${lines[0]} ${lines[1]}`}
        rowClassName="font-display text-display font-bold"
        scrollVelocity={60}
      />
    </div>
  );
}

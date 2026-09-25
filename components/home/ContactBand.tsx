import ScrollVelocity from '@/components/effects/ScrollVelocity';

/** Opens the Contact section: a type strip that moves only while the page scrolls. */
export default function ContactBand() {
  return (
    <div className="overflow-hidden border-y border-line py-10">
      <ScrollVelocity
        texts={[
          'Have something to build?',
          <span key="talk" className="text-transparent [-webkit-text-stroke:1.5px_var(--ink)]">
            Let&apos;s talk.
          </span>
        ]}
        label="Have something to build? Let's talk."
        rowClassName="font-display text-display font-bold"
        scrollVelocity={60}
      />
    </div>
  );
}

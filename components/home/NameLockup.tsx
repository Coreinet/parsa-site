import FoldText from '@/components/effects/FoldText';
import { site } from '@/content/site';

/**
 * The brand lockup and the page's only <h1>: "Parsa" in solid ink, "Alizadeh" outlined and
 * indented. The animated letters are the real heading text (srCopy={false}) with a space
 * between the words, so crawlers read exactly "Parsa Alizadeh"; aria-label gives screen
 * readers the name as one word group instead of letter-by-letter spans.
 */
export default function NameLockup() {
  return (
    <h1 aria-label={site.name} className="font-display text-display-xl font-bold">
      <FoldText
        text={site.firstName}
        className="block"
        hinge="top"
        duration={0.55}
        stagger={0.035}
        playOnce="hero-first"
        srCopy={false}
      />{' '}
      <FoldText
        text={site.lastName}
        className="block pl-[0.42em] text-transparent [-webkit-text-stroke:1.5px_var(--ink)]"
        hinge="top"
        duration={0.55}
        stagger={0.035}
        delay={0.12}
        creaseShading={0}
        playOnce="hero-last"
        srCopy={false}
      />
    </h1>
  );
}

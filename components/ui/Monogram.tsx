/**
 * The "PA." mark: initials in the display face with the full stop in the signal colour, as a
 * deliberate part of the wordmark (the old square badge collided with the "A"). Purely visual:
 * the caller supplies the link. Pair with the `group` class on the parent for the hover state.
 */
export default function Monogram() {
  return (
    <span aria-hidden="true" className="font-display text-[15px] font-bold leading-none tracking-[-0.04em] transition-colors duration-300 group-hover:text-paper">
      PA<span className="text-signal">.</span>
    </span>
  );
}

import Link from 'next/link';
import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/cn';

// ---------- Buttons: pills in the same family as the nav and the dock ----------

type Intent = 'primary' | 'secondary';
type Size = 'md' | 'sm';

const FILL: Record<Intent, CSSProperties> = {
  // Primary: ink pill; the accent rises from below and the label turns accent-ink.
  primary: { '--fx-fill': 'var(--signal)', '--fx-text': 'var(--signal-ink)' } as CSSProperties,
  // Secondary: outlined pill; ink rises and the label turns paper.
  secondary: { '--fx-fill': 'var(--ink)', '--fx-text': 'var(--paper)' } as CSSProperties
};

export const buttonClass = (intent: Intent = 'primary', size: Size = 'md', extra?: string): string =>
  cn(
    'fx-fill group inline-flex items-center justify-center gap-3 rounded-full font-semibold whitespace-nowrap',
    'transition-[border-color,transform] duration-200 active:scale-[.98] disabled:pointer-events-none disabled:opacity-50',
    'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-signal',
    intent === 'primary' ? 'bg-ink text-paper' : 'border border-line-strong text-ink hover:border-ink',
    size === 'md' ? 'h-12 text-[15px]' : 'h-10 text-sm',
    size === 'md' ? (intent === 'primary' ? 'pl-6 pr-1.5' : 'px-6') : intent === 'primary' ? 'pl-4 pr-1' : 'px-4',
    extra
  );

/** Label that slides up and is replaced by a copy in the hover colour. */
export const FxLabel = ({ children }: { children: string }) => (
  <span className="fx-label">
    <span>{children}</span>
    <span aria-hidden="true">{children}</span>
  </span>
);

/** Arrow in a small circle; turns 45° on hover. Primary buttons only. */
export const ArrowDot = ({ size = 'md' }: { size?: Size }) => (
  <span
    aria-hidden="true"
    className={cn(
      'grid place-items-center rounded-full bg-paper text-ink transition-transform duration-300 ease-out group-hover:-rotate-45',
      size === 'md' ? 'size-9' : 'size-8'
    )}
  >
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  </span>
);

export function ButtonLink({
  intent = 'primary',
  size = 'md',
  className,
  label,
  arrow = intent === 'primary',
  ...props
}: Omit<ComponentProps<typeof Link>, 'children'> & { intent?: Intent; size?: Size; label: string; arrow?: boolean }) {
  return (
    <Link className={buttonClass(intent, size, className)} style={FILL[intent]} {...props}>
      <FxLabel>{label}</FxLabel>
      {arrow ? <ArrowDot size={size} /> : null}
    </Link>
  );
}

export function Button({
  intent = 'primary',
  size = 'md',
  className,
  label,
  arrow = false,
  busy = false,
  ...props
}: Omit<ComponentProps<'button'>, 'children'> & { intent?: Intent; size?: Size; label: string; arrow?: boolean; busy?: boolean }) {
  return (
    <button className={buttonClass(intent, size, cn(!arrow && intent === 'primary' && (size === 'md' ? 'pr-6' : 'pr-4'), className))} style={FILL[intent]} aria-busy={busy || undefined} {...props}>
      {busy ? <span aria-hidden="true" className="size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" /> : null}
      <FxLabel>{label}</FxLabel>
      {arrow ? <ArrowDot size={size} /> : null}
    </button>
  );
}

// ---------- Text links ----------

export function TextLink({ className, children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        'group inline-flex items-center gap-2 font-semibold text-ink [background:linear-gradient(var(--signal),var(--signal))_0_100%/0_1.5px_no-repeat] pb-0.5 transition-[background-size,color] duration-300 hover:text-signal hover:[background-size:100%_1.5px]',
        className
      )}
      {...props}
    >
      {children}
      <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}

// ---------- Chips ----------

/** Soft rounded chip. `category` adds an accent dot; technology chips stay neutral. */
export function Tag({ children, category = false, className }: { children: ReactNode; category?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-medium leading-none',
        category ? 'bg-signal-soft text-signal' : 'bg-paper-2 text-ink-2',
        className
      )}
    >
      {category ? <span aria-hidden="true" className="size-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

/** Marks placeholder content that must be replaced before publishing. */
export function ExampleBadge({ className }: { className?: string }) {
  return (
    <span
      title="Placeholder content: replace it in /content before publishing"
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-full border border-dashed border-[color-mix(in_srgb,var(--warn)_70%,transparent)] px-3 text-[12.5px] font-medium leading-none text-warn',
        className
      )}
    >
      <span aria-hidden="true">✎</span> Example
    </span>
  );
}

// ---------- Layout ----------

export function Container({ className, children, as: Tag = 'div', id }: { className?: string; children: ReactNode; as?: 'div' | 'section' | 'header' | 'main' | 'footer'; id?: string }) {
  return (
    <Tag id={id} className={cn('mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12', className)}>
      {children}
    </Tag>
  );
}

/** The route-path eyebrow, e.g. /work. Segments before the last are muted. */
export function PathLabel({ path, className }: { path: string; className?: string }) {
  const parts = path.split('/').filter(Boolean);
  const last = parts.pop() ?? '';
  return (
    <span className={cn('font-mono text-xs tracking-[.02em] text-ink-3', className)}>
      /{parts.map(p => `${p}/`).join('')}
      <b className="font-medium text-signal">{last}</b>
    </span>
  );
}

/** A home-page section. `id` is the nav anchor; scroll-margin keeps it clear of the header. */
export function Section({
  id,
  path,
  title,
  intro,
  action,
  children,
  className
}: {
  id?: string;
  path?: string;
  title?: ReactNode;
  intro?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn('scroll-mt-20 py-[clamp(64px,8vw,112px)]', className)}>
      <Container className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:gap-12">
        {(path || title) && (
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="grid max-w-[62ch] gap-3">
              {path ? <PathLabel path={path} /> : null}
              {title ? <h2 className="text-display font-semibold">{title}</h2> : null}
              {intro ? <p className="text-body-lg text-ink-2">{intro}</p> : null}
            </div>
            {action}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}

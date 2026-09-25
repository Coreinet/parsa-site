import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';
import { Children, isValidElement, type ReactNode } from 'react';
import { slugify } from '@/lib/content';

const CALLOUT = {
  note: { label: 'Note', className: 'border-line-strong' },
  tip: { label: 'Tip', className: 'border-ok' },
  warning: { label: 'Warning', className: 'border-warn' }
} as const;

/** Labelled aside. The label, not a coloured stripe, says what kind it is. */
function Callout({ type = 'note', children }: { type?: keyof typeof CALLOUT; children: ReactNode }) {
  const c = CALLOUT[type] ?? CALLOUT.note;
  return (
    <aside className={`not-prose grid gap-1 rounded-md border bg-surface px-5 py-4 font-display text-base leading-relaxed text-ink-2 sm:grid-cols-[88px_minmax(0,1fr)] sm:gap-4 ${c.className}`}>
      <span className="pt-0.5 font-mono text-[11px] uppercase tracking-[.08em] text-ink">{c.label}</span>
      <div className="[&>p+p]:mt-2">{children}</div>
    </aside>
  );
}

const textOf = (node: ReactNode): string =>
  Children.toArray(node)
    .map(child => (typeof child === 'string' || typeof child === 'number' ? String(child) : isValidElement<{ children?: ReactNode }>(child) ? textOf(child.props.children) : ''))
    .join('');

const heading = (Tag: 'h2' | 'h3') =>
  function Heading({ children }: { children?: ReactNode }) {
    const id = slugify(textOf(children));
    return (
      <Tag id={id} className="group">
        {children}
        <a href={`#${id}`} aria-label="Link to this section" className="ml-2 font-mono text-[.7em] text-ink-3 no-underline opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100">
          #
        </a>
      </Tag>
    );
  };

export default function Mdx({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={{ Callout, h2: heading('h2'), h3: heading('h3') }}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [[rehypePrettyCode, { theme: 'github-dark-dimmed', keepBackground: false }]]
        }
      }}
    />
  );
}

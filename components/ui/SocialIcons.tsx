import type { CSSProperties } from 'react';
import type { IconType } from 'react-icons';
import { FaEnvelope, FaFileLines, FaGithub, FaInstagram, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import { site } from '@/content/site';
import { cn } from '@/lib/cn';

const ICON: Record<string, IconType> = { GitHub: FaGithub, LinkedIn: FaLinkedinIn, Instagram: FaInstagram, X: FaXTwitter };

/**
 * Profiles as round icon buttons (same rising fill as the nav). The visible name appears as
 * a tooltip on hover/focus; screen readers get it from aria-label.
 */
export default function SocialIcons({ size = 'md', withEmail = true, className }: { size?: 'md' | 'lg'; withEmail?: boolean; className?: string }) {
  const links = [
    ...site.socials.map(s => ({ label: s.label, href: s.href, Icon: ICON[s.label] ?? FaGithub, external: true })),
    ...(withEmail ? [{ label: 'Email', href: `mailto:${site.email}`, Icon: FaEnvelope, external: false }] : []),
    ...(site.cv ? [{ label: 'CV', href: site.cv, Icon: FaFileLines, external: false }] : [])
  ];

  return (
    <ul aria-label="Profiles" className={cn('flex flex-wrap gap-2.5', className)}>
      {links.map(({ label, href, Icon, external }) => (
        <li key={label} className="group/tip relative">
          <a
            href={href}
            aria-label={external ? `${label} (opens in a new tab)` : label}
            {...(external ? { target: '_blank', rel: 'noreferrer me' } : {})}
            style={{ '--fx-fill': 'var(--ink)' } as CSSProperties}
            className={cn(
              'fx-fill grid place-items-center rounded-full border border-line-strong text-ink transition-colors duration-300 hover:border-ink hover:text-paper focus-visible:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
              size === 'md' ? 'size-11' : 'size-14'
            )}
          >
            <Icon aria-hidden="true" className={size === 'md' ? 'size-[18px]' : 'size-[22px]'} />
          </a>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-full bg-ink px-2.5 py-1 text-xs font-medium text-paper opacity-0 transition duration-200 group-hover/tip:translate-y-0 group-hover/tip:opacity-100 group-focus-within/tip:translate-y-0 group-focus-within/tip:opacity-100"
          >
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}

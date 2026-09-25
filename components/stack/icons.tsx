import type { IconType } from 'react-icons';
import {
  SiDrizzle,
  SiGithub,
  SiGoogle,
  SiGreensock,
  SiHtml5,
  SiJavascript,
  SiNextdotjs,
  SiNodedotjs,
  SiReact,
  SiTailwindcss,
  SiThreedotjs,
  SiTypescript,
  SiVercel,
  SiVite
} from 'react-icons/si';

/** Names used in content/stack.ts → icon components. Add an entry when you add a tool. */
export const ICONS: Record<string, IconType> = {
  SiDrizzle,
  SiGithub,
  SiGoogle,
  SiGreensock,
  SiHtml5,
  SiJavascript,
  SiNextdotjs,
  SiNodedotjs,
  SiReact,
  SiTailwindcss,
  SiThreedotjs,
  SiTypescript,
  SiVercel,
  SiVite
};

export function StackIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = name ? ICONS[name] : undefined;
  if (!Icon) {
    return (
      <span aria-hidden="true" className={`grid place-items-center rounded-xs border border-line font-mono text-[10px] ${className ?? ''}`}>
        ◇
      </span>
    );
  }
  return <Icon aria-hidden="true" className={className} />;
}

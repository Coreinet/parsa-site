/**
 * The stack. `usedIn` lists the projects in content/work that use a tool; the stack section
 * links to them. Keep it to tools actually used, and add a slug when a project shows one.
 */
export interface StackItem {
  name: string;
  /** What the tool is used for, in one line. Never an achievement claim. */
  note: string;
  /** react-icons/si export name, e.g. "SiReact" */
  icon?: string;
  /** Slugs of projects in content/work that use this tool. */
  usedIn: string[];
}

export interface StackLayerData {
  id: string;
  name: string;
  summary: string;
  items: StackItem[];
}

export const stack: StackLayerData[] = [
  {
    id: 'interface',
    name: 'Interface',
    summary: 'What people see and use in the browser.',
    items: [
      { name: 'TypeScript', note: 'Typed JavaScript for application code.', icon: 'SiTypescript', usedIn: [] },
      { name: 'React', note: 'Component-based user interfaces.', icon: 'SiReact', usedIn: ['enteredge', 'gamesector', 'filmohub'] },
      { name: 'Next.js', note: 'App Router applications and static sites.', icon: 'SiNextdotjs', usedIn: ['enteredge', 'gamesector', 'filmohub'] },
      { name: 'Tailwind CSS', note: 'Utility-first styling and design tokens.', icon: 'SiTailwindcss', usedIn: ['enteredge', 'gamesector'] },
      { name: 'Vite', note: 'Fast builds for single-page apps.', icon: 'SiVite', usedIn: [] },
      { name: 'GSAP', note: 'Scroll and interface animation.', icon: 'SiGreensock', usedIn: [] },
      { name: 'Three.js', note: '3D graphics with WebGL.', icon: 'SiThreedotjs', usedIn: [] },
      { name: 'HTML, CSS and JavaScript', note: 'Framework-free tools with no build step.', icon: 'SiJavascript', usedIn: [] }
    ]
  },
  {
    id: 'ai',
    name: 'AI and computer vision',
    summary: 'Machine learning models running inside real products.',
    items: [
      { name: 'MediaPipe Tasks Vision', note: 'Hand tracking with 21 landmarks per hand, in the browser.', icon: 'SiGoogle', usedIn: [] },
      { name: 'Canvas API', note: 'Real-time image filters and drawing.', icon: 'SiHtml5', usedIn: [] }
    ]
  },
  {
    id: 'server',
    name: 'Server and data',
    summary: 'APIs, databases and the logic behind the interface.',
    items: [
      { name: 'Node.js', note: 'The runtime behind the Next.js applications.', icon: 'SiNodedotjs', usedIn: [] },
      { name: 'Drizzle ORM', note: 'Typed data access and migrations.', icon: 'SiDrizzle', usedIn: [] }
    ]
  },
  {
    id: 'tooling',
    name: 'Tooling and delivery',
    summary: 'How code is versioned and shipped.',
    items: [
      { name: 'Git and GitHub', note: 'Version control and public source code.', icon: 'SiGithub', usedIn: [] },
      { name: 'Vercel', note: 'Deployment for web apps.', icon: 'SiVercel', usedIn: [] }
    ]
  }
];

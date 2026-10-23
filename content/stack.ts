import type { Locale, Translated } from '@/content/i18n';

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
      { name: 'React', note: 'Component-based user interfaces.', icon: 'SiReact', usedIn: ['enteredge', 'gamesector', 'filmohub', 'entergame', 'safeguard'] },
      { name: 'Next.js', note: 'App Router applications and static sites.', icon: 'SiNextdotjs', usedIn: ['enteredge', 'gamesector', 'filmohub', 'safeguard'] },
      { name: 'Tailwind CSS', note: 'Utility-first styling and design tokens.', icon: 'SiTailwindcss', usedIn: ['enteredge', 'gamesector', 'entergame', 'safeguard'] },
      { name: 'Vite', note: 'Fast builds for single-page apps.', icon: 'SiVite', usedIn: ['entergame'] },
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

/** Layer names, summaries and tool notes in Persian and Turkish; tool names stay as they are. */
const translations: Record<Translated, { layers: Record<string, { name: string; summary: string }>; notes: Record<string, string> }> = {
  fa: {
    layers: {
      interface: { name: 'رابط کاربری', summary: 'آنچه مردم در مرورگر می‌بینند و از آن استفاده می‌کنند.' },
      ai: { name: 'هوش مصنوعی و بینایی ماشین', summary: 'مدل‌های یادگیری ماشین که درون محصولات واقعی اجرا می‌شوند.' },
      server: { name: 'سرور و داده', summary: 'APIها، پایگاه‌های داده و منطقی که پشت رابط کاربری است.' },
      tooling: { name: 'ابزار و انتشار', summary: 'اینکه کد چطور نسخه‌بندی و منتشر می‌شود.' }
    },
    notes: {
      TypeScript: 'جاوااسکریپت تایپ‌دار برای کد اپلیکیشن.',
      React: 'رابط‌های کاربری مبتنی بر کامپوننت.',
      'Next.js': 'اپلیکیشن‌های App Router و سایت‌های استاتیک.',
      'Tailwind CSS': 'استایل‌دهی utility-first و توکن‌های طراحی.',
      Vite: 'build سریع برای اپلیکیشن‌های تک‌صفحه‌ای.',
      GSAP: 'انیمیشن اسکرول و رابط کاربری.',
      'Three.js': 'گرافیک سه‌بعدی با WebGL.',
      'HTML, CSS and JavaScript': 'ابزارهای بدون فریم‌ورک و بدون مرحله‌ی build.',
      'MediaPipe Tasks Vision': 'ردیابی دست با ۲۱ نقطه‌ی کلیدی برای هر دست، در مرورگر.',
      'Canvas API': 'فیلترهای تصویر و ترسیم بلادرنگ.',
      'Node.js': 'محیط اجرای پشت اپلیکیشن‌های Next.js.',
      'Drizzle ORM': 'دسترسی تایپ‌دار به داده و migrationها.',
      'Git and GitHub': 'کنترل نسخه و کد منبع عمومی.',
      Vercel: 'استقرار اپلیکیشن‌های وب.'
    }
  },
  tr: {
    layers: {
      interface: { name: 'Arayüz', summary: 'İnsanların tarayıcıda gördüğü ve kullandığı kısım.' },
      ai: { name: 'Yapay zekâ ve bilgisayarlı görü', summary: 'Gerçek ürünlerin içinde çalışan makine öğrenmesi modelleri.' },
      server: { name: 'Sunucu ve veri', summary: 'API’ler, veritabanları ve arayüzün arkasındaki mantık.' },
      tooling: { name: 'Araçlar ve yayına alma', summary: 'Kodun nasıl sürümlendiği ve yayına alındığı.' }
    },
    notes: {
      TypeScript: 'Uygulama kodu için tipli JavaScript.',
      React: 'Bileşen tabanlı kullanıcı arayüzleri.',
      'Next.js': 'App Router uygulamaları ve statik siteler.',
      'Tailwind CSS': 'Utility-first stil ve tasarım token’ları.',
      Vite: 'Tek sayfalı uygulamalar için hızlı derleme.',
      GSAP: 'Kaydırma ve arayüz animasyonları.',
      'Three.js': 'WebGL ile 3D grafikler.',
      'HTML, CSS and JavaScript': 'Framework’süz, derleme adımı olmayan araçlar.',
      'MediaPipe Tasks Vision': 'Tarayıcıda, her el için 21 nokta ile el takibi.',
      'Canvas API': 'Gerçek zamanlı görüntü filtreleri ve çizim.',
      'Node.js': 'Next.js uygulamalarının çalıştığı ortam.',
      'Drizzle ORM': 'Tipli veri erişimi ve migration’lar.',
      'Git and GitHub': 'Sürüm kontrolü ve açık kaynak kod.',
      Vercel: 'Web uygulamaları için yayına alma.'
    }
  }
};

/** The stack with layer names, summaries and notes in the given language. */
export const stackFor = (locale: Locale): StackLayerData[] =>
  locale === 'en'
    ? stack
    : stack.map(layer => ({
        ...layer,
        ...translations[locale].layers[layer.id],
        items: layer.items.map(item => ({ ...item, note: translations[locale].notes[item.name] ?? item.note }))
      }));

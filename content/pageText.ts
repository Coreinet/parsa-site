import type { Locale } from '@/content/i18n';

/**
 * Interface strings of the blog, article, project, stack and topic pages, in every language.
 * Placeholders like {n} are filled with `fill()`; they are plain strings so client components
 * can receive them as props.
 */
export const fill = (template: string, values: Record<string, string | number>): string =>
  template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? ''));

export const pageText = {
  en: {
    categories: { web: 'Web', mobile: 'Mobile', ai: 'AI', engineering: 'Engineering', notes: 'Notes' },
    blog: {
      metaTitle: 'Blog – Parsa Alizadeh',
      metaDescription: 'Articles by Parsa Alizadeh on web development, mobile development, AI engineering and search, with sources for every claim.',
      title: 'Blog by Parsa Alizadeh',
      homeTitle: 'Blog',
      intro: 'Articles by Parsa Alizadeh on building for the web, mobile and AI: what worked, what broke, and why. Every article cites its sources.',
      homeIntro: 'Notes on building for the web, mobile and AI: what worked, what broke, and why.',
      all: 'All articles',
      topicGuides: 'Topic guides',
      empty: 'No articles yet. The first one is being written.'
    },
    index: {
      all: 'All',
      filter: 'Filter by category',
      search: 'Search articles',
      shown: '{n} articles shown',
      shownOne: '{n} article shown',
      noMatch: 'No articles match',
      tryBroader: 'Try a broader word or another category.',
      showAll: 'Show all articles'
    },
    article: {
      min: '{n} min',
      minRead: '{n} min read',
      updated: 'updated',
      onThisPage: 'On this page',
      writtenBy: 'Written by',
      moreAboutMe: 'More about me',
      workWithMe: 'Work with me',
      related: 'Related articles'
    },
    topic: {
      metaTitle: '{topic} – articles and projects by Parsa Alizadeh',
      metaSuffix: 'Articles and projects by Parsa Alizadeh.',
      guideBy: 'A topic guide by',
      guideRest: ': one article to start with, deeper articles, and the projects where it comes up in real work.',
      partOf: 'Part of the topic guide',
      pillar: 'Pillar article',
      supporting: 'Supporting article',
      startHere: 'Start here',
      goDeeper: 'Go deeper',
      morePlanned: 'More articles on this topic are planned.',
      inPractice: 'In practice',
      otherTopics: 'Other topics',
      guideLabel: 'Topic guide: {topic}'
    },
    project: {
      metaTitle: '{title} – Case study by Parsa Alizadeh',
      metaDescription: '{summary} Role: {role}. Built with {stack}.',
      allWork: 'All work',
      builtBy: 'Built by',
      role: 'Role',
      year: 'Year',
      platform: 'Platform',
      stack: 'Stack',
      status: 'Status',
      links: 'Links',
      liveSite: 'Live site',
      source: 'Source code',
      private: 'Private',
      visit: 'Visit website',
      viewSource: 'View source',
      seeLive: 'See {title} live',
      next: 'Next project',
      relatedWriting: 'Related writing',
      topic: 'Topic:',
      screens: '{title} screens',
      screen: '{title}, screen {n}'
    },
    stack: {
      metaTitle: 'Tech Stack & Skills – Parsa Alizadeh',
      metaDescription:
        'The tech stack Parsa Alizadeh builds with: TypeScript, React, Next.js, Tailwind CSS, AI and computer vision tools, Node.js and deployment, grouped by layer.',
      title: 'Parsa Alizadeh’s tech stack',
      homeTitle: 'The stack',
      intro: 'The languages, frameworks and tools Parsa Alizadeh builds with, grouped by layer from the screen down to deployment.',
      homeIntro: 'The tools I build with, grouped by layer from the screen down to deployment.',
      full: 'Full stack',
      usedIn: 'Used in',
      layers: 'Stack layers'
    }
  },
  fa: {
    categories: { web: 'وب', mobile: 'موبایل', ai: 'هوش مصنوعی', engineering: 'مهندسی', notes: 'یادداشت' },
    blog: {
      metaTitle: 'بلاگ پارسا علیزاده – مقاله‌های وب، موبایل و هوش مصنوعی',
      metaDescription: 'مقاله‌های پارسا علیزاده درباره‌ی توسعه‌ی وب، توسعه‌ی موبایل، مهندسی هوش مصنوعی و جست‌وجو، با منبع برای هر ادعا.',
      title: 'بلاگ پارسا علیزاده',
      homeTitle: 'بلاگ',
      intro: 'مقاله‌های پارسا علیزاده درباره‌ی ساختن برای وب، موبایل و هوش مصنوعی: چه جواب داد، چه خراب شد و چرا. هر مقاله منابعش را ذکر می‌کند.',
      homeIntro: 'یادداشت‌هایی درباره‌ی ساختن برای وب، موبایل و هوش مصنوعی: چه جواب داد، چه خراب شد و چرا.',
      all: 'همه‌ی مقاله‌ها',
      topicGuides: 'راهنماهای موضوعی',
      empty: 'هنوز مقاله‌ای منتشر نشده است. اولین مقاله در حال نوشتن است.'
    },
    index: {
      all: 'همه',
      filter: 'فیلتر بر اساس دسته',
      search: 'جست‌وجوی مقاله‌ها',
      shown: '{n} مقاله نمایش داده شد',
      shownOne: '{n} مقاله نمایش داده شد',
      noMatch: 'مقاله‌ای پیدا نشد برای',
      tryBroader: 'یک کلمه‌ی کلی‌تر یا دسته‌ی دیگری را امتحان کنید.',
      showAll: 'نمایش همه‌ی مقاله‌ها'
    },
    article: {
      min: '{n} دقیقه',
      minRead: '{n} دقیقه مطالعه',
      updated: 'به‌روزرسانی',
      onThisPage: 'در این صفحه',
      writtenBy: 'نوشته‌ی',
      moreAboutMe: 'بیشتر درباره‌ی من',
      workWithMe: 'همکاری با من',
      related: 'مقاله‌های مرتبط'
    },
    topic: {
      metaTitle: '{topic} – مقاله‌ها و پروژه‌های پارسا علیزاده',
      metaSuffix: 'مقاله‌ها و پروژه‌های پارسا علیزاده.',
      guideBy: 'راهنمای موضوعی از',
      guideRest: ': یک مقاله برای شروع، مقاله‌های عمیق‌تر، و پروژه‌هایی که این موضوع در کار واقعی در آن‌ها مطرح شده است.',
      partOf: 'بخشی از راهنمای موضوعی',
      pillar: 'مقاله‌ی اصلی',
      supporting: 'مقاله‌ی تکمیلی',
      startHere: 'از اینجا شروع کنید',
      goDeeper: 'عمیق‌تر شوید',
      morePlanned: 'مقاله‌های بیشتری درباره‌ی این موضوع در راه است.',
      inPractice: 'در عمل',
      otherTopics: 'موضوع‌های دیگر',
      guideLabel: 'راهنمای موضوعی: {topic}'
    },
    project: {
      metaTitle: '{title} – مطالعه‌ی موردی از پارسا علیزاده',
      metaDescription: '{summary} نقش: {role}. ساخته‌شده با {stack}.',
      allWork: 'همه‌ی نمونه‌کارها',
      builtBy: 'ساخته‌ی',
      role: 'نقش',
      year: 'سال',
      platform: 'پلتفرم',
      stack: 'فناوری‌ها',
      status: 'وضعیت',
      links: 'لینک‌ها',
      liveSite: 'سایت',
      source: 'کد منبع',
      private: 'خصوصی',
      visit: 'مشاهده‌ی وب‌سایت',
      viewSource: 'مشاهده‌ی کد',
      seeLive: '{title} را آنلاین ببینید',
      next: 'پروژه‌ی بعدی',
      relatedWriting: 'مقاله‌های مرتبط',
      topic: 'موضوع:',
      screens: 'تصویرهای {title}',
      screen: '{title}، تصویر {n}'
    },
    stack: {
      metaTitle: 'ابزارها و مهارت‌های فنی پارسا علیزاده',
      metaDescription:
        'ابزارهایی که پارسا علیزاده با آن‌ها کار می‌کند: TypeScript، React، Next.js، Tailwind CSS، ابزارهای هوش مصنوعی و بینایی ماشین، Node.js و استقرار، دسته‌بندی‌شده بر اساس لایه.',
      title: 'ابزارهای پارسا علیزاده',
      homeTitle: 'ابزارها',
      intro: 'زبان‌ها، فریم‌ورک‌ها و ابزارهایی که پارسا علیزاده با آن‌ها می‌سازد، دسته‌بندی‌شده بر اساس لایه، از صفحه‌ی نمایش تا استقرار.',
      homeIntro: 'ابزارهایی که با آن‌ها می‌سازم، دسته‌بندی‌شده بر اساس لایه، از صفحه‌ی نمایش تا استقرار.',
      full: 'همه‌ی ابزارها',
      usedIn: 'استفاده در',
      layers: 'لایه‌ها'
    }
  },
  tr: {
    categories: { web: 'Web', mobile: 'Mobil', ai: 'Yapay zekâ', engineering: 'Mühendislik', notes: 'Notlar' },
    blog: {
      metaTitle: 'Blog – Parsa Alizadeh',
      metaDescription: 'Parsa Alizadeh’in web geliştirme, mobil geliştirme, yapay zekâ mühendisliği ve arama üzerine yazıları; her iddia için kaynaklarıyla.',
      title: 'Parsa Alizadeh’in blogu',
      homeTitle: 'Blog',
      intro: 'Parsa Alizadeh’in web, mobil ve yapay zekâ için geliştirme üzerine yazıları: ne işe yaradı, ne bozuldu ve neden. Her yazı kaynaklarını belirtir.',
      homeIntro: 'Web, mobil ve yapay zekâ için geliştirme üzerine notlar: ne işe yaradı, ne bozuldu ve neden.',
      all: 'Tüm yazılar',
      topicGuides: 'Konu rehberleri',
      empty: 'Henüz yazı yok. İlki yazılıyor.'
    },
    index: {
      all: 'Tümü',
      filter: 'Kategoriye göre filtrele',
      search: 'Yazılarda ara',
      shown: '{n} yazı gösteriliyor',
      shownOne: '{n} yazı gösteriliyor',
      noMatch: 'Eşleşen yazı yok:',
      tryBroader: 'Daha genel bir kelime ya da başka bir kategori deneyin.',
      showAll: 'Tüm yazıları göster'
    },
    article: {
      min: '{n} dk',
      minRead: '{n} dk okuma',
      updated: 'güncellendi',
      onThisPage: 'Bu sayfada',
      writtenBy: 'Yazan:',
      moreAboutMe: 'Hakkımda',
      workWithMe: 'Benimle çalışın',
      related: 'İlgili yazılar'
    },
    topic: {
      metaTitle: '{topic} – Parsa Alizadeh’in yazıları ve projeleri',
      metaSuffix: 'Parsa Alizadeh’in yazıları ve projeleri.',
      guideBy: 'Konu rehberi:',
      guideRest: '. Başlamak için bir yazı, daha derin yazılar ve konunun gerçek işte karşımıza çıktığı projeler.',
      partOf: 'Konu rehberinin parçası:',
      pillar: 'Ana yazı',
      supporting: 'Destekleyici yazı',
      startHere: 'Buradan başlayın',
      goDeeper: 'Daha derine inin',
      morePlanned: 'Bu konuda daha fazla yazı planlanıyor.',
      inPractice: 'Uygulamada',
      otherTopics: 'Diğer konular',
      guideLabel: 'Konu rehberi: {topic}'
    },
    project: {
      metaTitle: '{title} – Parsa Alizadeh’in vaka çalışması',
      metaDescription: '{summary} Rol: {role}. Kullanılan teknolojiler: {stack}.',
      allWork: 'Tüm çalışmalar',
      builtBy: 'Geliştiren:',
      role: 'Rol',
      year: 'Yıl',
      platform: 'Platform',
      stack: 'Teknolojiler',
      status: 'Durum',
      links: 'Bağlantılar',
      liveSite: 'Canlı site',
      source: 'Kaynak kod',
      private: 'Özel',
      visit: 'Web sitesini ziyaret et',
      viewSource: 'Kaynak kodu gör',
      seeLive: '{title} canlı olarak',
      next: 'Sonraki proje',
      relatedWriting: 'İlgili yazılar',
      topic: 'Konu:',
      screens: '{title} ekranları',
      screen: '{title}, ekran {n}'
    },
    stack: {
      metaTitle: 'Teknolojiler ve Beceriler – Parsa Alizadeh',
      metaDescription:
        'Parsa Alizadeh’in kullandığı teknolojiler: TypeScript, React, Next.js, Tailwind CSS, yapay zekâ ve bilgisayarlı görü araçları, Node.js ve yayına alma; katmanlara göre gruplanmış.',
      title: 'Parsa Alizadeh’in teknolojileri',
      homeTitle: 'Teknolojiler',
      intro: 'Parsa Alizadeh’in geliştirirken kullandığı diller, framework’ler ve araçlar; ekrandan yayına almaya kadar katmanlara göre gruplanmış.',
      homeIntro: 'Geliştirirken kullandığım araçlar; ekrandan yayına almaya kadar katmanlara göre gruplanmış.',
      full: 'Tüm teknolojiler',
      usedIn: 'Kullanıldığı projeler:',
      layers: 'Katmanlar'
    }
  }
} as const satisfies Record<Locale, unknown>;

export type PageText = (typeof pageText)[Locale];

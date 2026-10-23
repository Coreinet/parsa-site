import type { Locale, Translated } from '@/content/i18n';

/**
 * Topic clusters. Each topic has one pillar article (the broad entry point), supporting
 * articles that go deeper, and the projects where the topic shows up in real work.
 * Articles and projects link to their topic hub (/topics/[id]) and to each other from here.
 * Slugs must match files in content/blog and content/work.
 */
export interface Topic {
  id: string;
  name: string;
  /** One or two plain sentences that define the topic; shown first on the hub page. */
  definition: string;
  pillar: string;
  supporting: string[];
  projects: string[];
}

export const topics: Topic[] = [
  {
    id: 'ai-engineering',
    name: 'AI engineering',
    definition:
      'AI engineering is the work of building software around machine learning models: retrieving the right information, understanding how the models work, and running them inside real products.',
    pillar: 'retrieval-augmented-generation',
    supporting: ['transformer-attention-explained', 'vector-search-hnsw', 'evaluating-rag-systems', 'llm-quantization'],
    projects: []
  },
  {
    id: 'web-performance-accessibility',
    name: 'Web performance and accessibility',
    definition:
      'Web performance is how quickly and smoothly a page loads and responds; accessibility is whether everyone, including people with disabilities, can use it. Both are measurable qualities of a website.',
    pillar: 'core-web-vitals-lcp',
    supporting: ['reduced-motion-accessibility'],
    projects: []
  },
  {
    id: 'search-discoverability',
    name: 'Search and AI discoverability',
    definition:
      'Discoverability is how easily search engines and AI answer engines can find a website, understand who and what it is about, and cite it accurately.',
    pillar: 'building-a-site-search-engines-understand',
    supporting: ['structured-data-personal-website', 'generative-engine-optimization-research', 'name-disambiguation-search-ai'],
    projects: []
  },
  {
    id: 'mobile-development',
    name: 'Mobile development',
    definition: 'Mobile development is building applications for phones and tablets, natively or with cross-platform frameworks such as React Native.',
    pillar: 'react-native-new-architecture',
    supporting: [],
    projects: []
  }
];

export const topicById = (id: string): Topic | undefined => topics.find(t => t.id === id);

/** Topics an article belongs to (as pillar or supporting). */
export const topicsForArticle = (slug: string): Topic[] => topics.filter(t => t.pillar === slug || t.supporting.includes(slug));

/** Topics a project is part of. */
export const topicsForProject = (slug: string): Topic[] => topics.filter(t => t.projects.includes(slug));

/** Topic names and definitions in Persian and Turkish; English is the source above. */
const translations: Record<Translated, Record<string, { name: string; definition: string }>> = {
  fa: {
    'ai-engineering': {
      name: 'مهندسی هوش مصنوعی',
      definition:
        'مهندسی هوش مصنوعی یعنی ساختن نرم‌افزار پیرامون مدل‌های یادگیری ماشین: بازیابی اطلاعات درست، فهمیدن نحوه‌ی کار مدل‌ها، و اجرای آن‌ها درون محصولات واقعی.'
    },
    'web-performance-accessibility': {
      name: 'کارایی و دسترس‌پذیری وب',
      definition:
        'کارایی وب یعنی یک صفحه با چه سرعت و روانی‌ای بارگذاری می‌شود و پاسخ می‌دهد؛ دسترس‌پذیری یعنی آیا همه، از جمله افراد دارای معلولیت، می‌توانند از آن استفاده کنند. هر دو ویژگی‌های قابل‌اندازه‌گیری یک وب‌سایت هستند.'
    },
    'search-discoverability': {
      name: 'جست‌وجو و دیده‌شدن در هوش مصنوعی',
      definition:
        'دیده‌شدن (discoverability) یعنی موتورهای جست‌وجو و موتورهای پاسخ هوش مصنوعی چقدر راحت می‌توانند یک وب‌سایت را پیدا کنند، بفهمند درباره‌ی چه کسی و چه چیزی است، و آن را دقیق نقل کنند.'
    },
    'mobile-development': {
      name: 'توسعه‌ی موبایل',
      definition: 'توسعه‌ی موبایل یعنی ساختن اپلیکیشن برای گوشی و تبلت، به‌صورت نیتیو یا با فریم‌ورک‌های چندسکویی مثل React Native.'
    }
  },
  tr: {
    'ai-engineering': {
      name: 'Yapay zekâ mühendisliği',
      definition:
        'Yapay zekâ mühendisliği, makine öğrenmesi modelleri etrafında yazılım geliştirme işidir: doğru bilgiyi getirmek, modellerin nasıl çalıştığını anlamak ve onları gerçek ürünlerin içinde çalıştırmak.'
    },
    'web-performance-accessibility': {
      name: 'Web performansı ve erişilebilirlik',
      definition:
        'Web performansı, bir sayfanın ne kadar hızlı ve akıcı yüklendiği ve tepki verdiğidir; erişilebilirlik ise engelli bireyler dahil herkesin onu kullanıp kullanamadığıdır. İkisi de bir web sitesinin ölçülebilir nitelikleridir.'
    },
    'search-discoverability': {
      name: 'Arama ve yapay zekâda bulunabilirlik',
      definition:
        'Bulunabilirlik, arama motorlarının ve yapay zekâ yanıt motorlarının bir web sitesini ne kadar kolay bulabildiği, kimin ve neyin hakkında olduğunu anlayabildiği ve onu doğru şekilde kaynak gösterebildiğidir.'
    },
    'mobile-development': {
      name: 'Mobil geliştirme',
      definition: 'Mobil geliştirme, telefonlar ve tabletler için yerel olarak ya da React Native gibi çapraz platform framework’lerle uygulama geliştirmektir.'
    }
  }
};

/** A topic with its name and definition in the given language. */
export const localizeTopic = (topic: Topic, locale: Locale): Topic => (locale === 'en' ? topic : { ...topic, ...translations[locale][topic.id] });

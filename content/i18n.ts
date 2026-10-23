/**
 * Languages. English is the default and lives at the root; Persian and Turkish have their own
 * URLs (/fa, /tr) so search engines can index each one. Only the pages in TRANSLATED_PATHS
 * exist in every language; case studies and articles stay in English and are linked from there.
 * Same rule as content/site.ts: only facts Parsa has confirmed, translated, never added to.
 */
export const LOCALES = ['en', 'fa', 'tr'] as const;
export type Locale = (typeof LOCALES)[number];
export type Translated = Exclude<Locale, 'en'>;

export const LOCALE_META: Record<Locale, { name: string; short: string; dir: 'ltr' | 'rtl'; og: string }> = {
  en: { name: 'English', short: 'EN', dir: 'ltr', og: 'en_US' },
  fa: { name: 'فارسی', short: 'FA', dir: 'rtl', og: 'fa_IR' },
  tr: { name: 'Türkçe', short: 'TR', dir: 'ltr', og: 'tr_TR' }
};

export const TRANSLATED_PATHS = ['/', '/about', '/work', '/contact'] as const;
export type TranslatedPath = (typeof TRANSLATED_PATHS)[number];

/** "/about" in a language: "/about", "/fa/about", "/tr/about". */
export const localePath = (locale: Locale, path = '/'): string => (locale === 'en' ? path : `/${locale}${path === '/' ? '' : path}`);

/** Splits "/fa/about" into { locale: 'fa', path: '/about' }. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const m = /^\/(fa|tr)(?=\/|$)/.exec(pathname);
  return m ? { locale: m[1] as Locale, path: pathname.slice(m[0].length) || '/' } : { locale: 'en', path: pathname };
}

export const isTranslated = (path: string): path is TranslatedPath => (TRANSLATED_PATHS as readonly string[]).includes(path);

/** hreflang map for a page that exists in every language; x-default is the English page. */
export const languageAlternates = (path: TranslatedPath): Record<string, string> => ({
  en: path,
  fa: localePath('fa', path),
  tr: localePath('tr', path),
  'x-default': path
});

// ---------- Interface strings, for every language ----------

export const ui = {
  en: {
    nav: { home: 'Home', work: 'Work', about: 'About', stack: 'Stack', blog: 'Blog', contact: 'Contact' },
    more: 'More',
    close: 'Close',
    morePages: 'More pages',
    skip: 'Skip to content',
    homeLabel: 'Parsa Alizadeh, home',
    language: 'Language',
    builtWith: 'built with Next.js',
    lastDeploy: 'last deploy',
    status: { live: 'Live', repository: 'Code on GitHub', 'in-progress': 'In progress', archived: 'Archived' },
    copyEmail: 'Copy email',
    emailCopied: 'Email copied'
  },
  fa: {
    nav: { home: 'خانه', work: 'نمونه‌کارها', about: 'درباره', stack: 'ابزارها', blog: 'بلاگ', contact: 'تماس' },
    more: 'بیشتر',
    close: 'بستن',
    morePages: 'صفحه‌های بیشتر',
    skip: 'رفتن به محتوا',
    homeLabel: 'پارسا علیزاده، خانه',
    language: 'زبان',
    builtWith: 'ساخته‌شده با Next.js',
    lastDeploy: 'آخرین انتشار',
    status: { live: 'آنلاین', repository: 'کد در گیت‌هاب', 'in-progress': 'در حال ساخت', archived: 'بایگانی‌شده' },
    copyEmail: 'کپی ایمیل',
    emailCopied: 'ایمیل کپی شد'
  },
  tr: {
    nav: { home: 'Ana sayfa', work: 'Çalışmalar', about: 'Hakkımda', stack: 'Teknolojiler', blog: 'Blog', contact: 'İletişim' },
    more: 'Daha fazla',
    close: 'Kapat',
    morePages: 'Diğer sayfalar',
    skip: 'İçeriğe geç',
    homeLabel: 'Parsa Alizadeh, ana sayfa',
    language: 'Dil',
    builtWith: 'Next.js ile yapıldı',
    lastDeploy: 'son yayın',
    status: { live: 'Yayında', repository: 'Kod GitHub’da', 'in-progress': 'Devam ediyor', archived: 'Arşivlendi' },
    copyEmail: 'E-postayı kopyala',
    emailCopied: 'E-posta kopyalandı'
  }
} as const;

export type Ui = (typeof ui)[Locale];

/** Labels for the contact form. Values sent to the API stay in English. */
export interface FormText {
  name: string;
  namePlaceholder: string;
  email: string;
  typeLegend: string;
  types: Record<'Web app' | 'Mobile app' | 'AI feature' | 'Something else', string>;
  budget: string;
  optional: string;
  budgetPlaceholder: string;
  message: string;
  messagePlaceholder: string;
  messageHelp: string;
  errName: string;
  errEmail: string;
  errEmailDomain: string;
  errMessage: string;
  send: string;
  sending: string;
  retry: string;
  sentTitle: string;
  sentText: (firstName: string) => string;
  almostTitle: string;
  almostText: string;
  failedTitle: string;
  failedText: string;
}

export const formText: Record<Locale, FormText> = {
  en: {
    name: 'Name',
    namePlaceholder: 'Your name',
    email: 'Email',
    typeLegend: 'What are you building?',
    types: { 'Web app': 'Web app', 'Mobile app': 'Mobile app', 'AI feature': 'AI feature', 'Something else': 'Something else' },
    budget: 'Budget',
    optional: '(optional)',
    budgetPlaceholder: 'A range is fine',
    message: 'Message',
    messagePlaceholder: 'What you are building, who it is for, and when you would like to start.',
    messageHelp: 'A few sentences is plenty.',
    errName: 'Add your name so I know who to reply to.',
    errEmail: 'Add an email address to reply to.',
    errEmailDomain: 'Add the domain ending, for example sara@company.com',
    errMessage: 'Write at least a couple of sentences (20+ characters) about the project.',
    send: 'Send message',
    sending: 'Sending…',
    retry: 'Try again',
    sentTitle: 'Message sent.',
    sentText: n => `Thanks, ${n}. I usually reply within 2 working days.`,
    almostTitle: 'Almost there.',
    almostText: 'Your email app should have opened with your message ready to send. If it didn’t, write to',
    failedTitle: 'Your message wasn’t sent',
    failedText: 'Your text is still in the form, so you can try again, or email'
  },
  fa: {
    name: 'نام',
    namePlaceholder: 'نام شما',
    email: 'ایمیل',
    typeLegend: 'چه چیزی می‌سازید؟',
    types: { 'Web app': 'اپلیکیشن وب', 'Mobile app': 'اپلیکیشن موبایل', 'AI feature': 'قابلیت هوش مصنوعی', 'Something else': 'چیز دیگر' },
    budget: 'بودجه',
    optional: '(اختیاری)',
    budgetPlaceholder: 'یک بازه هم کافی است',
    message: 'پیام',
    messagePlaceholder: 'چه چیزی می‌سازید، برای چه کسانی، و از کی می‌خواهید شروع کنید.',
    messageHelp: 'چند جمله کافی است.',
    errName: 'نام‌تان را بنویسید تا بدانم به چه کسی جواب بدهم.',
    errEmail: 'یک آدرس ایمیل برای پاسخ بنویسید.',
    errEmailDomain: 'دامنه را کامل بنویسید، مثلاً sara@company.com',
    errMessage: 'حداقل چند جمله (بیش از ۲۰ نویسه) درباره‌ی پروژه بنویسید.',
    send: 'ارسال پیام',
    sending: 'در حال ارسال…',
    retry: 'دوباره امتحان کنید',
    sentTitle: 'پیام ارسال شد.',
    sentText: n => `ممنون ${n}. معمولاً ظرف ۲ روز کاری جواب می‌دهم.`,
    almostTitle: 'تقریباً تمام است.',
    almostText: 'برنامه‌ی ایمیل شما باید با پیام آماده باز شده باشد. اگر باز نشد، به این آدرس بنویسید:',
    failedTitle: 'پیام شما ارسال نشد',
    failedText: 'متن‌تان هنوز در فرم هست و می‌توانید دوباره امتحان کنید، یا مستقیم ایمیل بزنید به'
  },
  tr: {
    name: 'Ad',
    namePlaceholder: 'Adınız',
    email: 'E-posta',
    typeLegend: 'Ne geliştiriyorsunuz?',
    types: { 'Web app': 'Web uygulaması', 'Mobile app': 'Mobil uygulama', 'AI feature': 'Yapay zekâ özelliği', 'Something else': 'Başka bir şey' },
    budget: 'Bütçe',
    optional: '(isteğe bağlı)',
    budgetPlaceholder: 'Bir aralık yeterli',
    message: 'Mesaj',
    messagePlaceholder: 'Ne geliştirdiğinizi, kimin için olduğunu ve ne zaman başlamak istediğinizi yazın.',
    messageHelp: 'Birkaç cümle yeterli.',
    errName: 'Kime yanıt vereceğimi bilmem için adınızı yazın.',
    errEmail: 'Yanıt için bir e-posta adresi yazın.',
    errEmailDomain: 'Alan adını da yazın, örneğin sara@company.com',
    errMessage: 'Proje hakkında en az birkaç cümle (20+ karakter) yazın.',
    send: 'Mesaj gönder',
    sending: 'Gönderiliyor…',
    retry: 'Tekrar dene',
    sentTitle: 'Mesaj gönderildi.',
    sentText: n => `Teşekkürler ${n}. Genellikle 2 iş günü içinde yanıt veririm.`,
    almostTitle: 'Neredeyse tamam.',
    almostText: 'E-posta uygulamanız mesajınız hazır şekilde açılmış olmalı. Açılmadıysa şu adrese yazın:',
    failedTitle: 'Mesajınız gönderilemedi',
    failedText: 'Metniniz hâlâ formda, tekrar deneyebilir ya da doğrudan e-posta gönderebilirsiniz:'
  }
};

// ---------- Page copy for the translated pages ----------

export interface PageCopy {
  /** The name as written in this language. */
  name: string;
  portraitAlt: string;
  meta: Record<TranslatedPath, { title: string; description: string }>;
  roles: string;
  intro: string;
  availability: string;
  localTime: string;
  startProject: string;
  seeWork: string;
  statement: string;
  bio: string[];
  interestsTitle: string;
  interests: string[];
  facts: { label: string; value: string }[];
  timelineTitle: string;
  timeline: { version: string; year: string; title: string; text: string }[];
  fullProfile: string;
  selectedWork: string;
  workTitle: string;
  workIntro: string;
  allProjects: string;
  caseStudiesNote: string;
  /** Project summaries by slug; a project without one shows its English summary. */
  projects: Record<string, string>;
  writingTitle: string;
  writingText: string;
  readBlog: string;
  contactTitle: string;
  contactHome: string;
  contactText: string;
  contactBand: [string, string];
  formTitle: string;
  englishNote: string;
}

export const copy: Record<Translated, PageCopy> = {
  fa: {
    name: 'پارسا علیزاده',
    portraitAlt: 'پرتره‌ی سیاه‌وسفید پارسا علیزاده (Parsa Alizadeh)، توسعه‌دهنده‌ی نرم‌افزار، در خیابانی پر از درخت',
    meta: {
      '/': {
        title: 'پارسا علیزاده (Parsa Alizadeh) – توسعه‌دهنده‌ی نرم‌افزار، وب و موبایل',
        description: 'پارسا علیزاده (Parsa Alizadeh) توسعه‌دهنده‌ی نرم‌افزار و فریلنسر است که اپلیکیشن‌های وب و موبایل می‌سازد و با هوش مصنوعی کار می‌کند. نمونه‌کارها، مقاله‌ها و راه‌های تماس.'
      },
      '/about': {
        title: 'درباره‌ی پارسا علیزاده – توسعه‌دهنده‌ی نرم‌افزار',
        description: 'پارسا علیزاده توسعه‌دهنده‌ی نرم‌افزار است؛ برنامه‌نویسی را از ۲۰۲۱ شروع کرده و از ۲۰۲۴ فریلنسر است. زندگی‌نامه، مسیر کاری، علاقه‌ها و زبان‌ها.'
      },
      '/work': {
        title: 'نمونه‌کارهای پارسا علیزاده – وب، موبایل و هوش مصنوعی',
        description: 'پروژه‌های وب، موبایل و هوش مصنوعی پارسا علیزاده، هرکدام با یک مطالعه‌ی موردی کوتاه.'
      },
      '/contact': {
        title: 'تماس با پارسا علیزاده – سفارش پروژه',
        description: 'برای پروژه‌ی وب، موبایل یا هوش مصنوعی با پارسا علیزاده تماس بگیرید. ایمیل، فرم تماس و شبکه‌های اجتماعی.'
      }
    },
    roles: 'توسعه‌دهنده‌ی نرم‌افزار · وب · موبایل · هوش مصنوعی',
    intro:
      'محصولات وب و موبایل را از صفر تا انتشار می‌سازم، همراه با ابزارهای هوش مصنوعی که آن‌ها را هوشمندتر می‌کنند. رابط‌های سریع، سیستم‌های تمیز و تحویل به‌موقع برایم مهم است.',
    availability: 'پذیرای پروژه‌های جدید',
    localTime: 'به وقت محلی',
    startProject: 'شروع یک پروژه',
    seeWork: 'دیدن نمونه‌کارها',
    statement: 'توسعه‌دهنده‌ی نرم‌افزار برای وب، موبایل و هوش مصنوعی.',
    bio: [
      'من پارسا علیزاده (Parsa Alizadeh) هستم، توسعه‌دهنده‌ی نرم‌افزار. یادگیری برنامه‌نویسی را از سال ۲۰۲۱ شروع کردم و از سال ۲۰۲۴ به‌صورت فریلنسر روی پروژه‌ها کار می‌کنم.',
      'اپلیکیشن‌های وب و موبایل می‌سازم و از هوش مصنوعی استفاده می‌کنم تا نرم‌افزارها کاربردی‌تر شوند. این سایت جایی است که پروژه‌هایم را جمع می‌کنم، درباره‌ی چیزهایی که می‌سازم و یاد می‌گیرم می‌نویسم، و می‌توانید با من در تماس باشید.'
    ],
    interestsTitle: 'علاقه‌ها',
    interests: ['توسعه‌ی وب', 'توسعه‌ی موبایل', 'مهندسی نرم‌افزار', 'برنامه‌نویسی', 'هوش مصنوعی'],
    facts: [
      { label: 'تمرکز', value: 'وب، موبایل و هوش مصنوعی' },
      { label: 'تجربه', value: 'برنامه‌نویسی از ۲۰۲۱، فریلنسری از ۲۰۲۴' },
      { label: 'زبان‌ها', value: 'فارسی، انگلیسی، ترکی' }
    ],
    timelineTitle: 'مسیر کاری',
    timeline: [
      { version: 'v1.0', year: '2024', title: 'توسعه‌دهنده‌ی فریلنسر', text: 'شروع کار روی پروژه‌ها به‌صورت فریلنسر.' },
      { version: 'v0.1', year: '2021', title: 'شروع برنامه‌نویسی', text: 'شروع یادگیری برنامه‌نویسی.' }
    ],
    fullProfile: 'پروفایل کامل',
    selectedWork: 'نمونه‌کارهای منتخب',
    workTitle: 'نمونه‌کارهای پارسا علیزاده',
    workIntro: 'پروژه‌های وب، موبایل و هوش مصنوعی، هرکدام با یک مطالعه‌ی موردی کوتاه: مسئله، رویکرد و نتیجه.',
    allProjects: 'همه‌ی پروژه‌ها',
    caseStudiesNote: 'متن کامل مطالعه‌های موردی به انگلیسی است.',
    projects: {
      enteredge: 'پلتفرم خودکارسازی معاملات رمزارز برای ساخت، بک‌تست و اجرای ربات‌های سیگنال روی صرافی‌های بزرگ.',
      gamesector: 'پلتفرم جذب و همکاری برای بوسترهای بازی، با موقعیت‌های باز در فهرستی رو به رشد از بازی‌ها.',
      filmohub: 'سایتی فارسی برای تماشای آنلاین و دانلود فیلم و سریال.',
      entergame: 'وب‌سایت فارسی یک کلاینت گیمینگ ویندوز که پینگ را کم می‌کند، اتصال را پایدار نگه می‌دارد و محدودیت لانچرهای بازی را دور می‌زند.',
      safeguard: 'پلتفرم ایمنی و انطباق، با یک سایت معرفی و داشبورد مدیریتی کامل برای پیگیری حوادث، ممیزی‌ها، آموزش‌ها و ریسک.'
    },
    writingTitle: 'مقاله‌ها',
    writingText: 'درباره‌ی ساختن برای وب، موبایل و هوش مصنوعی می‌نویسم و هر مقاله منابعش را ذکر می‌کند. مقاله‌ها به زبان انگلیسی هستند.',
    readBlog: 'خواندن بلاگ',
    contactTitle: 'تماس با پارسا علیزاده',
    contactHome: 'بیایید چیزی بسازیم.',
    contactText: 'برای پروژه‌ی وب، موبایل یا هوش مصنوعی با من همکاری کنید، یا فقط سلام کنید. معمولاً ظرف ۲ روز کاری جواب می‌دهم.',
    contactBand: ['چیزی برای ساختن دارید؟', 'بیایید صحبت کنیم.'],
    formTitle: 'فرم تماس',
    englishNote: 'به انگلیسی'
  },
  tr: {
    name: 'Parsa Alizadeh',
    portraitAlt: 'Yazılım geliştirici Parsa Alizadeh’in ağaçlı bir sokakta çekilmiş siyah beyaz portresi',
    meta: {
      '/': {
        title: 'Parsa Alizadeh – Yazılım, Web ve Mobil Geliştirici',
        description: 'Parsa Alizadeh, web ve mobil uygulamalar geliştiren ve yapay zekâ ile çalışan serbest yazılım geliştiricidir. Projeler, yazılar ve iletişim bilgileri.'
      },
      '/about': {
        title: 'Parsa Alizadeh Hakkında – Yazılım Geliştirici',
        description: 'Parsa Alizadeh bir yazılım geliştirici; 2021’den beri programlama yapıyor, 2024’ten beri serbest çalışıyor. Biyografi, kariyer, ilgi alanları ve diller.'
      },
      '/work': {
        title: 'Parsa Alizadeh’in Çalışmaları – Web, Mobil ve Yapay Zekâ',
        description: 'Parsa Alizadeh’in web, mobil ve yapay zekâ projeleri, her biri kısa bir vaka çalışmasıyla.'
      },
      '/contact': {
        title: 'Parsa Alizadeh ile İletişim – Proje Başlat',
        description: 'Web, mobil veya yapay zekâ projeniz için Parsa Alizadeh ile iletişime geçin. E-posta, iletişim formu ve sosyal medya.'
      }
    },
    roles: 'Yazılım · Web · Mobil · Yapay zekâ geliştirici',
    intro:
      'Web ve mobil ürünleri baştan sona geliştiriyorum; onları daha akıllı hale getiren yapay zekâ araçlarıyla birlikte. Hızlı arayüzler, temiz sistemler ve işi teslim etmek benim için önemli.',
    availability: 'Yeni projelere açığım',
    localTime: 'yerel saat',
    startProject: 'Proje başlat',
    seeWork: 'Çalışmalarımı gör',
    statement: 'Web, mobil ve yapay zekâ için yazılım geliştiriyorum.',
    bio: [
      'Ben Parsa Alizadeh, yazılım geliştiriciyim. Programlamayı 2021’de öğrenmeye başladım ve 2024’ten beri serbest geliştirici olarak projeler alıyorum.',
      'Web ve mobil uygulamalar geliştiriyor, yazılımı daha kullanışlı hale getirmek için yapay zekâ ile çalışıyorum. Bu site projelerimi topladığım, geliştirdiklerim ve öğrendiklerim hakkında yazdığım ve benimle iletişime geçebileceğiniz yer.'
    ],
    interestsTitle: 'İlgi alanları',
    interests: ['Web geliştirme', 'Mobil geliştirme', 'Yazılım mühendisliği', 'Programlama', 'Yapay zekâ'],
    facts: [
      { label: 'Odak', value: 'Web, mobil ve yapay zekâ' },
      { label: 'Deneyim', value: '2021’den beri programlama, 2024’ten beri serbest' },
      { label: 'Diller', value: 'Farsça, İngilizce, Türkçe' }
    ],
    timelineTitle: 'Kariyer',
    timeline: [
      { version: 'v1.0', year: '2024', title: 'Serbest geliştirici', text: 'Serbest geliştirici olarak projeler almaya başladım.' },
      { version: 'v0.1', year: '2021', title: 'Programlamaya başladım', text: 'Programlamayı öğrenmeye başladım.' }
    ],
    fullProfile: 'Tam profil',
    selectedWork: 'Seçilmiş çalışmalar',
    workTitle: 'Parsa Alizadeh’in çalışmaları',
    workIntro: 'Web, mobil ve yapay zekâ projeleri; her birinin kısa bir vaka çalışması var: problem, yaklaşım ve sonuç.',
    allProjects: 'Tüm projeler',
    caseStudiesNote: 'Vaka çalışmalarının tam metni İngilizcedir.',
    projects: {
      enteredge: 'Büyük borsalarda sinyal botları oluşturmak, geriye dönük test etmek ve çalıştırmak için bir kripto alım satım otomasyon platformu.',
      gamesector: 'Oyun booster’ları için, giderek büyüyen bir oyun listesinde açık pozisyonlar sunan bir işe alım ve çalışma platformu.',
      filmohub: 'Film ve dizi izlemek ve indirmek için Farsça bir site.',
      entergame: 'Pingi düşüren, bağlantıyı stabil tutan ve oyun başlatıcılarındaki kısıtlamaları aşan bir Windows oyun istemcisinin Farsça web sitesi.',
      safeguard: 'Olayları, denetimleri, eğitimleri ve riskleri takip etmek için tanıtım sitesi ve tam bir yönetim paneli içeren bir iş güvenliği ve uyum platformu.'
    },
    writingTitle: 'Yazılar',
    writingText: 'Web, mobil ve yapay zekâ için geliştirme üzerine yazıyorum; her yazı kaynaklarını belirtir. Yazılar İngilizcedir.',
    readBlog: 'Blogu oku',
    contactTitle: 'Parsa Alizadeh ile iletişim',
    contactHome: 'Birlikte bir şey yapalım.',
    contactText: 'Web, mobil veya yapay zekâ projeniz için benimle çalışın ya da sadece merhaba deyin. Genellikle 2 iş günü içinde yanıt veririm.',
    contactBand: ['Yapacak bir şeyin mi var?', 'Konuşalım.'],
    formTitle: 'İletişim formu',
    englishNote: 'İngilizce'
  }
};

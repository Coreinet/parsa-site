/**
 * Everything personal lives here. Only facts Parsa has confirmed belong in this file:
 * it feeds the page copy, the meta tags and the Person structured data.
 */
export const site = {
  name: 'Parsa Alizadeh',
  firstName: 'Parsa',
  lastName: 'Alizadeh',
  roles: ['Software', 'Web', 'Mobile', 'AI'],
  title: 'Software developer',
  jobTitle: 'Software Developer',
  intro:
    'I build web and mobile products end to end, and the AI tools that make them smarter. I care about fast interfaces, clean systems and shipping.',
  /** One-sentence description used for meta descriptions and the Person entity. */
  description:
    'Parsa Alizadeh is a freelance software developer who builds web and mobile applications and works with artificial intelligence. Programming since 2021, freelancing since 2024.',
  /**
   * Topics for Person.knowsAbout: the stated fields of work, plus technologies with public
   * evidence in the project pages (see content/work and content/stack.ts).
   */
  knowsAbout: [
    'Software development',
    'Web development',
    'Mobile development',
    'Software engineering',
    'Programming',
    'Artificial intelligence',
    'TypeScript',
    'React',
    'Next.js',
    'Tailwind CSS'
  ],
  /** Fallback only: set NEXT_PUBLIC_SITE_URL to the real domain (see lib/site-url.ts). */
  url: 'https://www.parsa-alizadeh.com',
  email: 'parsa.alizadeh.inet@gmail.com',
  /** IANA time zone for the "local time" in the status line */
  timeZone: 'Europe/Istanbul', // from the GitHub profile location
  available: true,
  availability: 'Available for new projects',
  responseTime: 'I usually reply within 2 working days.',
  portrait: {
    src: '/images/parsa-alizadeh.jpg',
    width: 1086,
    height: 1448,
    alt: 'Black-and-white portrait of Parsa Alizadeh, software developer, on a tree-lined street'
  },
  cv: '', // Path to a PDF in /public when there is one, e.g. /parsa-alizadeh-cv.pdf
  socials: [
    { label: 'GitHub', handle: 'Coreinet', href: 'https://github.com/Coreinet' },
    { label: 'LinkedIn', handle: 'parsa-alizadeh', href: 'https://www.linkedin.com/in/parsa-alizadeh-123237240/' },
    { label: 'Instagram', handle: 'parsa.inet', href: 'https://www.instagram.com/parsa.inet/' }
  ],
  facts: [
    { label: 'Focus', value: 'Web, mobile and AI' },
    { label: 'Experience', value: 'Programming since 2021, freelance since 2024' },
    { label: 'Languages', value: 'Persian, English, Turkish' }
  ]
} as const;

export type Site = typeof site;

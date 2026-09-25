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
    supporting: ['transformer-attention-explained', 'vector-search-hnsw'],
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
    supporting: ['structured-data-personal-website', 'generative-engine-optimization-research'],
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

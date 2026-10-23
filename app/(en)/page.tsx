import Hero from '@/components/home/Hero';
import AboutSection from '@/components/sections/AboutSection';
import BlogSection from '@/components/sections/BlogSection';
import ContactSection from '@/components/sections/ContactSection';
import StackSection from '@/components/sections/StackSection';
import WorkSection from '@/components/sections/WorkSection';
import JsonLd from '@/components/seo/JsonLd';
import { site } from '@/content/site';
import { pageMetadata } from '@/lib/metadata';
import { getArticles } from '@/lib/content';
import { blogSchema, graph, personSchema, websiteSchema } from '@/lib/schema';

export const metadata = pageMetadata({
  title: `${site.name} – Software, Web & Mobile Developer`,
  description: `${site.name} is a software developer building web and mobile applications and working with AI. Projects, writing, and how to get in touch.`,
  path: '/'
});

/** Overview of the whole site: each section previews its own page (/work, /about, /stack, /blog, /contact). */
export default function HomePage() {
  return (
    <>
      <JsonLd data={graph(websiteSchema(), personSchema(), blogSchema(getArticles()))} />
      <Hero />
      <WorkSection />
      <div className="border-t border-line" />
      <AboutSection />
      <div className="border-t border-line" />
      <StackSection />
      <div className="border-t border-line" />
      <BlogSection />
      <ContactSection />
    </>
  );
}

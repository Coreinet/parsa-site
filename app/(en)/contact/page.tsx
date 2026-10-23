import ContactSection from '@/components/sections/ContactSection';
import JsonLd from '@/components/seo/JsonLd';
import { site } from '@/content/site';
import { pageMetadata } from '@/lib/metadata';
import { breadcrumbSchema, contactPageSchema, graph, personSchema } from '@/lib/schema';

const description = `Contact ${site.name}, freelance software developer, about a web, mobile or AI project. Email, contact form, GitHub, LinkedIn and Instagram.`;

export const metadata = pageMetadata({
  title: `Contact ${site.name} – Hire a Software Developer`,
  description,
  path: '/contact'
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={graph(
          contactPageSchema(description),
          personSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Contact', path: '/contact' }
          ])
        )}
      />
      <ContactSection page />
    </>
  );
}

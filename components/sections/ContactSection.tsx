import ContactForm from '@/components/contact/ContactForm';
import CopyEmail from '@/components/contact/CopyEmail';
import ContactBand from '@/components/home/ContactBand';
import SocialIcons from '@/components/ui/SocialIcons';
import { Breadcrumb, Container, PathLabel } from '@/components/ui/primitives';
import { site } from '@/content/site';

/** Home: the closing contact band. Page (/contact): the same form under the page's h1. */
export default function ContactSection({ page = false }: { page?: boolean }) {
  const Heading = page ? 'h1' : 'h2';
  return (
    <section id={page ? undefined : 'contact'} className={page ? 'pt-[clamp(40px,7vw,88px)]' : 'scroll-mt-20 pt-[clamp(48px,8vw,96px)]'}>
      {page ? null : <ContactBand />}
      <Container className="grid gap-12 py-[clamp(56px,9vw,112px)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="grid content-start gap-6">
          {page ? (
            <Breadcrumb
              items={[
                { name: 'Home', href: '/' },
                { name: 'Contact', href: '/contact' }
              ]}
            />
          ) : (
            <PathLabel path="/contact" />
          )}
          <Heading className="text-display font-semibold">{page ? `Contact ${site.name}` : <>Let&apos;s build something.</>}</Heading>
          <p className="max-w-[44ch] text-body-lg text-ink-2">
            {page ? `Hire ${site.name} for a web, mobile or AI project, or just say hello. ` : 'Tell me what you are working on. '}
            {site.responseTime}
          </p>
          <CopyEmail email={site.email} />
          <SocialIcons withEmail={false} className="pt-2" />
        </div>
        <div className="rounded-[24px] border border-line bg-surface p-5 sm:p-8">
          <h2 className="sr-only">Contact form</h2>
          <ContactForm email={site.email} />
        </div>
      </Container>
      {page ? <ContactBand /> : null}
    </section>
  );
}

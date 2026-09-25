import ContactForm from '@/components/contact/ContactForm';
import CopyEmail from '@/components/contact/CopyEmail';
import ContactBand from '@/components/home/ContactBand';
import SocialIcons from '@/components/ui/SocialIcons';
import { Container, PathLabel } from '@/components/ui/primitives';
import { site } from '@/content/site';


export default function ContactSection() {
  return (
    <section id="contact" className="scroll-mt-20 pt-[clamp(48px,8vw,96px)]">
      <ContactBand />
      <Container className="grid gap-12 py-[clamp(56px,9vw,112px)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="grid content-start gap-6">
          <PathLabel path="/contact" />
          <h2 className="text-display font-semibold">Let&apos;s build something.</h2>
          <p className="max-w-[44ch] text-body-lg text-ink-2">Tell me what you are working on. {site.responseTime}</p>
          <CopyEmail email={site.email} />
          <SocialIcons withEmail={false} className="pt-2" />
        </div>
        <div className="rounded-[24px] border border-line bg-surface p-5 sm:p-8">
          <h3 className="sr-only">Contact form</h3>
          <ContactForm email={site.email} />
        </div>
      </Container>

    </section>
  );
}

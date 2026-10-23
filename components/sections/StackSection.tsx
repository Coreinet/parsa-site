import StackGrid from '@/components/stack/StackGrid';
import StackLayers from '@/components/stack/StackLayers';
import { Section, TextLink } from '@/components/ui/primitives';
import { localePath, ui, type Locale } from '@/content/i18n';
import { pageText } from '@/content/pageText';
import { stackFor } from '@/content/stack';

export default function StackSection({ page = false, locale = 'en' }: { page?: boolean; locale?: Locale }) {
  const t = pageText[locale].stack;
  const path = localePath(locale, '/stack');
  return (
    <Section
      id={page ? undefined : 'stack'}
      path={path}
      page={page ? ui[locale].nav.stack : undefined}
      home={{ name: ui[locale].nav.home, href: localePath(locale) }}
      title={page ? t.title : t.homeTitle}
      intro={page ? t.intro : t.homeIntro}
      action={page ? undefined : <TextLink href={path}>{t.full}</TextLink>}
    >
      <StackLayers
        label={t.layers}
        layers={stackFor(locale).map(layer => ({ id: `stack-${layer.id}`, name: layer.name, content: <StackGrid layer={layer} locale={locale} /> }))}
      />
    </Section>
  );
}

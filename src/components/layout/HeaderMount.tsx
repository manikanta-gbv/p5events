import { getNavigation, getSettings } from '@/lib/content';
import { whatsappLink } from '@/lib/whatsapp';
import { SiteHeader } from './SiteHeader';

/** Server wrapper: reads content, hands the header plain props. */
export function HeaderMount() {
  const nav = getNavigation();
  const { brand } = getSettings();

  return (
    <SiteHeader
      items={nav.header}
      ctaLabel={nav.headerCta.label}
      brandName={brand.name}
      wordmark={brand.wordmark}
      logoMark={brand.logoMark}
      whatsappHref={whatsappLink()}
    />
  );
}

import { getAreas, getFaqs, getSettings, getSiteUrl } from '@/lib/content';
import type { Package } from '@/lib/schema';

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function LocalBusinessJsonLd() {
  const { brand, location, contact, seo, social } = getSettings();
  const site = getSiteUrl();
  const areas = getAreas();

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: brand.name,
        description: seo.defaultDescription,
        url: site,
        image: `${site}${brand.logoFull}`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: location.addressLine,
          addressLocality: location.city,
          addressRegion: location.region,
          postalCode: location.postalCode,
          addressCountry: location.country,
        },
        telephone: contact.phone,
        email: contact.email,
        sameAs: [social.instagram, social.youtube, social.googleBusiness].filter(Boolean),
        areaServed: areas.map((area) => ({ '@type': 'Place', name: area.name })),
      }}
    />
  );
}

export function PackageJsonLd({ pkg }: { pkg: Package }) {
  const { brand, currency } = getSettings();
  const site = getSiteUrl();

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: pkg.title,
        description: pkg.summary,
        image: `${site}${pkg.images[0]}`,
        brand: { '@type': 'Brand', name: brand.name },
        offers: {
          '@type': 'Offer',
          price: pkg.price,
          priceCurrency: currency.code,
          availability: 'https://schema.org/InStock',
          url: `${site}/packages/${pkg.slug}/`,
        },
      }}
    />
  );
}

export function FaqJsonLd() {
  const faqs = getFaqs();

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      }}
    />
  );
}

export function BreadcrumbJsonLd({ trail }: { trail: { name: string; href: string }[] }) {
  const site = getSiteUrl();

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: trail.map((crumb, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: crumb.name,
          item: `${site}${crumb.href}`,
        })),
      }}
    />
  );
}

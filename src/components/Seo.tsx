import { getAreas, getFaqs, getPackages, getSettings, getSiteUrl } from '@/lib/content';
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
  const { brand, location, contact, seo, social, openingHours } = getSettings();
  const site = getSiteUrl();
  const areas = getAreas();
  const packages = getPackages();

  const prices = packages.map((p) => p.price);
  const currency = getSettings().currency.symbol;
  const priceRange = prices.length
    ? `${currency}${Math.min(...prices).toLocaleString('en-IN')}–${currency}${Math.max(...prices).toLocaleString('en-IN')}`
    : null;

  const hasGeo = Boolean(location.geo?.latitude && location.geo?.longitude);
  const hasHours = Boolean(openingHours?.opens && openingHours?.closes);

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
        // Derived from the real catalogue rather than typed by hand.
        ...(priceRange ? { priceRange } : {}),
        ...(social.googleBusiness ? { hasMap: social.googleBusiness } : {}),
        // Only emitted once someone fills them in — invented coordinates or
        // hours are worse than none.
        ...(hasGeo
          ? {
              geo: {
                '@type': 'GeoCoordinates',
                latitude: location.geo?.latitude,
                longitude: location.geo?.longitude,
              },
            }
          : {}),
        ...(hasHours
          ? {
              openingHoursSpecification: {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: openingHours?.days,
                opens: openingHours?.opens,
                closes: openingHours?.closes,
              },
            }
          : {}),
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

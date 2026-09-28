import Image from 'next/image';
import Link from 'next/link';
import {
  getAreas,
  getCategories,
  getCategoryFromPrice,
  getGallery,
  getPackages,
  getSettings,
} from '@/lib/content';
import { formatPrice } from '@/lib/format';
import { whatsappLink, telLink } from '@/lib/whatsapp';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { PackageCard } from '@/components/ui/PackageCard';
import { toPackageCard } from '@/lib/view';

function SectionHead({
  eyebrow,
  heading,
  linkLabel,
  linkHref,
}: {
  eyebrow?: string;
  heading: string;
  linkLabel?: string;
  linkHref?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-7">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-2 text-[28px] tracking-tight md:text-[38px]">{heading}</h2>
      </div>
      {linkLabel && linkHref ? (
        <Link
          href={linkHref}
          className="inline-flex items-center gap-2 text-[14.5px] font-semibold text-accent hover:text-accentDark"
        >
          {linkLabel}
          <Icon name="arrowRight" size={16} />
        </Link>
      ) : null}
    </div>
  );
}

const SHELL = 'mx-auto max-w-shell px-5 md:px-14';

/* ------------------------------------------------------------------ */

export type TrustStripProps = {
  items: { icon: string; title: string; sub: string }[];
};

export function TrustStrip({ items }: TrustStripProps) {
  return (
    <div className="border-b border-line">
      <div className={`${SHELL} grid gap-6 py-6 sm:grid-cols-2 lg:grid-cols-4`}>
        {items.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <Icon
              name={item.icon as IconName}
              size={20}
              strokeWidth={2.2}
              className="mt-0.5 shrink-0 text-success"
            />
            <div>
              <p className="text-[14.5px] font-semibold">{item.title}</p>
              <p className="mt-0.5 text-[13px] text-muted">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export type CategoryGridProps = {
  eyebrow?: string;
  heading: string;
  linkLabel?: string;
  linkHref?: string;
};

export function CategoryGrid({ eyebrow, heading, linkLabel, linkHref }: CategoryGridProps) {
  const categories = getCategories();

  return (
    <section id="occasions" className={`${SHELL} pt-14 md:pt-16`}>
      <SectionHead
        eyebrow={eyebrow}
        heading={heading}
        linkLabel={linkLabel}
        linkHref={linkHref}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const from = getCategoryFromPrice(category.slug);
          return (
            <Link
              key={category.slug}
              href={`/occasions/${category.slug}`}
              className="group overflow-hidden rounded-lg border border-line bg-surface transition-colors hover:border-lineStrong"
            >
              <div className="relative h-44 bg-shade">
                <Image
                  src={category.image}
                  alt={category.imageAlt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="px-4 pb-4 pt-3.5">
                <p className="text-[16.5px] font-semibold">{category.name}</p>
                {from ? (
                  <p className="mt-0.5 text-[13.5px] font-semibold text-accent">
                    from {formatPrice(from)}
                  </p>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export type PackageGridProps = {
  eyebrow?: string;
  heading: string;
  filter?: 'featured' | 'all';
  limit?: number;
};

export function PackageGrid({ eyebrow, heading, filter = 'all', limit }: PackageGridProps) {
  const all = getPackages();
  const chosen = filter === 'featured' ? all.filter((p) => p.featured) : all;
  const packages = limit ? chosen.slice(0, limit) : chosen;

  if (!packages.length) return null;

  return (
    <section id="packages" className={`${SHELL} pt-14 md:pt-16`}>
      <SectionHead eyebrow={eyebrow} heading={heading} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {packages.map((pkg) => (
          <PackageCard key={pkg.slug} data={toPackageCard(pkg)} showCta />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export type StepsProps = {
  heading: string;
  steps: { title: string; body: string }[];
};

export function Steps({ heading, steps }: StepsProps) {
  return (
    <section className={`${SHELL} pt-14 md:pt-16`}>
      <div className="rounded-xl bg-ink px-6 py-10 md:px-12 md:py-12">
        <h2 className="text-[26px] tracking-tight text-onInk md:text-[34px]">{heading}</h2>
        <ol className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title}>
              <span className="flex h-9 w-9 items-center justify-center rounded-pill border-[1.5px] border-gold text-sm font-semibold text-gold">
                {i + 1}
              </span>
              <p className="mt-4 text-[17px] font-semibold text-onInk">{step.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-onInkMuted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export type GalleryStripProps = {
  eyebrow?: string;
  heading: string;
  linkLabel?: string;
  linkHref?: string;
  limit?: number;
};

export function GalleryStrip({
  eyebrow,
  heading,
  linkLabel,
  linkHref,
  limit = 4,
}: GalleryStripProps) {
  const items = getGallery().slice(0, limit);

  return (
    <section id="work" className={`${SHELL} pt-14 md:pt-16`}>
      <SectionHead
        eyebrow={eyebrow}
        heading={heading}
        linkLabel={linkLabel}
        linkHref={linkHref}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-3.5">
        {items.map((item) => (
          <div
            key={item.image}
            className="relative h-48 overflow-hidden rounded-lg bg-shade md:h-[300px]"
          >
            <Image
              src={item.image}
              alt={item.alt}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export type AreasProps = { heading: string };

export function Areas({ heading }: AreasProps) {
  const areas = getAreas();
  const { location } = getSettings();

  return (
    <section className={`${SHELL} pt-14 md:pt-16`}>
      <h2 className="text-xl">{heading}</h2>
      <p className="mt-1.5 text-sm text-muted">
        We set up across {location.city} and the surrounding area.
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {areas.map((area) => (
          <li
            key={area.slug}
            className="rounded-pill border border-lineStrong px-4 py-2 text-[13.5px] text-body"
          >
            {area.name}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export type CtaBandProps = {
  heading: string;
  body: string;
  image: string;
  imageAlt: string;
};

export function CtaBand({ heading, body, image, imageAlt }: CtaBandProps) {
  const settings = getSettings();

  return (
    <section id="contact" className={`${SHELL} pt-14 md:pt-16`}>
      <div className="flex flex-col overflow-hidden rounded-xl md:flex-row">
        <div className="flex flex-1 flex-col justify-center bg-accent px-7 py-10 md:px-11">
          <h2 className="text-[26px] tracking-tight text-white md:text-[34px]">{heading}</h2>
          <p className="mt-3.5 max-w-lg text-[15.5px] leading-relaxed text-onAccent">{body}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button href={whatsappLink()} variant="light" size="lg" icon="whatsapp" external>
              WhatsApp us
            </Button>
            <Button href={telLink()} variant="outlineLight" size="lg" external>
              Call {settings.contact.phone}
            </Button>
          </div>
        </div>
        <div className="relative h-56 bg-shade md:h-auto md:w-80">
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

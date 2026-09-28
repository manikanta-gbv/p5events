import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  getAddons,
  getCategory,
  getFaqs,
  getPackage,
  getPackages,
  getSettings,
} from '@/lib/content';
import { formatPrice, savingsAmount } from '@/lib/format';
import { telLink, whatsappLink } from '@/lib/whatsapp';
import { PageShell } from '@/components/layout/PageShell';
import { BookingPanel } from '@/components/BookingPanel';
import { FaqJsonLd, PackageJsonLd } from '@/components/Seo';
import { Icon } from '@/components/ui/Icon';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPackages().map((pkg) => ({ slug: pkg.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const pkg = getPackage(slug);
  const { location } = getSettings();
  if (!pkg) return {};

  return {
    title: `${pkg.title} — ${formatPrice(pkg.price)}`,
    description: `${pkg.summary}. Set up anywhere in ${location.city}.`,
    alternates: { canonical: `/packages/${pkg.slug}/` },
    openGraph: { images: pkg.images },
  };
}

export default async function PackagePage({ params }: Params) {
  const { slug } = await params;
  const pkg = getPackage(slug);
  if (!pkg) notFound();

  const settings = getSettings();
  const category = getCategory(pkg.category);
  const addons = getAddons();
  const faqs = getFaqs();
  const savings = savingsAmount(pkg.price, pkg.strikePrice);

  return (
    <PageShell
      crumbs={[
        { name: 'Home', href: '/' },
        { name: 'Packages', href: '/packages' },
        ...(category
          ? [{ name: category.name, href: `/occasions/${category.slug}` }]
          : []),
        { name: pkg.title, href: `/packages/${pkg.slug}` },
      ]}
    >
      <PackageJsonLd pkg={pkg} />
      <FaqJsonLd />

      <div className="mx-auto max-w-shell px-5 pt-4 md:px-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-9">
          <div className="lg:w-[58%] xl:w-[62%]">
            <div className="relative h-72 overflow-hidden rounded-xl bg-shade sm:h-96 lg:h-[460px]">
              <Image
                src={pkg.images[0]}
                alt={pkg.imageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
            {pkg.images.length > 1 ? (
              <div className="mt-3 grid grid-cols-4 gap-3">
                {pkg.images.slice(1, 5).map((image) => (
                  <div
                    key={image}
                    className="relative h-20 overflow-hidden rounded-md bg-shade sm:h-24"
                  >
                    <Image src={image} alt="" fill sizes="25vw" className="object-cover" />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="lg:flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              {category ? (
                <span className="rounded-pill bg-accentTint px-3 py-1.5 text-[11.5px] font-semibold text-accentDark">
                  {category.name}
                </span>
              ) : null}
            </div>

            <h1 className="mt-3.5 text-[27px] leading-tight tracking-tight md:text-[33px]">
              {pkg.title}
            </h1>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-body">
              Set up at your home, hall or terrace anywhere in {settings.location.city}.
            </p>

            <div className="mt-5">
              <BookingPanel
                packageTitle={pkg.title}
                priceLabel={formatPrice(pkg.price)}
                strikeLabel={pkg.strikePrice ? formatPrice(pkg.strikePrice) : null}
                savingsLabel={savings ? formatPrice(savings) : null}
                slots={settings.booking.slots}
                city={settings.location.city}
                phone={settings.contact.phone}
                telHref={telLink()}
                whatsappNumber={settings.contact.whatsappNumber}
                messageTemplate={settings.booking.messageTemplate}
                brandName={settings.brand.name}
              />
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-10 lg:flex-row lg:gap-9">
          <div className="lg:w-[58%] xl:w-[62%]">
            <h2 className="text-2xl">What is included</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-x-8">
              {pkg.inclusions.map((item) => (
                <li key={item} className="flex gap-2.5 text-[14.5px] leading-relaxed text-inkSoft">
                  <Icon
                    name="check"
                    size={17}
                    strokeWidth={2.4}
                    className="mt-0.5 shrink-0 text-success"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[13.5px] text-muted">
              Typical installation time: {pkg.setupHours} hours.
            </p>

            <h2 className="mt-9 text-2xl">Common questions</h2>
            <div className="mt-4 border-t border-line">
              {faqs.map((faq) => (
                <details key={faq.question} className="group border-b border-line py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15.5px] font-semibold">
                    {faq.question}
                    <Icon
                      name="chevronDown"
                      size={18}
                      className="shrink-0 text-muted transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <p className="mt-2.5 max-w-2xl text-[14.5px] leading-relaxed text-body">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>

          <div className="lg:flex-1">
            <h2 className="text-2xl">Add to this setup</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {addons.map((addon) => (
                <li
                  key={addon.slug}
                  className="flex items-center gap-3.5 rounded-md border border-line bg-surface p-4"
                >
                  <div className="flex-1">
                    <p className="text-[14.5px] font-semibold">{addon.title}</p>
                    <p className="mt-0.5 text-[13px] text-muted">{formatPrice(addon.price)}</p>
                  </div>
                  <a
                    href={whatsappLink({
                      packageTitle: `${pkg.title} + ${addon.title}`,
                      price: pkg.price + addon.price,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 items-center rounded-pill border-[1.5px] border-ink px-4 text-[13.5px] font-semibold transition-colors hover:bg-ink hover:text-onInk"
                  >
                    Add
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-5 rounded-lg bg-ink p-5">
              <p className="text-base font-semibold leading-snug text-onInk">
                Want something different?
              </p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-onInkMuted">
                Send us the picture you have in mind. We will quote a custom setup for your
                space.
              </p>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex h-11 items-center justify-center rounded-pill bg-canvas text-sm font-semibold text-ink"
              >
                Get a custom quote
              </a>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

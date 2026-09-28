import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getCategories, getCategoryFromPrice, getSettings } from '@/lib/content';
import { formatPrice } from '@/lib/format';
import { PageShell } from '@/components/layout/PageShell';

export function generateMetadata(): Metadata {
  const { location, brand } = getSettings();
  return {
    title: `Occasions we decorate in ${location.city}`,
    description: `Birthdays, first birthdays, baby showers, anniversaries and more — every occasion ${brand.name} sets up for in ${location.city}.`,
    alternates: { canonical: '/occasions/' },
  };
}

export default function OccasionsPage() {
  const categories = getCategories();

  return (
    <PageShell
      crumbs={[
        { name: 'Home', href: '/' },
        { name: 'Occasions', href: '/occasions' },
      ]}
    >
      <div className="mx-auto max-w-shell px-5 pb-16 pt-3 md:px-14">
        <h1 className="text-[30px] tracking-tight md:text-[40px]">
          What are we celebrating?
        </h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const from = getCategoryFromPrice(category.slug);
            return (
              <Link
                key={category.slug}
                href={`/occasions/${category.slug}`}
                className="group overflow-hidden rounded-lg border border-line bg-surface transition-colors hover:border-lineStrong"
              >
                <div className="relative h-48 bg-shade">
                  <Image
                    src={category.image}
                    alt={category.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-4">
                  <p className="text-[16.5px] font-semibold">{category.name}</p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-body">
                    {category.blurb}
                  </p>
                  {from ? (
                    <p className="mt-2 text-[13.5px] font-semibold text-accent">
                      from {formatPrice(from)}
                    </p>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
